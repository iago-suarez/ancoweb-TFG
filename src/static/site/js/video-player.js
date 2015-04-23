$(document).ready(function(){
/****************** Video Details view ********************/

    var pos = [0,0];
    var detected_objs ;

    function paintFrame(){

        function get_video_fps(video){
            var ext = video.currentSrc.split('.').pop();
            var fps = $(video).children('source[src$="'  + ext + '"]').attr('fps');
            return fps;
        }

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

        var canvas = document.getElementById('objects');
        var context = canvas.getContext('2d');
        var video = document.getElementById('video-player');
        context.clearRect ( 0 , 0 , canvas.width, canvas.height );

        var frame_number = Math.round(video.currentTime * get_video_fps(video))

        //Para cada elemento en la frame pintamos su recuadro
        var frame = $($(detected_objs).find('frame')[frame_number])
        $(frame).find('objectlist object').each(function(){

            var h = parseInt($(this).find('box').attr('h'));
            var w = parseInt($(this).find('box').attr('h'));
            var xc = parseInt($(this).find('box').attr('xc'));
            var yc = parseInt($(this).find('box').attr('yc'));

            paint_rect(context, xc, yc, w, h)
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


    /* Video canvas adjust size and START */
    var video = document.getElementById("video-player");
    // Cuando el vídeo ha cargado su tamano establecemos el
    // mismo tamaño para el canvas
    video.onloadedmetadata = function(){
        $('.drawing-layer').offset($('#video-player').offset());
        $('.drawing-layer').attr('height', $('#video-player').height());
        $('.drawing-layer').attr('width', $('#video-player').width());

        $( window, '#video-player' ).resize(function() {
            $('.drawing-layer').offset($('#video-player').offset());
            $('.drawing-layer').attr('height', $('#video-player').height());
            $('.drawing-layer').attr('width', $('#video-player').width());
        });
    }

    /* Entering Exiting fullscreen mode */
    $('#video-player').bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
        var fullscreenOn = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if (fullscreenOn){
            $('.drawing-layer').css('z-index', 2147483647)
        }else{
            $('.drawing-layer').css('z-index', "")
        }
    });
});