# Generated by Django 5.2 on 2025-04-20 13:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0008_alter_document_mode'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedback',
            name='comment',
            field=models.TextField(blank=True, null=True),
        ),
    ]
