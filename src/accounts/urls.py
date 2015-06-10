from django.conf.urls import url, include
from accounts.views import LoginView, LogoutView

urlpatterns = [
    url(r'^login/$', LoginView.as_view(), name='login'),
    url(r'^logout/$', LogoutView.as_view(), name='logout'),
    url(r'', include('django.contrib.auth.urls')),

]
