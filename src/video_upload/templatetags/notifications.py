from django import template
from video_upload.models import video_upload

register = template.Library()


@register.inclusion_tag('video_upload/notifications_fragment.html')
def notifications(user):
    n = video_upload.objects.filter(owner=user)
    return {'notification_list': n}