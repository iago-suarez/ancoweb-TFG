# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import video_manager.models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='VideoModel',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('title', models.CharField(max_length=50)),
                ('video', models.FileField(upload_to=video_manager.models.video_file_path)),
                ('detected_objs', models.FileField(upload_to='', null=True)),
                ('image', models.ImageField(upload_to='', null=True)),
                ('description', models.CharField(blank=True, max_length=250)),
                ('creation_timestamp', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
