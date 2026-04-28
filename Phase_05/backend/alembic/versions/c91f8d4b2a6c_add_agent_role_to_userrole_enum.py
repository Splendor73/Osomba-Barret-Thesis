"""add agent role to userrole enum

Revision ID: c91f8d4b2a6c
Revises: b3a1f2c84d01
Create Date: 2026-04-28 14:45:30.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "c91f8d4b2a6c"
down_revision: Union[str, Sequence[str], None] = "b3a1f2c84d01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'agent'")


def downgrade() -> None:
    # PostgreSQL cannot safely remove enum values without rebuilding the type.
    pass
