import os
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.utils.decorators import method_decorator
from django.views import generic
from django.contrib import messages

from ancoweb import settings
from accounts.views import SignInAndSignUp
from videoUpload import utils
from videoUpload.forms import VideoModelForm
from videoUpload.utils import generate_video_frames
from video_manager.models import VideoModel

from django.http import HttpResponse
from django.core.cache import cache

try:
    import json
except ImportError:
    # Django <1.7 packages simplejson for older Python versions
    from django.utils import simplejson as json


# TODO Mover esto al fichero handlers.py, ya que tiene mucha más coherencia
def upload_progress(request):
    """
    Used by Ajax calls

    Return the upload progress and total length values
    """
    if 'X-Progress-ID' in request.GET:
        progress_id = request.GET['X-Progress-ID']
    elif 'X-Progress-ID' in request.META:
        progress_id = request.META['X-Progress-ID']
    if progress_id:
        cache_key = "%s_%s" % (request.META['REMOTE_ADDR'], progress_id)
        data = cache.get(cache_key)
        return HttpResponse(json.dumps(data))


class UploadView(SignInAndSignUp):
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
                return HttpResponseRedirect(reverse('videoUpload:success-upload', args=(instance.id,)))
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
    template_name = 'videoUpload/successfulUpload.html'
    model = VideoModel

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(SuccessfulUpload, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(SuccessfulUpload, self).get_context_data(**kwargs)
        context['image_urls'] = generate_video_frames(self.object, self.request.user.id)
        return context

    def post(self, request, *args, **kwargs):
        # Save the POSTed url like an image
        image_url = request.POST.get('main_image')
        old_path = os.path.join(settings.MEDIA_ROOT, image_url.split(settings.MEDIA_URL)[1])
        video_model = self.get_object()
        # Move the file to the final location
        relocate_image(video_model, old_path)
        video_model.save()

        # Delete the generated images

        return HttpResponseRedirect(reverse('videos:details', args=(video_model.id,)))


def relocate_image(video_model, old_path):
    """
    Move the file located on old_path to a new path in /images/userId/videoId.png
    :param video_model:
    :param old_path:
    :return:
    """
    new_path = os.path.join(utils.IMAGES_FOLDER,
                            str(video_model.owner.id), str(video_model.id) + utils.IMAGE_DEFAULT_EXT)
    new_path_root= os.path.join(settings.MEDIA_ROOT, new_path)
    directory, file = os.path.split(new_path_root)
    if not os.path.exists(directory):
        os.makedirs(directory)
    os.rename(old_path, new_path_root)
    # Debemos extraer la parte correspondiente a MEDIA_ROOT
    video_model.image = new_path
    return new_path_root