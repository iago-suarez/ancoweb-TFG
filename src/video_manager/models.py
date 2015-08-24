import os
import threading
from random import randint

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models

from ancoweb import settings
from video_upload import utils, tasks


# 30 MB
MAX_FILE_SIZE = 1024 * 1024 * 30


def get_valid_filename(filename, bad_extensions=None, directory=""):
    """
    If the name filename exists with its extension or any of the bad_extensions
    the function returns a new filename which will be valid, appending _ and
    random numbers

    :param filename: The input name of the file
    :param bad_extensions: extensions tha are not allowed
    :return: The valid filename
    """
    if not bad_extensions:
        bad_extensions = []
    file, ext = os.path.splitext(filename)
    # While exists a file with this name, we search other filename recursively
    while True:
        is_valid = True
        my_bad_exts = bad_extensions[:]
        my_bad_exts.append(ext)
        for bad_ext in my_bad_exts:
            if os.path.isfile(os.path.join(directory, file + bad_ext)):
                is_valid = False
                break
        if is_valid:
            return filename
        else:
            return get_valid_filename(file + "_" + str(randint(1, 10000)) + ext,
                                      bad_extensions, directory)


def video_file_path(self, filename):
    file, original_ext = os.path.splitext(filename)
    name = os.path.join(utils.VIDEOS_FOLDER, str(self.owner.id),
                        ("v" + original_ext))
    # Solo con name no es suficiente, ya que queremos guardar tanto en
    # fichero original, como sus versiones en las demas extensiones
    return get_valid_filename(name, settings.USED_VIDEO_EXTENSIONS, settings.MEDIA_ROOT)


class VideoField(models.FileField):
    def validate(self, value, model_instance):
        "Check if value consists only of valid emails."
        if model_instance.video.size > MAX_FILE_SIZE:
            raise ValidationError("The so large file exceeds "
                                  + str(MAX_FILE_SIZE / (1024 * 1024)) + "MB", code=500)
        # Use the parent's handling of required fields, etc.
        super(VideoField, self).validate(value, model_instance)


class VideoModel(models.Model):
    title = models.CharField(max_length=50)
    video = VideoField(upload_to=video_file_path)
    detected_objs = models.FileField(null=True)
    image = models.ImageField(null=True)
    description = models.CharField(max_length=250, blank=True)
    owner = models.ForeignKey(User)
    creation_timestamp = models.DateTimeField(auto_now_add=True, blank=True)

    def __str__(self):
        return self.title

    def delete(self, using=None, delete_files=True):
        if delete_files:
            os.remove(os.path.join(self.video.storage.location, self.video.name))
            for ext in settings.USED_VIDEO_EXTENSIONS:
                name = os.path.splitext(
                    os.path.join(self.video.storage.location, self.video.name))[0] + ext
                os.remove(name)
            if self.image:
                os.remove(os.path.join(self.image.storage.location, self.image.name))
            if self.detected_objs:
                os.remove(os.path.join(self.detected_objs.storage.location,
                                       self.detected_objs.name))
        return super(VideoModel, self).delete(using)


class AnalysisProcess(models.Model):
    video_model = models.ForeignKey(VideoModel)
    progress = models.IntegerField(default=0)
    state_message = models.CharField(max_length=100)
    is_finished = models.BooleanField(default=False)

    def __str__(self):
        return self.video_model.title

    def process(self):
        self.exec_thread = threading.Thread(
            target=self.exec_states
        )
        self.exec_thread.start()

    def exec_states(self):
        tasks.AnalyzeVideo(self).exec()
        tasks.AnalysisFinishedState(self).exec()
