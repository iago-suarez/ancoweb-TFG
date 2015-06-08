import os
import unittest
from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.core.urlresolvers import reverse
from django.test import Client
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from ancoweb import settings
from video_manager.models import VideoModel
from selenium.webdriver.support import expected_conditions as EC


class IndexTest(unittest.TestCase):
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

    def tearDown(self):
        self.v1.delete()
        self.v2.delete()
        self.john.delete()


class VideoManagerSeleniumTest(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        cls.selenium = webdriver.Firefox()
        super(VideoManagerSeleniumTest, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super(VideoManagerSeleniumTest, cls).tearDownClass()

    def test_video_in_list(self):
        john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        john.save()
        v1 = VideoModel.objects.create(title="Primero", video="tests_resources/v296.mpg",
                                       detected_objs="tests_resources/wk1gt.xml",
                                       description="Descripcion.", owner=john)
        v1.save()
        self.selenium.get(self.live_server_url + reverse('videos:index'))
        title = self.selenium.find_element_by_css_selector(
            "li.video-fragment div.col-xs-9 a").text
        self.assertEqual(title, v1.title)

        v1.delete()
        john.delete()

    def test_upload_video(self):

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
        self.selenium.find_element_by_id('id_title').send_keys("Funcional Tests")
        self.selenium.find_element_by_id('id_video').send_keys(
            os.path.join(str(settings.BASE_DIR),
                         str(settings.MEDIA_ROOT),
                         "tests_resources/wk1gt.xml"))
        self.selenium.find_element_by_id('id_description') \
            .send_keys("Funcional Tests Description \n this is a quite "
                       "important test because it'll test the video uploads")

        self.selenium.find_element_by_id('form_submit_button').click()

        wait = WebDriverWait(self.selenium, 100)
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[class*="video-finished-btn"')))

        # Logout
        self.logout_user(self.john)
        john.delete()

    def login_user(self, user, password):
        self.selenium.get(self.live_server_url)
        self.selenium.find_element_by_id('id_username').send_keys(user.username)
        self.selenium.find_element_by_id('id_password').send_keys(password)
        self.selenium.find_element_by_id('submit-id-sign_in').click()
        wait = WebDriverWait(self.selenium, 1)
        menu = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.dropdown-toggle')))
        self.assertEqual(user.username, menu.text)

    def logout_user(self, user):
        self.selenium.find_element_by_css_selector('a.dropdown-toggle').click()
        self.selenium.find_element_by_css_selector(
            'ul.dropdown-menu a[href*="/accounts/logout"]').click()

        wait = WebDriverWait(self.selenium, 10)
        wait .until(EC.presence_of_element_located((By.ID, 'submit-id-sign_in')))
        msg = self.selenium.find_element_by_css_selector('div.alert-info').text
        assert 'Logout successful!' in msg
        user.delete()