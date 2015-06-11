import io
from django.test import TestCase
from video_upload.models import UploadProcess
from video_upload.utils import TimeUtils, VideoUtils, ImageUtils
import os
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from ancoweb import settings
from video_manager.models import VideoModel
from video_upload import utils
from django.test import Client


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


class VideoUtilsTestCase(TestCase):
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

    def test_relocate_image(self):
        # Creamos cinco imágenes tres a borrar y dos que no se borrarán
        tmp = "media/tmp"
        if not os.path.exists(tmp):
            os.makedirs(tmp)
        img1del = os.path.join(tmp, "video" + str(self.v1.id) + "_second12.png")
        img2del = os.path.join(tmp, "video" + str(self.v1.id) + "_second31.png")
        img3mov = os.path.join(tmp, "video" + str(self.v1.id) + "_second22.png")
        img4not_del = os.path.join(tmp, "video15_second1.png")
        img5not_del = os.path.join(tmp, "video14_second51.png")
        io.open(img1del, "a")
        io.open(img2del, "a")
        io.open(img3mov, "a")
        io.open(img4not_del, "a")
        io.open(img5not_del, "a")

        # Comprobamos
        ImageUtils.relocate_image(self.v1, img3mov)
        self.assertFalse(os.path.isfile(img1del))
        self.assertFalse(os.path.isfile(img2del))
        self.assertFalse(os.path.isfile(img3mov))
        destination = os.path.join(settings.MEDIA_ROOT,
                                   utils.IMAGES_FOLDER, str(self.v1.owner.id),
                                   str(self.v1.id) + utils.IMAGE_DEFAULT_EXT)
        self.assertTrue(os.path.isfile(destination))
        self.assertTrue(os.path.isfile(img4not_del))
        self.assertTrue(os.path.isfile(img5not_del))

        # Borramos los ficheros para hacer el test repetible
        os.remove(destination)
        os.remove(img4not_del)
        os.remove(img5not_del)

    def addCleanup(self, function, *args, **kwargs):
        self.v1.delete(delete_files=False)
        self.v2.delete(delete_files=False)
        self.john.delete()


class VideoUploadTests(TestCase):
    def setUp(self):
        # Every test needs a client.
        self.client = Client()

        self.john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        self.john.save()
        self.paco = User.objects.create_user('paco', 'paco@thebeatles.com', 'pacopassword')
        self.paco.save()
        self.v1 = VideoModel.objects.create(title="Primero", video="tests_resources/v296.mpg",
                                            detected_objs="tests_resources/wk1gt.xml",
                                            description="Descripcion.", owner=self.john)
        self.v1.save()

    def test_upload_required_login(self):
        response = self.client.get(reverse('video_upload:upload'))
        self.assertRedirects(response, reverse('accounts:login') +
                             '?next=' + reverse('video_upload:upload'))

    # def (integration) test_notification_delete_and_cancel_update

    def upload_progress(self):
        # Not implemented
        pass

    def test_success_upload(self):
        # Testeamos que funcione con usuario adecuado
        self.client.login(username='john', password='johnpassword')
        url = '/video_upload/upload/' + str(self.v1.id) + '/success/'
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.client.logout()

        # Testeamos que sin loguear nos redirija al login
        r = self.client.get(url)
        self.assertRedirects(r, reverse('accounts:login') +
                             '?next=' + url)

        # Testeamos el Permission Denied
        self.client.login(username='paco', password='pacopassword')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 403)

        # Testeamos el error 404 tras la subida de la foto
        self.v1.image = "tests_resources/test-img.jpg"
        self.v1.save()
        r = self.client.get(url)
        self.assertEqual(r.status_code, 404)
        self.client.logout()

    def test_not_fragment(self):
        # Testeamos sin usuario logueado -> login required
        url = reverse('video_upload:json_notifications')
        r = self.client.get(url)
        self.assertRedirects(r, reverse('accounts:login') + '?next=' + url)

        # Testeamos con usuario logueado
        self.client.login(username='john', password='johnpassword')
        r = self.client.get(url)
        self.assertJSONEqual(str(r.content, encoding='utf8'), [])

        # Testeamos con notificaciones y usuario logueado
        up = UploadProcess.objects.create(video_model=self.v1, progress=50,
                                          title='Test upload process',
                                          owner=self.john, state_message='Hello!')
        r = self.client.get(url)
        self.assertJSONEqual(str(r.content, encoding='utf8'),
                             [{'fields': {'canceled': False,
                                          'is_finished': False,
                                          'owner': self.john.id,
                                          'progress': 50,
                                          'state_message': 'Hello!',
                                          'title': 'Test upload process',
                                          'video_model': self.v1.id},
                               'model': 'video_upload.uploadprocess',
                               'pk': up.id}])

    def tearDown(self):
        self.v1.delete(delete_files=False)
        self.paco.delete()
        self.john.delete()