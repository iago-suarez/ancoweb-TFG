function getUrlParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

$(document).ready(function(){
    /* Search Bar */
    $('#search-video-form input#id_name').attr('value', getUrlParameter('name'));

    /* Notifications */
    $('.delete-notification').click(function(){
        var not_id = $(this).next('.notificationId').attr('value');
        var $this = $(this);
        $.post( '/videoUpload/notifications/delete/' + not_id + '/', function(data, status){
            //Si todo ha ido bien borramos la notificacion
            $this.parent().fadeOut(500, function() { $(this).remove(); });
        }).error(function(data){
            alert(data.statusText.concat("\n\n", data.responseText))
        })
        return false;
    });

    var csrftoken = $.cookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    function refresh_notification(not_dom, not_json){
        if(not_json.fields.is_finished && !(not_dom.find('.video-finished-btn').length)){
            not_dom.children('.progress').remove();
            var new_dom =
                '<div class=\"text-center\"> \
                    <a class=\"btn btn-primary video-finished-btn\" \
                        href=\"/videoUpload/upload/' + not_json.fields.video_model + '/success/"> \
                            Finish \
                    </a> \
                </div>';
            not_dom.append($(new_dom));
        } else {
            not_dom.find('.progress-bar')
                .attr('aria-valuenow', not_json.fields.progress)
                .css('width', not_json.fields.progress + '%');
            not_dom.find('.progress-bar span').text(not_json.fields.progress + '% Complete');
        }
        not_dom.children('.state_message').text(not_json.fields.state_message);
    }

    function refresh_notifications(){
        // If there is no notification of a rise in progress we left
        if (!$('.notification:has(.progress-bar)').length)
            return true;
        // For all notifications we update it state
        $.getJSON("/videoUpload/notificationsJson", function(notifications){
            $.each(notifications, function (i, elem) {
                refresh_notification($('.notification:has(span[value=' + elem.pk + '])'), elem);
            });
        })
        window.setTimeout(refresh_notifications, 300);
    }
    refresh_notifications();

    /****************** Video Details view ********************/

    /* Video canvas adjust size */
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


    var pos = [0,0];
    var detected_objs ;

    function paintFrame(){

        function get_video_fps(video){
            var ext = video.currentSrc.split('.').pop();
            var fps = $(video).children('source[src$="'  + ext + '"]').attr('fps');
            return fps;
        }

        var canvas = document.getElementById('objects');
        var context = canvas.getContext('2d');
        var video = document.getElementById('video-player');
        context.clearRect ( 0 , 0 , canvas.width, canvas.height );

        var frame_number = Math.round(video.currentTime * get_video_fps(video))

        //Para cada elemento en la frame pintamos
        var frame = $($(detected_objs).find('frame')[frame_number])
        $(frame).find('objectlist object').each(function(){

            var h = parseInt($(this).find('box').attr('h'));
            var w = parseInt($(this).find('box').attr('h'));
            var xc = parseInt($(this).find('box').attr('xc'));
            var yc = parseInt($(this).find('box').attr('yc'));

            context.beginPath();
            // left, top, width, height
            context.rect(xc, yc, w, h);

            context.fillStyle = "rgba(0, 0, 0, 0)";
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = 'blue';
            context.stroke();
        });
    }

    function draw_objects(){
        var video = document.getElementById('video-player');
        var xml_url = $('#xml_detected_objs').attr('value');
        $.get(xml_url, function(data){
            detected_objs = data
            video.addEventListener("timeupdate", paintFrame, false);
        });
    }

    draw_objects();
});
