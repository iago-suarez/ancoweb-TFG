from django.test import TestCase
from django.core.urlresolvers import resolve
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from accounts.views import HomeView
from ancoweb.tests import SeleniumAncowebTest


class PageOpenTestCase(TestCase):
    def test_home_page_exists(self):
        url = reverse('home')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)

    def test_home_page_resolves(self):
        url = reverse('home')
        found = resolve(url)
        self.assertEqual(found.func.__name__,
                         HomeView.as_view().__name__)

    def test_about_page_exists(self):
        url = reverse('about')
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)


class AccountsSeleniumTest(SeleniumAncowebTest):
    def test_home(self):
        self.selenium.get(self.live_server_url)
        title = self.selenium.find_element_by_tag_name("h1").text
        self.assertEqual(title, "Ancoweb")

    def test_login_logout(self):
        john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        john.save()
        self.login_user(john, 'johnpassword')
        self.logout_user(john)
