from djangojs.views import QUnitView

from integration_tests.tests import QUnitVideoPlayerTests


class MyQUnitView(QUnitView):
    django_js = True
    template_name = 'integration_tests/test-qunit.html'
    js_files = QUnitVideoPlayerTests.js_files
