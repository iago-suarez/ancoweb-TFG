# Create your views here.
from django import forms
from django.forms import ModelForm, Textarea
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.views import generic
import os
from ancoweb import settings
from accounts.views import SignInAndSignUp
from django.contrib import messages
from video_manager import models

VIDEOS_FOLDER = 'videos/'


class IndexView(generic.ListView, SignInAndSignUp):
    template_name = 'videos/index.html'
    context_object_name = 'video_list'

    @property
    def object_list(self):
        """Return the elements."""
        videos = []
        directory = os.path.join(settings.MEDIA_ROOT, VIDEOS_FOLDER)
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


class VideoForm(ModelForm):
    class Meta:
        model = models.Video
        fields = ['title', 'video', 'description']
        widgets = {
            'description': Textarea(attrs={'cols': 40, 'rows': 8}),
        }


class UploadView(SignInAndSignUp):
    template_name = 'videos/upload.html'

    upload_form_class = VideoForm

    def get(self, request, *args, **kwargs):
        if "upload_form" not in kwargs:
            kwargs["upload_form"] = self.upload_form_class()
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'upload_form' in request.POST:
            form = self.upload_form_class(request.POST, request.FILES)
            if form.is_valid():
                # If the video form is OK
                form.save()
                return redirect('videos:success-upload')
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


# def handle_uploaded_file(f, name):
#     video_file = os.path.join(settings.MEDIA_ROOT, VIDEOS_FOLDER, name)
#     with open(video_file, 'wb+') as destination:
#         for chunk in f.chunks():
#             destination.write(chunk)


class DetailsView(SignInAndSignUp, generic.TemplateView):
    template_name = 'videos/details.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(DetailsView, self).get_context_data(**kwargs)
        # Add in the publisher
        context['videoName'] = kwargs['videoName']
        context['videoUrl'] = VIDEOS_FOLDER + kwargs['videoName'] + '.ogv'
        return context


class SuccessfulUpload(SignInAndSignUp, generic.TemplateView):
    template_name = 'videos/successfulUpload.html'
