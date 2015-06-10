from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.views import generic

from ancoweb import settings
from video_manager.models import VideoModel, AnalysisProcess


VIDEOS_FOLDER = 'videos/'
TEMPORAL_FOLDER = 'tmp/'
DEF_FRAMES_NUM = 5


class IndexView(generic.ListView):
    template_name = 'videos/index.html'
    model = VideoModel

    def get(self, request, *args, **kwargs):
        return generic.ListView.get(self, request, *args, **kwargs)

    def get_queryset(self):
        qs = super(IndexView, self).get_queryset()
        # Exclude incomplete uploads
        qs = qs.order_by('creation_timestamp').exclude(image="").exclude(detected_objs="").reverse()
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


class DetailsView(generic.DetailView):
    model = VideoModel
    template_name = 'videos/details.html'

    def get_queryset(self):
        qs = super(DetailsView, self).get_queryset()
        # Exclude incomplete uploads
        qs = qs.exclude(image="").exclude(detected_objs="")
        return qs

    def get_context_data(self, **kwargs):
        # If any AnalysisProcess was created and if finished, we delete it
        try:
            ap = AnalysisProcess.objects.get(video_model=kwargs["object"].id)
            if ap.is_finished:
                ap.delete()
                ap = None
        except AnalysisProcess.DoesNotExist:
            ap = None

        kwargs["ap"] = ap
        return super(DetailsView, self).get_context_data(**kwargs)


def reanalize_video(request, video_id):
    video_model = get_object_or_404(VideoModel, pk=video_id)
    if not AnalysisProcess.objects.filter(video_model=video_id):
        ap = AnalysisProcess.objects.create(video_model=video_model)
        ap.process()
        return get_video_analysis_json(request, video_id)
    else:
        raise Exception('The video is already being analyzed')


def get_video_analysis_json(request, video_id):
    JSONSerializer = serializers.get_serializer("json")
    json_serializer = JSONSerializer()

    obj = get_object_or_404(AnalysisProcess, video_model=video_id)
    json_serializer.serialize([obj, ])
    return HttpResponse(json_serializer.getvalue())

