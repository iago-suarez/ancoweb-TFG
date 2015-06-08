from django.test import TestCase
from ancoweb.tests import SeleniumAncowebTest
from video_upload.models import UploadProcess
from video_upload.utils import TimeUtils, VideoUtils
import os
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from ancoweb import settings
from video_manager.models import VideoModel
from selenium.webdriver.support import expected_conditions as EC
from video_upload import utils


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


class VideoManagerSeleniumTest(SeleniumAncowebTest):

    def test_upload_video(self):

        video_title = "Funcional Tests"

        john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        john.save()
        # Login
        self.login_user(john, 'johnpassword')

        # Upload Video
        self.selenium.get(self.live_server_url)
        upload_url = reverse('video_upload:upload')
        self.selenium.find_element_by_css_selector('a.dropdown-toggle').click()
        self.selenium.find_element_by_css_selector(
            'a[href*="' + upload_url + '"]').click()
        self.selenium.find_element_by_id('id_title').send_keys(video_title)
        self.selenium.find_element_by_id('id_video').send_keys(
            os.path.join(str(settings.BASE_DIR),
                         str(settings.MEDIA_ROOT),
                         "tests_resources/v296.mpg"))
        self.selenium.find_element_by_id('id_description') \
            .send_keys("Funcional Tests Description \n this is a quite "
                       "important test because it'll test the video uploads")

        self.selenium.find_element_by_id('form_submit_button').click()

        wait = WebDriverWait(self.selenium, 100)
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.video-finished-btn')))
        self.selenium.find_element_by_css_selector('a.video-finished-btn').click()
        video_images = self.selenium.find_elements_by_class_name('image_picker_image')
        self.assertEqual(utils.DEF_FRAMES_NUM, len(video_images))
        video_images[0].click()
        self.selenium.find_element_by_css_selector('input[type="submit"]').click()

        # Comprobamos que nos ha redirigido a la página del vídeo
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'video')))
        video_id = VideoModel.objects.get(title=video_title).id
        assert str(video_id) in self.selenium.current_url
        self.assertEqual(video_title, self.selenium.find_element_by_tag_name("h2").text)

        #Comprobamos que se haya añadido al indice
        self.selenium.get(self.live_server_url + reverse('videos:index'))
        self.selenium.find_element_by_link_text(video_title)

        #Comprobamos que no haya notificaciones
        self.assertEqual(0, len(UploadProcess.objects.all()))

        # Logout
        self.logout_user(john)