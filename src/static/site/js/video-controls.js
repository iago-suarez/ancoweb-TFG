function getVideoIdFromUrl() {
    return window.location.href.split('/')[4];
}

$(document).ready(function () {
    $('#show-analysis-checkbox').click(function () {
        $('.drawing-layer').toggle();
    });

    $('#show-all-detections').click(function () {
        $('#detected-objs-table').toggle();
        $('#current-detected-objs').toggle();
    });

    $('#colors-checkbox').click(function () {
        videoDetections.toggleUseColor();

    });

    function refreshAnalysisProgress() {
        $.getJSON("/videos/" + getVideoIdFromUrl() + "/analyze/").done(function (analysis) {
            //Get analysis status from the iterable list
            analysis = analysis[0].fields;
            var stateMsg = $('#state_message');
            var analyzingPb = $('#analyzing-pb');
            if (analysis.is_finished) {
                $(stateMsg).parent().append('<a class="btn btn-success" href="'
                    + window.location.href + '">Reload</a>');
                $(analyzingPb).hide();
                $(stateMsg).text(analysis.state_message);
                return;
            }

            //Update the progressbar
            $(stateMsg).text(analysis.state_message);
            $(analyzingPb).find('.progress-bar')
                .attr('aria-valuenow', analysis.progress)
                .css('width', analysis.progress + '%');
            $(document).find('#analyzing-pb span').text(analysis.progress + '% Complete');
            window.setTimeout(refreshAnalysisProgress, 300);
        });
    }

    refreshAnalysisProgress();

    $('#analyze-btn').click(function () {
        // We change the button for the "Analyzing label and the progress bar
        $('#analyze-btn').hide();
        $('#analyzing-pb').show();
        // Make the call to makeanalysis
        $.post("/videos/" + getVideoIdFromUrl() + "/makeanalyze/", function () {
            refreshAnalysisProgress();
        });
        return false;
    });

});