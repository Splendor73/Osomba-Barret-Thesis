"""add source_post_id to faqs

Revision ID: b3a1f2c84d01
Revises: 0d781e87548f
Create Date: 2026-03-11 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3a1f2c84d01'
down_revision: Union[str, Sequence[str], None] = '0d781e87548f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('faqs', sa.Column('source_post_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_faqs_source_post_id', 'faqs', 'forum_posts', ['source_post_id'], ['id'])
    op.create_index(op.f('ix_faqs_source_post_id'), 'faqs', ['source_post_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_faqs_source_post_id'), table_name='faqs')
    op.drop_constraint('fk_faqs_source_post_id', 'faqs', type_='foreignkey')
    op.drop_column('faqs', 'source_post_id')
