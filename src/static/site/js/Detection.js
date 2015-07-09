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
function Detection(videoDetections, id, firstFrame, lastFrame, xmlTrajectory) {
    this.id = id;
    this.firstFrame = firstFrame;
    this.lastFrame = lastFrame;
    this.color = idToRgb(id);
    this.selected = false;
    this.xmlTrajectory = xmlTrajectory;
    this.videoDetections = videoDetections;

    // It is calculated only once when the object is created to optimize
    this._fixedTableRowStr = '><th scope="row"><a href="#">' + this.id + '</a></th><td>'
        + frameToSecondsStr(this.firstFrame, this.videoDetections.fps) + '</td><td>'
        + frameToSecondsStr(this.lastFrame, this.videoDetections.fps) + '</td><td>'
        + frameToSecondsStr(this.lastFrame - this.firstFrame, this.videoDetections.fps) + '</td></tr>\n';

    /**
     * Sets the image extracting it from the video box
     * @param video
     * @param box
     */
    this.setImgFromVideoBox = function (video, box) {
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

        this.currentImg = capture(video, side, side,
            Math.round(xc - ((side - w) / 2)),
            Math.round(yc - ((side - h) / 2)));
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
            '</p><p><strong>First Frame: </strong>\t' + frameToSecondsStr(this.firstFrame, this.videoDetections.fps) +
            '</p><p><strong>Last Frame: </strong>\t' + frameToSecondsStr(this.lastFrame, this.videoDetections.fps) +
            '</p><p><strong>Stage Frames: </strong>\t' +
            frameToSecondsStr(this.lastFrame - this.firstFrame, this.videoDetections.fps) + '</p>\'>   ' +

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