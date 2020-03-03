hopscotch.registerHelper('addOverlay', function () {
    $('body').append('<div id="cover"></div>');
    $('html, body,#slider').animate({scrollTop: 0}, 0);
    var menu_a = $('.accordion > li > a');

    menu_a.children('img').removeClass('down_arrow');
    menu_a.removeClass('active');
    menu_a.next().stop(true, true).slideUp('normal');
    $('body').addClass('stop-scrolling');
});

hopscotch.registerHelper('removeOverlay', function () {
    $('#cover').remove();
    $('body').removeClass('stop-scrolling');
    $('html, body,#slider').animate({scrollTop: 0}, 0);
});

var titles_1 = ["Settings", "Search", "Social Networks", "Language", "Topics", "Original", "Type", "Unique", "Date", "Sort", "Feed", "Dashboard", "Social Item"];
var contents_1 = ["Click to toggle settings tab.", "Search for content with a specific keyword / hashtag.", "Filter content based on source(s).", "Filter content based on language.", "Define certain topics.", "Define source of item.", "Define type of items.", "Define if items are unique", "Define time window.", "Define sort criteria.", "Inspect social feed.", "Track a various collection of analytics.", "This is a individual social item with all the contained information."];
var titles_2 = ["Settings", "Search", "Social Networks", "Language", "Topics", "Original", "Type", "Unique", "Date", "Feed", "Dashboard", "Posts", "Users", "Reach", "Endorsements", "Timeline", "Social Mix", "Heatmap", "Users Locations", "Active Users", "Entities"];
var contents_2 = ["Click to toggle settings tab.", "Search for content with a specific keyword / hashtag.", "Filter content based on source(s).", "Filter content based on language.", "Define certain topics.", "Define source of item.", "Define type of items.", "Define if items are unique", "Define time window.", "Inspect social feed.", "Track a various collection of analytics.", "The number of posts made.", "The number of users made one or more posts.", "The number of users read one or more posts.", "The number of likes", "The number of posts in time.", "Source Analysis of posts, users, reach, endorsement.", "Location Analysis of posts.", "Location Analysis of users.", "Top influencers", "Top entities."];
var nextBtn = "Next";
var prevBtn = "Back";
var doneBtn = "Done";
var skipBtn = "Skip";
var closeTooltip = "Close";

var tour = {
    id: "tour",
    showCloseButton: true,
    showPrevButton: true,
    scrollDuration: 0,
    i18n: {
        nextBtn: nextBtn,
        prevBtn: prevBtn,
        doneBtn: doneBtn,
        skipBtn: skipBtn,
        closeTooltip: closeTooltip
    },
    steps: [
        {
            title: titles_1[0],
            content: contents_1[0],
            target: "#menu",
            placement: "bottom",
            yOffset: 10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#ff-search").offset().top}, 0);
            }
        },
        {
            title: titles_1[1],
            content: contents_1[1],
            target: "#ff-search",
            placement: "right",
            yOffset: -18,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $(".ff-filter-holder").offset().top}, 0);
            }
        },
        {
            title: titles_1[2],
            content: contents_1[2],
            target: ".ff-filter-holder",
            placement: "right",
            yOffset: 20,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop4").offset().top}, 0);
            }
        },
        {
            title: titles_1[3],
            content: contents_1[3],
            target: "#hop4",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop10").offset().top}, 0);
            }
        },
        {
            title: titles_1[4],
            content: contents_1[4],
            target: "#hop10",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop8").offset().top}, 0);
            }
        },
        {
            title: titles_1[5],
            content: contents_1[5],
            target: "#hop8",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop9").offset().top}, 0);
            }
        },
        {
            title: titles_1[6],
            content: contents_1[6],
            target: "#hop9",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop12").offset().top}, 0);
            }
        },
        {
            title: titles_1[7],
            content: contents_1[7],
            target: "#hop12",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop11").offset().top}, 0);
            }
        },
        {
            title: titles_1[8],
            content: contents_1[8],
            target: "#hop11",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop5").offset().top}, 0);
            }
        },
        {
            title: titles_1[9],
            content: contents_1[9],
            target: "#hop5",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop6").offset().top}, 0);
            }
        },
        {
            title: titles_1[10],
            content: contents_1[10],
            target: "#hop6",
            placement: "top",
            yOffset: -15,
            xOffset: 35,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop7").offset().top}, 0);
            }
        },
        {
            title: titles_1[11],
            content: contents_1[11],
            target: "#hop7",
            placement: "top",
            yOffset: -10,
            xOffset: 30,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: 0}, 0);
            }
        },
        {
            title: titles_1[12],
            content: contents_1[12],
            target: "#tiles li",
            placement: "right",
            yOffset: 50,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
        }
    ],
    onStart: ["addOverlay"],
    onEnd: ["removeOverlay"],
    onClose: ["removeOverlay"]
};

var tour2 = {
    id: "tour2",
    showCloseButton: true,
    showPrevButton: true,
    scrollDuration: 0,
    i18n: {
        nextBtn: nextBtn,
        prevBtn: prevBtn,
        doneBtn: doneBtn,
        skipBtn: skipBtn,
        closeTooltip: closeTooltip
    },
    steps: [
        {
            title: titles_2[0],
            content: contents_2[0],
            target: "#menu",
            placement: "bottom",
            yOffset: 10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#ff-search").offset().top}, 0);
            }
        },
        {
            title: titles_2[1],
            content: contents_2[1],
            target: "#ff-search",
            placement: "right",
            yOffset: -18,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $(".ff-filter-holder").offset().top}, 0);
            }
        },
        {
            title: titles_2[2],
            content: contents_2[2],
            target: ".ff-filter-holder",
            placement: "right",
            yOffset: 20,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop4").offset().top}, 0);
            }
        },
        {
            title: titles_2[3],
            content: contents_2[3],
            target: "#hop4",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop10").offset().top}, 0);
            }
        },
        {
            title: titles_2[4],
            content: contents_2[4],
            target: "#hop10",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop8").offset().top}, 0);
            }
        },
        {
            title: titles_2[5],
            content: contents_2[5],
            target: "#hop8",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop9").offset().top}, 0);
            }
        },
        {
            title: titles_2[6],
            content: contents_2[6],
            target: "#hop9",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop12").offset().top}, 0);
            }
        },
        {
            title: titles_2[7],
            content: contents_2[7],
            target: "#hop12",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop11").offset().top}, 0);
            }
        },
        {
            title: titles_2[8],
            content: contents_2[8],
            target: "#hop11",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop5").offset().top}, 0);
            }
        },
        {
            title: titles_2[9],
            content: contents_2[9],
            target: "#hop6",
            placement: "top",
            yOffset: -15,
            xOffset: 35,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop7").offset().top}, 0);
            }
        },
        {
            title: titles_2[10],
            content: contents_2[10],
            target: "#hop7",
            placement: "top",
            yOffset: -10,
            xOffset: 30,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: 0}, 0);
            }
        },
        {
            title: titles_2[11],
            content: contents_2[11],
            target: "#posts_num",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#posts_num").offset().top - 10});
            }
        },
        {
            title: titles_2[12],
            content: contents_2[12],
            target: "#users_num",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#users_num").offset().top - 10});
            }
        },
        {
            title: titles_2[13],
            content: contents_2[13],
            target: "#reach_num",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#reach_num").offset().top - 10});
            }
        },
        {
            title: titles_2[14],
            content: contents_2[14],
            target: "#endo_num",
            placement: "left",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#endo_num").offset().top - 10});
            }
        },
        {
            title: titles_2[15],
            content: contents_2[15],
            target: "#timeline_head",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#timeline_head").offset().top - 10});
            }
        },
        {
            title: titles_2[16],
            content: contents_2[16],
            target: "#socialmix_head",
            placement: "left",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#socialmix_head").offset().top - 20});
            }
        },
        {
            title: titles_2[17],
            content: contents_2[17],
            target: "#heatmap_head",
            placement: "left",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#heatmap_head").offset().top - 20});
            }
        },
        {
            title: titles_2[18],
            content: contents_2[18],
            target: "#usersloc_head",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#usersloc_head").offset().top - 10});
            }
        },
        {
            title: titles_2[19],
            content: contents_2[19],
            target: "#activeuser_head",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#activeuser_head").offset().top - 10});
            }
        },
        {
            title: titles_2[20],
            content: contents_2[20],
            target: "#tags_head",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#tags_head").offset().top - 10});
            }
        }
    ],
    onStart: ["addOverlay"],
    onEnd: ["removeOverlay"],
    onClose: ["removeOverlay"]
};

