from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views import generic
from ancoweb import settings
from accounts.views import SignInAndSignUp
from django.contrib import messages
from video_manager.forms import VideoModelForm, generate_video_frames
from video_manager.handlers import VideoUploadHandler
from video_manager.models import VideoModel

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
        context['image_urls'] = generate_video_frames(self.object, self.request.user.id)
        return context

    def post(self, request, *args, **kwargs):
        # Save the POSTed url like an image
        image_url = request.POST.get('main_image')
        image_path = image_url.split(settings.MEDIA_URL)[1]
        videoModel = self.get_object()
        videoModel.image = image_path
        videoModel.save()

        # Delete the generated images

        return HttpResponseRedirect(reverse('videos:details', args=(videoModel.id,)))