from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        (
            "grades",
            "0002_alter_markingscheme_pic",
        ),  # Replace with your latest migration name
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE grades_markingscheme
                ALTER COLUMN pic TYPE jsonb
                USING pic::jsonb;
            """,
            reverse_sql="""
                ALTER TABLE grades_markingscheme
                ALTER COLUMN pic TYPE text;
            """,
        ),
    ]
