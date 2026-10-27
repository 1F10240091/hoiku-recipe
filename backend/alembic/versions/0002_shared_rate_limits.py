"""Shared production rate limits."""
from alembic import op
import sqlalchemy as sa
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("rate_limit_buckets", sa.Column("key", sa.String(64), primary_key=True),
                    sa.Column("window", sa.Integer(), nullable=False), sa.Column("hits", sa.Integer(), nullable=False))

def downgrade():
    op.drop_table("rate_limit_buckets")
