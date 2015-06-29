/****************** Video Details view ********************/

const trainingFrames = 35;

//Used to resize the video if we are in full screen
var fullScreenOn = false;
var videoProportion = 1;
var canvasLeftPadding = 0;
var canvasTopPadding = 0;

var detections = {};

/**
 * Return the corresponding rgb light color to the object with id
 * @param id a number between 0 and 1000000
 * @returns {string}
 */
function idToRgb(id) {

    function max(r, g, b) {
        if (r > g) {
            if (r > b) {
                return r;
            } else {
                return b;
            }
        } else {
            if (g > b) {
                return g;
            } else {
                return b;
            }
        }
    }

    var r = Math.round(id / 1000000);
    var g = Math.round((id % 1000000) / 1000);
    var b = Math.round(id % 1000);

    // Transform the numbers in 2 digits hexademilas strigns
    var rStr;
    if (r < 16) rStr = '0' + r.toString(16);
    else rStr = r.toString(16);

    var gStr;
    if (g < 16) gStr = '0' + g.toString(16);
    else gStr = g.toString(16);

    var bStr;
    if (b < 16) bStr = '0' + b.toString(16);
    else bStr = b.toString(16);

    //Select the most similar light color
    var maxVal = max(r, g, b);
    if (maxVal === r) {
        return '#' + 'ff' + gStr + bStr;
    } else {
        if (maxVal === g) {
            return '#' + rStr + 'ff' + bStr;
        } else {
            return '#' + rStr + gStr + 'ff';
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
 *  Given a list of items to select, the function remarks them in the table.
 *
 * @param detections The full detections map
 * @param {object} objectList The list of items to select
 * @param tBody The table body where the head is: Identifier, First Frame, Last Frame, Stage Frames
 * @param currentObjsDiv
 * @param useColors Boolean value indicating whether the objects are painted in different colors
 */
function selectObjects(detections, objectList, tBody, currentObjsDiv, useColors) {

    for (var i in detections) {
        var j = 0;
        var selected = false;
        var obj;
        while ((j < objectList.length) && (!selected)) {
            obj = objectList[j];
            selected = (obj.id === detections[i].id);
            j++;
        }
        //If it's necessary update the row state
        if (detections[i].selected != selected) {
            if (!detections[i].selected) {
                //if he has appeared for the first time we add it
                $(currentObjsDiv).append(detections[i].asCurrentDetection(useColors));
                $('[data-toggle="popover"]').popover({
                    html: true,
                    template: detections[i].asPopoverTemplate(useColors)
                });

            } else {
                $(currentObjsDiv).find('span:contains(' + detections[i].id + ')').parent().remove();
            }
            detections[i].selected = selected;
            $(tBody).find('tr:contains(' + detections[i].id + ')')
                .replaceWith(detections[i].asTableRow(useColors));
        }
    }
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
 *  Paints the objects into the canvas element
 *
 * @param canvas
 * @param frameObjects
 * @param useColors
 */
function paintFrameObjects(canvas, frameObjects, useColors) {

    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    $(frameObjects).each(function () {

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

/**
 * Paints the trajectories into the canvas element if the frameNumber > trainingFrames,
 * otherwise it paints the trainingLbl
 * @param canvas
 * @param frameNumber
 * @param xmlResult
 * @param useColors
 * @returns {number}
 */
function paintFrameTrajectories(canvas, frameNumber, xmlResult, useColors) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    $('tr.selected a').each(function () {
        var id = parseInt($(this).text());
        var trajPoints = $(xmlResult).find('trajectory#' + id + ' point');
        context.beginPath();
        context.moveTo(videoProportion * parseInt($(trajPoints[0]).attr('x')),
            videoProportion * parseInt($(trajPoints[0]).attr('y')));
        context.lineWidth = 3;
        //Select the color
        if (useColors) {
            context.strokeStyle = idToRgb(id);
        } else {
            context.strokeStyle = '#ff0000';
        }
        var i = 1;
        var f = 0;
        while ((i < trajPoints.length) && f <= frameNumber) {
            context.lineTo(videoProportion * parseInt($(trajPoints[i]).attr('x')),
                videoProportion * parseInt($(trajPoints[i]).attr('y')));
            i++;
            f = $(trajPoints[i]).attr('frame');
        }
        context.stroke();
    });
}

/**
 * Paint the training label if it's necessary
 *
 * @param canvas
 * @param frameNumber
 * @param trainingLbl
 * @returns {number}
 */
function paintTrainingMsgIfNecessary(canvas, frameNumber, trainingLbl) {

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
}

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
 * @class Represents a detected object in the table
 * @property {String} id
 * @property {String} firstFrame
 * @property {String} lastFrame
 * @constructor
 */
function Detection(id, firstFrame, lastFrame) {
    this.id = id;
    this.firstFrame = firstFrame;
    this.lastFrame = lastFrame;
    this.color = idToRgb(id);
    this.selected = false;

    // It is calculated only once when the object is created to optimize
    this._fps = getVideoFps(document.getElementById('video-player'));
    this._fixedTableRowStr = '><th scope="row"><a href="#">' + this.id + '</a></th><td>'
        + frameToSecondsStr(this.firstFrame, this._fps) + '</td><td>'
        + frameToSecondsStr(this.lastFrame, this._fps) + '</td><td>'
        + frameToSecondsStr(this.lastFrame - this.firstFrame, this._fps) + '</td></tr>\n';

    this.setCanvas = function (canvas) {
        this.canvasCurrentImg = canvas;
    };

    this.getBgColorStyle = function (useColors) {

        if (useColors) {
            return 'background-color: ' + this.color;
        } else {
            // class info color
            return 'background-color: #d9edf7';
        }
    };

    /**
     * Return the detection as a table row
     *
     * @param useColors
     * @returns {string}
     */
    this.asTableRow = function (useColors) {

        var result = '<tr';
        if (this.selected) {
            result += ' class="selected" style="' + this.getBgColorStyle(useColors) + ';"';
        }
        result += this._fixedTableRowStr;
        return result;
    };

    /**
     * Return the colored base of the pop over view
     *
     * @param useColors
     * @returns {string}
     */
    this.asPopoverTemplate = function (useColors) {
        return '<div class="popover" role="tooltip"><div class="arrow"></div>' +
            '<strong><h3 class="popover-title" style=" ' +
            this.getBgColorStyle(useColors) + '" ></h3></strong>' +
            '<div class="popover-content"></div></div>';
    };

    /**
     * Return the current detection view if it's selected
     * @returns {*}
     */
    this.asCurrentDetection = function (useColors) {
        var result = '<button data-container="body"' +
            'class="btn btn-default img-thumbnail text-right current-detection-small"' +
            'style=" border: 10px solid ';
        if (useColors) {
            result += this.color + ';" ';
        } else {
            result += '#d9edf7;" ';
        }
        result += 'data-toggle="popover" data-placement="bottom" ' +
            'title="Detection ' + this.id + '" ' +
            'data-content=\'' +
                //popover content
            '<span class="detection-id" hidden>' + this.id + '</span>' +
            '</p><p><strong>First Frame: </strong>\t' + frameToSecondsStr(this.firstFrame, this._fps) +
            '</p><p><strong>Last Frame: </strong>\t' + frameToSecondsStr(this.lastFrame, this._fps) +
            '</p><p><strong>Stage Frames: </strong>\t' +
            frameToSecondsStr(this.lastFrame - this.firstFrame, this._fps) + '</p>\'>   ' +

            '<span class="myCaret"></span><span class="detection-id" hidden>' + this.id + '</span>' +
            '</button>';
        return result;
    };
}

/**
 * Generates the Table Objects parsing the xml file.
 *
 * @param xmlObjects
 * @returns {{Detection}}
 */
function getTableObjectsFromXml(xmlObjects) {
    var myObjects = {};
    $(xmlObjects).find('frame').each(function () {
        var fnum = $(this).attr('number');
        $(this).find('object').each(function () {
            var objId = $(this).attr('id');
            if (myObjects[objId] === undefined) {
                myObjects[objId] = new Detection(objId, parseInt(fnum), parseInt(fnum) + 1);
            } else {
                myObjects[objId].lastFrame = parseInt(fnum);
            }
        });
    });
    return myObjects;
}

/**
 * Load the detected objects in the video via AJAX.
 * @param video
 */
function loadXmlResult(video) {
    var xmlUrl = $('#xml_detected_objs').text();
    $.get(xmlUrl, function (xmlResult) {
        // This is the heart of the beast

        //Generate the table of objects
        detections = getTableObjectsFromXml(xmlResult);
        for (var i in detections) {
            $('#objects-tbody').append(detections[i].asTableRow(true));
        }

        //Sort the table
        $('table').tablesorter();
        $('#first-moment-th').click();

        video.addEventListener("timeupdate", function () {
            var frameNumber = Math.round(this.currentTime * getVideoFps(this));
            var frameObjects = $(xmlResult).find('frame[number=' + frameNumber + '] objectlist object');
            var useColors = document.getElementById('colors-checkbox').hasAttribute('checked');
            // We mark the objects that are being shown in the table
            selectObjects(detections, frameObjects, $('#objects-tbody'), $('#current-detected-objs'), useColors);

            // Paint the objects in the canvas element
            paintFrameObjects(document.getElementById('objects-canvas'), frameObjects, useColors);

            // Paint the trajectories in the canvas element
            paintFrameTrajectories(document.getElementById('trajectories-canvas'), frameNumber, xmlResult, useColors);

            // Paint the training label if it's necessary
            paintTrainingMsgIfNecessary(document.getElementById('training-canvas'), frameNumber,
                document.getElementById("training-lbl"));

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