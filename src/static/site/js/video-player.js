/****************** Video Details view ********************/
const trainingFrames = 35;

//Used to resize the video if we are in full screen
var fullScreenOn = false;
var videoProportion = 1;
var canvasLeftPadding = 0;
var canvasTopPadding = 0;

var updateIndex = 0;
var lastUpdateTimes = Array.apply(null, new Array(10)).map(Number.prototype.valueOf,0);

var videoDetections;

function arrayMean(arr){
    var sum = 0;
    for( var i = 0; i < arr.length; i++ ){
        sum += parseInt( arr[i], 10 );
    }
    return  sum/arr.length;
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
        ("0" + sec.toFixed(2)).slice(-5);
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
        videoDetections = new VideoDetections(video, $(xmlResult).find('trajectories'),
            $(xmlResult).find('objects'));

        videoDetections.addObserver(new CurrentDetectionsObserver(videoDetections,
            $('#current-detected-objs')));
        videoDetections.addObserver(new DetectionsTableObserver(videoDetections,
            $('#objects-tbody')));
        videoDetections.addObserver(new TrajectoriesObserver(videoDetections,
            document.getElementById('trajectories-canvas')));
        videoDetections.addObserver(new DetectedObjectsObserver(videoDetections,
            document.getElementById('objects-canvas')));
        videoDetections.addObserver(new TrainingMsgObserver(videoDetections,
            document.getElementById('training-canvas'),
            document.getElementById("training-lbl"), trainingFrames));
        videoDetections.addObserver(new PopupLauncherObserver(videoDetections));
        //Sort the table
        $('table').tablesorter();
        $('#first-moment-th').click();

        var max = videoDetections.getMaxAbnormalityRate();
        if (max > 0) {
            $("#abnormality-slider").slider({
                max: max,
                step: 0.001,
                slide: function (event, ui) {
                    $('#abnormality-input').val(ui.value);
                    videoDetections.alarmAbnormalRate = parseFloat(ui.value);
                    videoDetections.updateState();
                }
            });
            $('#abnormality-input').val(0);
        }


        function updateStatus() {
            if (!video.paused) {
                var time = Date.now();
                videoDetections.updateState();

                updateIndex = (updateIndex + 1) % lastUpdateTimes.length;
                lastUpdateTimes[updateIndex] = Date.now() - time;
                var updateTime  = Math.floor((1000 / videoDetections.fps) - arrayMean(lastUpdateTimes));
                console.log("(fps: " + videoDetections.fps + ")estimateTime: " + updateTime);
                return setTimeout(updateStatus, updateTime);
            }
        }

        $(video).bind('play', function () {
            updateStatus();
        });
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

    //Reload the graphical view
    if (videoDetections) {
        videoDetections.notify();
    }
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

function fullScreenChange() {

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
    //Reload the graphical view
    if (videoDetections) {
        videoDetections.notify();
    }
}

$(document).ready(function () {

    var video = document.getElementById("video-player");
    if (video === null) {
        //If we aren't into the video page
        return;
    }

    //If the user change the time bar we update the state
    video.addEventListener("timeupdate", function () {
        if (videoDetections && video.paused) {
            videoDetections.updateState();
        }
    }, false);


    loadXmlResult(video);

    $(video).resize(function () {
        adjustCanvasExtended(this);
    });

    $(window).resize(function () {
        adjustCanvasExtended(video);
    });

    $(video).ready(function () {
        adjustCanvasExtended(video);
    });

    /* Entering Exiting full screen mode */
    document.addEventListener("fullscreenchange", fullScreenChange, false);
    document.addEventListener("mozfullscreenchange", fullScreenChange, false);
    document.addEventListener("webkitfullscreenchange", fullScreenChange, false);
    document.addEventListener("msfullscreenchange", fullScreenChange, false);

    /* Start and stop functions for video player */
    function playAndPause(video) {
        if (video.paused) {
            video.play();
        }
        else {
            video.pause();
        }
    }

    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isChrome = window.chrome;

    if (isOpera) {
        $(video).click(function () {
        });
    }

    if (isChrome && !isOpera) {
        $(video).click(function () {
            playAndPause(this);
            return true;
        });
    }

    $(document).keypress(function (event) {
        if (event.charCode === 32) {
            playAndPause(document.getElementById("video-player"));
            return false;
        }
    });
});