from django.contrib.auth.models import User
from django.db import models


def file_path(self, filename):
    return "videos/" + filename


class VideoFileField(models.FileField):
    # TODO guardar los videos remplazando el nombre que me
    # dan por un id, para ello hay que crear una clase que
    # extienda de FileField, y reescribir el método generate_filename
    pass


class VideoModel(models.Model):

    title = models.CharField(max_length=50)
    video = models.FileField(upload_to=file_path)
    image = models.ImageField(null=True)
    description = models.CharField(max_length=250)
    owner = models.ForeignKey(User)
    creation_timestamp = models.DateTimeField(auto_now_add=True, blank=True)

    def __str__(self):
        return self.title