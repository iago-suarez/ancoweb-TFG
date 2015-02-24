# Create your views here.
from django.shortcuts import render
from django.views import generic
import os
from ancoweb import settings


class IndexView(generic.ListView):
    template_name = 'videos/index.html'
    context_object_name = 'video_list'

    def get_queryset(self):
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

def details(request, videoName):
    context = {'videoUrl': 'videos/' + videoName + '.ogv',
               'videoName': videoName}
    return render(request, 'videos/details.html', context)
