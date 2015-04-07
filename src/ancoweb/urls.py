from django.conf.urls import patterns, include, url
from django.contrib import admin
from accounts.views import SignInAndSignUp, LogoutView, AboutView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = patterns(
    '',
    url(r'^$', SignInAndSignUp.as_view(template_name='home.html'),
        name='home'),
    url(r'^about/$', AboutView.as_view(), name='about'),
    url(r'^accounts/logout$', LogoutView.as_view(), name='logout'),
    url(r'^videos/', include('video_manager.urls', namespace='videos')),
    url(r'videoUpload/', include('videoUpload.urls', namespace='videoUpload')),
    url(r'^admin/', include(admin.site.urls)),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)