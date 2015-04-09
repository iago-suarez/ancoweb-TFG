# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import video_manager.models


class Migration(migrations.Migration):

    dependencies = [
        ('video_manager', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='image',
            field=models.ImageField(upload_to='', null=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='video',
            name='video',
            field=models.FileField(upload_to=video_manager.models.file_path),
            preserve_default=True,
        ),
    ]
