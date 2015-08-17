/**
 * Created by iago on 16/07/15.
 */

var video;
var loop_running = false;
var systemStarted = false;
var zoomVD;

var updateIndex = 0;
var lastUpdateTimes = Array.apply(null, new Array(10)).map(Number.prototype.valueOf, 0);

var videoDetections;

function arrayMean(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += parseInt(arr[i], 10);
    }
    return sum / arr.length;
}

function updateStatus() {
    if (!video.paused) {
        loop_running = true;

        var time = Date.now();
        zoomVD.updateState();

        updateIndex = (updateIndex + 1) % lastUpdateTimes.length;
        lastUpdateTimes[updateIndex] = Date.now() - time;
        //Waits the fps time least data processing time
        var updateTime = Math.floor((1000 / zoomVD.fps) - arrayMean(lastUpdateTimes));
        console.log("(fps: " + zoomVD.fps + ")estimateTime: " + updateTime);
        return setTimeout(updateStatus, updateTime);
    } else {
        loop_running = false;
        console.log("EXIT!!");
    }
}

function adjustCanvas(video) {
    $('#video-player').width(window.innerWidth -30);
    window.resizeTo(window.innerWidth, $('body').height() +30);
    $('#canvas-container')
        .height($(video).height())
        .width($(video).width())
        .offset({top: $(video).offset().top, left: $(video).offset().left});
    $('.drawing-layer').attr('height', zoomVD.window_size)
        .attr('width', zoomVD.window_size);

    zoomVD.updateState();
}

/**
 * Sets the handlers for the video events
 *
 * @param video
 */
function bindVideoEvents(video) {
    adjustCanvas(video);

    $("#zoom-slider").slider({
        min: 0,
        max: 1,
        step: 0.01,
        value: (zoomVD.maxZoom - zoomVD.maxZoom) /
        ( Math.max(video.videoHeight, video.videoWidth) - zoomVD.maxZoom),
        orientation: "vertical",
        slide: function (event, ui) {
            zoomVD.sliderFun(event, ui)
        }
    });
    $(video).bind('timeupdate', function () {
        zoomVD.updateState();
    });

    $(video).bind('play', function () {
        //Checks if the loop is still running
        //if (!loop_running) {
        updateStatus();
        //}
    });
}


function ZoomVideoDetections(videoElement, xmlTrajectories, xmlDetections, detId) {
    VideoDetections.call(this, videoElement, xmlTrajectories, xmlDetections);

    this.detection = this.detections[detId];
    this.maxZoom = Math.max(this.detection.maxSize.h, this.detection.maxSize.w);
    this.minZoom = Math.max(this.videoElement.videoHeight, this.videoElement.videoWidth);
    this.window_size = this.maxZoom * 2;
    this.center = {x: 10, y: 28}; //Object with x and y fields
    this.zoomedOut = false;

    /**
     * Updates the zoom state in function of the time and the detection position
     */
    this.updateState = function () {
        var newCenter = this.detection
            .getPositionPoint(this.getCurrentFrame());
        if (newCenter !== undefined) {
            this.center = newCenter;
        } else if (this.getCurrentFrame() > this.detection.lastFrame) {
            // Zoom out
            this.zoomOut();
        }

        console.log("(" + this.getCurrentFrame()
            + "): Center.x: " + this.center.x + ", center.y: "
            + this.center.y
            + ", wSize: " + this.window_size);

        this.notify();
    };

    /**
     * Update the zoom level and the state
     *
     * @param event
     * @param ui value between 0 and 1 that defines the windows size between
     * this.minZoom - this.maxZoom
     */
    this.sliderFun = function (event, ui) {
        this.window_size = this.maxZoom + (this.minZoom - this.maxZoom) * ui.value;
        $('.drawing-layer').attr('height', this.window_size).attr('width', this.window_size);
        this.updateState();
    };

    /**
     * Change the value of window_size global variable updating the view
     * according that
     */
    this.zoomOut = function () {
        const zoomOuVelocity = 0.01;
        var slider = $('#zoom-slider');
        var sliderVal = slider.slider("option", "value");
        var newVal;
        if (( sliderVal < 1) && !this.zoomedOut) {
            slider.slider('value', sliderVal + zoomOuVelocity);
            newVal = slider.slider("option", "value");
            this.zoomedOut = newVal === 1;

            this.window_size = this.maxZoom + (this.minZoom - this.maxZoom) * newVal;
            $('.drawing-layer').attr('height', this.window_size).attr('width', this.window_size);
        }
    };

    /**
     * Given the center to the window, this function calc the
     * distance in pixels to the top margin and left margin of
     * the video for a windows with size window_size
     * @param center
     * @param window_size
     * @param video
     * @returns {{left: number, top: number}}
     */
    this.centerToLeftTop = function (center, window_size, video) {
        var x = center.x - window_size / 2;
        //If the box is over the video size adjust it
        if (x < 0) {
            x = 0;
        } else if ((x + window_size) > video.videoWidth) {
            x = video.videoWidth - window_size;
        }
        var y = center.y - window_size / 2;
        //If the box is over the video size adjust it
        if (y < 0) {
            y = 0;
        } else if ((y + window_size) > video.videoHeight) {
            y = video.videoHeight - window_size;
        }

        if (video.videoWidth < window_size) {
            // The video is less wide than the canvas element
            x = -(Math.abs(video.videoWidth - window_size) / 2);

        } else if (video.videoHeight < window_size) {
            // The video is less high than the canvas element
            y = -(Math.abs(video.videoHeight - window_size) / 2);
        }
        return {left: x, top: y};
    };
}

// ZoomVideoDetections.prototype create the object that inherits from VideoDetections.prototype
ZoomVideoDetections.prototype = Object.create(VideoDetections.prototype);


/**
 * Manage the popup suspicious windows
 *
 * @param zoomVideoDetections
 * @constructor
 * @param canvasElement
 */
function PopupManagerObserver(zoomVideoDetections, canvasElement) {
    DetectionsObserver.call(this, zoomVideoDetections);
    this.canvasElement = canvasElement;

    this.update = function () {
        if (!this.isEnable) {
            return;
        }

        this.drawZoomedImage();
    };

    /**
     * Draw the zoomed image in the canvas element
     *
     */
    this.drawZoomedImage = function () {

        var context = this.canvasElement.getContext('2d');
        context.fillStyle = 'black';
        context.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        var pos = this.videoDetections.centerToLeftTop(this.videoDetections.center,
            this.videoDetections.window_size, video);
        context.drawImage(video, -pos.left, -pos.top);

    };
}

// PopupManagerObserver.prototype create the object that inherits from DetectionsObserver.prototype
PopupManagerObserver.prototype = Object.create(DetectionsObserver.prototype);

/**
 * Paints the trajectories into the canvas element
 *
 * @param zoomVideoDetections
 * @param canvasElement
 * @constructor
 */
function SuspiciousTrajectoriesObserver(zoomVideoDetections, canvasElement) {
    //Call to the father constructor to init his values
    DetectionsObserver.call(this, zoomVideoDetections);
    this.canvasElement = canvasElement;

    this.update = function () {
        if (!this.isEnable) {
            return;
        }

        var context = this.canvasElement.getContext('2d');
        context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        //Get the trajectory points for the current detection
        context.beginPath();

        // Window coordinates with respect to the to right margin Video
        var lefTopDistance = this.videoDetections.centerToLeftTop(this.videoDetections.center,
            this.videoDetections.window_size, this.videoDetections.videoElement);

        var p = this.videoDetections.detection.getPositionPoint(
            this.videoDetections.detection.trajectory.firstFrame);

        context.moveTo(p.x - lefTopDistance.left, p.y - lefTopDistance.top);
        context.lineWidth = 3;

        //Select the color
        context.strokeStyle = this.videoDetections.detection.getCurrentColor();

        var f = this.videoDetections.detection.trajectory.firstFrame;
        while (f <= this.videoDetections.getCurrentFrame() &&
        f <= this.videoDetections.detection.trajectory.lastFrame) {
            p = this.videoDetections.detection.getPositionPoint(f);
            context.lineTo(p.x - lefTopDistance.left, p.y - lefTopDistance.top);
            f++;
        }
        context.stroke();
    };
}

// TrajectoriesObserver.prototype create the object that inherits from DetectionsObserver.prototype
SuspiciousTrajectoriesObserver.prototype = Object.create(DetectionsObserver.prototype);


/**************************************************************************/

$(document).ready(function () {

    video = document.getElementById('video-player');

    $(video).ready(function () {
        if (systemStarted) {
            console.log("ready h: " + video.videoHeight + ", w: " + video.videoWidth);
            adjustCanvas(video);
        }
    });

    $(video).resize(function () {

        if (!systemStarted) {
            var xmlUrl = decodeURIComponent(getUrlParameter("xmlResult"));
            $.get(xmlUrl, function (xmlResult) {

                //Create the videoDetections object from the xml result and add its observers
                zoomVD = new ZoomVideoDetections(video, $(xmlResult).find('trajectories'),
                    $(xmlResult).find('objects'), getUrlParameter("suspiciousDetId"));

                console.log("Initial size: (h:" + zoomVD.detection.maxSize.h
                    + ", w:" + zoomVD.detection.maxSize.w + ")");

                //Sets the initial time to the video
                zoomVD.videoElement.currentTime = zoomVD.detection.firstFrame *
                    ((1000 / zoomVD.fps) / 1000);

                zoomVD.addObserver(new PopupManagerObserver(zoomVD,
                    document.getElementById("suspicious-layer")));
                zoomVD.addObserver(
                    new SuspiciousTrajectoriesObserver(zoomVD,
                        document.getElementById("trajectories-layer")));

                systemStarted = true;
                bindVideoEvents(video);

                video.play();
            });
        } else {
            //Here we have the necessary data of the video
            console.log("resize1 h: " + video.videoHeight + ", w: " + video.videoWidth);
            adjustCanvas(video);
        }
    });

    $(window).resize(function () {
        if (systemStarted) {
            console.log("resizeW h: " + video.videoHeight + ", w: " + video.videoWidth);
            adjustCanvas(video);
        }
    });
});