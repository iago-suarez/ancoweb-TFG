function getVideoIdFromUrl(){
    return window.location.href.split('/')[4];
}

$(document).ready(function(){
    $('#show-analysis-checkbox').click(function(){
        $('.drawing-layer').toggle();
    });

    function refresh_analysis_progress(){
        $.getJSON("/videos/" + getVideoIdFromUrl() + "/analyze/").done(function(analysis){
            //Get analysis status from the iterable list
            analysis = analysis[0].fields
            if(analysis.is_finished){
                $('#analyze-btn').parent().append('<a class="btn btn-success" href="'
                    + window.location.href + '">Reload</a>');
                $('#analyzing-pb').hide();
                $('#state_message').text(analysis.state_message);
                return;
            }

            //Update the progressbar
            $('#state_message').text(analysis.state_message);
            $('#analyzing-pb').find('.progress-bar')
                .attr('aria-valuenow', analysis.progress)
                .css('width', analysis.progress + '%');
            $(document).find('#analyzing-pb span').text(analysis.progress + '% Complete');
            window.setTimeout(refresh_analysis_progress, 300);
        });
    }

    $('#analyze-btn').click(function(){
        //Cambiamos el boton por el de se está analizando + progressbar
        $('#analyze-btn').hide()
        $('#analyzing-pb').show();
        // hacemos la llamada a makeanalysis
        $.post("/videos/" + getVideoIdFromUrl() + "/makeanalyze/", function(){
            refresh_analysis_progress();
        });
    });

});