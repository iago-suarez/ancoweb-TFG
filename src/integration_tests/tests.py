import os

from djangojs.runners import QUnitSuite, JsTemplateTestCase
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions

from ancoweb.tests import SeleniumAncowebTest
from video_upload.models import UploadProcess
from ancoweb import settings
from video_manager.models import VideoModel
from video_upload import utils


class VideoUploadSeleniumTests(SeleniumAncowebTest):
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
        wait.until(expected_conditions.element_to_be_clickable((By.CSS_SELECTOR, 'a.video-finished-btn')))
        self.selenium.find_element_by_css_selector('a.video-finished-btn').click()
        video_images = self.selenium.find_elements_by_class_name('image_picker_image')
        self.assertEqual(utils.DEF_FRAMES_NUM, len(video_images))
        video_images[0].click()
        self.selenium.find_element_by_css_selector('input[type="submit"]').click()

        # Comprobamos que nos ha redirigido a la página del vídeo
        wait.until(expected_conditions.presence_of_element_located((By.TAG_NAME, 'video')))
        video = VideoModel.objects.get(title=video_title)
        assert str(video.id) in self.selenium.current_url
        self.assertEqual(video_title, self.selenium.find_element_by_tag_name("h2").text)

        # Comprobamos que se haya añadido al indice
        self.selenium.get(self.live_server_url + reverse('videos:index'))
        self.selenium.find_element_by_link_text(video_title)

        # Comprobamos que no haya notificaciones
        self.assertEqual(0, len(UploadProcess.objects.all()))

        # Logout
        video.delete()
        self.logout_user(john)

    def test_notification_delete_and_cancel_update(self):
        # TODO Implementar
        # Testeamos que funcione con usuario adecuado en el medio de la subida
        # Testeamos que funcione con usuario adecuado tras la subida
        # Testeamos el Permission Denied con otro usuario
        # Testeamos sin usuario logueado -> login required
        pass


class VideoManagerSeleniumTests(SeleniumAncowebTest):
    def test_video_in_list(self):
        john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        john.save()
        v1 = VideoModel.objects.create(title="Primero", video="tests_resources/v296.mpg",
                                       detected_objs="tests_resources/wk1gt.xml",
                                       description="Descripcion.", owner=john,
                                       image="tests_resources/test-img.jpg")

        v1.save()
        self.selenium.get(self.live_server_url + reverse('videos:index'))
        title = self.selenium.find_element_by_css_selector(
            "li.video-fragment div.col-xs-9 a").text
        self.assertEqual(title, v1.title)

        v1.delete(delete_files=False)
        john.delete()

    def test_check_analyze(self):
        # TODO Implementar
        # Testeamos con el video analizado
        # Testeamos con el video subiendose
        # Testeamos con el video analizando
        pass

    def test_details(self):
        # TODO Implementar
        # Mientras el video se está subiendo
        pass

    def test_make_analyze(self):
        # TODO Implementar
        # Testeamos que no funcione cuando el vídeo todavía se está subiendo
        pass


class QUnitVideoPlayerTests(QUnitSuite, JsTemplateTestCase):
    django_js = True
    template_name = 'integration_tests/test-qunit.html'
    js_files = (
        'site/js/jquery-1.10.2.min.js',
        'site/js/Detection.js',
        'site/tests/Detection.tests.js',
        'site/js/VideoDetections.js',
        #'site/js/video-player.js',
        'site/tests/video-player.tests.js',
        'site/tests/qunit-assert-canvas.js',
    )
