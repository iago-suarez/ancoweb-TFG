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
    this.abnormalityState = null;
}

Detection.RED = '#FF0000';
Detection.BLUE = '#0000FF';
Detection.BLACK = '#000000';
Detection.LIGHT_RED = '#d9534f';
Detection.LIGHT_BLUE = '#d9edf7';
Detection.GREY = '#777777';

/**
 * Sets the image extracting it from the video box
 * @param box
 */
Detection.prototype.setImgFromVideoBox = function (box) {
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

Detection.prototype.getCurrentLightColor = function () {
    if (this.videoDetections.useColors) {
        return this.color;
    }
    if (!this.videoDetections.useAbnormalityRate) {
        // class info color
        return Detection.LIGHT_BLUE;
    }
    var abRate = this.getCurrentAbnormalityRate();

    if (abRate === 0) {
        // We haven't got abnormality rate
        return Detection.GREY;
    } else if (abRate > this.videoDetections.alarmAbnormalRate) {
        // Suspicious object
        return Detection.LIGHT_RED;
    } else {
        //Trusty object
        return Detection.LIGHT_BLUE;
    }
};

Detection.prototype.getCurrentColor = function () {
    if (this.videoDetections.useColors) {
        return this.color;
    }
    if (!this.videoDetections.useAbnormalityRate) {
        return Detection.BLUE;
    }

    var abRate = this.getCurrentAbnormalityRate();
    if (abRate === 0) {
        // We haven't got abnormality rate
        return Detection.BLACK;
    } else if (abRate > this.videoDetections.alarmAbnormalRate) {
        // Suspicious object
        return Detection.RED;
    } else {
        //Trusty object
        return Detection.BLUE;
    }
};

Detection.State = {
    NO_ABNORMALITY_RATE: 0,
    SUSPECT: 1,
    TRUSTY: 2
};

/**
 * Return the current Detection state, but don't set it, so if you want
 * you can access to the last abnormalityState to check the difference
 *
 * @returns {number}
 */
Detection.prototype.calcCurrAbState = function () {
    var abRate = this.getCurrentAbnormalityRate();
    if (abRate === 0) {
        // We haven't got abnormality rate
        return Detection.State.NO_ABNORMALITY_RATE;
    } else if (abRate > this.videoDetections.alarmAbnormalRate) {
        // Suspicious object
        return Detection.State.SUSPECT = 1;
    } else {
        //Trusty object
        return Detection.State.TRUSTY = 2;
    }
};

Detection.prototype.getCurrentAbnormalityRate = function () {

    var nFrame = this.videoDetections.getCurrentFrame();

    //If we still have a value for this frame return it
    if (nFrame === this._currentAbRateNumberFrame) {
        return this._abnormalityRate;
    }

    //Look for the last abnormalityRate
    this._currentAbRateNumberFrame = nFrame;
    var framePoint = [];
    do {
        framePoint = $(this.xmlTrajectory).find('point[frame="' + nFrame + '"]');
        nFrame--;
    } while ((nFrame >= this.firstFrame) && framePoint.length === 0);
    //If we didn't find return 0 else return the value
    if (framePoint.length === 0) {
        this._abnormalityRate = 0;
        return 0;
    } else {
        this._abnormalityRate = parseFloat($(framePoint).attr('abnormality'));
        return parseFloat($(framePoint).attr('abnormality'));
    }
};

Detection.prototype.getMaxAbnormalityRate = function () {
    var max = 0;
    var currentAb = 0;
    $(this.xmlTrajectory).find('point').each(function () {
        currentAb = parseFloat($(this).attr('abnormality'));
        if (currentAb > max) {
            max = currentAb;
        }
    });
    return max;
};

/**
 * Return true if the image is dark and false if the image is light
 *
 * @param imageData
 * @returns {*}
 */
Detection.imageIsDark = function (imageData) {

    /**
     * Return a number between 0 and 1 which is the brightness of the image
     * @returns {number}
     * @param image
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
    var imageCtx = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return getBrightness(imageCtx) < umbral;
};

/**
 * Return the position of the detection for the frame nFrame
 *
 * @param nFrame
 * @returns {*} Return undefined if there are no position available for nFrame
 */
Detection.prototype.getPositionPoint = function (nFrame) {
    var points = {};
    var tmpPoints = $(this.xmlTrajectory).find('point');

    //If there are no points exit
    if (tmpPoints.length === 0) {
        return;
    }
    $(tmpPoints).each(function () {
        points[parseInt($(this).attr('frame'))] =
        {x: parseInt($(this).attr('x')), y: parseInt($(this).attr('y'))};
    });

    var firstFrame = parseInt($(tmpPoints[0]).attr('frame'));
    var lastFrame = parseInt($(tmpPoints[tmpPoints.length - 1]).attr('frame'));
    // if the object is not detected on nFrame
    if (!nFrame.between(firstFrame, lastFrame)) {
        return;
    }

    if (points[nFrame] !== undefined) {
        //If we have a point for this frame we return it
        return points[nFrame];
    }
    // If it doesn't exists we calc it.
    var p1, f1 = nFrame;
    do {
        f1--;
        p1 = points[f1];
    } while (p1 === undefined);
    var p2, f2 = nFrame;
    do {
        f2++;
        p2 = points[f2];
    } while (p2 === undefined);

    var ratio = ((nFrame - f1) / (f1 - f2));

    var x = p1.x + ratio * (p2.x - p1.x);
    var y = p1.y + ratio * (p2.y - p1.y);

    return {x: Math.round(x), y: Math.round(y)};
};

