
QUnit.test("Trivial Test", function (assert) {
    assert.ok(1 == "1", "Passed!");
});

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

QUnit.test("frameToSecondsStr Test", function (assert) {
    //Convert the frame number to time string
    //frameToSecondsStr(nFrame, fps)

    assert.equal(frameToSecondsStr(0, 25), "00:00", "Passed!");
    assert.equal(frameToSecondsStr(100, 25), "00:04", "Passed!");
    assert.equal(frameToSecondsStr(1020, 25), "00:40", "Passed!");
    assert.equal(frameToSecondsStr(4454, 34), "02:11", "Passed!");

});

module('Trajectories Tests', {
  setup: function() {
    var canvas, context,
        fixtureEl = document.getElementById('qunit-fixture');
      fixtureEl.innerHTML = '<canvas width="800" height="480"></canvas>';

    canvas = fixtureEl.firstChild;
    try {
      context = canvas.getContext('2d');
    }
    catch(e) {
      // probably no canvas support, just exit
      return;
    }

    this.canvas = canvas;
    this.context = context;
  }
});

test('Example unit test', function(assert) {
    this.context.fillStyle = 'rgba(0, 0, 0, 0)';
    this.context.fillRect(0, 0, 5, 5);

    assert.pixelEqual(this.canvas, 0, 0, 0, 0, 0, 0);
    assert.notPixelEqual(this.canvas, 0, 0, 1, 1, 1, 0);
});
