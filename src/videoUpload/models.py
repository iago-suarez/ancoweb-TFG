import threading
from django.contrib.auth.models import User
from django.db import models
import time
from videoUpload import utils
from video_manager.models import VideoModel


class UploadState(object):
    def __init__(self, name, upload_model):
        self.name = name
        self.upload_model = upload_model
        self.upload_model.state_message = name
        self.upload_model.progress = 0
        self.upload_model.save()

    def set_progress(self, progress):
        self.upload_model.progress = progress
        self.upload_model.save()

    def exec(self, **args):
        raise NotImplementedError("Subclasses should implement this!")


class GeneratingImagesState(UploadState):
    def __init__(self, upload_model):
        super(GeneratingImagesState, self).__init__("Generating image", upload_model)

    def exec(self):
        utils.generate_video_frames(self.upload_model.video_model)


class AnalyzeVideo(UploadState):
    def __init__(self, upload_model):
        super(AnalyzeVideo, self).__init__("Analyzing video", upload_model)

    def exec(self):
        # TODO Implementar
        for i in range(0, 100):
            time.sleep(.01)
            if i % 3 == 0:
                self.set_progress(i)


class CovertVideo(UploadState):
    def __init__(self, upload_model):
        super(CovertVideo, self).__init__("Converting video", upload_model)

    def exec(self):
        # TODO Implementar
        for i in range(0, 100):
            time.sleep(.01)
            if i % 3 == 0:
                self.set_progress(i)


class FinishedStated(UploadState):
    def __init__(self, upload_model):
        super(FinishedStated, self).__init__("Your video has been successfully uploaded", upload_model)

    def exec(self):
        self.upload_model.is_finished = True
        self.upload_model.save()


class UploadNotification(models.Model):
    video_model = models.ForeignKey(VideoModel)
    progress = models.IntegerField(default=0)
    title = models.CharField(max_length=100)  # default=video_model.title
    owner = models.ForeignKey(User)  # default=video_model.owner
    state_message = models.CharField(max_length=100)
    is_finished = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Si no hay valores, asignamos unos por defecto
        if not self.title:
            self.title = self.video_model.title
        if not self.owner_id:
            self.owner = self.video_model.owner
        super(UploadNotification, self).save(*args, **kwargs)

    def __str__(self):
        return self.title

    def process(self):
        threading.Thread(
            target=self.exec_states
        ).start()

    def exec_states(self):
        AnalyzeVideo(self).exec()
        CovertVideo(self).exec()
        GeneratingImagesState(self).exec()
        FinishedStated(self).exec()

    def delete(self, using=None):
        # TODO Implementar
        super(UploadNotification, self).delete()