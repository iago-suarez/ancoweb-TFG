import unittest
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.test import Client
from video_manager.models import VideoModel


class SimpleTest(unittest.TestCase):
    def setUp(self):
        # Every test needs a client.
        self.client = Client()

        self.john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        self.john.save()
        self.v1 = VideoModel.objects.create(title="Primero", video="tests_resources/v296.mpg",
                                            detected_objs="tests_resources/wk1gt.xml",
                                            description="Descripcion.", owner=self.john)
        self.v1.save()

        self.v2 = VideoModel.objects.create(title="Segundo", video="tests_resources/v296.mpg",
                                            detected_objs="tests_resources/wk1gt.xml",
                                            description="Descripcion.", owner=self.john)
        self.v2.save()

    def test_details(self):
        # Issue a GET request.

        url = reverse('videos:index')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

        # Check that the rendered context contains 5 customers.
        self.assertEqual(len(r.context['object_list']), 2)
        self.assertEqual(r.context['object_list'][0], self.v2)
        self.assertEqual(r.context['object_list'][1], self.v1)

    def addCleanup(self, function, *args, **kwargs):
        self.v1.delete()
        self.v2.delete()
        self.john.delete()