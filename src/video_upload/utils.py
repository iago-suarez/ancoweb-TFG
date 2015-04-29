from os import path, makedirs
import os
from subprocess import call, Popen, STDOUT, PIPE
from ancoweb import settings

VIDEOS_FOLDER = 'videos'
IMAGES_FOLDER = 'images'
XML_FOLDER = 'xml'
TEMPORAL_FOLDER = 'tmp'
IMAGE_DEFAULT_EXT = '.png'
VIDEO_DEFAULT_EXT = '.mp4'
DEF_FRAMES_NUM = 3


class VideoUtils:
    @staticmethod
    def create_video_frame(video_instance, time, output_file):
        """
        Create a new video frame

        :param video_instance: The video you will create a video frame
        :param time: time wil be a string with format hh:mm:ss
        :param output_file: The output to the video we will create
        :return:
        """
        input_path = os.path.join(video_instance.video.storage.location, video_instance.video.name)
        call('ffmpeg -n -i %s -ss %s -vframes 1 %s' %
             (input_path, time, output_file), shell='TRUE')

    @staticmethod
    def get_video_seconds(video_instance):
        """
        Return video length in seconds

        :param video_instance: The video you will return the length
        :return: The number of seconds (int)
        """
        shell_result = Popen('ffmpeg -i %s 2>&1 | grep Duration' %
                             os.path.join(video_instance.video.storage.location,
                                          video_instance.video.name),
                             shell='TRUE', stdout=PIPE, stderr=STDOUT, universal_newlines=True)

        line = str(shell_result.stdout.readline())
        # De toda la linea de información buscamos la duración y la devolvemos
        for video_property in line.split(','):
            if 'Duration' in video_property:
                return TimeUtils.get_sec(video_property.split()[1])

        return TimeUtils.get_sec(line.split()[2])

    @staticmethod
    def select_seconds(tot_sec, parts):
        """
        Returns a list of seconds(int) that are central  parts frames of a tot_sec length video.
        :param tot_sec:
        :param parts:
        :return:
        """
        interval = tot_sec // (parts + 1)

        result = []
        for i in range(1, parts + 1):
            result.append(i * interval)
        return result

    @staticmethod
    def get_video_frames_paths(video_instance):
        """
        Return the list of the relative paths of the temporal video frames for the video_instance.
        :param video_instance:
        :return:
        """
        img_paths = []

        # Generamos todas las imágenes
        for second in VideoUtils.select_seconds(VideoUtils.get_video_seconds(video_instance), DEF_FRAMES_NUM):
            filename = 'video%s_second%s%s' % (video_instance.id,
                                               str(second), IMAGE_DEFAULT_EXT)
            img_paths.append(os.path.join(settings.MEDIA_URL, TEMPORAL_FOLDER,
                                          str(video_instance.owner.id), filename))

        # Devolvemos los paths de ellas
        return img_paths

    @staticmethod
    def get_number_frames(video_path):
        """
        Return the frames number for the video on video_path
        :param video_path:
        :return:
        """
        p = Popen("ffmpeg -i %s -vcodec copy -f rawvideo "
                  "-y /dev/null 2>&1 | tr ^M '\n' | awk "
                  "'/^frame=/ {print $2}'|tail -n 1" % video_path,
                  shell='TRUE', stdout=PIPE, stderr=STDOUT, universal_newlines=True)
        try:
            return int(p.stdout.readline())
        except ValueError:
            raise IOError(p.stdout.readline())

    @staticmethod
    def get_fps(video_path):
        p = Popen("ffmpeg -i %s 2>&1| grep fps" % video_path,
                  shell='TRUE', stdout=PIPE, stderr=STDOUT, universal_newlines=True)
        line = p.stdout.readline()
        # De toda la linea de información buscamos los fps y los devolvemos
        for video_property in line.split(','):
            if 'fps' in video_property:
                return round(float(video_property.split()[0]))


class ImageUtils:
    @staticmethod
    def image_tmp_folder(video_instance):
        directory = os.path.join(settings.MEDIA_ROOT, TEMPORAL_FOLDER,
                                 str(video_instance.owner.id))
        if not path.exists(directory):
            makedirs(directory)
        return directory

    @staticmethod
    def relocate_image(video_model, old_path):
        """
        Move the file located on old_path to a new path in MEDIA_ROOT/images/userId/videoId.png
        :param video_model:
        :param old_path:
        :return:
        """
        new_path = os.path.join(IMAGES_FOLDER,
                                str(video_model.owner.id), str(video_model.id) + IMAGE_DEFAULT_EXT)
        new_path_root = os.path.join(settings.MEDIA_ROOT, new_path)
        directory, file = os.path.split(new_path_root)
        if not os.path.exists(directory):
            os.makedirs(directory)
        os.rename(old_path, new_path_root)
        video_model.image = new_path
        return new_path_root


class TimeUtils:
    @staticmethod
    def print_sec(s):
        """ s -> hh:mm:ss.mss """
        [hours, s_m] = divmod(s, 3600)
        [minutes, seconds] = divmod(s_m, 60)
        return '{:0>2d}:{:0>2d}:{:0>2d}.000'.format(hours, minutes, seconds)

    @staticmethod
    def get_sec(s):
        """ hh:mm:ss.mss -> s """
        if s == "":
            return 0
        l = s.split('.')[0].split(':')
        return int(l[0]) * 3600 + int(l[1]) * 60 + int(l[2])


def media_url_to_path(file_url):
    """
    Convert a media file url to a relative path into MEDIA_ROOT folder
    :param file_url:
    :return:
    """
    return os.path.join(settings.MEDIA_ROOT, file_url.split(settings.MEDIA_URL)[1])