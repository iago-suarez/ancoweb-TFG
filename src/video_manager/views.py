# Create your views here.
from django.forms import ModelForm, Textarea, ClearableFileInput
from django.shortcuts import redirect
from django.views import generic
from ancoweb import settings
from accounts.views import SignInAndSignUp
from django.contrib import messages
from video_manager import models
from video_manager.models import Video

VIDEOS_FOLDER = 'videos/'


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


class DetailsView(generic.DetailView):
    model = Video
    template_name = 'videos/details.html'


class SuccessfulUpload(SignInAndSignUp, generic.TemplateView):
    template_name = 'videos/successfulUpload.html'
