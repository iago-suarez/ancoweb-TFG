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
        $.post( '/video_upload/notifications/delete/' + not_id + '/', function(data, status){
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
                        href=\"/video_upload/upload/' + not_json.fields.video_model + '/success/"> \
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
        $.getJSON("/video_upload/notificationsJson", function(notifications){
            $.each(notifications, function (i, elem) {
                refresh_notification($('.notification:has(span[value=' + elem.pk + '])'), elem);
            });
        })
        window.setTimeout(refresh_notifications, 300);
    }
    refresh_notifications();

});
