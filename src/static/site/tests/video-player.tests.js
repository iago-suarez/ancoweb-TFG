QUnit.test("Trivial Test", function (assert) {
    assert.ok(1 == "1", "Passed!");
});

//QUnit.test("frameToSecondsStr Test", function (assert) {
//    //Convert the frame number to time string
//    //frameToSecondsStr(nFrame, fps)
//
//    assert.equal(frameToSecondsStr(0, 25), "00:00", "Passed!");
//    assert.equal(frameToSecondsStr(100, 25), "00:04", "Passed!");
//    assert.equal(frameToSecondsStr(1020, 25), "00:40", "Passed!");
//    assert.equal(frameToSecondsStr(4454, 34), "02:11", "Passed!");
//
//});

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
QUnit.test('Example unit test', function (assert) {
    this.context.fillStyle = 'rgba(0, 0, 0, 0)';
    this.context.fillRect(0, 0, 5, 5);

    assert.pixelEqual(this.canvas, 0, 0, 0, 0, 0, 0);
    assert.notPixelEqual(this.canvas, 0, 0, 1, 1, 1, 0);
});


