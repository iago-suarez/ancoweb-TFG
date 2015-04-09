from django.contrib.auth.models import User
from django.db import models


def video_file_path(self, filename):
    return "videos/" + str(self.owner.id) + "/" + self.title


class VideoModel(models.Model):
    title = models.CharField(max_length=50)
    video = models.FileField(upload_to=video_file_path)
    image = models.ImageField(null=True)
    description = models.CharField(max_length=250)
    owner = models.ForeignKey(User)
    creation_timestamp = models.DateTimeField(auto_now_add=True, blank=True)

    def __str__(self):
        return self.title