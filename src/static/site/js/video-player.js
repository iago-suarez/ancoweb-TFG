$(document).ready(function(){
/****************** Video Details view ********************/

    var pos = [0,0];
    var detected_objs ;
    var video_fps;

    //Utilizadas para redimensionar el vídeo en caso de que estemos en pantalla completa
    var fullscreenOn = false;
    var video_proportion = 1;
    var canvas_left_padding = 0;
    var canvas_top_padding = 0;

    function paintFrame(){

        function paint_rect(context, xc, yc, w, h){
            context.beginPath();
            // left, top, width, height
            context.rect(xc, yc, w, h);
            context.fillStyle = "rgba(0, 0, 0, 0)";
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = 'blue';
            context.stroke();
        }
        var video = document.getElementById('video-player');
        var canvas = document.getElementById('objects');
        var context = canvas.getContext('2d');
        context.clearRect ( 0 , 0 , canvas.width, canvas.height );

        if (video_fps === undefined){
            video_fps = get_video_fps(video)
        }

        var frame_number = Math.round(video.currentTime * video_fps)

        //Para cada elemento en la frame pintamos su recuadro
        var frame = $($(detected_objs).find('frame[number=' + frame_number + ']'))
        $(frame).find('objectlist object').each(function(){

            var h = parseInt($(this).find('box').attr('h'));
            var w = parseInt($(this).find('box').attr('h'));
            var xc = parseInt($(this).find('box').attr('xc'));
            var yc = parseInt($(this).find('box').attr('yc'));

            paint_rect(context, video_proportion * xc, video_proportion * yc,
                video_proportion * w, video_proportion * h)
        });
    }

    function load_xml_objects(){
        var video = document.getElementById('video-player');
        var xml_url = $('#xml_detected_objs').attr('value');
        $.get(xml_url, function(data){
            detected_objs = data
            video.addEventListener("timeupdate", paintFrame, false);
        });
    }
    load_xml_objects();

    function get_video_fps(video){
        var ext = video.currentSrc.split('.').pop();
        var fps = $(video).children('source[src$="'  + ext + '"]').attr('fps');
        return fps;
    }

    /** Adjust only position and dimesions of the Canvas Element **/
    function adjustCanvas(){
        $('.drawing-layer').offset($('#video-player').offset());
        $('.drawing-layer').attr('height', $('#video-player').height());
        $('.drawing-layer').attr('width', $('#video-player').width());
    }

    /** Adjust Canvas Element including fullScreen mode **/
    function adjustCanvasExtended(video){
        // If we are in full screen mode
        if(fullscreenOn){
            video_height = video.videoHeight;
            video_width = video.videoWidth;
            screen_height = $(video).height();
            screen_width = $(video).width();
            video_proportion = screen_height / video_height;

            if((video_width/video_height) < (screen_width/screen_height)){
                // El video es más cuadrado que la pantalla
                // Por tanto se contara un offset a la izq de la pantalla

                canvas_left_padding = (screen_width - (video_proportion*video_width))/2;
                canvas_top_padding = 0;
                $('.drawing-layer').attr('height', screen_height);
                $('.drawing-layer').attr('width', video_proportion*video_width);
            } else {
                // El video es menos cuadrado que la pantalla
                // Por tanto se contara un offset a la parte superior de la pantalla

                canvas_left_padding = 0;
                canvas_top_padding =  (screen_height - (video_proportion*video_height))/2;
                $('.drawing-layer').attr('width', screen_width);
                $('.drawing-layer').attr('height', video_proportion*video_height);
            }
        } else {
            // If we are not in fullscreen mode, only reset the size of the canvas
            video_proportion = 1;
            canvas_left_padding = 0;
            canvas_top_padding = 0;
            $('.drawing-layer').attr('height', $('#video-player').height());
            $('.drawing-layer').attr('width', $('#video-player').width());

        }
        $('.drawing-layer').offset($('#video-player').offset());
        $('.drawing-layer').css('padding-left' , canvas_left_padding);
        $('.drawing-layer').css('padding-top' , canvas_top_padding);
    }

    /* Video canvas adjust size and START */
    var video = document.getElementById("video-player");

    /*************** HACEMOS DEBUG DE LOS EVENTOS DEL VÍDEO ******************/
    $(video).bind("loadedmetadata", function(){
        console.log("--> video.onloadedmetadata");
    });

    $(video).bind("canplay", function(){
        console.log("--> video.canplay");
    });

    $(video).bind("loadeddata", function(){
        console.log("--> video.loadeddata");
    });

    $(video).resize(function(){
        console.log("video.resize: " + $('video').height() + " - " + $('video').width());
    });
    /*************************************************************************/

    $(video).ready(function(){
        console.log("--> video.ready: " + $('video').height() + " - " + $('video').width());
    });


    // Cuando el vídeo ha cargado su tamano establecemos el
    // mismo tamaño para el canvas
    $(video).ready(adjustCanvas);

    $( window, '#video-player' ).resize(adjustCanvasExtended(video));

    /* Entering Exiting fullscreen mode */
    $('#video-player').bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
        fullscreenOn = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if (fullscreenOn){
            $('.drawing-layer').css('z-index', 2147483647)

        }else{
            $('.drawing-layer').css('z-index', "")
        }
    });
});