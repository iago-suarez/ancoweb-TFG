/**
 * Created by iago on 16/07/15.
 */
var detection;

$(document).ready(function () {

    var dummyVD = new VideoDetections(document.getElementById('video-player'), "", "");
    //recover the detection from the url or the cookie
    if (areCookiesEnabled()) {
        var cookieName = "suspiciousDet-" + getUrlParameter("suspiciousDetId");
        var jsonDet = window.JSON.parse($.cookie(cookieName));
        console.log(jsonDet);
        detection = new Detection(dummyVD,
            jsonDet.id, jsonDet.firstFrame, jsonDet.lastFrame, jsonDet.xmlTrajectory);

        $.removeCookie(cookieName);
    } else {
        detection = new Detection(dummyVD,
            decodeURIComponent(getUrlParameter("id")),
            decodeURIComponent(getUrlParameter("firstFrame")),
            decodeURIComponent(getUrlParameter("lastFrame")),
            decodeURIComponent(getUrlParameter("xmlTrajectory")));
    }
});