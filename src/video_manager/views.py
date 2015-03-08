# Create your views here.
from django.forms import ModelForm, Textarea, ClearableFileInput
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views import generic
from ancoweb import settings
from accounts.views import SignInAndSignUp
from django.contrib import messages
from video_manager import models
from video_manager.handlers import VideoUploadHandler
from video_manager.models import Video
import os, subprocess
from video_manager.utils import TimeUtils

VIDEOS_FOLDER = 'videos/'
TEMPORAL_FOLDER = 'tmp/'
DEF_FRAMES_NUM = 3


class IndexView(SignInAndSignUp, generic.ListView):
    template_name = 'videos/index.html'
    model = Video

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.object_list = Video.objects.order_by('title')

    def get_queryset(self):
        """Return the last five published questions."""
        return Video.objects.order_by('title')[:10]

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
            'video': ClearableFileInput(attrs={'accept': '.mp4, .ogv, .avi, .flv'}),
        }
        exclude = ('image',)


class UploadView(SignInAndSignUp):
    template_name = 'videos/upload.html'

    upload_form_class = VideoForm

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
    model = Video
    template_name = 'videos/details.html'


class SuccessfulUpload(generic.DetailView):
    template_name = 'videos/successfulUpload.html'
    model = Video

    def generate_video_frames(self):

        def get_video_frame(time, output_file_no_ext):
            DEFAULT_IMG_EXT = '.png'
            """ time wil be a string with format hh:mm:ss """
            input_path = str(settings.BASE_DIR) + self.object.video.url

            subprocess.call('ffmpeg -y -i %s -ss %s -vframes 1 %s%s' %
                            (input_path, time, output_file_no_ext, DEFAULT_IMG_EXT), shell='TRUE')
            return output_file_no_ext + DEFAULT_IMG_EXT

        def get_video_seconds():
            """ Devuelve un int con el número de segundos"""
            shell_result = subprocess.Popen('ffmpeg -i %s 2>&1 | grep Duration' %
                                            (str(settings.BASE_DIR) + self.object.video.url),
                                            shell='TRUE', stdout=subprocess.PIPE,
                                            stderr=subprocess.STDOUT)

            line = str(shell_result.stdout.readline())
            return TimeUtils.get_sec(line.split()[2])

        def select_seconds(tot_sec):
            """ descartamos el primer y el último segundo de video y devolvemos
             los DEF_FRAMES_NUM intermedios"""
            interval = tot_sec // (DEF_FRAMES_NUM + 1)
            result = []
            for i in range(1, DEF_FRAMES_NUM + 1):
                result.append(i * interval)
            return result

        # Las imágenes se almacenan en una carpeta temporal en media/tmp/usrId
        # Creamos esa carpeta
        directory = str(settings.BASE_DIR) + str(
            settings.MEDIA_URL) + TEMPORAL_FOLDER + str(self.request.user.id)
        if not os.path.exists(directory):
            os.makedirs(directory)
        img_paths = []
        # Generamos todas las imágenes
        for second in select_seconds(get_video_seconds()):
            img_paths.append(get_video_frame(TimeUtils.print_sec(second),
                                             directory + '/out' + str(second)))
        # Devolvemos los paths de ellas
        return img_paths

    def get_context_data(self, **kwargs):
        context = super(SuccessfulUpload, self).get_context_data(**kwargs)
        context['image_urls'] = self.generate_video_frames()
        return context