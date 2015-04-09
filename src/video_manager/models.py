import os
from django.contrib.auth.models import User
from django.db import models
from videoUpload import utils


def video_file_path(self, filename):
    return os.path.join(utils.VIDEOS_FOLDER, str(self.owner.id),
                        (self.title + utils.VIDEO_DEFAULT_EXT))


class VideoModel(models.Model):
    title = models.CharField(max_length=50)
    video = models.FileField(upload_to=video_file_path)
    image = models.ImageField(null=True)
    description = models.CharField(max_length=250, blank=True)
    owner = models.ForeignKey(User)
    creation_timestamp = models.DateTimeField(auto_now_add=True, blank=True)

    def __str__(self):
        return self.title