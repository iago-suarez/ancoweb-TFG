from django.conf.urls import url
from django.conf import settings
from django.conf.urls.static import static

from video_upload import views, handlers

urlpatterns = [url(r'^$', views.UploadView.as_view(), name='upload'),
               url(r'^notifications/delete/(?P<pk>\d+)/$', views.mark_notification_as_deleted,
                   name='notification_delete'),
               url(r'^upload_progress$', handlers.upload_progress, name="upload_progress"),
               url(r'^upload/(?P<pk>\d+)/success/$', views.SuccessfulUpload.as_view(),
                   name='success-upload'),
               url(r'^notificationsJson', views.notifications_as_json,
                   name='json_notifications')
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
