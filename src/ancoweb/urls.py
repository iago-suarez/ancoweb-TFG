from django.conf.urls import include
from django.contrib import admin
from accounts.views import AboutView, HomeView
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url
from integration_tests.views import MyQUnitView

urlpatterns = [
                  url(r'^$', HomeView.as_view(), name='home'),
                  url(r'^about/$', AboutView.as_view(), name='about'),
                  url(r'^videos/', include('video_manager.urls', namespace='videos')),
                  url(r'video_upload/', include('video_upload.urls', namespace='video_upload')),
                  url(r'^accounts/', include('accounts.urls', namespace="accounts")),
                  url(r'^admin/', include(admin.site.urls)),
                  url(r'^djangojs/', include('djangojs.urls')),
                  url(r'^qunit$', MyQUnitView.as_view(), name='my_qunit_view'),
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)