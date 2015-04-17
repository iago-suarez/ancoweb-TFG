import os

from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.utils.decorators import method_decorator
from django.views import generic
from django.contrib import messages

from ancoweb import settings
from accounts.views import SignInAndSignUp
from videoUpload.forms import VideoModelForm
from videoUpload.models import VideoUpload
from videoUpload.utils import VideoUtils, ImageUtils
from video_manager.models import VideoModel
from videoUpload.notification_views import NotificationsView


class UploadView(NotificationsView, SignInAndSignUp):
    template_name = 'videoUpload/upload.html'
    upload_form_class = VideoModelForm

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(UploadView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        if "upload_form" not in kwargs:
            kwargs["upload_form"] = self.upload_form_class()
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'upload_form' in request.POST:
            form = self.upload_form_class(request.POST, request.FILES)
            if form.is_valid():
                # If the video form is OK
                instance = form.save(commit=False)
                instance.owner = request.user
                instance.save()
                notification = VideoUpload.objects.create(video_model=instance)
                notification.process()

                return HttpResponseRedirect(reverse('home'))
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


class SuccessfulUpload(NotificationsView, generic.DetailView):
    template_name = 'videoUpload/successfulUpload.html'
    model = VideoModel

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(SuccessfulUpload, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(SuccessfulUpload, self).get_context_data(**kwargs)
        context['image_urls'] = VideoUtils.get_video_frames_paths(self.object)
        return context

    def post(self, request, *args, **kwargs):
        # Save the POSTed url like an image
        image_url = request.POST.get('main_image')
        old_path = os.path.join(settings.MEDIA_ROOT, image_url.split(settings.MEDIA_URL)[1])
        video_model = self.get_object()
        # Move the file to the final location
        ImageUtils.relocate_image(video_model, old_path)
        video_model.save()

        # Delete upload model if exists
        VideoUpload.objects.get(video_model=video_model).delete()

        return HttpResponseRedirect(reverse('videos:details', args=(video_model.id,)))


def notifications_as_json(request):
    JSONSerializer = serializers.get_serializer("json")
    json_serializer = JSONSerializer()

    notifications_qs = VideoUpload.objects.filter(owner=request.user)
    json_serializer.serialize(notifications_qs)
    return HttpResponse(json_serializer.getvalue())


