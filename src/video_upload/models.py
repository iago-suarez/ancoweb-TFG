import threading

from django.contrib.auth.models import User
from django.db import models

from video_upload import tasks
from video_manager.models import VideoModel


class UploadProcess(models.Model):
    video_model = models.ForeignKey(VideoModel)
    progress = models.IntegerField(default=0)
    title = models.CharField(max_length=100)
    owner = models.ForeignKey(User)
    state_message = models.CharField(max_length=100)
    is_finished = models.BooleanField(default=False)
    canceled = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Si no hay valores, asignamos unos por defecto
        if not self.title:
            self.title = self.video_model.title
        if not self.owner_id:
            self.owner = self.video_model.owner
        super(UploadProcess, self).save(*args, **kwargs)

    def __str__(self):
        return self.title

    def process(self):
        self.exec_thread = threading.Thread(
            target=self.exec_states
        )
        self.exec_thread.start()

    def exec_states(self):
        states = [tasks.CovertVideo,
                  tasks.AnalyzeVideo,
                  tasks.GeneratingImagesState,
                  tasks.ProcessFinishedState]
        for state in states:
            self.refresh_from_db()
            if not self.canceled:
                state(self).exec()
            else:
                self.video_model.delete()
                self.delete()
