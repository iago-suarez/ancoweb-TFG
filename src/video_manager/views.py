# Create your views here.
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views import generic
from django.views.generic import FormView
from ancoweb import settings
from accounts.views import SignInAndSignUp
from django.contrib import messages
from video_manager.forms import VideoModelForm, MainImageForm
from video_manager.handlers import VideoUploadHandler
from video_manager.models import VideoModel
import os, subprocess
from video_manager.utils import TimeUtils

VIDEOS_FOLDER = 'videos/'
TEMPORAL_FOLDER = 'tmp/'
DEF_FRAMES_NUM = 5


class IndexView(SignInAndSignUp, generic.ListView):
    template_name = 'videos/index.html'
    model = VideoModel

    def get(self, request, *args, **kwargs):
        return generic.ListView.get(self, request, *args, **kwargs)

    def get_queryset(self):
        qs = super(IndexView, self).get_queryset()
        #Filter if we are in a special search
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


class UploadView(SignInAndSignUp):
    template_name = 'videos/upload.html'

    upload_form_class = VideoModelForm

    def get(self, request, *args, **kwargs):
        if "upload_form" not in kwargs:
            kwargs["upload_form"] = self.upload_form_class()
            request.upload_handlers.insert(0, VideoUploadHandler())
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'upload_form' in request.POST:
            form = self.upload_form_class(request.POST, request.FILES)
            if form.is_valid():
                # If the video form is OK
                instance = form.save()
                return HttpResponseRedirect(reverse('videos:success-upload', args=(instance.id,)))
            else:
                # If the video form has errors
                messages.add_message(request,
                                     messages.ERROR,
                                     "You have errors in your form, please check it!")
                return super().get(request,
                                   upload_form=form)
        else:
            # POST is not from video form
            super().post(self, request, *args, **kwargs)


class DetailsView(generic.DetailView):
    model = VideoModel
    template_name = 'videos/details.html'


class SuccessfulUpload(generic.DetailView):
    template_name = 'videos/successfulUpload.html'
    model = VideoModel

    def get_context_data(self, **kwargs):
        context = super(SuccessfulUpload, self).get_context_data(**kwargs)
        context['form'] = MainImageForm(self.object, self.request.user.id)
        return context

    def post(self, request, *args, **kwargs):
        form = MainImageForm(self.object, request.user.id, request.POST)
        if form.is_valid():
            # Guardamos la imagen correspondiente y borramos la anterior
            video_id = kwargs['pk']
            return HttpResponseRedirect(reverse('videos:details', args=(video_id,)))
        else:
            # If the video form has errors
            messages.add_message(request,
                                 messages.ERROR,
                                 "You have errors in your form, please check it!")
            return super().get(request)


class SuccessfulUploadForm(FormView):
    form_class = MainImageForm

    def form_valid(self, form):
        # This method is called when valid form data has been POSTed.
        # It should return an HttpResponse.
        print('Siii!')
        video_id = self.kwargs['pk']
        return HttpResponseRedirect(reverse('videos:details', args=(video_id,)))
