from django.db import models

# Create your models here.


class Video(models.Model):
    title = models.CharField(max_length=50)
    video = models.FileField()
    description = models.CharField(max_length=250)

    def __str__(self):
        return self.title