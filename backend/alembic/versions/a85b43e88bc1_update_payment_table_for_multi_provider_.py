"""Update payment table for multi-provider support

Revision ID: a85b43e88bc1
Revises: 56b2f0304c8b
Create Date: 2026-02-14 18:43:32.576152

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a85b43e88bc1'
down_revision: Union[str, Sequence[str], None] = '56b2f0304c8b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Handle Enums - Create types if they don't exist
    payment_provider = sa.Enum('MPESA', 'PAYSTACK', 'AIRTEL', 'STRIPE', 'COINBASE', 'ORANGE', name='paymentprovider')
    payment_status = sa.Enum('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', name='paymentstatus')
    
    payment_provider.create(op.get_bind(), checkfirst=True)
    payment_status.create(op.get_bind(), checkfirst=True)

    # 2. Add columns if they don't exist
    conn = op.get_bind()
    columns = [c['name'] for c in sa.inspect(conn).get_columns('payment')]
    
    if 'created_at' not in columns:
        op.add_column('payment', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    
    if 'provider_transaction_id' not in columns:
        op.add_column('payment', sa.Column('provider_transaction_id', sa.String(), nullable=True))
        op.create_index('ix_payment_provider_transaction_id', 'payment', ['provider_transaction_id'], unique=True)
        
    if 'metadata_json' not in columns:
        op.add_column('payment', sa.Column('metadata_json', sa.JSON(), nullable=True))
        
    if 'updated_at' not in columns:
        op.add_column('payment', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))

    # 3. Alter existing columns to use Enums
    # We use a explicit cast for Postgres
    op.execute("ALTER TABLE payment ALTER COLUMN payment_type TYPE paymentprovider USING payment_type::paymentprovider")
    op.execute("ALTER TABLE payment ALTER COLUMN payment_status TYPE paymentstatus USING payment_status::paymentstatus")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE payment ALTER COLUMN payment_status TYPE VARCHAR")
    op.execute("ALTER TABLE payment ALTER COLUMN payment_type TYPE VARCHAR")
    
    op.drop_index('ix_payment_provider_transaction_id', table_name='payment')
    op.drop_column('payment', 'updated_at')
    op.drop_column('payment', 'metadata_json')
    op.drop_column('payment', 'provider_transaction_id')
    op.drop_column('payment', 'created_at')
    
    op.execute("DROP TYPE paymentstatus")
    op.execute("DROP TYPE paymentprovider")
