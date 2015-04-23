# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('video_manager', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='video_upload',
            fields=[
                ('id', models.AutoField(primary_key=True, verbose_name='ID', auto_created=True, serialize=False)),
                ('progress', models.IntegerField(default=0)),
                ('title', models.CharField(max_length=100)),
                ('state_message', models.CharField(max_length=100)),
                ('is_finished', models.BooleanField(default=False)),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
                ('video_model', models.ForeignKey(to='video_manager.VideoModel')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
