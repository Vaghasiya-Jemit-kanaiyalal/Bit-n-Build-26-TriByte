"""finalize_roles_admin_driver_analyst

Revision ID: 3d849204e112
Revises: 2c4237edb865
Create Date: 2026-09-19 16:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3d849204e112'
down_revision: Union[str, None] = 'fca64a770500'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Migrate data first: COLLECTOR -> DRIVER, VIEWER -> ANALYST
    op.execute("UPDATE users SET role = 'DRIVER' WHERE role = 'COLLECTOR'")
    op.execute("UPDATE users SET role = 'ANALYST' WHERE role = 'VIEWER'")
    
    # Update platform_user_role column enum definition
    op.alter_column(
        'users',
        'role',
        existing_type=sa.Enum('ADMIN', 'COLLECTOR', 'VIEWER', name='platform_user_role', native_enum=False),
        type_=sa.Enum('ADMIN', 'DRIVER', 'ANALYST', name='platform_user_role', native_enum=False),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.execute("UPDATE users SET role = 'COLLECTOR' WHERE role = 'DRIVER'")
    op.execute("UPDATE users SET role = 'VIEWER' WHERE role = 'ANALYST'")
    
    op.alter_column(
        'users',
        'role',
        existing_type=sa.Enum('ADMIN', 'DRIVER', 'ANALYST', name='platform_user_role', native_enum=False),
        type_=sa.Enum('ADMIN', 'COLLECTOR', 'VIEWER', name='platform_user_role', native_enum=False),
        existing_nullable=False,
    )
