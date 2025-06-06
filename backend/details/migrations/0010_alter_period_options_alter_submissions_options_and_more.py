# Generated by Django 5.2 on 2025-06-03 12:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('details', '0009_alter_period_directory'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='period',
            options={'ordering': ['start_date']},
        ),
        migrations.AlterModelOptions(
            name='submissions',
            options={'ordering': ['date_open']},
        ),
        migrations.AlterUniqueTogether(
            name='period',
            unique_together={('start_date', 'end_date', 'course')},
        ),
        migrations.AlterUniqueTogether(
            name='submissions',
            unique_together={('date_open', 'date_close', 'course')},
        ),
    ]
