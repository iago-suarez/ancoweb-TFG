import os
import subprocess
from django import forms
from ancoweb import settings
from video_manager import models
from video_manager.utils import TimeUtils

VIDEOS_FOLDER = 'videos/'
TEMPORAL_FOLDER = 'tmp/'
DEF_FRAMES_NUM = 5


def generate_video_frames(video_obj, user_id):
    """
    Generates DEF_FRAMES_NUM frames from the videoModel video_obj, when the user
    with identifier user_id is logged in.

    :param video_obj:
    :param user_id:
    :return: the list of relative paths of the generated video frames
    """

    def create_video_frame(time, output_file):
        """ time wil be a string with format hh:mm:ss """
        input_path = str(settings.BASE_DIR) + video_obj.video.url
        subprocess.call('ffmpeg -n -i %s -ss %s -vframes 1 %s' %
                        (input_path, time, output_file), shell='TRUE')

    def get_video_seconds():
        """ Devuelve un int con el número de segundos"""
        shell_result = subprocess.Popen('ffmpeg -i %s 2>&1 | grep Duration' %
                                        (str(settings.BASE_DIR) + video_obj.video.url),
                                        shell='TRUE', stdout=subprocess.PIPE,
                                        stderr=subprocess.STDOUT)

        line = str(shell_result.stdout.readline())
        return TimeUtils.get_sec(line.split()[2])

    def select_seconds(tot_sec):
        """ descartamos el primer y el último segundo de video y devolvemos
         los DEF_FRAMES_NUM intermedios"""
        interval = tot_sec // (DEF_FRAMES_NUM + 1)
        result = []
        for i in range(1, DEF_FRAMES_NUM + 1):
            result.append(i * interval)
        return result

    # Las imágenes se almacenan en una carpeta temporal en media/tmp/usrId
    # Creamos esa carpeta
    directory = str(
        settings.MEDIA_ROOT) + TEMPORAL_FOLDER + str(user_id) + '/'
    if not os.path.exists(directory):
        os.makedirs(directory)
    img_paths = []
    # Generamos todas las imágenes
    for second in select_seconds(get_video_seconds()):
        filename = 'video%s_second%s.png' % (video_obj.id, str(second))
        create_video_frame(TimeUtils.print_sec(second),
                           directory + filename)
        img_paths.append(str(settings.MEDIA_URL) + TEMPORAL_FOLDER
                         + str(user_id) + '/' + filename)
    # Devolvemos los paths de ellas
    return img_paths


class VideoModelForm(forms.ModelForm):
    class Meta:
        model = models.VideoModel
        fields = ['title', 'video', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'cols': 40, 'rows': 8}),
            'video': forms.ClearableFileInput(attrs={'accept': '.mp4, .ogv, .avi, .flv'}),
        }
        exclude = ('image',)