from pathlib import Path

from app.core.config import Settings


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_support_frontend_url_defaults_to_support_site():
    settings = Settings(
        POSTGRES_SERVER="localhost",
        POSTGRES_USER="postgres",
        POSTGRES_PASSWORD="postgres",
        POSTGRES_DB="postgres",
    )

    assert settings.SUPPORT_FRONTEND_URL == "https://support.osomba.com"


def test_backend_thread_links_do_not_target_main_osomba_site():
    forum_endpoint = REPO_ROOT / "backend" / "app" / "api" / "v1" / "endpoints" / "forum.py"
    source = forum_endpoint.read_text()

    assert "SUPPORT_FRONTEND_URL" in source
    assert "https://osomba.com/thread/" not in source


def test_header_logo_is_only_external_osomba_link():
    header = REPO_ROOT / "frontend" / "src" / "components" / "Header.tsx"
    source = header.read_text()

    assert 'const MAIN_OSOMBA_URL = "https://www.osomba.com/";' in source
    assert 'href={MAIN_OSOMBA_URL}' in source
    assert '<a href="/"' not in source
