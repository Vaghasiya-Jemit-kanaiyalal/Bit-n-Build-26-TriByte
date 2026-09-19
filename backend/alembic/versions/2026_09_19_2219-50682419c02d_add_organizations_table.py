"""add organizations table

Revision ID: 50682419c02d
Revises: f5788519879e
Create Date: 2026-09-19 22:19:14.662023

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50682419c02d'
down_revision: Union[str, None] = 'f5788519879e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('department', sa.String(length=150), nullable=False),
        sa.Column('operating_region', sa.String(length=150), nullable=False),
        sa.Column('operating_zones', sa.JSON(), nullable=False),
        sa.Column('default_timezone', sa.String(length=100), nullable=False),
        sa.Column('default_currency', sa.String(length=50), nullable=False),
        sa.Column('contact_email', sa.String(length=255), nullable=False),
        sa.Column('contact_phone', sa.String(length=50), nullable=False),
        sa.Column('address', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('active_since', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_organizations_id'), 'organizations', ['id'], unique=False)
    op.create_index(op.f('ix_organizations_org_code'), 'organizations', ['org_code'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_organizations_org_code'), table_name='organizations')
    op.drop_index(op.f('ix_organizations_id'), table_name='organizations')
    op.drop_table('organizations')
