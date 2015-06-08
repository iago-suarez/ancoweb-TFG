from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class SeleniumAncowebTest(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        cls.selenium = webdriver.Firefox()
        super(SeleniumAncowebTest, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super(SeleniumAncowebTest, cls).tearDownClass()

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
        wait.until(EC.presence_of_element_located((By.ID, 'submit-id-sign_in')))
        msg = self.selenium.find_element_by_css_selector('div.alert-info').text
        assert 'Logout successful!' in msg
        user.delete()