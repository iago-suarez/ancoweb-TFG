from django.conf.urls import patterns, url
from django.conf import settings
from django.conf.urls.static import static
from videoUpload import views
from videoUpload import handlers
from video_manager import notification_views

urlpatterns = patterns('',
                       url(r'^$', views.UploadView.as_view(), name='upload'),
                       url(r'^notifications/delete/(?P<pk>\d+)/$', notification_views.DeleteView.as_view(),
                           name='notification_delete'),
                       url(r'^upload_progress$', handlers.upload_progress, name="upload_progress"),
                       url(r'^upload/(?P<pk>\d+)/success/$', views.SuccessfulUpload.as_view(),
                           name='success-upload'),
                       url(r'^notificationsJson', views.notifications_as_json,
                           name='not_fragment')
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
