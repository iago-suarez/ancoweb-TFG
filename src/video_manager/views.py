# Create your views here.
from django.views import generic
import os
from ancoweb import settings
from accounts.views import SignInAndSignUp


class IndexView(generic.ListView, SignInAndSignUp):
    template_name = 'videos/index.html'
    context_object_name = 'video_list'

    @property
    def object_list(self):
        """Return the elements."""
        videos = []
        directory = os.path.join(settings.MEDIA_ROOT, 'videos/')
        # 'videos/' file should exist in static path. otherwise, error will occur
        for file in os.listdir(directory):
            if file.endswith(".ogv"):
                videos.append(file.replace(".ogv", ""))
        return videos

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(IndexView, self).get_context_data(**kwargs)
        # Add in a QuerySet of all the books
        context['defaultVideoIcon'] = settings.DEFAULT_VIDEO_ICON
        return context


class DetailsView(SignInAndSignUp, generic.TemplateView):

    template_name = 'videos/details.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(DetailsView, self).get_context_data(**kwargs)
        # Add in the publisher
        context['videoName'] = kwargs['videoName']
        context['videoUrl'] = 'videos/' + kwargs['videoName'] + '.ogv'
        return context