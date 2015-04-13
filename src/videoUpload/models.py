from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.db import models


class UploadNotification(models.Model):

    title = models.CharField(max_length=200)
    progress = models.IntegerField(default=0, )
    owner = models.ForeignKey(User)

    def get_absolute_url(self):
        return reverse('home')