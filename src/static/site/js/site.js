function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

$(document).ready(function () {
    /* Search Bar */
    $('#search-video-form').find('input#id_name').attr('value', getUrlParameter('name'));

    /* Notifications */
    $('.delete-notification').click(function () {
        var notId = $(this).next('.notificationId').attr('id');
        var $this = $(this);
        $.post('/video_upload/notifications/delete/' + notId + '/', function () {
            //Si ha ido bien borramos la notificacion
            $this.parent().fadeOut(500, function () {
                $(this).remove();
            });
        }).error(function (data) {
            alert(data.statusText.concat("\n\n", data.responseText))
        });
        return false;
    });

    var csrftoken = $.cookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    function refreshNotification(notificationDom, notificationJson) {
        if (notificationJson.fields.is_finished && !(notificationDom.find('.video-finished-btn').length)) {
            notificationDom.children('.progress').remove();
            var newDom =
                '<div class=\"text-center\"> \
                    <a class=\"btn btn-primary video-finished-btn\" \
                        href=\"/video_upload/upload/' + notificationJson.fields.video_model + '/success/"> \
                            Finish \
                    </a> \
                </div>';
            notificationDom.append($(newDom));
        } else {
            notificationDom.find('.progress-bar')
                .attr('aria-valuenow', notificationJson.fields.progress)
                .css('width', notificationJson.fields.progress + '%');
            notificationDom.find('.progress-bar span').text(notificationJson.fields.progress + '% Complete');
        }
        notificationDom.children('.state_message').text(notificationJson.fields.state_message);
    }

    function refreshNotifications() {
        // If there is no notification of a rise in progress we left
        if (!$('.notification:has(.progress-bar)').length)
            return true;
        // For all notifications we update it state
        $.getJSON("/video_upload/notificationsJson", function (notifications) {
            $.each(notifications, function (i, elem) {
                refreshNotification($('.notification:has(span#' + elem.pk + ')'), elem);
            });
        });
        window.setTimeout(refreshNotifications, 300);
    }

    refreshNotifications();

});
