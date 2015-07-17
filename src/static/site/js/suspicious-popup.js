/**
 * Created by iago on 16/07/15.
 */
const MAX_ZOOM = 20; // In pixels
const INITIAL_W_SIZE = 50;
var detection;
var video;
var window_size = INITIAL_W_SIZE;
var context;
var center = {x: 10, y: 28}; //Object with x and y fields
var zoomedOut = false;

Number.prototype.between = function (a, b) {
    return ((this >= a) && (this <= b));
};

function loop() {
    if (!video.paused) {

        var newCenter = detection
            .getPositionPoint(detection.videoDetections.getCurrentFrame());
        if (newCenter !== undefined) {
            center = newCenter;
        } else if (detection.videoDetections.getCurrentFrame() > detection.lastFrame) {
            // Zoom out
            const zoomOuVelocity = 0.01;
            var slider = $('#zoom-slider');
            var sliderVal = slider.slider("option", "value");
            var newVal;
            if (( sliderVal < 1) && !zoomedOut) {
                slider.slider('value', sliderVal + zoomOuVelocity);
                newVal = slider.slider("option", "value");
                zoomedOut = newVal === 1;
                sliderFun(null, {value: newVal});
            }
        }

        //console.log("(" + detection.videoDetections.getCurrentFrame()
        //    + "): Center.x: " + center.x + ", center.y: " + center.y + ", wSize: " + window_size);

        drawZoomedImage(video, context);
        // We suppose 25 fps
        return setTimeout(loop, 40);
    }
    console.log("EXIT!!");
}

function sliderFun(event, ui) {
    //TODO chequear que al estar dentro del resize no se ejecute 2 veces con el cambio de tanaño
    var min_zoom = Math.max(video.videoHeight, video.videoWidth);
    window_size = MAX_ZOOM + (min_zoom - MAX_ZOOM) * ui.value;
    $('#suspicious-layer').attr('height', window_size).attr('width', window_size);
    drawZoomedImage(video, context);
}

/**
 * Given the center to the window, this function calc the
 * distance in pixels to the top margin and left margin of
 * the video for a windows with size window_size
 * @param center
 * @param window_size
 * @param video
 * @returns {{left: number, top: number}}
 */
function centerToLeftTop(center, window_size, video) {
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
}

function drawZoomedImage(video, context) {

    context.fillStyle = 'black';
    var canvas = document.getElementById("suspicious-layer");
    context.fillRect(0, 0, canvas.width, canvas.height);

    var pos = centerToLeftTop(center, window_size, video);
    context.drawImage(video, -pos.left, -pos.top);

}

function adjustCanvas(video) {
    $('#canvas-container')
        .height($(video).height())
        .width($(video).width())
        .offset({top: $(video).offset().top, left: $(video).offset().left});
    $('#suspicious-layer').attr('height', window_size).attr('width', window_size);

    if (context !== undefined) {
        drawZoomedImage(video, context);
    }
}

function initVideo(video, detection) {
    adjustCanvas(video);

    //Get canvas context
    context = document.getElementById("suspicious-layer").getContext("2d");

    $("#zoom-slider").slider({
        min: 0,
        max: 1,
        step: 0.01,
        value: (INITIAL_W_SIZE - MAX_ZOOM) / ( Math.max(video.videoHeight, video.videoWidth) - MAX_ZOOM),
        orientation: "vertical",
        slide: sliderFun
    });
    $(video).bind('timeupdate', function () {
        drawZoomedImage(video, context)
    });

    $(video).bind('play', function () {
        loop();
    });

    detection.videoDetections.videoElement.play();
    loop();
}

$(document).ready(function () {

    var dummyVD = new VideoDetections(document.getElementById('video-player'), "", "");
    //recover the detection from the url or the cookie
    if (areCookiesEnabled()) {
        var cookieName = "suspiciousDet-" + getUrlParameter("suspiciousDetId");
        console.log("Reading cookieName: " + cookieName);
        var jsonDet = window.JSON.parse($.cookie(cookieName));
        detection = new Detection(dummyVD,
            jsonDet.id, jsonDet.firstFrame, jsonDet.lastFrame, jsonDet.xmlTrajectory);

        //$.removeCookie(cookieName);
    } else {
        detection = new Detection(dummyVD,
            parseInt(decodeURIComponent(getUrlParameter("id"))),
            parseInt(decodeURIComponent(getUrlParameter("firstFrame"))),
            parseInt(decodeURIComponent(getUrlParameter("lastFrame"))),
            decodeURIComponent(getUrlParameter("xmlTrajectory")));
    }

    //Sets the initial time to the video
    var loadedTime = decodeURIComponent(getUrlParameter("now"));
    var videoLoadedTime = decodeURIComponent(getUrlParameter("videoCurrTime"));
    var diff = Math.abs(Date.now() - loadedTime);
    dummyVD.videoElement.currentTime = (videoLoadedTime + diff) / 1000;

    /**************************************************************************/

    video = document.getElementById('video-player');

    $(video).ready(function () {
        console.log("ready h: " + video.videoHeight + ", w: " + video.videoWidth);
        adjustCanvas(video);
    });

    $(video).resize(function () {
        //Here we have the necessary data of the video
        console.log("resize1 h: " + video.videoHeight + ", w: " + video.videoWidth);
        initVideo(video, detection);
        adjustCanvas(video);
    });

    $(window).resize(function () {
        console.log("resizeW h: " + video.videoHeight + ", w: " + video.videoWidth);
        adjustCanvas(video);
    });
});