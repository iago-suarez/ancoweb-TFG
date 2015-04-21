from django.test import TestCase
from videoUpload import utils


class TimeUtilsTestCase(TestCase):

    def test_get_seconds(self):
        """Time in string format are correctly converted to int"""
        self.assertEqual(utils.TimeUtils.get_sec("00:40:19.08"), 2419)
        self.assertEqual(utils.TimeUtils.get_sec( "00:00:01.00"), 1)
        self.assertEqual(utils.TimeUtils.get_sec(""), 0)

    def test_print_seconds(self):
        """Time in integer format are correctly converted to string"""
        self.assertEqual(utils.TimeUtils.print_sec(2419), "00:40:19.000")
        self.assertEqual(utils.TimeUtils.print_sec(1), "00:00:01.000")
        self.assertEqual(utils.TimeUtils.print_sec(0), "00:00:00.000")