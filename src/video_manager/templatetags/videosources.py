import os
from django import template
from video_upload.utils import VideoUtils

register = template.Library()


@register.simple_tag
def videosources(video_model):
    file_name, file_ext = os.path.splitext(video_model.video.name)
    file_name = os.path.join(video_model.video.storage.location, file_name)
    url_name, url_ext = os.path.splitext(video_model.video.url)

    # sources = '<source src="' + url_name + '.ogv" type="video/ogg" fps="' + \
    #           str(VideoUtils.get_fps(file_name + '.ogv')) + '">'
    sources = '<source src="' + url_name + '.mp4" type="video/mp4" fps="' + \
               str(VideoUtils.get_fps(file_name + '.mp4')) + '">'
    sources += '<source src="' + url_name + '.webm" type="video/webm" fps="' + \
               str(VideoUtils.get_fps(file_name + '.webm')) + '">'
    return sources
