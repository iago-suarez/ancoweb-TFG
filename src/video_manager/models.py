from django.db import models
import os, subprocess
# name, extension = os.path.splitext(filename)
# subprocess.call('ffmpeg -i %s %s.mp4' % (filename, name), shell='TRUE')

DEF_VIDEO_FOLDER = 'videos/'
DEF_VIDEO_EXT = '.mp4'


def file_path(self, filename):
    return "videos/" + filename


class Video(models.Model):

    title = models.CharField(max_length=50)
    video = models.FileField(upload_to=file_path)
    description = models.CharField(max_length=250)

    def __str__(self):
        return self.title