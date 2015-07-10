/****************** Video Details view ********************/

const trainingFrames = 35;

//Used to resize the video if we are in full screen
var fullScreenOn = false;
var videoProportion = 1;
var canvasLeftPadding = 0;
var canvasTopPadding = 0;

/**
 * Return the corresponding rgb light color to the object with id
 * @param id a number between 0 and 1000000
 * @returns {string}
 */
function idToRgb(id) {

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
                return '#' + '00' + 'ff' + toHexString(b);
            } else {
                return '#' + toHexString(r) + 'ff' + '00';
            }
        case 2:
            if (id % 2) {
                return '#' + '00' + toHexString(g) + 'ff';
            } else {
                return '#' + toHexString(r) + '00' + 'ff';
            }
    }
}

/**
 * Return the corresponding rgba light color to the object with id
 * @param id
 * @param a a number between 0 and 256 that represents the transparency
 * @returns {string}
 */
function idToRgba(id, a) {
    return idToRgb(id) + a.toString(16);
}

/**
 * Generate a Canvas element from the video element
 * @param video
 * @param w
 * @param h
 * @param cx
 * @param cy
 * @returns {string}
 */
function capture(video, w, h, cx, cy) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, -cx, -cy);
    return canvas.toDataURL();
}

/**
 * Paint a rect in the canvas context in color and with lineWidth pixels in border.
 * @param context The canvas context
 * @param {Number} xc The coordinate of the x in pixels
 * @param {Number} yc The coordinate of the y in pixels
 * @param {Number} w The width
 * @param {Number} h The height
 * @param color The Color
 * @param {Number} lineWidth
 */
function paintRect(context, xc, yc, w, h, color, lineWidth) {
    context.beginPath();
    // left, top, width, height
    context.rect(xc, yc, w, h);
    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.fill();
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.stroke();
}

/**
 * Convert the frame number to time string
 * @param nFrame
 * @param fps
 * @returns {string}
 */
function frameToSecondsStr(nFrame, fps) {
    var sec = nFrame / fps;
    return ("0" + Math.floor(sec / 60)).slice(-2) + ':' +
        ("0" + Math.floor(sec % 60)).slice(-2);
}

/**
 * Load the detected objects in the video via AJAX.
 * @param video
 */
function loadXmlResult(video) {
    var xmlUrl = $('#xml_detected_objs').text();
    $.get(xmlUrl, function (xmlResult) {
        // This is the heart of the beast

        //Create the videoDetections object from the xml result and add its observers
        var videoDetections = new VideoDetections(video, $(xmlResult).find('trajectories'),
            $(xmlResult).find('objects'));

        videoDetections.addObserver(new CurrentDetectionsObserver(videoDetections,
            $('#current-detected-objs')));
        videoDetections.addObserver(new DetectionsTableObserver(videoDetections,
            $('#objects-tbody')));
        videoDetections.addObserver(new TrajectoriesObserver(videoDetections,
            document.getElementById('trajectories-canvas')));
        videoDetections.addObserver(new DetectionsObjectsObserver(videoDetections,
            document.getElementById('objects-canvas')));
        videoDetections.addObserver(new TrainingMsgObserver(videoDetections,
            document.getElementById('training-canvas'),
            document.getElementById("training-lbl"), trainingFrames));

        //Sort the table
        $('table').tablesorter();
        $('#first-moment-th').click();

        video.addEventListener("timeupdate", function () {
            videoDetections.updateState();
        }, false);
    });
}

/**
 * Adjust Canvas Element including fullScreen mode
 * @param video
 */
function adjustCanvasExtended(video) {
    // If we are in full screen mode
    var videoHeight = video.videoHeight;
    var videoWidth = video.videoWidth;
    var screenHeight = $(video).height();
    var screenWidth = $(video).width();
    videoProportion = screenHeight / videoHeight;

    var drawingLayers = $('.drawing-layer');

    if ((videoWidth / videoHeight) < (screenWidth / screenHeight)) {
        // The video is more square than the screen, so an offset to
        // the left will tell Screen

        canvasLeftPadding = (screenWidth - (videoProportion * videoWidth)) / 2;
        canvasTopPadding = 0;
        $(drawingLayers).attr('height', screenHeight)
            .attr('width', videoProportion * videoWidth);
    } else {
        // The video is less boxy than the screen, so it will have an offset
        // to the top of the screen

        canvasLeftPadding = 0;
        canvasTopPadding = (screenHeight - (videoProportion * videoHeight)) / 2;
        $(drawingLayers).attr('width', screenWidth)
            .attr('height', videoProportion * videoHeight);
    }

    $(drawingLayers).offset($('#video-player').offset())
        .css('padding-left', canvasLeftPadding)
        .css('padding-top', canvasTopPadding);
    adjustTrainingLbl(document.getElementById('training-lbl'));
}

/**
 * Adjust the "Training Frames" label over the video element
 */
function adjustTrainingLbl(trainingLbl) {

    var videoPlayer = $('#video-player');

    var videoWidth = $(videoPlayer).width();
    var videoTop = $(videoPlayer).offset().top;
    var videoLeft = $(videoPlayer).offset().left;
    var lblWidth = $(trainingLbl).width();

    var lblLeft = videoLeft + Math.round(videoWidth / 2) - Math.round(lblWidth / 2);
    $(trainingLbl).css("top", videoTop + 10).css("left", lblLeft);
}


$(document).ready(function () {

    var video = document.getElementById("video-player");
    if (video === null) {
        //Si no estamos en la página de video
        return;
    }

    loadXmlResult(video);

    $(video).resize(function () {
        adjustCanvasExtended(this);
    });

    $(window).resize(function () {
        adjustCanvasExtended(video);
    });

    $(video).ready(function () {
        adjustCanvasExtended(this);
    });

    /* Entering Exiting full screen mode */
    $(video).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function () {
        /** @namespace document.mozFullScreen */
        /** @namespace document.webkitIsFullScreen */
        /** @namespace document.fullScreen */
        fullScreenOn = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if (fullScreenOn) {
            $('.drawing-layer').css('z-index', 2147483647);
            $('#training-lbl').css('z-index', 2147483647);

        } else {
            $('.drawing-layer').css('z-index', "");
            $('#training-lbl').css('z-index', 50);
        }
    });

    /* Start and stop functions for video player */
    function playAndPause(video) {
        if (video.paused) {
            video.play();
        }
        else {
            video.pause();
        }
    }

    $(video).click(function () {
        playAndPause(this);
    });

    $(document).keypress(function (event) {
        if (event.charCode === 32) {
            playAndPause(document.getElementById("video-player"));
            return false;
        }
    });
});