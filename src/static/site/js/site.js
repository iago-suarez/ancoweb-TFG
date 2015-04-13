function getUrlParameter(sParam)
{
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
        $.post( 'videoUpload/notifications/delete/'.concat(not_id).concat('/'), function(data, status){
            //Si todo ha ido bien borramos la notificacion
            $this.parent().fadeOut(500);
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
});
