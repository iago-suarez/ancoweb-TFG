import os
from django.contrib.auth.models import User
from django.db import models
from video_upload import utils
from random import randint


def video_file_path(self, filename):
    file, original_ext = os.path.splitext(filename)
    while True:
        upload_to = os.path.join(utils.VIDEOS_FOLDER, str(self.owner.id),
                                 ("v" + str(randint(1, 1000)) + original_ext))
        upload_to_no_ext = os.path.splitext(upload_to)[0]
        # If the name does not exist we create the file
        if not os.path.isfile(os.path.join(upload_to_no_ext, ".mp4")) and \
                not os.path.isfile(os.path.join(upload_to_no_ext, ".ogv")) and \
                not os.path.isfile(os.path.join(upload_to_no_ext, ".webm")):
            break
    return upload_to


class VideoModel(models.Model):
    title = models.CharField(max_length=50)
    video = models.FileField(upload_to=video_file_path)
    detected_objs = models.FileField(null=True)
    image = models.ImageField(null=True)
    description = models.CharField(max_length=250, blank=True)
    owner = models.ForeignKey(User)
    creation_timestamp = models.DateTimeField(auto_now_add=True, blank=True)

    def __str__(self):
        return self.title