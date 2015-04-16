function set_progress(progressBar, progress){
    progressBar.children('div').attr('aria-valuenow', progress);
    progressBar.children('div').css('width', (progress) + "%");
    progressBar.attr('sr-only', (progress) + "%");
}

// Update progress bar
function update_progress_info() {
    $.getJSON(upload_progress_url, {'X-Progress-ID': uuid}, function(data, status){
        //console.log(data);
        if(data){
            $('#progressBar').removeAttr('hidden');  // show progress bar if there are datas
            var progress = parseInt(data.uploaded, 10)/parseInt(data.length, 10)*100;
            set_progress($('#progressBar'), progress)
        }
        else {
            $('#progressBar').attr('hidden', '');  // hide progress bar if no datas
            return true;
        }
        window.setTimeout(update_progress_info, 200);
    });
}


$(document).ready(function(){
    uuid = $('#progressBar').data('progress_bar_uuid');
    // form submission
    $('form').submit(function(){
        // Prevent multiple submits
        if ($.data(this, 'submitted')) return false;
        // Append X-Progress-ID uuid form action
        this.action += (this.action.indexOf('?') == -1 ? '?' : '&') + 'X-Progress-ID=' + uuid;
        window.setTimeout(update_progress_info, 200);
        $.data(this, 'submitted', true); // mark form as submitted.
        return true;
    });
});