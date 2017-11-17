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

    if ($("#hop5").is(":visible")) {
        if ($(window).height() > 1022) {
            $("#footer").css({'bottom': '0', 'position': 'absolute', 'margin-top': '0'});
        } else if ($(window).height() < 813) {
            $("#footer").css({'bottom': 'auto', 'position': 'relative', 'margin-top': '10px'});
        } else {
            setTimeout(function () {
                $("#footer").css({
                    'position': 'relative',
                    'margin-top': '0',
                    'bottom': -($("#slider").height() - 808) + 'px'
                });
            }, 700);
        }
    }
    else {
        if ($(window).height() > 958) {
            setTimeout(function () {
                $("#footer").css({'bottom': '0', 'position': 'absolute', 'margin-top': '0'});
            }, 700);
        } else if ($(window).height() < 755) {
            $("#footer").css({'bottom': 'auto', 'position': 'relative', 'margin-top': '13px'});
        } else {
            setTimeout(function () {
                $("#footer").css({
                    'position': 'relative',
                    'margin-top': '0',
                    'bottom': -($("#slider").height() - 743) + 'px'
                });
            }, 700);
        }

    }
}