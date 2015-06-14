from djangojs.views import QUnitView


class MyQUnitView(QUnitView):
    django_js = True
    template_name = 'integration_tests/test-qunit.html'
    js_files = (
        'site/tests/video-player.js',
        'site/tests/video-player.tests.js',
    )