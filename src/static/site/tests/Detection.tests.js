/**
 * Created by iago on 13/07/15.
 */

var videoDetections;

$('body').append('<video id="video-player" controls="" hidden>' +
'<source src="/media/tests_resources/we2645.mp4" type="video/mp4" fps="25"/>' +
'Your browser does not support the video tag.' +
'</video>');

if (navigator.userAgent.indexOf('PhantomJS') != -1) {
    QUnit.test('Async Load Data', function() {
        expect(1);
        QUnit.stop();
        $.get('/media/tests_resources/wk1gt.xml', function (xmlResult) {
            //Create the videoDetections object from the xml result and add its observers
            var video = document.getElementById('video-player');
            video.currentSrc = window.location.host + $('source').attr('src');
            videoDetections = new VideoDetections(video,
                $(xmlResult).find('trajectories'), $(xmlResult).find('objects'));
            ok(true);
            QUnit.start();
        });
    });
}else{
    QUnit.config.autostart =false;
    $.get('/media/tests_resources/wk1gt.xml', function (xmlResult) {
        //Create the videoDetections object from the xml result and add its observers
        videoDetections = new VideoDetections(document.getElementById('video-player'),
        $(xmlResult).find('trajectories'), $(xmlResult).find('objects'));
        QUnit.start();
    });
}


QUnit.test("idToRgb Test", function (assert) {
    //Return the corresponding rgb light color to the object with id
    //idToRgb(id);

    //Max value 255255255 -> #ffffff -> #ffff00
    assert.equal(Detection.idToRgb(255255255), "#ffff00", "Passed!");
    //Min value 0 -> #000000 -> #ff0000
    assert.equal(Detection.idToRgb(0), "#ff0000", "Passed!");
    //Other value 56235004 = 56*1000000 + 235*1000 + 4 -> 38EB04
    // 56235004 % 3 = 1    38EB04 -> 38FF04
    // 56235004 % 2 = 0    38FF04 -> 00FF04
    assert.equal(Detection.idToRgb(56235004), "#00ff04", "Passed!");

});
QUnit.test("idToRgba Test", function (assert) {
    //Return the corresponding rgba light color to the object with id
    //idToRgba(id, a);

    assert.equal(Detection.idToRgba(255255255, "ee"), "#ffff00ee", "Passed!");
    assert.equal(Detection.idToRgba(0, "12"), "#ff000012", "Passed!");
    //Other value 56235004 = 56*1000000 + 235*1000 + 4 -> 38EB04
    // 56235004 % 3 = 1    38EB04 -> 38FF04
    // 56235004 % 2 = 0    38FF04 -> 38FF00
    assert.equal(Detection.idToRgba(56235004, "00"), "#00ff0400", "Passed!");

});

QUnit.test('Check loaded data', function (assert) {
    assert.equal(videoDetections.detections[18150237].id, "18150237");
    assert.equal(videoDetections.detections[50152232].id, "50152232");
    assert.equal(videoDetections.detections[71227248].id, "71227248");
    assert.equal(videoDetections.detections[83130163].id, "83130163");
    assert.equal(videoDetections.detections[93083010].id, "93083010");
    assert.equal(videoDetections.detections[127129044].id, "127129044");
    assert.equal(videoDetections.detections[139051199].id, "139051199");
    assert.equal(videoDetections.detections[144193126].id, "144193126");
    assert.equal(videoDetections.detections[205178171].id, "205178171");
    assert.equal(videoDetections.detections[210207176].id, "210207176");
    assert.equal(videoDetections.detections[212013006].id, "212013006");
});

function MockVideoDetections() {
    this.getCurrentFrame = function () {
        return this.mockCurrentFrame;
    };
    this.setMockCurrentFrame = function (mockCurrentFrame) {
        this.mockCurrentFrame = mockCurrentFrame;
    }
}

QUnit.test('getCurrentAbnormalityRate Test', function (assert) {
    var originDet = videoDetections.detections[93083010];
    var mockVD = new MockVideoDetections();
    var testDet = new Detection(mockVD, originDet.id, 395, 93083010, {h: 0, w: 0}, originDet.xmlTrajectory);

    //The object wasn't detected in this frame
    mockVD.setMockCurrentFrame(200);
    assert.equal(testDet.getCurrentAbnormalityRate(), 0);

    //<point frame="395" abnormality="0" x="111" y="111"></point>
    mockVD.setMockCurrentFrame(395);
    assert.equal(testDet.getCurrentAbnormalityRate(), 0);

    //<point frame="401" abnormality="0" x="107" y="111"></point>
    //The algorithm must go back looking for the abnormality rate (0)
    mockVD.setMockCurrentFrame(403);
    assert.equal(testDet.getCurrentAbnormalityRate(), 0);

    //<point frame="413" abnormality="0.333333" x="104" y="104"></point>
    // The algorithm must go back looking for the abnormality rate (0.333333)
    mockVD.setMockCurrentFrame(415);
    assert.equal(testDet.getCurrentAbnormalityRate(), 0.333333);

    //<point frame="425" abnormality="0.2" x="98" y="99"></point>
    //Same frame
    mockVD.setMockCurrentFrame(425);
    assert.equal(testDet.getCurrentAbnormalityRate(), 0.2);
    //Repeat the sale call
    assert.equal(testDet.getCurrentAbnormalityRate(), 0.2);
    assert.equal(testDet.getCurrentAbnormalityRate(), 0.2);

    //<point frame="509" abnormality="0.473684" x="81" y="65"></point>
    //After the last detection
    mockVD.setMockCurrentFrame(560);
    assert.equal(testDet.getCurrentAbnormalityRate(), 0.473684);
});

QUnit.test('getMaxAbnormalityRate Test', function (assert) {
    var mockVD = new MockVideoDetections();

    //Only one value
    var originDet = videoDetections.detections[212013006];
    var testDet = new Detection(mockVD, originDet.id, originDet.firstFrame,
        originDet.lastFrame, {h: 0, w: 0}, originDet.xmlTrajectory);
    assert.equal(testDet.getMaxAbnormalityRate(), 0);

    //Multiple values
    //max(0,0,0,0.25,0.476028,0.445412,0.34002,0.385906,0.375571,0.308725
    // ,0.371568,0.257271,0.23748,0.220518,0.33915,0.317953,0.29925
    // ,0.321909,0.447445,0.389718,0.627357) = 6.411281
    originDet = videoDetections.detections[210207176];
    testDet = new Detection(mockVD, originDet.id, originDet.firstFrame,
        originDet.lastFrame, {h: 0, w: 0}, originDet.xmlTrajectory);
    assert.equal(testDet.getMaxAbnormalityRate(), 0.627357);

    //All zeros
    originDet = videoDetections.detections[190207005];
    testDet = new Detection(mockVD, originDet.id, originDet.firstFrame,
        originDet.lastFrame, {h: 0, w: 0}, originDet.xmlTrajectory);
    assert.equal(testDet.getMaxAbnormalityRate(), 0);

});

QUnit.test('getPositionPoint Test', function (assert) {

    // max h = 33, max w = 59
    var det = videoDetections.detections[50152232];
    var det2 = videoDetections.detections[71227248];
    //First Point
    assert.equal(JSON.stringify(det.getPositionPoint(61)),
        JSON.stringify({x: 28, y: 208}));
    //Last Point
    assert.equal(JSON.stringify(det.getPositionPoint(91)),
        JSON.stringify({x: 33, y: 196}));
    //Existent Point
    assert.equal(JSON.stringify(det2.getPositionPoint(174)),
        JSON.stringify({x: 49, y: 174}));
    //Non-existent point
    assert.equal(det2.getPositionPoint(100), undefined);
    //Calculated point
    // 108 -> x="45" y="191"
    // 114 -> x="42" y="187"
    // res: x = 45 - 1 = 44 , y = 191 - 1.33 = 190
    assert.equal(JSON.stringify(det2.getPositionPoint(110)),
        JSON.stringify({x: 44, y: 190}));

    // 216 -> x="50" y="173"
    // 222 -> x="51" y="173"
    assert.equal(JSON.stringify(det2.getPositionPoint(221)),
        JSON.stringify({x: 51, y: 173}));
});

QUnit.test('checkMaxSize', function (assert) {

    // max h = 29, max w = 35
    var det = videoDetections.detections[144193126];

    //A lot of values
    assert.equal(det.maxSize.h, 29);
    assert.equal(det.maxSize.w, 35);

    // max h = 33, max w = 59
    var det = videoDetections.detections[50152232];
    //Less appearences
    assert.equal(det.maxSize.h, 33);
    assert.equal(det.maxSize.w, 59);

});
//$('video').remove();
videoDetections = null;