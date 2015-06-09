# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import video_manager.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AnalysisProcess',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True, serialize=False)),
                ('progress', models.IntegerField(default=0)),
                ('state_message', models.CharField(max_length=100)),
                ('is_finished', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='VideoModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True, serialize=False)),
                ('title', models.CharField(max_length=50)),
                ('video', models.FileField(upload_to=video_manager.models.video_file_path)),
                ('detected_objs', models.FileField(upload_to='', null=True)),
                ('image', models.ImageField(upload_to='', null=True)),
                ('description', models.CharField(max_length=250, blank=True)),
                ('creation_timestamp', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='analysisprocess',
            name='video_model',
            field=models.ForeignKey(to='video_manager.VideoModel'),
        ),
    ]
