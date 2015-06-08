from django.test import TestCase
from django.core.urlresolvers import resolve
from accounts.views import HomeView
from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.core.urlresolvers import reverse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


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


class AccountsSeleniumTest(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        cls.selenium = webdriver.Firefox()
        cls.john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        cls.john.save()
        super(AccountsSeleniumTest, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        cls.john.delete()
        super(AccountsSeleniumTest, cls).tearDownClass()

    def test_home(self):
        self.selenium.get(self.live_server_url)
        title = self.selenium.find_element_by_tag_name("h1").text
        self.assertEqual(title, "Ancoweb")

    def test_login_logout(self):
        john = User.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')
        john.save()
        self.login_user(john, 'johnpassword')
        self.logout_user(john)

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