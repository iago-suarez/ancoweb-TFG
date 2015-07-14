/**
 * Created by iago on 8/07/15.
 */


/**
 * Return the number of Frames per second in the Custom HTML5 Video element
 *
 * @param video
 * @returns {Number}
 */
VideoDetections.getVideoFps = function (video) {
    var ext = video.currentSrc.split('.').pop();
    var fps = $(video).children('source[src$="' + ext + '"]').attr('fps');
    return parseInt(fps);
};


/**
 * Generates the Table Objects parsing the xml file.
 *
 * @returns {{Detection}}
 * @param videoDetections
 * @param xmlDetections
 * @param xmlTrajectories
 */
VideoDetections.getDetectionsFromXml = function (videoDetections, xmlDetections, xmlTrajectories) {
    var myObjects = {};
    $(xmlDetections).find('frame').each(function () {
        var fNumber = $(this).attr('number');
        $(this).find('object').each(function () {
            var objId = $(this).attr('id');
            if (myObjects[objId] === undefined) {
                var trajectory = $(xmlTrajectories).find('trajectory#' + objId)[0];
                myObjects[objId] = new Detection(videoDetections, objId, parseInt(fNumber), parseInt(fNumber) + 1, trajectory);
            } else {
                myObjects[objId].lastFrame = parseInt(fNumber);
            }
        });
    });
    return myObjects;
};

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
    this.fps = VideoDetections.getVideoFps(videoElement);
    this.detections = VideoDetections.getDetectionsFromXml(this, xmlDetections, xmlTrajectories);
    this.selectedDetections = {};
    this.detRecentlyDeleted = {};
    this.detRecentlySelected = {};
    this.xmlDetectionsByFrame = xmlDetections;
    this.alarmAbnormalRate = 0;
    this.useAbnormalityRate = false;
    xmlTrajectories = null;

    this.addObserver = function (observer) {
        this.observers.push(observer);
    };

    this.getCurrentFrame = function () {
        return Math.round(this.videoElement.currentTime * this.fps);
    };

    this.getCurrentFrameXmlObjects = function () {
        return $(this.xmlDetectionsByFrame)
            .find('frame[number=' + this.getCurrentFrame() + '] objectlist object');
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
        var detectionsToSelect = this.getCurrentFrameXmlObjects();
        this.detRecentlyDeleted = {};
        this.detRecentlySelected = {};
        for (var id in this.detections) {
            var j = 0;
            var selected = false;
            var obj;
            var det = this.detections[id];
            while ((j < detectionsToSelect.length) && (!selected)) {
                obj = detectionsToSelect[j];
                selected = (obj.id === det.id);
                j++;
            }
            //If it's necessary update the row state
            if (det.selected != selected) {
                if (!det.selected) {
                    //if he has appeared for the first time we add it
                    //Get the detection position, and set the image of this position
                    var detBox = $(detectionsToSelect).find('object[id=' + det.id + '] box')[0];
                    det.setImgFromVideoBox(detBox);
                    this.selectedDetections[det.id] = det;
                    this.detRecentlySelected[det.id] = det;
                } else {
                    //Remove the detection from the selectedMap
                    delete this.selectedDetections[det.id];
                    this.detRecentlyDeleted[det.id] = det;
                }
                det.selected = selected;
            }
        }
        this.notify();
    };

    this.notify = function () {
        this.observers.forEach(function (observer) {
            observer.update();
        });
    };

    /**
     * Refresh the detections because the user clicks in the Use Different Colors CheckBox
     */
    this.toggleUseColor = function () {
        this.useColors = !this.useColors;
        this.detRecentlyDeleted = this.selectedDetections;
        this.detRecentlySelected = this.selectedDetections;
        this.notify();
    };

    /**
     * Refresh the detections because the user clicks in the Filter by abnormality rate CheckBox
     */
    this.toggleUseAbnormalityRate = function () {
        this.useAbnormalityRate = !this.useAbnormalityRate;
        this.detRecentlyDeleted = this.selectedDetections;
        this.detRecentlySelected = this.selectedDetections;
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