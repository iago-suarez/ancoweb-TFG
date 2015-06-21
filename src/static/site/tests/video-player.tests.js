//QUnit.test("First Double Basics", function( assert ) {
//    assert.equal(double(5), 10);
//    assert.equal(double(8), 16);
//    assert.equal(double(0), 0);
//    assert.equal(double(10), 20);
//  });

QUnit.test("Trivial Test", function (assert) {
    assert.ok(1 == "1", "Passed!");
});

QUnit.test("idToRgb Test", function (assert) {
    //Return the corresponding rgb light color to the object with id
    //idToRgb(id);

    //Max value 255255255 -> #ffffff -> #ffffff
    assert.equal(idToRgb(255255255), "#ffffff", "Passed!");
    //Min value 0 -> #000000 -> #ff0000
    assert.equal(idToRgb(0), "#ff0000", "Passed!");
    //Other value 56235004 = 56*1000000 + 235*1000 + 4 -> 38EB04 -> 38FF04
    assert.equal(idToRgb(56235004), "#38ff04", "Passed!");

});
QUnit.test("idToRgba Test", function (assert) {
    //Return the corresponding rgba light color to the object with id
    //idToRgba(id, a);

    assert.equal(idToRgba(255255255, "ee"), "#ffffffee", "Passed!");
    assert.equal(idToRgba(0, "12"), "#ff000012", "Passed!");
    //Other value 56235004 = 56*1000000 + 235*1000 + 4 -> 38EB04 -> 38FF04
    assert.equal(idToRgba(56235004, "00"), "#38ff0400", "Passed!");

});

QUnit.test("frameToSecondsStr Test", function (assert) {
    //Convert the frame number to time string
    //frameToSecondsStr(nFrame, fps)

    assert.equal(frameToSecondsStr(0, 25), "00:00", "Passed!");
    assert.equal(frameToSecondsStr(100, 25), "00:04", "Passed!");
    assert.equal(frameToSecondsStr(1020, 25), "00:40", "Passed!");
    assert.equal(frameToSecondsStr(4454, 34), "02:11", "Passed!");

});


//QUnit.test("selectObjects Test", function (assert) {
// selectObjects(objectList, tBody);
// Given a list of items to select, the function remarks them in the table.

//var tbl=document.createElement('table');
//tbl.appendChild(document.createElement('tbody'));
//// Create an empty <tr> element and add it to the 1st position of the table:
//var row = table.insertRow(0);
//
//// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
//var cell1 = row.insertCell(0);
//var cell2 = row.insertCell(1);
//
//// Add some text to the new cells:
//cell1.innerHTML = "NEW CELL1";
//
//var tableInput = $('<tbody id="objects-tbody"></tbody>')[0];
//var inputObjects = [];
//
////Bough empty
//selectObjects(tableInput, inputObjects);
//assert.deepEqual(tableInput, $('<tbody id="objects-tbody"></tbody>')[0]);
//
////Empty table
//inputObjects = $('<object id="96004219">' +
//    '<box h="45" w="47" xc="25" yc="154"/>' +
//    '</object>' +
//    '<object id="105198103">' +
//    '<box h="29" w="45" xc="235" yc="194"/>' +
//    '</object>' +
//    '<object id="132072179">' +
//    '<box h="31" w="31" xc="73" yc="234"/>' +
//    '</object>')[0];
//
//selectObjects(inputObjects, tableInput);
//assert.deepEqual(tableInput, $('<tbody id="objects-tbody"></tbody>')[0]);

////Table without selected elements, some in the object list.
//var tableInput2 = $('<tbody id="objects-tbody">' +
//    '<tr><th scope="row"><a href="/">105198103</a></th><td>42</td><td>187</td><td>379</td></tr>' +
//    '<tr><th scope="row"><a href="/">96004219</a></th><td>102</td><td>225</td><td>919</td></tr>' +
//    '<tr><th scope="row"><a href="/">254161123</a></th><td>233</td><td>472</td><td>2098</td></tr>' +
//    '<tr><th scope="row"><a href="/">183051012</a></th><td>486</td><td>619</td><td>4375</td></tr>' +
//    '<tr><th scope="row"><a href="/">132072179</a></th><td>78</td><td>480</td><td>703</td></tr>' +
//    '<tr><th scope="row"><a href="/">224016249</a></th><td>486</td><td>490</td><td>4375</td></tr>' +
//    '</tbody>')[0];
//
//var tableResult2 = $('<tbody id="objects-tbody">' +
//    '<tr class="selected"><th scope="row"><a href="/">105198103</a></th><td>42</td><td>187</td><td>379</td></tr>' +
//    '<tr class="selected"><th scope="row"><a href="/">96004219</a></th><td>102</td><td>225</td><td>919</td></tr>' +
//    '<tr><th scope="row"><a href="/">254161123</a></th><td>233</td><td>472</td><td>2098</td></tr>' +
//    '<tr><th scope="row"><a href="/">183051012</a></th><td>486</td><td>619</td><td>4375</td></tr>' +
//    '<tr class="selected"><th scope="row"><a href="/">132072179</a></th><td>78</td><td>480</td><td>703</td></tr>' +
//    '<tr><th scope="row"><a href="/">224016249</a></th><td>486</td><td>490</td><td>4375</td></tr>' +
//    '</tbody>')[0];
//selectObjects(inputObjects, tableInput);
//assert.deepEqual(tableInput2, tableResult2);

////Table with some selected elements, some in the object list.
//tableInput= $('<tbody id="objects-tbody">' +
//    '<tr class="selected"><th scope="row"><a href="/">105198103</a></th><td>42</td><td>187</td><td>379</td></tr>' +
//    '<tr><th scope="row"><a href="/">96004219</a></th><td>102</td><td>225</td><td>919</td></tr>' +
//    '<tr class="selected"><th scope="row"><a href="/">254161123</a></th><td>233</td><td>472</td><td>2098</td></tr>' +
//    '<tr><th scope="row"><a href="/">183051012</a></th><td>486</td><td>619</td><td>4375</td></tr>' +
//    '<tr><th scope="row"><a href="/">132072179</a></th><td>78</td><td>480</td><td>703</td></tr>' +
//    '<tr class="selected"><th scope="row"><a href="/">224016249</a></th><td>486</td><td>490</td><td>4375</td></tr>' +
//    '</tbody>');
//selectObjects(inputObjects, tableInput);
//assert.deepEqual(tableInput, tableResult);
//
//});
//
//QUnit.test("paintFrameObjects Test", function (assert) {
//    /**
//    * Paints the objects into the canvas element if the frameNumber > trainingFrames, otherwise
//    * it paints the trainingLbl
//    *
//    * @param canvas
//    * @param frameNumber
//    * @param objects
//    * @param trainingLbl
//    * @returns {number}
//    */
//    paintFrameObjects(canvas, frameNumber, objects, trainingLbl)
//
//});
//
//QUnit.test("paintFrameObjects.paintRect Test", function (assert) {
//    /**
//    * Paint a rect in the canvas context in color and with lineWidth pixels in border.
//    * @param context The canvas context
//    * @param {Number} xc The coordinate of the x in pixels
//    * @param {Number} yc The coordinate of the y in pixels
//    * @param {Number} w The width
//    * @param {Number} h The height
//    * @param color The Color
//    * @param {Number} lineWidth
//    */
//    paintFrameObjects.paintRect(context, xc, yc, w, h, color, lineWidth)
//
//});
//
//QUnit.test("TableObject Test", function (assert) {
//    /**
//    * @class Represents a detected object in the table
//    * @property {String} id
//    * @property {String} firstFrame
//    * @property {String} lastFrame
//    * @constructor
//    */
//    TableObject(id, firstFrame, lastFrame)
//});
//
//QUnit.test("getTableObjectsFromXml Test", function (assert) {
//    /**
//    * Generates the Table Objects parsing the xml file.
//    *
//    * @param xmlObjects
//    * @returns {{TableObject}}
//    */
//    getTableObjectsFromXml(xmlObjects)
//
//});
//
//QUnit.test("loadXmlResult Test", function (assert) {
//    /**
//    * Load the detected objects in the video via AJAX.
//    */
//    loadXmlResult()
//});
//
//QUnit.test("getVideoFps Test", function (assert) {
//    /**
//    * Return the number of Frames per second in the HTML5 Video element
//    *
//    * @param video
//    * @returns {Number}
//    */
//    getVideoFps(video)
//});
//
//QUnit.test("adjustCanvasExtended Test", function (assert) {
//    /**
//    * Adjust Canvas Element including fullScreen mode
//    * @param video
//    */
//    adjustCanvasExtended(video)
//});
//QUnit.test("adjustTrainingLbl Test", function (assert) {
//    /**
//    * Adjust the "Training Frames" label over the video element
//    */
//    adjustTrainingLbl(trainingLbl)
//});