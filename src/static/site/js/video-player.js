$(document).ready(function () {
    /****************** Video Details view ********************/

    const trainingFrames = 35;

    var detectedObjs;
    var videoFps;

    //Used to resize the video if we are in full screen
    var fullScreenOn = false;
    var videoProportion = 1;
    var canvasLeftPadding = 0;
    var canvasTopPadding = 0;

    var trainingLbl = document.getElementById("training-lbl");

    /**
     * Given a list of items to select, the function remarks them in the table.
     */
    function selectObjects(objectList) {
        $('#objects-list').find('tr').each(function () {
            // For each table row
            var i = 0;
            var selected = false;
            var obj;
            while ((i < objectList.length) && (!selected)) {
                obj = objectList[i];
                selected = (obj.id === $($(this).find('th')[0]).text());
                i++;
            }
            if (selected) {
                //If it's selected
                if (!$(this).hasClass('info')) {
                    $(this).addClass('info')
                }
            } else {
                if ($(this).hasClass('info')) {
                    $(this).removeClass('info')
                }
            }
        });
    }

    /**
     * This functions selects a frame into the detected objects and paints all
     * objects for this frame.
     */
    function paintFrame() {

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

        var video = document.getElementById('video-player');
        var canvas = document.getElementById('objects');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (videoFps === undefined) {
            videoFps = getVideoFps(video)
        }

        var frameNumber = Math.round(video.currentTime * videoFps);

        //If the system is training display the label
        if (frameNumber < trainingFrames) {
            if (!$(trainingLbl).is(":visible")) {
                adjustTrainingLbl(trainingLbl);
                $(trainingLbl).show();
            }
            paintRect(context, 4, 4, canvas.width - 8, canvas.height - 8, '#f0ad4e', 4);
            return 0;
        } else if ((frameNumber >= trainingFrames) && ($(trainingLbl).is(":visible"))) {
            //If the system isn't training hide the label
            $(trainingLbl).hide();
        }

        //For each element in the frame paint your box
        var frame = $($(detectedObjs).find('frame[number=' + frameNumber + ']'));
        $(frame).find('objectlist object').each(function () {

            var h = parseInt($(this).find('box').attr('h'));
            var w = parseInt($(this).find('box').attr('h'));
            var xc = parseInt($(this).find('box').attr('xc'));
            var yc = parseInt($(this).find('box').attr('yc'));

            paintRect(context, videoProportion * xc, videoProportion * yc,
                videoProportion * w, videoProportion * h, 'blue', 2);

        });

        //We mark the objects that are being shown in the table
        selectObjects($(frame).find('objectlist object'));
    }

    /**
     * Generates the Table Elements parsing the xml file.
     */
    function generateObjectTable(xmlObjects) {
        var myObjects = {};
        $(xmlObjects).find('frame').each(function () {
            var fnum = $(this).attr('number');
            $(this).find('object').each(function () {
                var objId = $(this).attr('id');
                if (myObjects[objId] === undefined) {
                    myObjects[objId] = {id: objId, firstFrame: fnum, lastFrame: fnum + 1}
                } else {
                    myObjects[objId].lastFrame = fnum
                }
            });
        });
        return myObjects;
    }

    /**
     * Load the detected objects in the video via AJAX.
     */
    function loadXmlObjects() {
        var video = document.getElementById('video-player');
        var xmlUrl = $('#xml_detected_objs').attr('value');
        $.get(xmlUrl, function (data) {
            detectedObjs = data;
            var objs = generateObjectTable(detectedObjs);
            var obj, stageTime;
            for (var x in objs) {
                obj = objs[x];
                stageTime = parseInt(obj.lastFrame) - parseInt(obj.firstFrame);
                $('#objects-list').append('<tr><th scope="row"><a href="/">' + obj.id + '</a></th><td>'
                    + obj.firstFrame + '</td><td>' + obj.lastFrame + '</td><td>' + stageTime + '</td></tr>\n');
            }
            $('table').tablesorter();
            $('#first-moment-th').click();
            video.addEventListener("timeupdate", paintFrame, false);
        });
    }

    loadXmlObjects();

    /**
     * Return the number of Frames per second in the HTML5 Video element
     */
    function getVideoFps(video) {
        var ext = video.currentSrc.split('.').pop();
        var fps = $(video).children('source[src$="' + ext + '"]').attr('fps');
        return fps;
    }

    /** Adjust Canvas Element including fullScreen mode **/
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
        var videoLeft= $(videoPlayer).offset().left;
        var lblWidth = $(trainingLbl).width();

        var lblLeft = videoLeft + Math.round(videoWidth / 2) - Math.round(lblWidth / 2);
        $(trainingLbl).css("top", videoTop + 10).css("left", lblLeft);
    }

    /* Video canvas adjust size and START */
    var video = document.getElementById("video-player");


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