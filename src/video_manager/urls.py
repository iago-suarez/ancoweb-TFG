from django.conf.urls import patterns, url
from video_manager import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = patterns('',
                       url(r'^$', views.IndexView.as_view(), name='index'),
                           url(r'^(?P<videoName>.+)/$', views.DetailsView.as_view(), name='details'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)