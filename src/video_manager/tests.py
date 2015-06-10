import os
import io
import unittest
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.test import Client
from ancoweb import settings
from ancoweb.tests import SeleniumAncowebTest
from video_manager.models import VideoModel, get_valid_filename


class IndexTest(unittest.TestCase):
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

        # Check that the rendered context contains 5 customers.
        self.assertEqual(len(r.context['object_list']), 2)
        self.assertEqual(r.context['object_list'][0], self.v2)
        self.assertEqual(r.context['object_list'][1], self.v1)

        v3.delete(delete_files=False)
        v4.delete(delete_files=False)
        v5.delete(delete_files=False)

    def test_incomplete_video_index(self):
        # Issue a GET request.
        url = reverse('videos:index')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

        # Check that the rendered context contains 5 customers.
        self.assertEqual(len(r.context['object_list']), 2)

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

    def tearDown(self):
        self.v1.delete(delete_files=False)
        self.v2.delete(delete_files=False)
        self.john.delete()


class VideoManagerSeleniumTest(SeleniumAncowebTest):
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