from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.models.support import FAQ, ForumCategory, ForumPost, ForumTopic, ReportedContent
from app.models.user import User


API_PREFIX = f"{settings.SUPPORT_API_PREFIX}{settings.API_V1_STR}"


def test_semantic_search_excludes_deleted_topics_and_inactive_faqs(client, db_session):
    import app.services.search_service as search_service

    category = db_session.query(ForumCategory).filter_by(name="General").first()
    if not category:
        category = ForumCategory(name="General", description="General discussions")
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

    for user_id in (1201, 1202):
        db_session.add(
            User(
                user_id=user_id,
                email=f"user{user_id}@example.com",
                full_name=f"User {user_id}",
                role="BUYER",
                accepted_terms_at=datetime.utcnow(),
                terms_version="1.0"
            )
        )
    db_session.commit()

    visible_topic = ForumTopic(
        title="Visible semantic topic",
        content="Returned by semantic search",
        user_id=1201,
        category_id=category.id,
        embedding=[0.1] * 384
    )
    deleted_topic = ForumTopic(
        title="Deleted semantic topic",
        content="Should be filtered from search",
        user_id=1202,
        category_id=category.id,
        is_deleted=True,
        deleted_at=datetime.now(timezone.utc),
        embedding=[0.1] * 384
    )
    active_faq = FAQ(
        question="Visible semantic faq",
        answer="Returned by semantic search",
        category_id=category.id,
        is_active=True,
        embedding=[0.1] * 384
    )
    inactive_faq = FAQ(
        question="Inactive semantic faq",
        answer="Should be filtered from search",
        category_id=category.id,
        is_active=False,
        embedding=[0.1] * 384
    )
    db_session.add_all([visible_topic, deleted_topic, active_faq, inactive_faq])
    db_session.commit()

    original_generate = search_service.generate_embedding
    search_service.generate_embedding = lambda query: [0.1] * 384
    try:
        response = client.get(f"{API_PREFIX}/support/search", params={"query": "semantic"})
        assert response.status_code == 200
        titles = [item["title"] for item in response.json()["results"]]
        assert "Visible semantic topic" in titles
        assert "Visible semantic faq" in titles
        assert "Deleted semantic topic" not in titles
        assert "Inactive semantic faq" not in titles
    finally:
        search_service.generate_embedding = original_generate


def test_purge_deleted_support_content_removes_old_records_only(db_session):
    from scripts.purge_deleted_support_content import purge_deleted_support_content

    category = db_session.query(ForumCategory).filter_by(name="General").first()
    if not category:
        category = ForumCategory(name="General", description="General discussions")
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

    for user_id in (1301, 1302, 1303, 1304, 1305, 1306, 1307):
        db_session.add(
            User(
                user_id=user_id,
                email=f"user{user_id}@example.com",
                full_name=f"User {user_id}",
                role="BUYER",
                accepted_terms_at=datetime.utcnow(),
                terms_version="1.0"
            )
        )
    db_session.commit()

    cutoff_now = datetime(2026, 4, 21, tzinfo=timezone.utc)
    old_timestamp = cutoff_now - timedelta(days=31)
    recent_timestamp = cutoff_now - timedelta(days=10)

    old_topic = ForumTopic(
        title="Old deleted topic",
        content="Purged topic",
        user_id=1301,
        category_id=category.id,
        is_deleted=True,
        deleted_at=old_timestamp
    )
    recent_topic = ForumTopic(
        title="Recent deleted topic",
        content="Retained topic",
        user_id=1302,
        category_id=category.id,
        is_deleted=True,
        deleted_at=recent_timestamp
    )
    db_session.add_all([old_topic, recent_topic])
    db_session.commit()
    db_session.refresh(old_topic)
    db_session.refresh(recent_topic)

    old_post = ForumPost(
        topic_id=recent_topic.id,
        user_id=1303,
        content="Old deleted post",
        is_deleted=True,
        deleted_at=old_timestamp
    )
    recent_post = ForumPost(
        topic_id=recent_topic.id,
        user_id=1304,
        content="Recent deleted post",
        is_deleted=True,
        deleted_at=recent_timestamp
    )
    db_session.add_all([old_post, recent_post])
    db_session.commit()
    db_session.refresh(old_post)
    db_session.refresh(recent_post)

    old_topic_report = ReportedContent(
        reporter_id=1305,
        topic_id=old_topic.id,
        reason="Purge old topic report"
    )
    old_post_report = ReportedContent(
        reporter_id=1306,
        post_id=old_post.id,
        reason="Purge old post report"
    )
    recent_post_report = ReportedContent(
        reporter_id=1307,
        post_id=recent_post.id,
        reason="Retain recent post report"
    )
    db_session.add_all([old_topic_report, old_post_report, recent_post_report])
    db_session.commit()

    summary = purge_deleted_support_content(db_session, now=cutoff_now)

    assert summary["purged_topics"] == 1
    assert summary["purged_posts"] >= 1
    assert summary["purged_reports"] >= 2

    assert db_session.query(ForumTopic).filter(ForumTopic.id == old_topic.id).first() is None
    assert db_session.query(ForumPost).filter(ForumPost.id == old_post.id).first() is None
    assert db_session.query(ForumTopic).filter(ForumTopic.id == recent_topic.id).first() is not None
    assert db_session.query(ForumPost).filter(ForumPost.id == recent_post.id).first() is not None
    assert db_session.query(ReportedContent).filter(ReportedContent.id == old_topic_report.id).first() is None
    assert db_session.query(ReportedContent).filter(ReportedContent.id == old_post_report.id).first() is None
    assert db_session.query(ReportedContent).filter(ReportedContent.id == recent_post_report.id).first() is not None
