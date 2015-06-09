import os
from random import randint
from ancoweb import settings
from video_upload import utils
from video_upload.utils import VideoUtils, TimeUtils, ImageUtils
from subprocess import Popen, PIPE, STDOUT
import xml.etree.ElementTree as ET


class ProcessState(object):
    def __init__(self, name, process):
        self.name = name
        self.process = process
        self.process.state_message = name
        self.process.progress = 0
        self.process.save()

    def set_progress(self, progress):
        self.process.progress = progress
        self.process.save()

    def exec(self, **args):
        raise NotImplementedError("Subclasses should implement this!")


class ProcessFinishedStated(ProcessState):
    def __init__(self, upload_model):
        super(ProcessFinishedStated, self).__init__("Your video has been successfully uploaded", upload_model)

    def exec(self):
        self.process.is_finished = True
        self.process.save()


class AnalysisFinishedStated(ProcessState):
    def __init__(self, upload_model):
        super(AnalysisFinishedStated, self).__init__("Your video has been successfully analyzed", upload_model)

    def exec(self):
        self.process.progress = 100
        self.process.is_finished = True
        self.process.save()


class GeneratingImagesState(ProcessState):
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
        directory = ImageUtils.image_tmp_folder(self.process.video_model)
        img_paths = []

        # Generamos todas las imágenes
        for second in VideoUtils.select_seconds(VideoUtils.get_video_seconds(self.process.video_model),
                                                utils.DEF_FRAMES_NUM):
            filename = 'video%s_second%s%s' % (self.process.video_model.id,
                                               str(second), utils.IMAGE_DEFAULT_EXT)
            VideoUtils.create_video_frame(self.process.video_model, TimeUtils.print_sec(second),
                                          os.path.join(directory, filename))
            img_paths.append(os.path.join(settings.MEDIA_URL, utils.TEMPORAL_FOLDER,
                                          str(self.process.video_model.owner.id), filename))

        # Devolvemos los paths de ellas
        return img_paths


class AnalyzeVideo(ProcessState):
    def __init__(self, upload_model):
        super(AnalyzeVideo, self).__init__("Analyzing video", upload_model)

    def exec(self):

        def generate_xml_filename(video_model):
            """
            Return the relative path into MEDIA_ROOT to the video
            xml where can be loaded the behaviour analysis of video_model
            :param video_model:
            :return:
            """
            directory = os.path.join(utils.XML_FOLDER,
                                     str(video_model.owner.id))
            path_directory = os.path.join(settings.MEDIA_ROOT, directory)
            if not os.path.exists(path_directory):
                os.makedirs(path_directory)
            return os.path.join(directory, ("x" + str(randint(1, 1000)) + ".xml"))

        xml_relative_file = generate_xml_filename(self.process.video_model)
        xml_file = os.path.join(str(settings.BASE_DIR), settings.MEDIA_ROOT, xml_relative_file)
        mp4_name = os.path.splitext(self.process.video_model.video.name)[0]
        mp4_name += settings.USED_VIDEO_EXTENSIONS[0]
        video_file = os.path.join(settings.BASE_DIR,
                                  self.process.video_model.video.storage.location,
                                  mp4_name)

        command = settings.RECOGNITIONSYS_BIN + " -i " + video_file + " -o " + xml_file + " --standar"
        video_nframes = utils.VideoUtils.get_number_frames(video_file)

        p = Popen(command, shell='TRUE', stdout=PIPE, stderr=STDOUT, universal_newlines=True)
        while True:
            line = p.stdout.readline()
            if line == "":
                break

            # If the output is a frame xml object, we update the progress
            if line.startswith("<frame"):
                frame_element = ET.fromstring(line)
                nframe = int(frame_element.get("number"))
                progress = 100 * (nframe/video_nframes)
                #Aumentamos el progreso de 5% en 5% para no sobrecargar la BD
                if progress > (self.process.progress + 5):
                    self.set_progress(round(progress))

        self.process.video_model.detected_objs = xml_relative_file
        self.process.video_model.save()


class CovertVideo(ProcessState):
    def __init__(self, upload_model):
        super(CovertVideo, self).__init__("Converting video", upload_model)

    def exec(self):

        def convert_video(input_file, output_extensions):
            """
            Covert input_file video to output_extensions, and update the
            progress of the upload_model object according to the process
            :param input_file:
            :param output_extensions:
            :return:
            """
            output_files = []
            # For each extension we generate the output file
            for out_ext in output_extensions:
                output_files.append(os.path.splitext(input_file)[0] + out_ext)

            frames_num = VideoUtils.get_number_frames(input_file)
            # calculate the number of files with the same extension as're not
            # consume processing time

            def has_input_ext(filename):
                return os.path.splitext(filename)[1] == os.path.splitext(input_file)[1]

            num_files_same_ext = len(list(filter(has_input_ext, output_files)))
            progress_points_by_video = 100 / (len(output_files) - num_files_same_ext)
            passed_files_same_ext = 0

            for i in range(len(output_files)):
                # for each video we convert and update progress
                p = Popen(
                    'ffmpeg -n -stats -i %s %s | grep "frame" 2>&1' %
                    (input_file, output_files[i]),
                    shell='TRUE', stdout=PIPE, stderr=STDOUT,
                    universal_newlines=True)
                # If the file will not be converted, the value of the
                # variable i must decrease by 1 when calculating progress
                if has_input_ext(output_files[i]):
                    passed_files_same_ext += 1
                else:
                    while True:
                        line = p.stdout.readline()
                        if line == "":
                            break
                        words = line.split()
                        # If the output corresponds to a frame number, you update the progress
                        if (len(words) > 2) and (words[0] == "frame="):
                            progress_of_1 = int(words[1]) / frames_num
                            progress = progress_points_by_video * (i - passed_files_same_ext + progress_of_1)
                            self.set_progress(round(progress))

        original = os.path.join(self.process.video_model.video.storage.location,
                                self.process.video_model.video.name)
        file, ext = os.path.splitext(original)
        convert_video(original, settings.USED_VIDEO_EXTENSIONS)