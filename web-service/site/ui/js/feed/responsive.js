if (typeof InstallTrigger !== 'undefined') {
    $('#logo p').css('padding', '0 12px');
}
var doit;
window.onresize = function () {
    clearTimeout(doit);
    doit = setTimeout(resizedw("natural"), 100);
};

function resizedw(trigger) {
    if (trigger !== "manually") {
        if ($(window).width() < 750) {
            close_slider();
        }
        else {
            open_slider();
        }
    }
    var space = 0;
    if ($("#hop5").is(":visible")) {
        space = $(window).height() - 28 - 49 - 92 - 616 - 107 + 3;
    }
    else {
        space = $(window).height() - 28 - 49 - 92 - 574 - 107 + 3+23;
    }
    if (space > 0) {
        $("#footer").css({
            'margin-top': space + 'px'
        });
    }
}