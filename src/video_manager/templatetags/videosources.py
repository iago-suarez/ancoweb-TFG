import os

from django import template
from django.conf import settings

from video_upload.utils import VideoUtils

register = template.Library()


@register.simple_tag
def videosources(video_model):
    file_name, file_ext = os.path.splitext(video_model.video.name)
    file_name = os.path.join(video_model.video.storage.location, file_name)
    url_name, url_ext = os.path.splitext(video_model.video.url)

    sources = ""
    for video_format in settings.USED_VIDEO_EXTENSIONS:
        sources += '<source src="' + url_name + video_format + '" type="video/webm" fps="' + \
                   str(VideoUtils.get_fps(file_name + '.webm')) + '">'
    return sources
