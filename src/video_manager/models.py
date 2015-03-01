from django.db import models


def file_path(self, filename):
    return "videos/" + filename


class Video(models.Model):
    title = models.CharField(max_length=50)
    video = models.FileField(upload_to=file_path)
    description = models.CharField(max_length=250)

    def __str__(self):
        return self.title