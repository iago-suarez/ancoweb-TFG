import os
import io

from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.test import Client
from django.test import TestCase

from ancoweb import settings
from ancoweb.tests import SeleniumAncowebTest
from video_manager.models import VideoModel, get_valid_filename


class VideoManagerTests(TestCase):
    def setUp(self):
        # Every test needs a client.
        self.client = Client()

        self.john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        self.john.save()
        self.v1 = VideoModel.objects.create(title="Primero", video="tests_resources/v296.mpg",
                                            detected_objs="tests_resources/wk1gt.xml",
                                            description="Descripcion.", owner=self.john,
                                            image="tests_resources/test-img.jpg")
        self.v1.save()

        self.v2 = VideoModel.objects.create(title="Segundo", video="tests_resources/v296.mpg",
                                            detected_objs="tests_resources/wk1gt.xml",
                                            description="Descripcion.", owner=self.john,
                                            image="tests_resources/test-img.jpg")
        self.v2.save()

    def test_index(self):
        # Create a video without image
        v3 = VideoModel.objects.create(title="Segundo", video="tests_resources/v296.mpg",
                                       detected_objs="tests_resources/wk1gt.xml",
                                       description="Descripcion.", owner=self.john)
        v3.save()
        # Create a video without analisys
        v4 = VideoModel.objects.create(title="Segundo", video="tests_resources/v296.mpg",
                                       description="Descripcion.", owner=self.john,
                                       image="tests_resources/test-img.jpg")
        v4.save()
        # Create a video without image and analisys
        v5 = VideoModel.objects.create(title="Segundo", video="tests_resources/v296.mpg",
                                       description="Descripcion.", owner=self.john)
        v5.save()
        # Issue a GET request.
        url = reverse('videos:index')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

        # Check that the rendered context contains 2 customers in order.
        self.assertEqual(len(r.context['object_list']), 2)
        self.assertEqual(r.context['object_list'][0], self.v2)
        self.assertEqual(r.context['object_list'][1], self.v1)

        v3.delete(delete_files=False)
        v4.delete(delete_files=False)
        v5.delete(delete_files=False)

    def test_details(self):
        # (integration) Mientras el fichero se está subiendo

        # Cuando el vídeo ya está subido
        r = self.client.get(reverse('videos:details', args=(self.v1.id,)))
        self.assertContains(r, self.v1.title)
        self.assertContains(r, self.v1.owner.username)
        self.assertContains(r, self.v1.description)

    def test_make_analyze(self):
        # Nos logueamos con el dueño del video
        url = '/videos/' + str(self.v1.id) + '/makeanalyze/'
        self.client.login(username='john', password='johnpassword')

        # Testeamos que funcione con usuario adecuado sin que se este analizando
        r = self.client.get(url)
        self.assertRedirects(r, reverse('videos:details', args=(self.v1.id,)))
        # r = self.client.get(reverse('videos:details', args=(self.v1.id,)))
        # self.assertContains(r, 'Analyzing video')

        # Testeamos que no funcione con usuario adecuado cuando ya está analizando
        r = self.client.get(url)
        self.assertEqual(r.status_code, 400)

        # Testeamos el Permission Denied con otro usuario
        self.client.logout()
        paco = User.objects.create_user('paco', 'paco@thebeatles.com', 'pacopassword')
        paco.save()
        self.client.login(username='paco', password='pacopassword')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 403)

        self.client.logout()
        paco.delete()

        # Testeamos sin usuario logueado -> login required
        r = self.client.get(url)
        self.assertRedirects(r, reverse('accounts:login') + '?next=' + url)

        # (integration) test_make_analyze: Testeamos que no funcione cuando
        # en vídeo todavía se está subiendo

    def tearDown(self):
        self.v1.delete(delete_files=False)
        self.v2.delete(delete_files=False)
        self.john.delete()


class VideoModelTests(TestCase):
    def test_get_valid_filename(self):
        # Test without bad_ext
        video_filename = os.path.join(str(settings.BASE_DIR), str(settings.MEDIA_ROOT),
                                      "tests_resources/v296.mpg")
        self.assertNotEqual(video_filename, get_valid_filename(video_filename))

        # Test with bad_ext
        io.open(os.path.splitext(video_filename)[0] + "x.mp4", "a")
        new_name = os.path.splitext(video_filename)[0] + "x.mpg"
        self.assertEqual(new_name, get_valid_filename(new_name))
        generated_name = get_valid_filename(new_name, [".mp4"])
        self.assertNotEqual(new_name, generated_name)

        # Test twice
        io.open(generated_name, "a")
        self.assertNotEqual(generated_name, get_valid_filename(generated_name, [".mp4"]))

        # Delete generated files
        os.remove(os.path.splitext(video_filename)[0] + "x.mp4")
        os.remove(generated_name)


class VideoManagerSeleniumTests(SeleniumAncowebTest):
    def test_make_analyze(self):
        # TODO Implementar y borrar el anterior otro test_make_analyze al hacerlo ya
        # que causa un error de BD

        # Nos logueamos con el dueño del video

        # Testeamos que funcione con usuario adecuado sin que se este analizando

        # Testeamos que no funcione con usuario adecuado cuando ya está analizando

        # Testeamos el Permission Denied con otro usuario

        # Testeamos sin usuario logueado -> login required

        # (integration) test_make_analyze: Testeamos que no funcione cuando
        # en vídeo todavía se está subiendo
        pass
