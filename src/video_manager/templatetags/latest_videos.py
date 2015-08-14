from django import template

from video_manager.models import VideoModel

register = template.Library()


@register.inclusion_tag('videos/video-element.html')
def latest_videos(n):
    videos = VideoModel.objects.filter() \
                 .order_by('-creation_timestamp').exclude(image="").exclude(detected_objs="")[:n]
    return {'videos': videos}
