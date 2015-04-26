from django.contrib.auth.models import User
from django.test import TestCase
from video_manager.models import VideoModel
from video_upload.utils import TimeUtils, VideoUtils


class TimeUtilsTestCase(TestCase):
    def test_get_seconds(self):
        """Time in string format are correctly converted to int"""
        self.assertEqual(TimeUtils.get_sec("00:40:19.08"), 2419)
        self.assertEqual(TimeUtils.get_sec("00:00:01.00"), 1)
        self.assertEqual(TimeUtils.get_sec(""), 0)

    def test_print_seconds(self):
        """Time in integer format are correctly converted to string"""
        self.assertEqual(TimeUtils.print_sec(2419), "00:40:19.000")
        self.assertEqual(TimeUtils.print_sec(1), "00:00:01.000")
        self.assertEqual(TimeUtils.print_sec(0), "00:00:00.000")


class VideoUyilsTestCase(TestCase):
    def setUp(self):
        self.john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        self.john.save()
        self.v1 = VideoModel.objects.create(title="Primero", video="tests_resources/v296.mpg",
                                            detected_objs="tests_resources/wk1gt.xml",
                                            description="Descripcion.", owner=self.john)
        self.v1.save()

        self.v2 = VideoModel.objects.create(title="Segundo", video="tests_resources/we2645.mp4",
                                            detected_objs="tests_resources/wk1gt.xml",
                                            description="Descripcion.", owner=self.john)
        self.v2.save()

    def test_create_video_frame(self):
        pass

    def test_get_video_seconds(self):
        self.assertEqual(VideoUtils.get_video_seconds(self.v1), 24)
        self.assertEqual(VideoUtils.get_video_seconds(self.v2), 30)

    def test_get_video_frames_paths(self):
        pass

    def test_get_number_frames(self):
        self.assertEqual(VideoUtils.get_number_frames("media/tests_resources/we2645.mp4"), 719)
        self.assertEqual(VideoUtils.get_number_frames("media/tests_resources/v296.mpg"), 613)

    def test_get_fps(self):
        self.assertEqual(VideoUtils.get_fps("media/tests_resources/we2645.mp4"), 24)
        self.assertEqual(VideoUtils.get_fps("media/tests_resources/v296.mpg"), 25)

    def test_select_seconds(self):
        self.assertEqual(VideoUtils.select_seconds(5, 3), [1, 2, 3])
        self.assertEqual(VideoUtils.select_seconds(40, 3), [10, 20, 30])
        self.assertEqual(VideoUtils.select_seconds(42, 5), [7, 14, 21, 28, 35])
        self.assertEqual(VideoUtils.select_seconds(0, 3), [0, 0, 0])

    def addCleanup(self, function, *args, **kwargs):
        self.v1.delete()
        self.v2.delete()
        self.john.delete()