# Generated by Django 5.2 on 2025-04-10 11:33

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settings', '0002_documentcategories_documenttheme'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documenttheme',
            name='value',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='settings.documentcategories'),
        ),
    ]
