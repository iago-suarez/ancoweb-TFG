from django.core import serializers
from django.core.exceptions import PermissionDenied
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404
from django.views import generic
from django.contrib import messages

from video_upload import utils
from video_upload.forms import VideoModelForm
from video_upload.models import UploadProcess
from video_upload.utils import VideoUtils, ImageUtils
from video_manager.models import VideoModel


class UploadView(generic.TemplateView):
    template_name = 'video_upload/upload.html'
    upload_form_class = VideoModelForm

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
                notification = UploadProcess.objects.create(video_model=instance)
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


class SuccessfulUpload(generic.DetailView):
    template_name = 'video_upload/successful_upload.html'
    model = VideoModel

    def get_queryset(self):
        qs = super(SuccessfulUpload, self).get_queryset()
        # Exclude complete uploads
        qs = qs.filter(image="")
        return qs

    def get_context_data(self, **kwargs):
        context = super(SuccessfulUpload, self).get_context_data(**kwargs)
        context['image_urls'] = VideoUtils.get_video_frames_paths(self.object)
        return context

    def get_object(self, queryset=None):
        """
        Returns the object the view is displaying if the user is his owner
        """
        obj = super(SuccessfulUpload, self).get_object(queryset)
        # If the user is not the owner
        if obj.owner != self.request.user:
            raise PermissionDenied
        return obj

    def post(self, request, *args, **kwargs):
        # Save the POSTed url like an image
        image_url = request.POST.get('main_image')
        old_path = utils.media_url_to_path(image_url)
        video_model = self.get_object()
        # Move the file to the final location
        ImageUtils.relocate_image(video_model, old_path)
        video_model.save()

        # Delete upload model if exists
        UploadProcess.objects.get(video_model=video_model).delete()

        return HttpResponseRedirect(reverse('videos:details', args=(video_model.id,)))


def notifications_as_json(request, *args, **kwargs):
    JSONSerializer = serializers.get_serializer("json")
    json_serializer = JSONSerializer()

    notifications_qs = UploadProcess.objects.filter(owner=request.user)
    json_serializer.serialize(notifications_qs)
    return HttpResponse(json_serializer.getvalue())


def mark_notification_as_deleted(request, pk, *args, **kwargs):
    notification = get_object_or_404(UploadProcess, pk=pk)

    # If the user is not the owner
    if notification.owner != request.user:
        raise PermissionDenied

    if notification.is_finished:
        notification.video_model.delete()
        notification.delete()
    else:
        notification.canceled = True
        notification.save()
    return HttpResponseRedirect(reverse('home'))
