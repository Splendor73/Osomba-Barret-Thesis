"""add_tc_and_marketing_fields

Revision ID: 56b2f0304c8b
Revises: f8e786bf5812
Create Date: 2026-02-13 16:28:53.180347

"""
from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision: str = '56b2f0304c8b'
down_revision: Union[str, Sequence[str], None] = 'f8e786bf5812'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add columns as nullable first
    op.add_column('users', sa.Column('accepted_terms_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('terms_version', sa.String(), nullable=True))
    op.add_column('users', sa.Column('marketing_opt_in', sa.Boolean(), nullable=True))
    
    # Update existing records with defaults
    op.execute("UPDATE users SET accepted_terms_at = NOW() WHERE accepted_terms_at IS NULL")
    op.execute("UPDATE users SET terms_version = '2026-q1-v1' WHERE terms_version IS NULL")
    op.execute("UPDATE users SET marketing_opt_in = False WHERE marketing_opt_in IS NULL")
    
    # Now set them to NOT NULL
    op.alter_column('users', 'accepted_terms_at', nullable=False)
    op.alter_column('users', 'terms_version', nullable=False)
    op.alter_column('users', 'marketing_opt_in', nullable=False)

    # Handle role enum change
    # Note: If the enum type doesn't exist yet, we might need to create it explicitly for Postgres
    user_role_enum = sa.Enum('BUYER', 'SELLER', 'BOTH', 'admin', name='userrole')
    user_role_enum.create(op.get_bind(), checkfirst=True)
    
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::userrole")


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'role',
               existing_type=sa.Enum('BUYER', 'SELLER', 'BOTH', 'admin', name='userrole'),
               type_=sa.VARCHAR(),
               existing_nullable=True)
    op.drop_column('users', 'marketing_opt_in')
    op.drop_column('users', 'terms_version')
    op.drop_column('users', 'accepted_terms_at')
    
    # We generally don't drop the enum type in downgrade to avoid issues if other things use it,
    # but for completeness:
    # sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=False)
