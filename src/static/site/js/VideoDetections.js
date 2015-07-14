/**
 * Created by iago on 8/07/15.
 */

/**
 *
 * @param videoElement
 * @class
 * @constructor
 * @param xmlTrajectories
 * @param xmlDetections
 */
function VideoDetections(videoElement, xmlTrajectories, xmlDetections) {
    this.videoElement = videoElement;
    this.observers = [];
    this.useColors = true;
    this.fps = this.getVideoFps(videoElement);
    this.detections = {};
    this.selectedDetections = {};
    this.detRecentlyDeleted = [];
    this.detRecentlySelected = [];
    this.currentSuspiciousDetections = [];
    this.normalDetections = [];
    this.notStudiedDetections = [];
    this.xmlDetectionsByFrame = {};
    this.alarmAbnormalRate = 0;
    this.useAbnormalityRate = false;

    /**
     * Generates the initial State of the VideoDetections object.
     *
     * @param xmlDetections
     * @param xmlTrajectories
     */
    this._init = function (xmlDetections, xmlTrajectories) {
        var selfVD = this;
        $(xmlDetections).find('frame').each(function () {
            var fNumber = $(this).attr('number');
            selfVD.xmlDetectionsByFrame[fNumber] = $(this).find('object');
            $(selfVD.xmlDetectionsByFrame[fNumber]).each(function () {
                var objId = $(this).attr('id');
                if (selfVD.detections[objId] === undefined) {
                    var trajectory = $(xmlTrajectories).find('trajectory#' + objId)[0];
                    selfVD.detections[objId] = new Detection(selfVD, objId,
                        parseInt(fNumber), parseInt(fNumber) + 1, trajectory);
                } else {
                    selfVD.detections[objId].lastFrame = parseInt(fNumber);
                }
            });
        });
    };

    //Get initial state from xml
    this._init(xmlDetections, xmlTrajectories);
    xmlTrajectories = null;
    xmlDetections = null;

    this.addObserver = function (observer) {
        this.observers.push(observer);
    };

    this.getCurrentFrame = function () {
        return Math.round(this.videoElement.currentTime * this.fps);
    };

    this.getCurrentFrameXmlObjects = function () {
        return this.xmlDetectionsByFrame[this.getCurrentFrame()];
    };

    /**
     * Generate a Canvas element from the video element
     * @param w
     * @param h
     * @param cx
     * @param cy
     * @returns {string}
     */
    this.captureImg = function (w, h, cx, cy) {
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoElement, -cx, -cy);
        return canvas.toDataURL();
    };

    this.updateState = function () {

        //Gets the current frame objects
        if (DEBUG_TIME) {
            var debugTime = Date.now();
        }

        var detectionsToSelect = this.getCurrentFrameXmlObjects();
        //if the XML file had no detections for the current frame we exit
        if (!detectionsToSelect) {
            return;
        }
        this.detRecentlyDeleted = [];
        this.detRecentlySelected = [];
        for (var id in this.detections) {
            // Check if the selected state has change
            var j = 0;
            var selected = false;
            var obj;
            var det = this.detections[id];
            while ((j < detectionsToSelect.size()) && (!selected)) {
                obj = detectionsToSelect[j];
                selected = (obj.id === det.id);
                j++;
            }
            // If it's necessary update the row state
            if (det.selected != selected) {
                if (!det.selected) {
                    //if he has appeared for the first time we add it
                    //Get the detection position, and set the image of this position
                    var detBox = $(detectionsToSelect).find('object[id=' + det.id + '] box')[0];
                    det.setImgFromVideoBox(detBox);
                    this.selectedDetections[det.id] = det;
                    this.detRecentlySelected[this.detRecentlySelected.length] = det;
                } else {
                    //Remove the detection from the selectedMap
                    delete this.selectedDetections[det.id];
                    this.detRecentlyDeleted[this.detRecentlyDeleted.length] = det;
                }
                det.selected = selected;
            }
        }
        if (DEBUG_TIME) {
            console.log("Select time: " + Math.abs(Date.now() - debugTime));
        }
        this.notify();

    };

    this.notify = function () {
        if (DEBUG_TIME) {
            var notifyTime = Date.now();
            var totalTime = Date.now();
        }
        this.observers.forEach(function (observer) {
            observer.update();
            if (DEBUG_TIME) {
                if (observer instanceof CurrentDetectionsObserver) {
                    console.log("CurrentDetectionsObserver time: " + Math.abs(Date.now() - notifyTime));
                    notifyTime = Date.now();
                } else if (observer instanceof DetectionsTableObserver) {
                    console.log("DetectionsTableObserver time:   " + Math.abs(Date.now() - notifyTime));
                    notifyTime = Date.now();
                } else if (observer instanceof TrajectoriesObserver) {
                    console.log("TrajectoriesObserver time:      " + Math.abs(Date.now() - notifyTime));
                    notifyTime = Date.now();
                } else if (observer instanceof DetectedObjectsObserver) {
                    console.log("DetectedObjectsObserver time:   " + Math.abs(Date.now() - notifyTime));
                    notifyTime = Date.now();
                } else if (observer instanceof TrainingMsgObserver) {
                    console.log("TrainingMsgObserver time:       " + Math.abs(Date.now() - notifyTime));
                    notifyTime = Date.now();
                }
            }
        });
        if (DEBUG_TIME) {
            console.log("------------ TOTAL Time: " + Math.abs(Date.now() - totalTime) + " -----");
        }
    };

    /**
     * Refresh the detections because the user clicks in the Use Different Colors CheckBox
     */
    this.toggleUseColor = function () {
        this.useColors = !this.useColors;
        this.detRecentlyDeleted = $.map(this.selectedDetections, function (value, index) {
            return [value];
        });
        this.detRecentlySelected = $.map(this.selectedDetections, function (value, index) {
            return [value];
        });
        this.notify();
    };

    /**
     * Refresh the detections because the user clicks in the Filter by abnormality rate CheckBox
     */
    this.toggleUseAbnormalityRate = function () {
        this.useAbnormalityRate = !this.useAbnormalityRate;
        this.detRecentlyDeleted = $.map(this.selectedDetections, function (value, index) {
            return [value];
        });
        this.detRecentlySelected = $.map(this.selectedDetections, function (value, index) {
            return [value];
        });
        this.notify();
    };

    this.getMaxAbnormalityRate = function () {
        var max = 0;
        var maxDet;
        for (var id in this.detections) {
            maxDet = this.detections[id].getMaxAbnormalityRate();
            if (max < maxDet) {
                max = maxDet;
            }
        }
        return max;
    }
}

/**
 * Return the number of Frames per second in the Custom HTML5 Video element
 *
 * @param video
 * @returns {Number}
 */
VideoDetections.prototype.getVideoFps = function (video) {
    var ext = video.currentSrc.split('.').pop();
    var fps = $(video).children('source[src$="' + ext + '"]').attr('fps');
    return parseInt(fps);
};