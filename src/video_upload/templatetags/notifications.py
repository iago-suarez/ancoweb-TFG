from django import template

from video_upload.models import UploadProcess

register = template.Library()


@register.inclusion_tag('video_upload/notifications_fragment.html')
def notifications(user):
    n = UploadProcess.objects.filter(owner=user)
    return {'notification_list': n}
