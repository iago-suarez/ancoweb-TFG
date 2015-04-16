from os import path, makedirs
import os
from subprocess import call, Popen, STDOUT, PIPE
from ancoweb import settings

VIDEOS_FOLDER = 'videos/'
IMAGES_FOLDER = 'images'
TEMPORAL_FOLDER = 'tmp/'
IMAGE_DEFAULT_EXT = '.png'
VIDEO_DEFAULT_EXT = '.mp4'
DEF_FRAMES_NUM = 3


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


def get_video_seconds(video_instance):
    """
    Return video length in seconds

    :param video_instance: The video you will return the length
    :return: The number of seconds (int)
    """
    shell_result = Popen('ffmpeg -i %s 2>&1 | grep Duration' %
                         os.path.join(video_instance.video.storage.location,
                                      video_instance.video.name),
                         shell='TRUE', stdout=PIPE, stderr=STDOUT)

    line = str(shell_result.stdout.readline())
    return TimeUtils.get_sec(line.split()[2])


def select_seconds(tot_sec):
    """
    Returns a list of seconds that are central  DEF_FRAMES_NUM frames of a tot_sec length video.
    :param tot_sec:
    :return:
    """
    interval = tot_sec // (DEF_FRAMES_NUM + 1)
    result = []
    for i in range(1, DEF_FRAMES_NUM + 1):
        result.append(i * interval)
    return result


def generate_video_frames(video_instance):
    """
    Generates DEF_FRAMES_NUM frames from the videoModel video_obj, when the user
    with identifier user_id is logged in.

    :param video_instance:
    :return: the list of relative paths of the generated video frames
    """

    # Las imágenes se almacenan en una carpeta temporal en media/tmp/usrId
    # Creamos esa carpeta
    directory = image_tmp_folder(video_instance)
    img_paths = []

    # Generamos todas las imágenes
    for second in select_seconds(get_video_seconds(video_instance)):
        filename = 'video%s_second%s%s' % (video_instance.id,
                                           str(second), IMAGE_DEFAULT_EXT)
        create_video_frame(video_instance, TimeUtils.print_sec(second),
                           os.path.join(directory, filename))
        img_paths.append(os.path.join(settings.MEDIA_URL, TEMPORAL_FOLDER,
                                      str(video_instance.owner.id), filename))

    # Devolvemos los paths de ellas
    return img_paths


def get_video_frames_paths(video_instance):
    """
    Return the list of the relative paths of the temporal video frames for the video_instance.
    :param video_instance:
    :return:
    """
    img_paths = []

    # Generamos todas las imágenes
    for second in select_seconds(get_video_seconds(video_instance)):
        filename = 'video%s_second%s%s' % (video_instance.id,
                                           str(second), IMAGE_DEFAULT_EXT)
        img_paths.append(os.path.join(settings.MEDIA_URL, TEMPORAL_FOLDER,
                                      str(video_instance.owner.id), filename))

    # Devolvemos los paths de ellas
    return img_paths


def image_tmp_folder(video_instance):
    directory = os.path.join(settings.MEDIA_ROOT, TEMPORAL_FOLDER,
                             str(video_instance.owner.id))
    if not path.exists(directory):
        makedirs(directory)
    return directory


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
        l = s.split('.')[0].split(':')
        return int(l[0]) * 3600 + int(l[1]) * 60 + int(l[2])