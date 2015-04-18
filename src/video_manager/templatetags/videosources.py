import os
from django import template

register = template.Library()


@register.simple_tag
def videosources(video_model):
    file_name, file_ext = os.path.splitext(video_model.video.url)
    sources = '<source src="' + file_name + '.ogv" type="video/ogg">'
    sources += '<source src="' + file_name + '.mp4" type="video/mp4">'
    sources += '<source src="' + file_name + '.webm" type="video/webm">'
    return sources
