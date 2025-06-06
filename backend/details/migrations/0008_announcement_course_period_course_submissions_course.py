# Generated by Django 5.2 on 2025-04-28 11:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('details', '0007_period_is_selection_period'),
    ]

    operations = [
        migrations.AddField(
            model_name='announcement',
            name='course',
            field=models.CharField(choices=[('FYP1', 'FYP1'), ('FYP2', 'FYP2'), ('Both', 'Both')], default='Both', max_length=5),
        ),
        migrations.AddField(
            model_name='period',
            name='course',
            field=models.CharField(choices=[('FYP1', 'FYP1'), ('FYP2', 'FYP2'), ('Both', 'Both')], default='Both', max_length=5),
        ),
        migrations.AddField(
            model_name='submissions',
            name='course',
            field=models.CharField(choices=[('FYP1', 'FYP1'), ('FYP2', 'FYP2'), ('Both', 'Both')], default='Both', max_length=5),
        ),
    ]
