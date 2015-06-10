from django.conf.urls import url
from video_manager import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [url(r'^$', views.IndexView.as_view(), name='index'),
               url(r'^(?P<pk>\d+)/$', views.DetailsView.as_view(), name='details'),
               url(r'^(?P<video_id>\d+)/makeanalyze/$', views.reanalize_video, name='makeanalyze'),
               url(r'^(?P<video_id>\d+)/analyze/$', views.get_video_analysis_json, name='analyze'),
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)