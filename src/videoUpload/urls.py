from django.conf.urls import patterns, url
from django.conf import settings
from django.conf.urls.static import static
from videoUpload import views

urlpatterns = patterns('',
                       url(r'^$', views.UploadView.as_view(), name='upload'),
                       url(r'^upload_progress$', views.upload_progress, name="upload_progress"),
                       url(r'^upload/(?P<pk>\d+)/success/$', views.SuccessfulUpload.as_view(),
                           name='success-upload'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
