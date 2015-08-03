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

QUnit.test('getCurrentAbnormalityRate', function (assert) {
    var originDet = videoDetections.detections[93083010];
    var mockVD = new MockVideoDetections();
    var testDet = new Detection(mockVD, originDet.id, 395, 93083010, originDet.xmlTrajectory);

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

QUnit.test('getMaxAbnormalityRate', function (assert) {
    var mockVD = new MockVideoDetections();

    //Only one value
    var originDet = videoDetections.detections[212013006];
    var testDet = new Detection(mockVD, originDet.id, originDet.firstFrame,
        originDet.lastFrame, originDet.xmlTrajectory);
    assert.equal(testDet.getMaxAbnormalityRate(), 0);

    //Multiple values
    //max(0,0,0,0.25,0.476028,0.445412,0.34002,0.385906,0.375571,0.308725
    // ,0.371568,0.257271,0.23748,0.220518,0.33915,0.317953,0.29925
    // ,0.321909,0.447445,0.389718,0.627357) = 6.411281
    originDet = videoDetections.detections[210207176];
    testDet = new Detection(mockVD, originDet.id, originDet.firstFrame,
        originDet.lastFrame, originDet.xmlTrajectory);
    assert.equal(testDet.getMaxAbnormalityRate(), 0.627357);

    //All zeros
    originDet = videoDetections.detections[190207005];
    testDet = new Detection(mockVD, originDet.id, originDet.firstFrame,
        originDet.lastFrame, originDet.xmlTrajectory);
    assert.equal(testDet.getMaxAbnormalityRate(), 0);

});

//$('video').remove();
videoDetections = null;