# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import video_manager.models


class Migration(migrations.Migration):

    dependencies = [
        ('video_manager', '0002_auto_20150307_2106'),
    ]

    operations = [
        migrations.CreateModel(
            name='VideoModel',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('title', models.CharField(max_length=50)),
                ('video', models.FileField(upload_to=video_manager.models.file_path)),
                ('image', models.ImageField(upload_to='', null=True)),
                ('description', models.CharField(max_length=250)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.DeleteModel(
            name='Video',
        ),
    ]
