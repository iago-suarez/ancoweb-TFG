$(document).ready(function () {
    /****************** Video Details view ********************/

    const trainingFrames = 35;

    //Used to resize the video if we are in full screen
    var fullScreenOn = false;
    var videoProportion = 1;
    var canvasLeftPadding = 0;
    var canvasTopPadding = 0;

    /**
     *  Given a list of items to select, the function remarks them in the table.
     *
     * @param {object} objectList The list of items
     * @param tBody The table body where the head is: Identifier, First Frame, Last Frame, Stage Frames
     */
    function selectObjects(objectList, tBody) {
        $(tBody).find('tr').each(function () {
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
     * Paints the objects into the canvas element if the frameNumber > trainingFrames, otherwise
     * it paints the trainingLbl
     *
     * @param canvas
     * @param frameNumber
     * @param objects
     * @param trainingLbl
     * @returns {number}
     */
    function paintFrame(canvas, frameNumber, objects, trainingLbl) {
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

        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

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

        $(objects).each(function () {

            var h = parseInt($(this).find('box').attr('h'));
            var w = parseInt($(this).find('box').attr('h'));
            var xc = parseInt($(this).find('box').attr('xc'));
            var yc = parseInt($(this).find('box').attr('yc'));

            paintRect(context, videoProportion * xc, videoProportion * yc,
                videoProportion * w, videoProportion * h, 'blue', 2);
        });
    }

    /**
     * @class Represents a detected object in the table
     * @property {String} id
     * @property {String} firstFrame
     * @property {String} lastFrame
     * @constructor
     */
    function TableObject (id, firstFrame, lastFrame) {
        this.id = id;
        this.firstFrame = firstFrame;
        this.lastFrame = lastFrame;
        this.stageTime = parseInt(lastFrame) - parseInt(firstFrame);

        this.asTableRow = function(){
            return '<tr><th scope="row"><a href="/">' + this.id + '</a></th><td>'
                + this.firstFrame + '</td><td>' + this.lastFrame + '</td><td>'
                + this.stageTime + '</td></tr>\n';
        }
    }

    /**
     * Generates the Table Objects parsing the xml file.
     *
     * @param xmlObjects
     * @returns {{TableObject}}
     */
    function getTableObjectsFromXml(xmlObjects) {
        var myObjects = {};
        $(xmlObjects).find('frame').each(function () {
            var fnum = $(this).attr('number');
            $(this).find('object').each(function () {
                var objId = $(this).attr('id');
                if (myObjects[objId] === undefined) {
                    myObjects[objId] = new TableObject(objId, fnum, fnum + 1);
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
        var xmlUrl = $('#xml_detected_objs').text();
        $.get(xmlUrl, function (detectedXmlObjs) {
            // This is the heart of the beast

            //Generate the table of objects
            var tableObjects = getTableObjectsFromXml(detectedXmlObjs);
            for(var i in tableObjects) {
                $('#objects-tbody').append(tableObjects[i].asTableRow());
            }

            //Sort the table
            $('table').tablesorter();
            $('#first-moment-th').click();

            video.addEventListener("timeupdate", function(){
                var frameNumber = Math.round(this.currentTime * getVideoFps(this));
                var frame = $($(detectedXmlObjs).find('frame[number=' + frameNumber + ']'));
                var objects = $(frame).find('objectlist object');

                // Paint the objects in the canvas element
                paintFrame(document.getElementById('objects-canvas'), frameNumber, objects,
                    document.getElementById("training-lbl"));

                //We mark the objects that are being shown in the table
                selectObjects(objects, $('#objects-tbody'));
            }, false);
        });
    }

    loadXmlObjects();

    /**
     * Return the number of Frames per second in the HTML5 Video element
     *
     * @param video
     * @returns {Number}
     */
    function getVideoFps(video) {
        var ext = video.currentSrc.split('.').pop();
        var fps = $(video).children('source[src$="' + ext + '"]').attr('fps');
        return parseInt(fps);
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