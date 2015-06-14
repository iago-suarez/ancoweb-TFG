$(document).ready(function(){
/****************** Video Details view ********************/

    const training_frames = 35;

    var pos = [0,0];
    var detected_objs ;
    var video_fps;

    //Utilizadas para redimensionar el vídeo en caso de que estemos en pantalla completa
    var fullscreenOn = false;
    var video_proportion = 1;
    var canvas_left_padding = 0;
    var canvas_top_padding = 0;

    var training_lbl = document.getElementById("training-lbl");

    /**
    * Given a list of items to select, the function remarks them in the table.
    */
    function selectObjects(object_list){
        $('#objects-list tr').each(function(){
            //Para cada fila de la tabla
            var i = 0;
            var selected = false;
            while ((i<object_list.length) && (!selected)){
                obj = object_list[i];
                selected = (obj.id === $($(this).find('th')[0]).text())
                i++;
            }
            if (selected){
                //Si está seleccionado
                if (!$(this).hasClass('info')){
                    $(this).addClass('info')
                }
            }else{
                if ($(this).hasClass('info')){
                    $(this).removeClass('info')
                }
            }
        });
    }

    /**
    * This functions selects a frame into the detected objects and paints all
    * objects for this frame.
    */
    function paintFrame(){

        function paint_rect(context, xc, yc, w, h, color, lineWidth){
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
        context.clearRect ( 0 , 0 , canvas.width, canvas.height );

        if (video_fps === undefined){
            video_fps = get_video_fps(video)
        }

        var frame_number = Math.round(video.currentTime * video_fps)

        //If the system is training display the label
        if(frame_number < training_frames){
            if(!$(training_lbl).is(":visible")){
                adjustTrainingLbl(training_lbl);
                $(training_lbl).show();
            }
            paint_rect(context, 4, 4, canvas.width-8, canvas.height-8,  '#f0ad4e', 4);
            return 0;
        } else if((frame_number >= training_frames) && ($(training_lbl).is(":visible"))){
            //If the system isn't training hide the label
            $(training_lbl).hide();
        }

        //Para cada elemento en la frame pintamos su recuadro
        var frame = $($(detected_objs).find('frame[number=' + frame_number + ']'))
        $(frame).find('objectlist object').each(function(){

            var h = parseInt($(this).find('box').attr('h'));
            var w = parseInt($(this).find('box').attr('h'));
            var xc = parseInt($(this).find('box').attr('xc'));
            var yc = parseInt($(this).find('box').attr('yc'));

            paint_rect(context, video_proportion * xc, video_proportion * yc,
                video_proportion * w, video_proportion * h,  'blue', 2);

        });

        //Marcamos los objetos que se están mostrando en la tabla
        selectObjects($(frame).find('objectlist object'));
    }

    /**
    * Generates the Table Elements parsing the xml file.
    */
    function generateObjectTable(xml_objects){
        var my_objects = {};
        $(detected_objs).find('frame').each(function(){
            fnum = $(this).attr('number');
            $(this).find('object').each(function(){
                obj_id = $(this).attr('id')
                if (my_objects[obj_id] === undefined){
                    my_objects[obj_id] = {id: obj_id, first_frame: fnum, last_frame: fnum+1}
                }else{
                    my_objects[obj_id].last_frame = fnum
                }
            });
        });
        return my_objects;
    }

    /**
    * Load the detected objects in the video via AJAX.
    */
    function load_xml_objects(){
        var video = document.getElementById('video-player');
        var xml_url = $('#xml_detected_objs').attr('value');
        $.get(xml_url, function(data){
            detected_objs = data
            objs = generateObjectTable(detected_objs);
            for( var x in objs){
                obj= objs[x];
                stage_time = parseInt(obj.last_frame) - parseInt(obj.first_frame);
                $('#objects-list').append('<tr><th scope="row"><a href="/">' + obj.id + '</a></th><td>'
                    + obj.first_frame + '</td><td>' + obj.last_frame + '</td><td>'+ stage_time + '</td></tr>\n');
            }
            $('table').tablesorter();
            $('#first-moment-th').click();
            video.addEventListener("timeupdate", paintFrame, false);
        });
    }
    load_xml_objects();

    /**
    * Return the number of Frames per second in the HTML5 Video element
    */
    function get_video_fps(video){
        var ext = video.currentSrc.split('.').pop();
        var fps = $(video).children('source[src$="'  + ext + '"]').attr('fps');
        return fps;
    }

    /** Adjust Canvas Element including fullScreen mode **/
    function adjustCanvasExtended(video){
        // If we are in full screen mode
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
                $('.drawing-layer').attr('height', screen_height)
                    .attr('width', video_proportion*video_width);
            } else {
                // El video es menos cuadrado que la pantalla
                // Por tanto se contara un offset a la parte superior de la pantalla

                canvas_left_padding = 0;
                canvas_top_padding =  (screen_height - (video_proportion*video_height))/2;
                $('.drawing-layer').attr('width', screen_width)
                    .attr('height', video_proportion*video_height);
            }

        $('.drawing-layer').offset($('#video-player').offset())
            .css('padding-left' , canvas_left_padding)
            .css('padding-top' , canvas_top_padding);
        adjustTrainingLbl(document.getElementById('training-lbl'));
    }

    /**
    * Adjust the "Training Frames" label over the video element
    */
    function adjustTrainingLbl(training_lbl){

        video_width = $('#video-player').width();
        video_top = $('#video-player').offset().top;
        video_left = $('#video-player').offset().left;
        lbl_width = $(training_lbl).width();

        lbl_left = video_left + Math.round(video_width/2) - Math.round(lbl_width/2);
        $(training_lbl).css("top", video_top + 10).css("left", lbl_left);
    }

    /* Video canvas adjust size and START */
    var video = document.getElementById("video-player");


    $(video).resize(function(){
        adjustCanvasExtended(this);
    });

    $(window).resize(function(){
        adjustCanvasExtended(video);
    });

    $(video).ready(function(){
        adjustCanvasExtended(this);
    });

    /* Entering Exiting fullscreen mode */
    $('#video-player').bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
        fullscreenOn = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if (fullscreenOn){
            $('.drawing-layer').css('z-index', 2147483647);
            $('#training-lbl').css('z-index', 2147483647);

        }else{
            $('.drawing-layer').css('z-index', "");
            $('#training-lbl').css('z-index', 50);
        }
    });

    /* Start and stop functions for video player */
    function playAndPause(video){
        if(video.paused){
            video.play();
        }
        else{
            video.pause();
        }
    }

    $('#video-player').click(function(){
        playAndPause(this);
    });

    $(document).keypress(function(event){
        if(event.charCode === 32){
            playAndPause(document.getElementById("video-player"));
            return false;
        }
    });
});