from django.views import generic

from ancoweb import settings
from accounts.views import SignInAndSignUp
from video_manager.models import VideoModel
from video_upload.notification_views import NotificationsView


VIDEOS_FOLDER = 'videos/'
TEMPORAL_FOLDER = 'tmp/'
DEF_FRAMES_NUM = 5


class IndexView(NotificationsView, SignInAndSignUp, generic.ListView):
    template_name = 'videos/index.html'
    model = VideoModel

    def get(self, request, *args, **kwargs):
        return generic.ListView.get(self, request, *args, **kwargs)

    def get_queryset(self):
        qs = super(IndexView, self).get_queryset()
        # Filter if we are in a special search
        name = self.request.GET.get('name')
        if name:
            return qs.filter(title__contains=name)
        return qs

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(IndexView, self).get_context_data(**kwargs)
        # Add in a QuerySet of all the books
        context['defaultVideoIcon'] = settings.DEFAULT_VIDEO_ICON
        return context


class DetailsView(NotificationsView, generic.DetailView):
    model = VideoModel
    template_name = 'videos/details.html'