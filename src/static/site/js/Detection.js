/**
 * Created by iago on 30/06/15.
 */


/**
 * Return the corresponding rgb light color to the object with id
 * @param id a number between 0 and 1000000
 * @returns {string}
 */
Detection.idToRgb = function (id) {

    function toHexString(color) {
        if (color < 16) {
            return '0' + color.toString(16);
        } else {
            return color.toString(16);
        }
    }

    var r = Math.round(id / 1000000);
    var g = Math.round((id % 1000000) / 1000);
    var b = Math.round(id % 1000);

    //Choose the most similar light color
    switch (id % 3) {
        case 0:
            if (id % 2) {
                return '#' + 'ff' + toHexString(g) + '00';
            } else {
                return '#' + 'ff' + '00' + toHexString(b);
            }
        case 1:
            if (id % 2) {
                return '#' + toHexString(r) + 'ff' + '00';
            } else {
                return '#' + '00' + 'ff' + toHexString(b);
            }
        case 2:
            if (id % 2) {
                return '#' + toHexString(r) + '00' + 'ff';
            } else {
                return '#' + '00' + toHexString(g) + 'ff';
            }
    }
};

/**
 * Return the corresponding rgba light color to the object with id
 * @param id
 * @param a a number between 0 and 256 that represents the transparency
 * @returns {string}
 */
Detection.idToRgba = function (id, a) {
    return Detection.idToRgb(id) + a.toString(16);
};

/**
 * @class Represents a detected object in the table
 * @property {String} id
 * @property {String} firstFrame
 * @property {String} lastFrame
 * @constructor
 */
function Detection(videoDetections, id, firstFrame, lastFrame, xmlTrajectory) {
    this.id = id;
    this.firstFrame = firstFrame;
    this.lastFrame = lastFrame;
    this.color = Detection.idToRgb(id);
    this.selected = false;
    this.xmlTrajectory = xmlTrajectory;
    this.videoDetections = videoDetections;
    this.abnormalityRate = parseFloat($(xmlTrajectory).attr('abnormality'));
    /**
     * Sets the image extracting it from the video box
     * @param box
     */
    this.setImgFromVideoBox = function (box) {
        const factor = 2;

        //We frame a rectangle that take twice the space centering it at the same point
        var w = parseInt($(box).attr('w'));
        var h = parseInt($(box).attr('h'));
        var xc = parseInt($(box).attr('xc'));
        var yc = parseInt($(box).attr('yc'));

        // A square is selected, the square will have the dimensions:
        // longest side * (factor - degree of difference between height and width)
        var increase = (factor - 1) / Math.max(h / w, w / h);
        var side = Math.round(Math.max(h, w) * (1 + increase));

        this.currentImg = this.videoDetections.captureImg(side, side,
            Math.round(xc - ((side - w) / 2)),
            Math.round(yc - ((side - h) / 2)));
    };

    this.getBgColorStyle = function () {

        if (this.videoDetections.useColors) {
            return 'background-color: ' + this.color;
        } else {
            // class info color
            return 'background-color: #d9edf7';
        }
    };
}

/**
 * Return true if the image is dark and false if the image is light
 *
 * @param imageData
 * @returns {*}
 */
Detection.imageIsDark = function (imageData) {

    /**
     * Return a number between 0 and 1 which is the brightness of the image
     * @param imageData
     * @returns {number}
     */
    function getBrightness(image) {
        var data = image.data;
        var r, g, b, avg;
        var colorSum = 0;
        for (var x = 0, len = data.length; x < len; x += 4) {
            r = data[x];
            g = data[x + 1];
            b = data[x + 2];

            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
        }

        var brightness = Math.floor(colorSum / (imageData.width * imageData.height));
        return brightness / 255;
    }

    const umbral = 0.5;
    if (image == "undefined") {
        return 0;
    }
    var myImg = document.createElement("IMG");
    myImg.src = image;
    var canvas = document.createElement("canvas");
    canvas.width = myImg.width / 2;
    canvas.height = myImg.height / 2;

    var ctx = canvas.getContext("2d");

    ctx.drawImage(myImg, Math.round(myImg.width / 2), 0,
        canvas.width, canvas.height
        , 0, 0, canvas.width, canvas.height);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return getBrightness(imageData) < umbral;
};


