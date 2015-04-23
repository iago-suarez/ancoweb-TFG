from django.conf.urls import patterns, include, url
from django.contrib import admin
from accounts.views import SignInAndSignUp, LogoutView, AboutView, HomeView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = patterns(
    '',
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^about/$', AboutView.as_view(), name='about'),
    url(r'^accounts/logout$', LogoutView.as_view(), name='logout'),
    url(r'^videos/', include('video_manager.urls', namespace='videos')),
    url(r'video_upload/', include('video_upload.urls', namespace='video_upload')),
    url(r'^admin/', include(admin.site.urls)),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)