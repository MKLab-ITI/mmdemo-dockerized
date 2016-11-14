if (project_name !== "") {
    $('#logo').find('h1').text(project_name);
    document.title = project_name;
}
if (project_favicon !== "") {
    var link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.href = project_favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
}

var collection_param = gup('collection');
var language_param = gup('language');
var unique_param = gup('unique');
var sort_param = gup('sort');
var original_param = gup('original');
var type_param = gup('type');
var topic_param = gup('topics').replace(/%20/g, ' ');
var query_param = gup('query').replace(/%20/g, ' ');
var source_param = gup('source');
var since_param = parseInt(gup('since'));
var until_param = parseInt(gup('until'));
var view_param = gup('view');
var translation_param = gup('translation');
var language_since;
var language_until;
var setanalysis_flag = true;

var pagelocation;
var slider, collection_status;
var $this_a;

var flag_sort = true;
$(".sub2").each(function () {
    $this_a = $(this).find('a');
    if ($this_a.data('id') === sort_param) {
        $this_a.addClass('activelan');
        flag_sort = false;
        return false;
    }
});
if (flag_sort) {
    $('.sub2').eq(0).find('a').addClass('activelan');
    sort_param = "recency";
}

var flag_unique = true;
$(".sub6").each(function () {
    $this_a = $(this).find('a');
    if ($this_a.data('id').toString() === unique_param.toString()) {
        $this_a.addClass('activelan');
        flag_unique = false;
        return false;
    }
});
if (flag_unique) {
    $('.sub6').eq(0).find('a').addClass('activelan');
    unique_param = "false";
}

var flag_original = true;
$(".sub3").each(function () {
    $this_a = $(this).find('a');
    if ($this_a.data('id') === original_param) {
        $this_a.addClass('activelan');
        flag_original = false;
        return false;
    }
});
if (flag_original) {
    $('.sub3').eq(0).find('a').addClass('activelan');
    original_param = "all";
}

var flag_type = true;
$(".sub4").each(function () {
    $this_a = $(this).find('a');
    if ($this_a.data('id') === type_param) {
        $this_a.addClass('activelan');
        flag_type = false;
        return false;
    }
});
if (flag_type) {
    $('.sub4').eq(0).find('a').addClass('activelan');
    type_param = "all";
}
var typearr = source_param.split(",");
$('.ff-filter').each(function () {
    if ($.inArray($(this).attr('id'), typearr) > -1) {
        $(this).removeClass('close');
    }
});
var user_id;
$.ajax({
    type: 'GET',
    url: api_folder + 'collection/?cid=' + collection_param,
    dataType: "json",
    success: function (json) {
        user_id = json.ownerId;
        if (!(json.hasOwnProperty("title"))) {
            $('#collection').html("-");
            $("#date_range,#date_range_animate").remove();
        }
        else {
            $('#collection').html(json.title);
            language_since = moment(new Date(json.since)).format("X") * 1000;
            language_until = moment(new Date(json.stopDate)).format("X") * 1000;
            if (since_param === 0) {
                since_param = moment(new Date(json.since)).format("X") * 1000;
            }
            if (until_param === 1514678400000) {
                until_param = moment(new Date(json.stopDate)).format("X") * 1000;
            }
            collection_status = json.status;
            $("#range").ionRangeSlider({
                type: "double",
                min: moment(new Date(json.since)).format("X"),
                max: moment(new Date(json.stopDate)).format("X"),
                from: moment(new Date(since_param)).format("X"),
                to: moment(new Date(until_param)).format("X"),
                step: 900,
                min_interval: 900,
                drag_interval: true,
                grid: true,
                //grid_num: 4,
                force_edges: true,
                prettify: function (num) {
                    var m = moment(num, "X");
                    return m.format("D MMM, HH:mm");
                },
                onFinish: function (e) {
                    since_param = e.from * 1000;
                    until_param = e.to * 1000;
                    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);

                    if ($('.page').data('id') === "Feed") {
                        $("#tiles").empty();
                        $("#main").height(0);
                        $("#loading").show();
                        $("#end,#loadmore").hide();
                        $('.informer').html("0").stop().animate({"opacity": "0"});
                        clearInterval(intervalID);
                        parse_latest(1);
                    }
                    else {
                        $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
                        $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
                        show_heatmap();
                        show_stats();
                        draw_social_mix(0, $('.activestat').attr('id'));
                        draw_timeline();
                        show_locations();
                        show_active_users();
                        draw_hashtags("classic");
                    }
                }
            });
            $("#range_animate").ionRangeSlider({
                type: "double",
                disable: true,
                min: moment(new Date(json.since)).format("X"),
                max: moment(new Date(json.stopDate)).format("X"),
                force_edges: true,
                prettify: function (num) {
                    var m = moment(num, "X");
                    return m.format("D MMM, HH:mm");
                }
            });
            slider = $("#range").data("ionRangeSlider");
            if (query_param !== "") {
                $('.icon-clear').show();
                $("#ff-search input[type='text']").addClass("searchon");
                $('#query').val(decodeURI(query_param));
            }
            if (view_param === "dashboard") {
                $('.action').find('span').removeClass('page');
                $('.action').eq(1).find('span').addClass('page');
                $('#loadingbar').hide().css('width', '0%');
                if (setanalysis_flag) {
                    settimeline_analysis_start();
                }
                pagelocation = "dashboard";
                $("#hop5").stop(true, true).slideUp(800);
                $("#update_field").stop(true, true).slideUp(800, function () {
                    resizedw("manually");
                });
                $('.inlist').eq(0).addClass("dash");
                $('.inlist').eq(1).addClass("dash");
                $('.inlist').eq(2).addClass("dash2");
                $('.inlist').eq(3).addClass("dash2");
                $('.inlist').eq(4).addClass("dash2");
                $("#dashboard,#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
                $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
                show_heatmap();
                show_stats();
                draw_social_mix(1, $('.activestat').attr('id'));
                draw_timeline();
                show_active_users();
                show_locations();
                setTimeout(function () {
                    draw_hashtags("classic");
                }, 300);//to get width
            }
            else {
                pagelocation = "latest";
                parse_latest(1);
                if (collection_status !== "stopped") {
                    interval();
                }
            }
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
        }
    },
    error: function () {
        $('#collection').html("-");
        $("#date_range").remove();
    },
    async: false
});


var heatmap_open = 1, timeline_open = 1, socialmix_open = 1;
$(function () {
    resizedw("natural");
    $("#menu").click(function () {
        if ($("#pageslide").is(":visible")) {
            close_slider();
        }
        else {
            open_slider();
        }
    });

    var menu_ul = $(".accordion > li > ul"),
        menu_a = $('.accordion > li > a');

    menu_a.click(function (e) {
        e.preventDefault();
        if (!$(this).hasClass('active')) {
            menu_a.removeClass('active');
            menu_a.children('img').removeClass('down_arrow');
            menu_ul.filter(':visible').slideUp('normal');
            $(this).addClass('active').next().stop(true, true).slideDown('normal');
            $(this).children('img').eq(1).addClass('down_arrow');
        } else {
            menu_a.children('img').removeClass('down_arrow');
            $(this).removeClass('active');
            $(this).next().stop(true, true).slideUp('normal');
        }
    });

    $('.action').click(function (e) {
        var pagedash = true, pagefeed = true;
        abort();
        e.preventDefault();

        if ($('.page').data('id') === "Dashboard") {
            pagedash = false;
        }
        else {
            pagefeed = false;
        }

        var li = $(this).find('span');
        $('.action').find('span').removeClass('page');
        li.addClass('page');

        if ((li.data('id') === "Feed")) {
            if ($('.informer').html() !== '0') {
                $('html, body').animate({scrollTop: 0}, 500);
                parse_new($('.informer').html());
                $('.informer').html("0");
                $('.informer').stop().animate({"opacity": "0"});
            }
            else {
                if (pagefeed) {
                    if (collection_status !== "stopped") {
                        interval();
                    }
                    view_param = "feed";
                    pagelocation = "latest";
                    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
                    $("#tiles").empty();
                    $("#main").show(0);
                    $("#loading").show();
                    $("#end,#loadmore,#dashboard").hide();
                    $("#chart_pie,#chart_line").empty();
                    $("#posts_num,#users_num,#reach_num,#endo_num").html(0);
                    $(window).unbind('.more_latest');
                    $("#hop5,.nav-sidebar:eq(0),#ff-search,.ff-filter-holder").stop(true, true).slideDown(800);
                    $("#update_field").stop(true, true).slideDown(800, function () {
                        resizedw("manually");
                    });
                    $('.inlist').eq(0).removeClass("dash");
                    $('.inlist').eq(1).removeClass("dash");
                    $('.inlist').eq(2).removeClass("dash2");
                    $('.inlist').eq(3).removeClass("dash2");
                    $('.inlist').eq(4).removeClass("dash2");
                    parse_latest(1);
                }
            }

        }
        else {
            if (pagedash) {
                if (setanalysis_flag) {
                    settimeline_analysis_start();
                }
                $(window).unbind('.more_latest');
                clearInterval(intervalID);
                $('#loadingbar').hide().css('width', '0%');
                view_param = "dashboard";
                pagelocation = "dashboard";
                window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
                $("#tiles").empty();
                $("#main").hide(0);
                $("#end,#loadmore").hide();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                $("#hop5").stop(true, true).slideUp(800);
                $("#update_field").stop(true, true).slideUp(800, function () {
                    resizedw("manually");
                });
                $('.inlist').eq(0).addClass("dash");
                $('.inlist').eq(1).addClass("dash");
                $('.inlist').eq(2).addClass("dash2");
                $('.inlist').eq(3).addClass("dash2");
                $('.inlist').eq(4).addClass("dash2");
                $("#dashboard,#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
                $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
                show_heatmap();
                show_stats();
                draw_social_mix(1, $('.activestat').attr('id'));
                draw_timeline();
                setTimeout(function () {
                    show_active_users();
                    show_locations();
                    draw_hashtags("classic");
                }, 900);//couse a little bit laggy
            }
        }
    });

    $('.ff-filter').click(function (e) {
        abort();
        e.preventDefault();
        var $this = $(this);
        if ($this.hasClass('close')) {
            $this.removeClass('close');
            typearr.push($this.attr('id'));
        }
        else {
            $this.addClass('close');
            var index = typearr.indexOf($this.attr('id'));
            if (index !== -1) {
                typearr.splice(index, 1);
            }
        }
        source_param = typearr.join(",");
        window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
        if ($('.page').data('id') === "Feed") {
            $("#tiles").empty();
            $("#main").height(0);
            $("#loading").show();
            $("#end,#loadmore").hide();
            $('.informer').html("0").stop().animate({"opacity": "0"});
            parse_latest(1);
        }
        else {
            $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
            $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
            show_heatmap();
            show_stats();
            draw_social_mix(0, $('.activestat').attr('id'));
            draw_timeline();
            show_locations();
            show_active_users();
            draw_hashtags("classic");
        }
    });
    $("#settings").on("click", ".sub1", function (e) {
        e.preventDefault();
        if (!($(this).find('a').hasClass('activelan'))) {
            abort();
            $('.sub1 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            language_param = $(".sub1 .activelan").text().toLowerCase();
            language_param = language_param.substr(0, language_param.indexOf(' '));
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#tiles").empty();
                $("#main").height(0);
                $("#loading").show();
                $("#end,#loadmore").hide();
                $('.informer').html("0");
                $('.informer').stop().animate({"opacity": "0"});
                parse_latest(1);
            }
            else {
                $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
                $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
                show_heatmap();
                show_stats();
                draw_social_mix(0, $('.activestat').attr('id'));
                draw_timeline();
                show_locations();
                show_active_users();
                draw_hashtags("classic");
            }
        }
    });
    $("#settings").on("click", ".sub2", function (e) {
        e.preventDefault();
        if (!($(this).find('a').hasClass('activelan'))) {
            abort();
            $('.sub2 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            sort_param = $(".sub2 .activelan").data('id');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
            $("#tiles").empty();
            $("#main").height(0);
            $("#loading").show();
            $("#end,#loadmore").hide();
            $('.informer').html("0");
            $('.informer').stop().animate({"opacity": "0"});
            parse_latest(1);
        }
    });
    $("#settings").on("click", ".sub3", function (e) {
        e.preventDefault();
        if (!($(this).find('a').hasClass('activelan'))) {
            abort();
            $('.sub3 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            original_param = $(".sub3 .activelan").data('id').toLowerCase();
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#tiles").empty();
                $("#main").height(0);
                $("#loading").show();
                $("#end,#loadmore").hide();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                parse_latest(1);
            }
            else {
                $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
                $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
                show_heatmap();
                show_stats();
                draw_social_mix(0, $('.activestat').attr('id'));
                draw_timeline();
                show_locations();
                show_active_users();
                draw_hashtags("classic");
            }
        }
    });
    $("#settings").on("click", ".sub4", function (e) {
        e.preventDefault();
        if (!($(this).find('a').hasClass('activelan'))) {
            abort();
            $('.sub4 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            type_param = $(".sub4 .activelan").data('id');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#tiles").empty();
                $("#main").height(0);
                $("#loading").show();
                $("#end,#loadmore").hide();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                parse_latest(1);
            }
            else {
                $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
                $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
                show_heatmap();
                show_stats();
                draw_social_mix(0, $('.activestat').attr('id'));
                draw_timeline();
                show_locations();
                show_active_users();
                draw_hashtags("classic");
            }

        }
    });
    $("#settings").on("click", ".sub6", function (e) {
        e.preventDefault();
        if (!($(this).find('a').hasClass('activelan'))) {
            abort();
            $('.sub6 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            unique_param = $(".sub6 .activelan").data('id');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#tiles").empty();
                $("#main").height(0);
                $("#loading").show();
                $("#end,#loadmore").hide();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                parse_latest(1);
            }
            else {
                $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
                $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
                show_heatmap();
                show_stats();
                draw_social_mix(0, $('.activestat').attr('id'));
                draw_timeline();
                show_locations();
                show_active_users();
                draw_hashtags("classic");
            }

        }
    });
    $("#settings").on("click", ".sub5", function (e) {
        e.preventDefault();
        if (!($(this).find('a').hasClass('activelan'))) {
            abort();
            $('.sub5 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            topic_param = $(".sub5 .activelan").find('p').data('query');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#tiles").empty();
                $("#main").height(0);
                $("#loading").show();
                $("#end,#loadmore").hide();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                parse_latest(1);
            }
            else {
                $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
                $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
                show_heatmap();
                show_stats();
                draw_social_mix(0, $('.activestat').attr('id'));
                draw_timeline();
                show_locations();
                show_active_users();
                draw_hashtags("classic");
            }
        }
    });

    $('.lb-outerContainer, .lb-dataContainer').hover(function () {
        $('.lb-dataContainer').stop().animate({
            "opacity": 1
        });
    }, function () {
        $('.lb-dataContainer').stop().animate({
            "opacity": 0
        });
    });

    $(".lb-container").click(function () {
        redirect($('.redirect').html());
    });

    $("#lightbox").on("click", ".lbimg", function (e) {
        var src = $(this).attr('data-link');
        window.open(src, '_blank');
    });

    $(document).on("mouseenter", ".outer", function () {
        $(this).find('.icon2outer').stop().animate({"opacity": 1});
    });
    $(document).on("mouseleave", ".outer", function () {
        $('.icon2outer').stop().animate({"opacity": 0});
    });

    $('.analysis').click(function (e) {
        if (!($(this).hasClass('activeanalysis'))) {
            e.preventDefault();
            $('.analysis').removeClass('activeanalysis');
            $(this).addClass('activeanalysis');
            $("#load2").show();
            $('#chart_line').animate({opacity: 0.4}, 400);
            draw_timeline();
        }
    });

    $('.analysis').click(function (e) {
        if (!($(this).hasClass('activeanalysis'))) {
            e.preventDefault();
            $('.analysis').removeClass('activeanalysis');
            $(this).addClass('activeanalysis');
            $("#load2").show();
            $('#chart_line').animate({opacity: 0.4}, 400);
            draw_timeline();
        }
    });

    $('.sort_by').click(function (e) {
        if (!($(this).hasClass('activesort'))) {
            e.preventDefault();
            $('.sort_by').removeClass('activesort');
            $(this).addClass('activesort');
            if (timeouts.length > 0) {
                draw_hashtags("classic");
            }
            else {
                toggle_view($(this).find('.sortzone').attr('id'));
            }
        }
    });

    $('.numbers').click(function (e) {
        if (!($(this).hasClass('activenumber'))) {
            e.preventDefault();
            $('.numbers').removeClass('activenumber');
            $(this).addClass('activenumber');
            $("#load5").show();
            $('#active_users').animate({opacity: 0.4}, 400);
            show_active_users();
        }
    });

    $('.numbers_tags').click(function (e) {
        if (!($(this).hasClass('activenumber_tag'))) {
            e.preventDefault();
            $('.numbers_tags').removeClass('activenumber_tag');
            $(this).addClass('activenumber_tag');
            $("#load6").show();
            $('#tags').animate({opacity: 0.4}, 400);
            draw_hashtags("classic");
        }
    });

    $('.details img').click(function (e) {
        e.preventDefault();
        if ($(this).attr('src') !== "imgs/arrow-right-24-black.png") {
            $('.details img').attr('src', "imgs/arrow-right-24.png").removeClass('activestat');
            $(this).attr('src', "imgs/arrow-right-24-black.png").addClass('activestat');
            $('#load1').show();
            $('#chart_pie').animate({opacity: 0.4}, 400);
            draw_social_mix(0, $('.activestat').attr('id'));
        }
    });
    $('#ff-search').on("keyup", "#query", function (e) {
        if (e.keyCode === 13) {
            parse_search();
        }
    });
    $('.icon-search').click(function (e) {
        parse_search();
    });

    $('#help').click(function (e) {
        e.preventDefault();
        if ($('.page').data('id') === "Feed") {
            hopscotch.startTour(tour);
        }
        else {
            hopscotch.startTour(tour2);
        }
    });

    $('.arrow2').click(function (e) {
        e.preventDefault();
        var $this = $(this);
        if ($this.hasClass('down_arrow')) {

            $this.removeClass('down_arrow');

            if ($this.attr('id') === "down1") {
                $('#chart_pie').stop(true, true).slideDown(800);
                $('#load1').attr("class", "svg__loading");
            }
            if ($this.attr('id') === "down2") {
                $('#erase_analysis').show();
                $('#chart_line').stop(true, true).slideDown(1000);
                $("#erase_analysis").animate({opacity: 1,}, 1000);
                $('#load2').attr("class", "svg__loading");
            }
            if ($this.attr('id') === "down3") {
                $('#heatmap').stop(true, true).slideDown(1000);
                $('#load3').attr("class", "svg__loading");
            }
            if ($this.attr('id') === "down4") {
                $('#users_locations').stop(true, true).slideDown(1000);
                $('#load4').attr("class", "svg__loading");
            }
            if ($this.attr('id') === "down5") {
                $('#active_users').stop(true, true).slideDown(1000);
                $('#load5').attr("class", "svg__loading");
            }
            if ($this.attr('id') === "down6") {
                $('#tags').stop(true, true).slideDown(1000);
                $('#load6').attr("class", "svg__loading");
            }
            if ($this.attr('id') === "set2") {
                $('#inner-set2').stop(true, true).slideUp(500);
            }
            if ($this.attr('id') === "set5") {
                $('#inner-set5').stop(true, true).slideUp(500);
            }
            if ($this.attr('id') === "set6") {
                $('#inner-set6').stop(true, true).slideUp(500);
            }
        }
        else {
            $this.addClass('down_arrow');

            if ($this.attr('id') === "down1") {
                $('#chart_pie').stop(true, true).slideUp(800);
                $('#load1').attr("class", "svg__loading hide-load");
            }
            if ($this.attr('id') === "down2") {
                $("#erase_analysis").animate({opacity: 0,}, 1000);
                $('#chart_line').stop(true, true).slideUp(1000, function () {
                    $('#erase_analysis').hide();
                });
                $('#inner-set2').stop(true, true).slideUp(1000);
                $('#set2').removeClass('down_arrow');
                $('#load2').attr("class", "svg__loading hide-load");

            }
            if ($this.attr('id') === "down3") {
                $('#heatmap').stop(true, true).slideUp(1000);
                $('#load3').attr("class", "svg__loading hide-load");
            }
            if ($this.attr('id') === "down4") {
                $('#users_locations').stop(true, true).slideUp(1000);
                $('#load4').attr("class", "svg__loading hide-load");
            }
            if ($this.attr('id') === "down5") {
                $('#active_users,#inner-set5').stop(true, true).slideUp(1000);
                $('#set5').removeClass('down_arrow');
                $('#load5').attr("class", "svg__loading hide-load");
            }
            if ($this.attr('id') === "down6") {
                $('#tags,#inner-set6').stop(true, true).slideUp(1000);
                $('#set6').removeClass('down_arrow');
                $('#load6').attr("class", "svg__loading hide-load");
            }
            if ($this.attr('id') === "close1") {
                socialmix_open = 0;
                $this.closest('.columns').stop(true, true).slideUp(800, function () {
                    if (timeline_open + heatmap_open === 2) {
                    }
                    else if (timeline_open === 1) {
                        $('#timeline_col').attr("class", "small-12 medium-12 large-12 columns");
                        $('#load2').show();
                        $('#chart_line').animate({opacity: 0.4}, 400);
                        draw_timeline();
                    }
                    else {
                        $('#heatmap_col').attr("class", "small-12 medium-12 large-12 columns");
                        $("#load3").show();
                        $('#heatmap').animate({opacity: 0.4}, 400);
                        show_heatmap();
                    }
                });
            }
            if ($this.attr('id') === "close2") {
                timeline_open = 0;
                $('#erase_analysis').css('opacity', 0);
                $this.closest('.columns').stop(true, true).slideUp(1000, function () {
                    if (socialmix_open + heatmap_open === 2) {
                        $('#socialmix_col').attr("class", "small-12 medium-12 large-6 columns");
                        $("#load1").show();
                        $('#chart_pie').animate({opacity: 0.4}, 400);
                        draw_social_mix(0, $('.activestat').attr('id'));
                        $('#heatmap_col').attr("class", "small-12 medium-12 large-6 columns");
                        $("#load3").show();
                        $('#heatmap').animate({opacity: 0.4}, 400);
                        show_heatmap();
                    }
                    else if (socialmix_open === 1) {
                        $('#socialmix_col').attr("class", "small-12 medium-12 large-12 columns");
                        $("#load1").show();
                        $('#chart_pie').animate({opacity: 0.4}, 400);
                        draw_social_mix(0, $('.activestat').attr('id'));
                    }
                    else {
                        $('#heatmap_col').attr("class", "small-12 medium-12 large-12 columns");
                        $("#load3").show();
                        $('#heatmap').animate({opacity: 0.4}, 400);
                        show_heatmap();
                    }
                    $('#erase_analysis').hide();
                });
            }
            if ($this.attr('id') === "close3") {
                $this.closest('.columns').stop(true, true).slideUp(1000, function () {
                    heatmap_open = 0;
                    if (socialmix_open + timeline_open === 2) {
                    }
                    else if (timeline_open === 1) {
                        $('#timeline_col').attr("class", "small-12 medium-12 large-12 columns");
                        $('#load2').show();
                        $('#chart_line').animate({opacity: 0.4}, 400);
                        draw_timeline();
                    }
                    else {
                        $('#socialmix_col').attr("class", "small-12 medium-12 large-12 columns");
                        $("#load1").show();
                        $('#chart_pie').animate({opacity: 0.4}, 400);
                        draw_social_mix(0, $('.activestat').attr('id'));
                    }
                });
            }
            if ($this.attr('id') === "close4") {
                $this.closest('.columns').stop(true, true).slideUp(1000, function () {
                    $('#active_col').attr("class", "small-12 medium-12 large-12 columns");
                    $('#load5').show();
                    $('#active_users').animate({opacity: 0.4}, 400);
                    show_active_users();
                });
            }
            if ($this.attr('id') === "close5") {
                $this.closest('.columns').stop(true, true).slideUp(1000, function () {
                    $('#location_col').attr("class", "small-12 medium-12 large-12 columns");
                    $('#load4').show();
                    $('#users_locations').animate({opacity: 0.4}, 400);
                    show_locations();
                });
            }
            if ($this.attr('id') === "close6") {
                $this.closest('.columns').stop(true, true).slideUp(1000, function () {
                });
            }
            if ($this.attr('id') === "set2") {
                $('#inner-set2').stop(true, true).slideDown(500);
            }
            if ($this.attr('id') === "set5") {
                $('#inner-set5').stop(true, true).slideDown(500);
            }
            if ($this.attr('id') === "set6") {
                $('#inner-set6').stop(true, true).slideDown(500);
            }
        }
    });

    $("#gages").on("click", ".arrow3", function (e) {
        if ($(this).attr('id') === "arrow3-right") {
            draw_gages('right');
        }
        else {
            draw_gages('left');
        }
    });

    $("#users_images").on("click", ".user", function () {
        window.open($(this).find('img').attr('data-url'), '_blank');
    });

});

function redirect(page) {

    setTimeout(function () {
        $('.lightboxOverlay').hide();
        $('.lightbox').hide();

    }, 1);
    $(window).on('focus', function () {
        $('#lightboxOverlay').hide();
    });

    window.open(page, '_blank');
}

function imgError1(image) {
    image.onerror = "";
    image.src = "imgs/errorimg.PNG";
    return true;
}

function imgError2(image, source, username) {
    image.onerror = "";
    if (source === "Twitter") {
        image.src = "https://twitter.com/" + username + "/profile_image?size=normal";
    }
    else {
        image.src = "imgs/noprofile.gif";
    }
    return true;
}

var intervalminutes;
minutes();

function minutes() {
    clearInterval(intervalminutes);
    intervalminutes = setInterval(function () {

        var range = "minutes";
        var time = $('.seconds').eq(0).html();
        if (typeof time === "undefined") {
            switch (translation_param) {
                case "en":
                    $("#update_field").html("Last item in current view: -");
                    break;
                case "el":
                    $("#update_field").html("Τελαυταία Δημοσίευση: -");
                    break;
                case "it":
                    $("#update_field").html("Ultimo messaggio: -");
                    break;
                case "tr":
                    $("#update_field").html("Bu görüntüleme için son öğe: -");
                    break;
                case "sp":
                    $("#update_field").html("Último mensaje: -");
                    break;
                case "ca":
                    $("#update_field").html("Darrer element en la vista actual: -");
                    break;
                default:
                    $("#update_field").html("Last item in current view: -");
            }
        }
        else {
            var seconds = parseInt(new Date().getTime() / 1000);
            var now = seconds - time;
            var now = Math.floor(now / 60);

            if (now > 60) {
                now = Math.floor(now / 60);
                switch (translation_param) {
                    case "en":
                        range = "hours";
                        break;
                    case "el":
                        range = "ώρες";
                        break;
                    case "it":
                        range = "ore";
                        break;
                    case "tr":
                        range = "saatler";
                        break;
                    case "sp":
                        range = "horas";
                        break;
                    case "ca":
                        range = "hores";
                        break;
                    default:
                        range = "hours";
                }
                if (now > 24) {
                    now = Math.floor(now / 24);
                    switch (translation_param) {
                        case "en":
                            range = "days";
                            break;
                        case "el":
                            range = "μέρες";
                            break;
                        case "it":
                            range = "giorni";
                            break;
                        case "tr":
                            range = "günler";
                            break;
                        case "sp":
                            range = "días";
                            break;
                        case "ca":
                            range = "dies";
                            break;
                        default:
                            range = "days";
                    }
                }
            }
            if (now < 0) {
                now = 0;
            }
            switch (translation_param) {
                case "en":
                    $("#update_field").html("Last item in current view:&nbsp;" + now + "&nbsp;" + range + " ago");
                    break;
                case "el":
                    $("#update_field").html("Τελευταία Δημοσίευση:&nbsp;" + now + "&nbsp;" + range + " πριν");
                    break;
                case "it":
                    $("#update_field").html("Ultimo messaggio:&nbsp;" + now + "&nbsp;" + range + " fa");
                    break;
                case "tr":
                    $("#update_field").html("Bu görüntüleme için son öğe:&nbsp;" + now + "&nbsp;" + range + " önce");
                    break;
                case "sp":
                    $("#update_field").html("Último mensaje:&nbsp;" + now + "&nbsp;" + range + " hace");
                    break;
                case "ca":
                    $("#update_field").html("Darrer element en la vista actual:&nbsp;" + now + "&nbsp;" + range + " fa");
                    break;
                default:
                    $("#update_field").html("Last item in current view:&nbsp;" + now + "&nbsp;" + range + " ago");
            }
        }
    }, 1000);
}

var titletop, intervalID;

function interval() {
    clearInterval(intervalID);
    var titlelast, different = 0;
    intervalID = setInterval(function () {
        slider.update({
            max: +moment().format("X"),
            to: +moment().format("X")
        });
        if (different === 0) {
            titlelast = $('.ids').eq(0).html();
        } else {
            titlelast = titletop;
        }
        until_param = +moment().format("X") * 1000;
        window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
        $.ajax({
            type: "GET",
            url: api_folder + "items?collection=" + collection_param + "&q=" + query_param + "&nPerPage=12&pageNumber=1&source=" + source_param + "&sort=" + sort_param + "&language=" + language_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
            dataType: "json",
            success: function (json) {
                if (pagelocation === "latest") {
                    var flag = 0;
                    for (var i = 0; i < json.length; i++) {


                        var title = json[i].id.replace(/#/g, "%23");

                        if (title !== titlelast) {
                            different++;
                        } else {
                            break;
                        }
                        if ((title !== titlelast) && (flag === 0)) {
                            titletop = title;
                            flag = 1;
                        }

                    }
                    if (different > 0) {
                        $('.informer').html("" + different);
                        $('.informer').stop().animate({"opacity": "1"});
                    }
                }
            },
            async: true
        });

    }, 60000);
}

function close_slider() {

    $.pageslide.close();
    $('#slider').stop().animate({"left": "-240px"}, 200, function () {
        if ($("#end").is(":visible")) {
            loadimage(2);
        }
        else {
            loadimage();
        }
        if (!($("#hop5").is(":visible"))) {
            $("#load1,#load2,#load3,#load4,#load5,#load6").show();
            $('#active_users').animate({opacity: 0.4}, 400);
            $('#chart_line, #chart_pie, #heatmap, #users_locations, #active_uses, #tags').animate({opacity: 0.4}, 400);
            draw_timeline();
            draw_social_mix(0, $('.activestat').attr('id'));
            show_heatmap();
            show_locations();
            show_active_users();
            draw_hashtags("classic");
        }
    });
    $('#loading').removeClass('opened');
    $('#loadmore').removeClass('opened2');
    $('#main').css({'padding-left': '40px', 'padding-right': '40px'});
}

function open_slider() {
    $.pageslide({href: '#slideoptions'});
    $('#slider').stop().animate({"left": 0}, 200, function () {
        if ($("#end").is(":visible")) {
            loadimage(2);
        }
        else {
            loadimage();
        }
        if (!($("#hop5").is(":visible"))) {
            $("#load1,#load2,#load3,#load4,#load5,#load6").show();
            $('#active_users').animate({opacity: 0.4}, 400);
            $('#chart_line, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
            draw_timeline();
            draw_social_mix(0, $('.activestat').attr('id'));
            show_heatmap();
            show_locations();
            show_active_users();
            draw_hashtags("classic");
        }
    });
    $('#loading').addClass('opened');
    $('#loadmore').addClass('opened2');
    $('#main').css({'padding-left': 0, 'padding-right': 0});
}

$('#logo h1,#back_icon').click(function () {
    if (translation_param !== "en") {
        window.location.href = "index.html?user_id=" + user_id + "&translation=" + translation_param;
    }
    else {
        window.location.href = "index.html?user_id=" + user_id;
    }

});
function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}

$('.icon-clear').click(function () {
    query_param = "";
    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&view=" + view_param + "&translation=" + translation_param);
    document.getElementById("query").value = "";
    $("#ff-search").find("input[type='text']").removeClass("searchon");
    $(this).hide();
    if ($('.page').data('id') === "Dashboard") {
        $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
        $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
        show_heatmap();
        show_stats();
        draw_social_mix(0, $('.activestat').attr('id'));
        draw_timeline();
        show_locations();
        show_active_users();
        draw_hashtags("classic");
    }
    else {
        $("#tiles").empty();
        $("#main").show(0);
        $("#loading").show();
        $(window).unbind('.more_latest');
        parse_latest(1);
    }
});


function nFormatter(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(0).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(0).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

$(function () {
    $.ajax({
        url: 'language.xml',
        success: function (xml) {
            $(xml).find('translation').each(function () {
                var id = $(this).attr('id');
                var text = $(this).find(translation_param).text();
                if (text) {
                    $('*[data-lang=' + id + ']').html(text);
//$("." + id).addClass(id + '_' + language);
                }
            });
        },
        async: false
    });
    switch (translation_param) {
        case "en":
            $('#query').attr("placeholder", "Search...");
            break;
        case "el":
            $('#query').attr("placeholder", "Αναζήτηση...");
            break;
        case "it":
            $('#query').attr("placeholder", "Cerca...");
            break;
        case "tr":
            $('#query').attr("placeholder", "Ara...");
            break;
        case "sp":
            $('#query').attr("placeholder", "Ara...");
            break;
        case "ca":
            $('#query').attr("placeholder", "Cerca...");
            break;
        default:
            $('#query').attr("placeholder", "Search...");
            break;
    }
});