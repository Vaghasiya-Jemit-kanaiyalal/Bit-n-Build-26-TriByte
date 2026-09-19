"""merge_heads

Revision ID: f5788519879e
Revises: 86534281b4a0, 8bae1eb2c0fe
Create Date: 2026-09-19 22:18:59.661356

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f5788519879e'
down_revision: Union[str, None] = ('86534281b4a0', '8bae1eb2c0fe')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
