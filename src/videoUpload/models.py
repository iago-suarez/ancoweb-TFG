import threading
from django.contrib.auth.models import User
from django.db import models
import shutil
from videostream import utils
from videoUpload import tasks
from videoUpload.utils import ImageUtils
from video_manager.models import VideoModel


class VideoUpload(models.Model):
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
        super(VideoUpload, self).save(*args, **kwargs)

    def __str__(self):
        return self.title

    def process(self):
        self.exec_thread = threading.Thread(
            target=self.exec_states
        )
        self.exec_thread.start()

    def exec_states(self):
        tasks.AnalyzeVideo(self).exec()
        tasks.CovertVideo(self).exec()
        tasks.GeneratingImagesState(self).exec()
        tasks.FinishedStated(self).exec()

    def delete(self, using=None):
        # launch this in a new thread, because it can make it
        # waiting to thread running video management
        self.exec_thread = threading.Thread(
            target=delete_upload,
            args=(self, ),
        )
        self.exec_thread.start()


def delete_upload(upload, using=None):
    """
    If the video still is being handled, then wait for the end to delete it,
    and after that call to super(...).delete()
    :param upload: The upload model to delete it
    :param using:
    :return:
    """
    if (not upload.is_finished) and hasattr(upload, 'exec_thread') \
            and upload.exec_thread.is_alive():
        # TODO ver porque el join no funciona correctamente y arreglarlo
        upload.exec_thread.join()

    # Delete the generated images
    shutil.rmtree(ImageUtils.image_tmp_folder(upload.video_model))

    super(VideoUpload, upload).delete(using)