from django import forms
from video_manager import models


class VideoModelForm(forms.ModelForm):
    class Meta:
        model = models.VideoModel
        fields = ['title', 'video', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'cols': 40, 'rows': 8}),
            'video': forms.ClearableFileInput(attrs={'accept': '.mp4, .ogv, .avi, .flv, .webm'}),
        }
        exclude = ('image',)