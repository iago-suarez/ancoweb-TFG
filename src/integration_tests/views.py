from djangojs.views import QUnitView


class MyQUnitView(QUnitView):
    django_js = True
    template_name = 'integration_tests/test-qunit.html'
    js_files = (
        'site/tests/blanket.min.js',
        'site/tests/qunit-assert-canvas.js',
        'site/js/Detection.js',
        'site/js/VideoDetections.js',
        'site/tests/Detection.tests.js',
        'site/tests/video-player.tests.js',
    )