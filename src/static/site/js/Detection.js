/**
 * Created by iago on 30/06/15.
 */
/**
 * @class Represents a detected object in the table
 * @property {String} id
 * @property {String} firstFrame
 * @property {String} lastFrame
 * @constructor
 */
function Detection(id, firstFrame, lastFrame) {
    this.id = id;
    this.firstFrame = firstFrame;
    this.lastFrame = lastFrame;
    this.color = idToRgb(id);
    this.selected = false;

    // It is calculated only once when the object is created to optimize
    this._fps = getVideoFps(document.getElementById('video-player'));
    this._fixedTableRowStr = '><th scope="row"><a href="#">' + this.id + '</a></th><td>'
        + frameToSecondsStr(this.firstFrame, this._fps) + '</td><td>'
        + frameToSecondsStr(this.lastFrame, this._fps) + '</td><td>'
        + frameToSecondsStr(this.lastFrame - this.firstFrame, this._fps) + '</td></tr>\n';

    this.setImg = function (imgUrl) {
        this.currentImg = imgUrl;
    };

    /**
     * Sets the image extracting it from the video box
     * @param video
     * @param box
     */
    this.setImgFromVideoBox = function (video, box) {
        const factor = 1.5;

        //We frame a rectangle that take twice the space centering it at the same point
        var w = parseInt($(box).attr('w'));
        var h = parseInt($(box).attr('h'));
        var xc = parseInt($(box).attr('xc'));
        var yc = parseInt($(box).attr('yc'));
        this.currentImg = capture(video,
            Math.round(w * factor),
            Math.round(h * factor),
            Math.max(0, Math.round(xc - (w * factor - w) / 2)),
            Math.max(0, Math.round(yc - (h * factor - h) / 2)));
    };

    /**
     * Return true if the image is dark and false if the image is light
     * @returns {boolean}
     */
    this.imageIsDark = function () {

        /**
         * Return a number between 0 and 1 which is the brightness of the image
         * @param imageData
         * @returns {number}
         */
        function getBrightness(imageData) {
            var data = imageData.data;
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
        if (this.currentImg == "undefined") {
            return 0;
        }
        var myImg = document.createElement("IMG");
        myImg.src = this.currentImg;
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

    this.getBgColorStyle = function (useColors) {

        if (useColors) {
            return 'background-color: ' + this.color;
        } else {
            // class info color
            return 'background-color: #d9edf7';
        }
    };

    /**
     * Return the detection as a table row
     *
     * @param useColors
     * @returns {string}
     */
    this.asTableRow = function (useColors) {

        var result = '<tr';
        if (this.selected) {
            result += ' class="selected" style="' + this.getBgColorStyle(useColors) + ';"';
        }
        result += this._fixedTableRowStr;
        return result;
    };

    /**
     * Return the current detection view if it's selected
     * @returns {*}
     */
    this.asCurrentDetection = function (useColors) {
        var result = '<button data-container="body"' +
            'class="btn btn-default current-detection-small"' +
            'style=" border: 10px solid ';
        if (useColors) {
            result += this.color + '; ';
        } else {
            result += '#d9edf7; ';
        }
        result += 'background-image: url(\'' + this.currentImg + '\'); "' +
            'data-toggle="popover" data-placement="bottom" ' +
            'title="Detection ' + this.id + '" ' +
            'data-content=\'' +
                //popover content
            '<span class="detection-id" hidden>' + this.id + '</span>' +
            '</p><p><strong>First Frame: </strong>\t' + frameToSecondsStr(this.firstFrame, this._fps) +
            '</p><p><strong>Last Frame: </strong>\t' + frameToSecondsStr(this.lastFrame, this._fps) +
            '</p><p><strong>Stage Frames: </strong>\t' +
            frameToSecondsStr(this.lastFrame - this.firstFrame, this._fps) + '</p>\'>   ' +

            '<div class="myCaret" style="margin-top: 10px;"><span';
        if (this.imageIsDark()) {
            result += ' style="border-top-color: #fff;"';
        }
        result += '></span></div>' +
            '<span class="detection-id" hidden>' + this.id + '</span>' +
            '</button>';

        return result;
    };

    /**
     * Return the colored base of the pop over view
     *
     * @param useColors
     * @returns {string}
     */
    this.asPopoverTemplate = function (useColors) {
        return '<div class="popover" role="tooltip"><div class="arrow"></div>' +
            '<strong><h3 class="popover-title" style=" ' +
            this.getBgColorStyle(useColors) + '" ></h3></strong>' +
            '<div class="popover-content"></div></div>';
    };
}