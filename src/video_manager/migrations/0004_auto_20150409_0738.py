# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('video_manager', '0003_auto_20150317_1624'),
    ]

    operations = [
        migrations.AddField(
            model_name='videomodel',
            name='creation_timestamp',
            field=models.DateTimeField(default=datetime.datetime(2015, 4, 9, 7, 33, 30, 117520, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='videomodel',
            name='owner',
            field=models.ForeignKey(unique=True, default=5, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
