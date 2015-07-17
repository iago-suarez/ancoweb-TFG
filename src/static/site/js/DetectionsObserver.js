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
    this.isEnable = true;
}

DetectionsObserver.prototype.update = function () {
    throw new Error("Abstract method!");
};

DetectionsObserver.prototype.enable = function () {
    this.isEnable = true;
};

DetectionsObserver.prototype.disable = function () {
    this.isEnable = false;
};

/**
 * Paints the detected objects into the canvas element using the
 * videoDetections.getCurrentFrameXmlObjects() method
 *
 * @param videoDetections
 * @param canvasElement
 * @constructor
 */
function DetectedObjectsObserver(videoDetections, canvasElement) {
    //Call to the father constructor to init his values
    DetectionsObserver.call(this, videoDetections);

    this.canvasElement = canvasElement;

    this.update = function () {
        if (!this.isEnable) {
            return;
        }
        var context = this.canvasElement.getContext('2d');
        context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        var videoDetections = this.videoDetections;

        //For each detection in the xml we mark it
        $(this.videoDetections.getCurrentFrameXmlObjects()).each(function () {

            var h = parseInt($(this).find('box').attr('h'));
            var w = parseInt($(this).find('box').attr('h'));
            var xc = parseInt($(this).find('box').attr('xc'));
            var yc = parseInt($(this).find('box').attr('yc'));

            var color = videoDetections.detections[this.id].getCurrentColor();
            paintRect(context, videoProportion * xc, videoProportion * yc,
                videoProportion * w, videoProportion * h, color, 2);
        });
    };
}

// DetectedObjectsObserver.prototype create the object that inherits from DetectionsObserver.prototype
DetectedObjectsObserver.prototype = Object.create(DetectionsObserver);

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
        if (!this.isEnable) {
            return;
        }
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
            context.strokeStyle = this.videoDetections.detections[id].getCurrentColor();

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
    };
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

    this.refreshCurrentDetection = function (newDet) {
        //Select old detection and remove it popover
        var oldDetDiv = $('.current-detection-small:contains(' + newDet.id + ')');
        var myPopover = $('div.popover:contains(' + newDet.id + ')');
        myPopover.popover('hide');
        myPopover.popover('disable');
        myPopover.remove();
        $(oldDetDiv).replaceWith(this.getDetectionDiv(newDet));
        var myButt = $('.current-detection-small:contains(' + newDet.id + ')');
        this.addPopover(newDet, myButt);
    };

    this.createCurrentDetection = function (det) {
        //Add the element
        $(this.currentDetectionsDiv).append(this.getDetectionDiv(det));
        var myButt = $('.current-detection-small:contains(' + det.id + ')');
        this.addPopover(det, myButt);
    };

    this.addPopover = function (det, currentDetectionBtn) {

        var showPopover = function (videoDetections, popover) {
                var det = videoDetections.detections[$(popover).find('.detection-id').text()];
                $(popover).attr('data-content', CurrentDetectionsObserver.getPopoverDataContent(det));
                $(popover).popover('show');
            }
            , hidePopover = function () {
                $(this).popover('hide');
            };
        //Pass the videoDetections ass local variable
        var myVD = this.videoDetections;
        $(currentDetectionBtn).popover({
            html: true,
            template: this.getDetectionPopoverTemplate(det),
            content: 'Popover content',
            trigger: 'manual'
        })
            .focus(function () {
                showPopover(myVD, this);
            })
            .blur(hidePopover)
            .hover(function () {
                showPopover(myVD, this)
            }, hidePopover);
    };

    this.update = function () {
        if (!this.isEnable) {
            return;
        }
        var self = this;
        this.videoDetections.detRecentlyDeleted.forEach(function (detection) {
            //Remove the dom element
            $(self.currentDetectionsDiv).find('span:contains(' + detection.id + ')').parent().remove();
            $('div.popover:contains(' + detection.id + ')').remove();
        });
        this.videoDetections.detRecentlySelected.forEach(function (detection) {
            self.createCurrentDetection(detection);
        });
        //If we filter by abnormal rate update the color if it's necessary
        if (this.videoDetections.useAbnormalityRate) {
            for (var id in this.videoDetections.abChangingDetections) {
                this.refreshCurrentDetection(this.videoDetections.abChangingDetections[id]);
            }
        }
    };

    /**
     * Return the current detection view if it's selected
     * @returns {*}
     */
    this.getDetectionDiv = function (detection) {
        var result = '<button data-container="body"' +
            'class="btn btn-default current-detection-small"' +
            'style=" border: 10px solid ' + detection.getCurrentLightColor() + '; ';
        result += 'background-image: url(\'' + detection.currentImg + '\'); "' +
            'data-toggle="popover" data-placement="bottom" ' +
            'title="Detection ' + detection.id + '" ' +
            'data-content=\'' + CurrentDetectionsObserver.getPopoverDataContent(detection) + '\'>';
        result += '<span class="detection-id" hidden>' + detection.id + '</span>' +
            '</button>';

        return result;
    };

    /**
     * Return the colored base of the pop over view
     *
     * @returns {string}
     * @param detection
     */
    this.getDetectionPopoverTemplate = function (detection) {
        return '<div class="popover" role="tooltip"><div class="arrow"></div>' +
            '<strong><h3 class="popover-title" style="background-color: ' +
            detection.getCurrentLightColor() + '" ></h3></strong>' +
            '<div class="popover-content"></div></div>';
    };

    this.enable = function () {
        this.isEnable = true;
        for (var id in this.videoDetections.selectedDetections) {
            this.createCurrentDetection(this.videoDetections.selectedDetections[id]);
        }
    };
    this.disable = function () {
        this.isEnable = false;
        $('.current-detection-small').remove();
        var popover = $('.popover');
        popover.popover('hide');
        popover.popover('disable');
        popover.remove();
    };
}
// CurrentDetectionsObserver.prototype create the object that inherits from DetectionsObserver.prototype
CurrentDetectionsObserver.prototype = Object.create(DetectionsObserver.prototype);


CurrentDetectionsObserver.getPopoverDataContent = function (detection) {
    return '<span class="detection-id" hidden>' + detection.id + '</span>' +
        '</p><p><strong>First Occurrence: </strong>\t' +
        frameToSecondsStr(detection.firstFrame, detection.videoDetections.fps) +
        '</p><p><strong>Last Occurrence: </strong>\t' +
        frameToSecondsStr(detection.lastFrame, detection.videoDetections.fps) +
        '</p><p><strong>Screen Time: </strong>\t' +
        frameToSecondsStr(detection.lastFrame - detection.firstFrame, detection.videoDetections.fps) +
        '</p><p id="popover-ab-rate"><strong>Abnormality Rate: </strong>' +
        detection.getCurrentAbnormalityRate() + '</p>';
};

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

    this.isEnable = false;
    this.tableBodyElement = tableBodyElement;

    this.update = function () {
        if (!this.isEnable) {
            return;
        }
        var self = this;
        //For each detection recently selected we mark it
        this.videoDetections.detRecentlySelected.forEach(function (det) {
            $(self.tableBodyElement).find('tr#' + det.id)
                .replaceWith(self.detectionAsTableRow(det));
        });
        //For each detection recently selected we uncheck it
        this.videoDetections.detRecentlyDeleted.forEach(function (det) {
            $(self.tableBodyElement).find('tr#' + det.id)
                .replaceWith(self.detectionAsTableRow(det));
        });
        if (this.videoDetections.useAbnormalityRate) {
            for (var id in this.videoDetections.abChangingDetections) {
                var det = this.videoDetections.abChangingDetections[id];
                $(this.tableBodyElement).find('tr#' + det.id)
                    .replaceWith(this.detectionAsTableRow(det));
            }
        }
    };


    /**
     * Return the detection as a table row
     *
     * @returns {string}
     * @param detection
     * @param opts can contain {'color' , 'selected' }
     */
    this.detectionAsTableRow = function (detection, opts) {
        // Javascript method overloading pattern {'color' , 'selected' }
        var color;
        var selected;
        if (opts) {
            if (opts['color'] !== undefined) { //if test param exists, do something..
                color = opts['color'];
            } else if (opts['selected'] !== undefined) {
                selected = opts['selected'];
            }
        }
        if (color === undefined) {
            color = detection.getCurrentLightColor();
        }
        if (selected === undefined) {
            selected = detection.selected;
        }

        var result = '<tr id="' + detection.id + '"';
        if (selected) {
            result += ' class="selected" style="background-color: ' + color + ';"';
        }
        result += '><th scope="row"><a href="#">' + detection.id + '</a></th><td>'
            + frameToSecondsStr(detection.firstFrame, detection.videoDetections.fps) + '</td><td>'
            + frameToSecondsStr(detection.lastFrame, detection.videoDetections.fps) + '</td><td>'
            + frameToSecondsStr(detection.lastFrame - detection.firstFrame,
                this.videoDetections.fps) + '</td></tr>\n';

        return result;
    };

    this.enable = function () {
        this.isEnable = true;
        for (var id in this.videoDetections.selectedDetections) {
            var det = this.videoDetections.selectedDetections[id];
            $(this.tableBodyElement).find('tr#' + det.id)
                .replaceWith(this.detectionAsTableRow(det));
        }
    };
    this.disable = function () {
        this.isEnable = false;
        for (var id in this.videoDetections.selectedDetections) {
            var det = this.videoDetections.selectedDetections[id];
            $(this.tableBodyElement).find('tr#' + det.id)
                .replaceWith(this.detectionAsTableRow(det, {'selected': false}));
        }
    };

    //Generates the initial table
    for (var id in videoDetections.detections) {
        $(tableBodyElement).append(this.detectionAsTableRow(videoDetections.detections[id]));
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
        if (!this.isEnable) {
            return;
        }
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
    };
}

// TrainingMsgObserver.prototype create the object that inherits from DetectionsObserver.prototype
TrainingMsgObserver.prototype = Object.create(DetectionsObserver.prototype);


function PopupLauncherObserver(videoDetections) {
    DetectionsObserver.call(this, videoDetections);
    this.throwPopups = false;
    this.nPopups = 0;

    this.update = function () {
        if (!this.isEnable) {
            return;
        }
        if (this.videoDetections.useAbnormalityRate && this.throwPopups) {
            for (var id in this.videoDetections.abChangingDetections) {
                var det = this.videoDetections.abChangingDetections[id];
                if (det.abnormalityState === Detection.State.SUSPECT) {
                    var simpleDet = {
                        id: det.id,
                        firstFrame: det.firstFrame,
                        lastFrame: det.lastFrame,
                        color: det.color,
                        selected: det.selected,
                        xmlTrajectory: new XMLSerializer().serializeToString(det.xmlTrajectory),
                        abnormalityState: det.abnormalityState
                    };
                    var url = window.location.href + "suspicious?";

                    if (areCookiesEnabled()) {
                        var cookieName = "suspiciousDet-" + det.id;
                        console.log("cookieName: " + cookieName);
                        $.cookie(cookieName, window.JSON.stringify(simpleDet));
                        url += "suspiciousDetId=" + det.id;
                    } else { //Use the URL
                        url += serializeObject(simpleDet);
                    }

                    //Add the current time and the video time to the url
                    url += "&now=" + Date.now() + "&videoCurrTime=" +
                        (1000 * this.videoDetections.videoElement.currentTime);
                    this.throwPopup(url);
                }
            }
        }
    };

    this.throwPopup = function (url) {
        var w = 400;
        var h = 360;
        var left;
        var top;

        switch (this.nPopups % 4) {
            case 0:
                //Top left
                left = 0;
                top = 0;
                break;
            case 1:
                //Top right
                left = screen.width - w;
                top = 0;
                break;
            case 2:
                //Bottom left
                left = 0;
                top = screen.height - h;
                break;
            case 3:
                //bottom right
                left = screen.width - w;
                top = screen.height - h;
                break;
        }
        window.open(url, this.target, 'width=' + w + ' ,height=' + h
            + ' , scrollbars=no, top= ' + top + ', left= ' + left);
        this.nPopups++;
    }
}

// PopupLauncherObserver.prototype create the object that inherits from DetectionsObserver.prototype
PopupLauncherObserver.prototype = Object.create(PopupLauncherObserver.prototype);


