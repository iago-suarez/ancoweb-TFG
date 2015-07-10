/**
 * Created by iago on 9/07/15.
 */

/**
 *
 * @param videoDetections
 * @constructor
 * @abstract
 */
function DetectionsObserver(videoDetections) {
    this.videoDetections = videoDetections;
}

DetectionsObserver.prototype.update = function () {
    throw new Error("Abstract method!");
};

/**
 * Paints the detected objects into the canvas element using the
 * videoDetections.getCurrentFrameXmlObjects() method
 *
 * @param videoDetections
 * @param canvasElement
 * @constructor
 */
function DetectionsObjectsObserver(videoDetections, canvasElement) {
    //Call to the father constructor to init his values
    DetectionsObserver.call(this, videoDetections);

    this.canvasElement = canvasElement;

    this.update = function () {
        var context = this.canvasElement.getContext('2d');
        context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        var useColors = this.videoDetections.useColors;
        //For each detection in the xml we mark it
        $(this.videoDetections.getCurrentFrameXmlObjects()).each(function () {

            var h = parseInt($(this).find('box').attr('h'));
            var w = parseInt($(this).find('box').attr('h'));
            var xc = parseInt($(this).find('box').attr('xc'));
            var yc = parseInt($(this).find('box').attr('yc'));
            //Select the color
            if (useColors) {
                paintRect(context, videoProportion * xc, videoProportion * yc,
                    videoProportion * w, videoProportion * h, idToRgb(this.id), 2);
            } else {
                paintRect(context, videoProportion * xc, videoProportion * yc,
                    videoProportion * w, videoProportion * h, 'blue', 2);
            }
        });
    }
}

// DetectionsObjectsObserver.prototype create the object that inherits from DetectionsObserver.prototype
DetectionsObjectsObserver.prototype = Object.create(DetectionsObserver);

/**
 * Paints the trajectories into the canvas element
 *
 * @param videoDetections
 * @param canvasElement
 * @constructor
 */
function TrajectoriesObserver(videoDetections, canvasElement) {
    //Call to the father constructor to init his values
    DetectionsObserver.call(this, videoDetections);

    this.canvasElement = canvasElement;

    this.update = function () {
        var context = this.canvasElement.getContext('2d');
        context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        for (var id in this.videoDetections.selectedDetections) {
            //Get the trajectory points for the current detection
            var trajPoints = $(this.videoDetections.detections[id].xmlTrajectory).find('point');
            context.beginPath();
            context.moveTo(videoProportion * parseInt($(trajPoints[0]).attr('x')),
                videoProportion * parseInt($(trajPoints[0]).attr('y')));
            context.lineWidth = 3;
            //Select the color
            if (this.videoDetections.useColors) {
                context.strokeStyle = idToRgb(id);
            } else {
                context.strokeStyle = '#ff0000';
            }
            var i = 1;
            var f = 0;
            while ((i < trajPoints.length) && f <= this.videoDetections.getCurrentFrame()) {
                context.lineTo(videoProportion * parseInt($(trajPoints[i]).attr('x')),
                    videoProportion * parseInt($(trajPoints[i]).attr('y')));
                i++;
                f = $(trajPoints[i]).attr('frame');
            }
            context.stroke();
        }
    }
}

// TrajectoriesObserver.prototype create the object that inherits from DetectionsObserver.prototype
TrajectoriesObserver.prototype = Object.create(DetectionsObserver.prototype);

/**
 * Remarks the current selected detections in the currentDetectionsDiv
 *
 * @param videoDetections
 * @param currentDetectionsDiv
 * @constructor
 */
function CurrentDetectionsObserver(videoDetections, currentDetectionsDiv) {
    //Call to the father constructor to init his values
    DetectionsObserver.call(this, videoDetections);

    this.currentDetectionsDiv = currentDetectionsDiv;

    this.update = function () {
        for (var id in this.videoDetections.detRecentlySelected) {
            var det = this.videoDetections.detRecentlySelected[id];
            var useColor = this.videoDetections.useColors;
            //Add the element
            $(this.currentDetectionsDiv).append(det.asCurrentDetection(useColor));
            $('[data-toggle="popover"]').popover({
                html: true,
                template: det.asPopoverTemplate(useColor)
            });
        }
        for (var id in this.videoDetections.detRecentlyDeleted) {
            //Remove the dom element if it is not already selected
            $(this.currentDetectionsDiv).find('span:contains(' +
                this.videoDetections.detRecentlyDeleted[id].id + ')').parent().remove();
        }
    }
}
// CurrentDetectionsObserver.prototype create the object that inherits from DetectionsObserver.prototype
CurrentDetectionsObserver.prototype = Object.create(DetectionsObserver.prototype);

/**
 * Remarks the current selected detections in the table
 *
 * @param videoDetections
 * @param tableBodyElement
 * @constructor
 */
function DetectionsTableObserver(videoDetections, tableBodyElement) {
    //Call to the father constructor to init his values
    DetectionsObserver.call(this, videoDetections);

    this.tableBodyElement = tableBodyElement;

    //Generates the initial table
    for (var id in videoDetections.detections) {
        $(tableBodyElement).append(videoDetections.detections[id].asTableRow(true));
    }

    this.update = function () {
        //For each detection recently selected we mark it
        for (var id in this.videoDetections.detRecentlySelected) {
            var det = this.videoDetections.detRecentlySelected[id];
            $(this.tableBodyElement).find('tr:contains(' + det.id + ')')
                .replaceWith(det.asTableRow(this.videoDetections.useColors));

        }
        //For each detection recently selected we uncheck it
        for (var id in this.videoDetections.detRecentlyDeleted) {
            var det = this.videoDetections.detRecentlyDeleted[id];
            $(this.tableBodyElement).find('tr:contains(' + det.id + ')')
                .replaceWith(det.asTableRow(this.videoDetections.useColors));

        }
    }
}

// DetectionsTableObserver.prototype create the object that inherits from DetectionsObserver.prototype
DetectionsTableObserver.prototype = Object.create(DetectionsObserver.prototype);

/**
 * Paint the training label if it's necessary
 *
 * @param videoDetections
 * @param canvasElement
 * @param trainingLbl
 * @param trainingFramesNum
 * @constructor
 */
function TrainingMsgObserver(videoDetections, canvasElement, trainingLbl, trainingFramesNum) {
    DetectionsObserver.call(this, videoDetections);
    this.canvasElement = canvasElement;
    this.isLabelDisplayed = false;
    this.trainingLbl = trainingLbl;
    this.trainingFramesNum = trainingFramesNum;

    this.update = function () {
        //If the system is training and the label is not displayed, display them
        if ((this.videoDetections.getCurrentFrame() < this.trainingFramesNum) && !this.isLabelDisplayed) {

            if (!$(trainingLbl).is(":visible")) {
                adjustTrainingLbl(trainingLbl);
                $(trainingLbl).show();
            }

            //Paint the training message rect
            var context = this.canvasElement.getContext('2d');
            context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            paintRect(context, 4, 4, this.canvasElement.width - 8,
                this.canvasElement.height - 8, '#f0ad4e', 4);
            this.isLabelDisplayed = true;

        } else if ((this.videoDetections.getCurrentFrame() >= trainingFrames)
            && this.isLabelDisplayed) {
            //If the system isn't training hide the label
            var context = this.canvasElement.getContext('2d');
            context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            $(this.trainingLbl).hide();
            this.isLabelDisplayed = false;
        }
    }
}

// TrainingMsgObserver.prototype create the object that inherits from DetectionsObserver.prototype
TrainingMsgObserver.prototype = Object.create(DetectionsObserver.prototype);
