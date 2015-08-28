__author__ = 'iago'
from ancoweb.settings import *

DEBUG = TEMPLATE_DEBUG = False
RECOGNITIONSYS_BIN = str(BASE_DIR / 'RecognitionSystem/recognitionsystem')
MEDIA_ROOT = '/var/www/media/'

STATIC_ROOT = '/var/www/static'
