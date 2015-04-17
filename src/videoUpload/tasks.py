import os
import time
from ancoweb import settings
from videoUpload import utils
from videoUpload.utils import VideoUtils, TimeUtils, ImageUtils


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


class FinishedStated(UploadState):
    def __init__(self, upload_model):
        super(FinishedStated, self).__init__("Your video has been successfully uploaded", upload_model)

    def exec(self):
        self.upload_model.is_finished = True
        self.upload_model.save()


class GeneratingImagesState(UploadState):
    def __init__(self, upload_model):
        super(GeneratingImagesState, self).__init__("Generating image", upload_model)

    def exec(self):
        """
        Generates DEF_FRAMES_NUM frames from the videoModel video_obj, when the user
        with identifier user_id is logged in.

        :return: the list of relative paths of the generated video frames
        """

        # Las imágenes se almacenan en una carpeta temporal en media/tmp/usrId
        # Creamos esa carpeta
        directory = ImageUtils.image_tmp_folder(self.upload_model.video_model)
        img_paths = []

        # Generamos todas las imágenes
        for second in VideoUtils.select_seconds(VideoUtils.get_video_seconds(self.upload_model.video_model)):
            filename = 'video%s_second%s%s' % (self.upload_model.video_model.id,
                                               str(second), utils.IMAGE_DEFAULT_EXT)
            VideoUtils.create_video_frame(self.upload_model.video_model, TimeUtils.print_sec(second),
                               os.path.join(directory, filename))
            img_paths.append(os.path.join(settings.MEDIA_URL, utils.TEMPORAL_FOLDER,
                                          str(self.upload_model.video_model.owner.id), filename))

        # Devolvemos los paths de ellas
        return img_paths


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
