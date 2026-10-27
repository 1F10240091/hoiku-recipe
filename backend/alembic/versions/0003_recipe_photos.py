"""Persist private recipe photos."""
from alembic import op
import sqlalchemy as sa
revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("recipe_photos", sa.Column("recipe_id", sa.String(36), sa.ForeignKey("recipes.id"), primary_key=True),
                    sa.Column("data", sa.LargeBinary(), nullable=False))

def downgrade():
    op.drop_table("recipe_photos")
