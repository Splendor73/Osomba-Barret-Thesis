from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.support import ForumPost, ForumTopic, ReportedContent


def purge_deleted_support_content(
    db: Session,
    *,
    now: datetime | None = None,
    retention_days: int = 30,
) -> dict[str, int]:
    current_time = now or datetime.now(timezone.utc)
    cutoff = current_time - timedelta(days=retention_days)

    old_topic_ids = [
        topic_id
        for topic_id, in db.query(ForumTopic.id)
        .filter(
            ForumTopic.is_deleted.is_(True),
            ForumTopic.deleted_at.isnot(None),
            ForumTopic.deleted_at < cutoff,
        )
        .all()
    ]

    old_post_ids = [
        post_id
        for post_id, in db.query(ForumPost.id)
        .filter(
            ForumPost.is_deleted.is_(True),
            ForumPost.deleted_at.isnot(None),
            ForumPost.deleted_at < cutoff,
            ForumPost.topic_id.notin_(old_topic_ids) if old_topic_ids else True,
        )
        .all()
    ]

    purged_reports = 0
    if old_topic_ids:
        purged_reports += (
            db.query(ReportedContent)
            .filter(ReportedContent.topic_id.in_(old_topic_ids))
            .delete(synchronize_session=False)
        )
        purged_reports += (
            db.query(ReportedContent)
            .filter(
                ReportedContent.post_id.in_(
                    select(ForumPost.id).where(ForumPost.topic_id.in_(old_topic_ids))
                )
            )
            .delete(synchronize_session=False)
        )
    if old_post_ids:
        purged_reports += (
            db.query(ReportedContent)
            .filter(ReportedContent.post_id.in_(old_post_ids))
            .delete(synchronize_session=False)
        )

    purged_posts_from_topics = 0
    if old_topic_ids:
        purged_posts_from_topics = (
            db.query(ForumPost)
            .filter(ForumPost.topic_id.in_(old_topic_ids))
            .delete(synchronize_session=False)
        )

    purged_posts = purged_posts_from_topics
    if old_post_ids:
        purged_posts += (
            db.query(ForumPost)
            .filter(ForumPost.id.in_(old_post_ids))
            .delete(synchronize_session=False)
        )

    purged_topics = 0
    if old_topic_ids:
        purged_topics = (
            db.query(ForumTopic)
            .filter(ForumTopic.id.in_(old_topic_ids))
            .delete(synchronize_session=False)
        )

    db.commit()
    return {
        "purged_topics": purged_topics,
        "purged_posts": purged_posts,
        "purged_reports": purged_reports,
    }


def main() -> None:
    db = SessionLocal()
    try:
        summary = purge_deleted_support_content(db)
        print(
            "Purged support content:",
            f"topics={summary['purged_topics']}",
            f"posts={summary['purged_posts']}",
            f"reports={summary['purged_reports']}",
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
