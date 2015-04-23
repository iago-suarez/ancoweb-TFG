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
                ('id', models.AutoField(primary_key=True, verbose_name='ID', auto_created=True, serialize=False)),
                ('title', models.CharField(max_length=50)),
                ('video', models.FileField(upload_to=video_manager.models.video_file_path)),
                ('detected_objs', models.FileField(null=True, upload_to='')),
                ('image', models.ImageField(null=True, upload_to='')),
                ('description', models.CharField(max_length=250, blank=True)),
                ('creation_timestamp', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
