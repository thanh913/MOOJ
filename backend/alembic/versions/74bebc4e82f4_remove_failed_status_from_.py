"""Remove failed status from SubmissionStatus enum

Revision ID: 74bebc4e82f4
Revises: 12df1ae8a34a
Create Date: 2025-04-01 04:53:00.437297

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74bebc4e82f4'
down_revision: Union[str, None] = '12df1ae8a34a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define old and new enum types
# Note: The 'old_enum' here represents the state BEFORE this migration runs
old_enum = sa.Enum('pending', 'processing', 'appealing', 'completed', 'evaluation_error', 'failed', name='submissionstatus')
# The 'new_enum' represents the TARGET state AFTER this migration
new_enum_temp_name = 'submissionstatus_new'
new_enum = sa.Enum('pending', 'processing', 'appealing', 'completed', 'evaluation_error', name=new_enum_temp_name)

def upgrade() -> None:
    # 1. Add 'evaluation_error' to the *existing* enum if it doesn't exist
    op.execute("ALTER TYPE submissionstatus ADD VALUE IF NOT EXISTS 'evaluation_error'")
    
    # Commit the transaction so the new enum value is visible
    op.execute("COMMIT")
    
    # 2. Update existing 'failed' statuses to 'evaluation_error' using text comparison
    op.execute("UPDATE submissions SET status = 'evaluation_error' WHERE status::text = 'failed'")

    # 3. Create the new enum type (without 'failed') using a temporary name
    new_enum.create(op.get_bind(), checkfirst=False)

    # 4. Alter the column to use the new temporary type, casting existing values
    op.execute(
        f'ALTER TABLE submissions ALTER COLUMN status TYPE {new_enum_temp_name} ' 
        f'USING status::text::{new_enum_temp_name}'
    )

    # 5. Drop the original enum type (which now includes evaluation_error but also failed)
    # We need to refer to it by its original name for dropping
    original_enum_to_drop = sa.Enum(name='submissionstatus') # Just need the name to drop
    original_enum_to_drop.drop(op.get_bind(), checkfirst=False)

    # 6. Rename the new temporary type to the original name
    op.execute(f'ALTER TYPE {new_enum_temp_name} RENAME TO submissionstatus')


def downgrade() -> None:
    # Downgrade needs to reverse the process: re-add 'failed'
    
    # Define the state we want to revert TO (includes 'failed')
    final_enum_name = 'submissionstatus'
    downgrade_enum = sa.Enum('pending', 'processing', 'appealing', 'completed', 'evaluation_error', 'failed', name=final_enum_name)
    temp_enum_name = 'submissionstatus_old'

    # 1. Rename current enum (which lacks 'failed') to a temporary name
    op.execute(f'ALTER TYPE {final_enum_name} RENAME TO {temp_enum_name}')

    # 2. Create the enum type WITH 'failed' included, using the final name
    downgrade_enum.create(op.get_bind(), checkfirst=False)

    # 3. Alter column back to use the final type name, casting values
    #    Values originally updated from 'failed' will remain 'evaluation_error'
    op.execute(
        f'ALTER TABLE submissions ALTER COLUMN status TYPE {final_enum_name} ' 
        f'USING status::text::{final_enum_name}'
    )

    # 4. Drop the renamed temporary type
    op.execute(f'DROP TYPE {temp_enum_name}')
