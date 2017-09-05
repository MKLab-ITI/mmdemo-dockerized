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
var section_param = gup('section');
var translation_param = gup('translation');
var view_param = gup("view");
var language_since;
var language_until;
var setanalysis_flag = true;

var pagelocation;
var slider, collection_status;
var $this_a;

if (view_param === "list") {
    $('#main').css('margin-bottom', '0');
    $('#gallery_icon').attr('src', 'imgs/gallery-16-gray.png');
    $('#list_icon').attr('src', 'imgs/list-16-black.png').addClass('active_view');
    if (section_param !== "dashboard") {
        $('#items_num,.verticalLine,.well,#main').show();
    }
}
else {
    view_param = "gallery";
    $('#gallery_icon').attr('src', 'imgs/gallery-16-black.png').addClass('active_view');
    $('#list_icon').attr('src', 'imgs/list-16-gray.png');
    if (section_param !== "dashboard") {
        $('#loadingbar,#main').show();
        var intervalminutes;
        minutes();
    }
}
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
                    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);

                    if ($('.page').data('id') === "Feed") {
                        $("#loading").show();
                        $('.informer').html("0").stop().animate({"opacity": "0"});
                        $(window).unbind('.more_latest');
                        clearInterval(intervalID);
                        if (view_param === "list") {
                            $(".list_table tbody").empty();
                            $(".well,#end,#posts_info,#download_icon").hide();
                            parse_latest_list(1);
                        }
                        else {
                            $("#tiles").empty();
                            $("#main").height(0);
                            $("#end,#loadmore,#posts_info").hide();
                            parse_latest(1);
                        }
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
            if (section_param === "dashboard") {
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
                if (view_param === "list") {
                    parse_latest_list(1);
                }
                else {
                    parse_latest(1);
                }
                if ((collection_status !== "stopped") && (view_param === "gallery")) {
                    interval();
                }
            }
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
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
        $('#loadingbar').hide().css('width', '0%');
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
                $('.informer').html("0").stop().animate({"opacity": "0"});
            }
            else {
                if (pagefeed) {
                    if ((collection_status !== "stopped") && (view_param === "gallery")) {
                        interval();
                    }
                    if (view_param === "gallery") {
                        minutes();
                    }
                    section_param = "feed";
                    pagelocation = "latest";
                    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
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
                    var $inlist = $('.inlist');
                    $inlist.eq(0).removeClass("dash");
                    $inlist.eq(1).removeClass("dash");
                    $inlist.eq(2).removeClass("dash2");
                    $inlist.eq(3).removeClass("dash2");
                    $inlist.eq(4).removeClass("dash2");
                    if (view_param === "list") {
                        $(".list_table tbody").empty();
                        $(".well,#end,#posts_info,#download_icon").hide();
                        parse_latest_list(1);
                    }
                    else {
                        $("#posts_info").hide();
                        parse_latest(1);
                    }
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
                clearInterval(intervalminutes);
                $('#loadingbar').hide().css('width', '0%');
                section_param = "dashboard";
                pagelocation = "dashboard";
                window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
                $("#tiles").empty();
                $("#main").hide(0);
                $("#end,#loadmore,#list_actions,#deleted_msg_user,#deleted_msg_post").hide();
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
        $('#loadingbar').hide().css('width', '0%');
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
        window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
        if ($('.page').data('id') === "Feed") {
            $("#loading").show();
            $('.informer').html("0").stop().animate({"opacity": "0"});
            $(window).unbind('.more_latest');
            if (view_param === "list") {
                $(".list_table tbody").empty();
                $(".well,#end,#posts_info,#download_icon").hide();
                parse_latest_list(1);
            }
            else {
                $("#tiles").empty();
                $("#main").height(0);
                $("#end,#loadmore,#posts_info").hide();
                parse_latest(1);
            }
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
            $('#loadingbar').hide().css('width', '0%');
            $('.sub1 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            language_param = $(".sub1 .activelan").text().toLowerCase();
            language_param = language_param.substr(0, language_param.indexOf(' '));
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#loading").show();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                $(window).unbind('.more_latest');
                if (view_param === "list") {
                    $(".list_table tbody").empty();
                    $(".well,#end,#posts_info,#download_icon").hide();
                    parse_latest_list(1);
                }
                else {
                    $("#tiles").empty();
                    $("#main").height(0);
                    $("#end,#loadmore,#posts_info").hide();
                    parse_latest(1);
                }
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
            $('#loadingbar').hide().css('width', '0%');
            $('.sub2 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            sort_param = $(".sub2 .activelan").data('id');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
            $("#loading").show();
            $('.informer').html("0").stop().animate({"opacity": "0"});
            $(window).unbind('.more_latest');
            if (view_param === "list") {
                $(".list_table tbody").empty();
                $(".well,#end,#posts_info,#download_icon").hide();
                parse_latest_list(1);
            }
            else {
                $("#tiles").empty();
                $("#main").height(0);
                $("#end,#loadmore,#posts_info").hide();
                parse_latest(1);
            }
        }
    });
    $("#settings").on("click", ".sub3", function (e) {
        e.preventDefault();
        if (!($(this).find('a').hasClass('activelan'))) {
            abort();
            $('#loadingbar').hide().css('width', '0%');
            $('.sub3 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            original_param = $(".sub3 .activelan").data('id').toLowerCase();
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#loading").show();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                $(window).unbind('.more_latest');
                if (view_param === "list") {
                    $(".list_table tbody").empty();
                    $(".well,#end,#posts_info,#download_icon").hide();
                    parse_latest_list(1);
                }
                else {
                    $("#tiles").empty();
                    $("#main").height(0);
                    $("#end,#loadmore,#posts_info").hide();
                    parse_latest(1);
                }
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
            $('#loadingbar').hide().css('width', '0%');
            $('.sub4 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            type_param = $(".sub4 .activelan").data('id');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#loading").show();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                $(window).unbind('.more_latest');
                if (view_param === "list") {
                    $(".list_table tbody").empty();
                    $(".well,#end,#posts_info,#download_icon").hide();
                    parse_latest_list(1);
                }
                else {
                    $("#tiles").empty();
                    $("#main").height(0);
                    $("#end,#loadmore,#posts_info").hide();
                    parse_latest(1);
                }
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
            $('#loadingbar').hide().css('width', '0%');
            $('.sub6 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            unique_param = $(".sub6 .activelan").data('id');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#loading").show();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                $(window).unbind('.more_latest');
                if (view_param === "list") {
                    $(".list_table tbody").empty();
                    $(".well,#end,#posts_info,#download_icon").hide();
                    parse_latest_list(1);
                }
                else {
                    $("#tiles").empty();
                    $("#main").height(0);
                    $("#end,#loadmore,#posts_info").hide();
                    parse_latest(1);
                }
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
            $('#loadingbar').hide().css('width', '0%');
            $('.sub5 a').removeClass('activelan');
            $(this).find('a').addClass('activelan');
            topic_param = $(".sub5 .activelan").find('p').data('query');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
            if ($('.page').data('id') === "Feed") {
                $("#loading").show();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                $(window).unbind('.more_latest');
                if (view_param === "list") {
                    $(".list_table tbody").empty();
                    $(".well,#end,#posts_info,#download_icon").hide();
                    parse_latest_list(1);
                }
                else {
                    $("#tiles").empty();
                    $("#main").height(0);
                    $("#end,#loadmore,#posts_info").hide();
                    parse_latest(1);
                }
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
                $("#erase_analysis").animate({opacity: 1}, 1000);
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

function minutes() {
    intervalminutes = setInterval(function () {
        var range = "minutes";
        var time = $('#tiles').find('li').eq(0).attr('data-time');
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
                case "es":
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
            now = Math.floor(now / 60);

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
                    case "es":
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
                        case "es":
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
                case "es":
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
            titlelast = $('#tiles').find('li').eq(0).attr('data-iid');
        } else {
            titlelast = titletop;
        }
        until_param = +moment().format("X") * 1000;
        window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
        $.ajax({
            type: "GET",
            url: api_folder + "items?collection=" + collection_param + "&q=" + query_param + "&nPerPage=12&pageNumber=1&source=" + source_param + "&sort=" + sort_param + "&language=" + language_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
            dataType: "json",
            success: function (json) {
                if (pagelocation === "latest") {
                    var flag = 0;
                    for (var i = 0; i < json.items.length; i++) {
                        var title = json.items[i].id.replace(/#/g, "%23");

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
                        $('.informer').html("" + different).stop().animate({"opacity": "1"});
                    }
                }
            },
            async: true
        });

    }, 60000);
}

function close_slider() {
    $.pageslide.close();
    $('#toolbar').css('padding-left', '45px');
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
    $('#toolbar').css('padding-left', '250px');
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
$('#gallery_icon,#list_icon').click(function () {
    if (!($(this).hasClass('active_view'))) {
        clearInterval(intervalID);
        clearInterval(intervalminutes);
        if ($(this).attr('id') === "gallery_icon") {
            $('#list_actions,#deleted_msg_user,#deleted_msg_post').hide();
            $('#list_table').css({'margin-top': 0});
            $('#main').css('margin-bottom', '65px');
            view_param = "gallery";
            $('#gallery_icon').attr('src', 'imgs/gallery-16-black.png').addClass("active_view");
            $('#list_icon').attr('src', 'imgs/list-16-gray.png').removeClass("active_view");
            $('#items_num,.verticalLine,#download_icon').hide();
            if (collection_status !== "stopped") {
                interval();
            }
            minutes();
        }
        else {
            $('#main').css('margin-bottom', '0');
            view_param = "list";
            $('#gallery_icon').attr('src', 'imgs/gallery-16-gray.png').removeClass("active_view");
            $('#list_icon').attr('src', 'imgs/list-16-black.png').addClass('active_view');
            $('#items_num,.verticalLine,#download_icon').show();
        }
        abort();
        $('#loadingbar').hide().css('width', '0%');
        window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);

        $("#loading").show();
        $('.informer').html("0").stop().animate({"opacity": "0"});
        $('.list_table,#tiles,#end,#loadmore,.well,#end,#posts_info,#download_icon').hide();
        $(".list_table tbody,#tiles").empty();
        $("#main").height(0);
        $(window).unbind('.more_latest');

        if (view_param === "list") {
            parse_latest_list(1);
        }
        else {
            parse_latest(1);
        }
    }
});

$('.itemsPerPage span').click(function () {
    if (!($(this).hasClass('active_items'))) {
        $('.itemsPerPage span').removeClass("active_items");
        $(this).addClass("active_items");
        abort();
        $(".list_table tbody").empty();
        $(".well,#end,#posts_info,#download_icon").hide();
        $('.informer').html("0").stop().animate({"opacity": "0"});
        $("#loading").show();
        parse_latest_list(1);
    }
});
$('.icon-clear').click(function () {
    query_param = "";
    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
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
        $("#loading").show();
        $('.informer').html("0").stop().animate({"opacity": "0"});
        $(window).unbind('.more_latest');
        if (view_param === "list") {
            $(".list_table tbody").empty();
            $(".well,#end,#posts_info,#download_icon").hide();
            parse_latest_list(1);
        }
        else {
            $("#tiles").empty();
            $("#main").height(0);
            $("#end,#loadmore,#posts_info").hide();
            parse_latest(1);
        }
    }
});
$('#download_icon').click(function () {
    var page = $('#pagination_list').data('twbsPagination').getCurrentPage();
    var pagesize = $('.active_items').text();
    var $page_desc = $('#page_desc');
    $('#file_name').val($('#collection').text() + '_' + page + '_' + pagesize);
    switch (translation_param) {
        case "en":
            $page_desc.text("(page:" + page + ", pagesize:" + pagesize + ")");
            break;
        case "el":
            $page_desc.text("(σελίδα:" + page + ", μέγεθος:" + pagesize + ")");
            break;
        case "it":
            $page_desc.text("(page:" + page + ", pagesize:" + pagesize + ")");
            break;
        case "tr":
            $page_desc.text("(page:" + page + ", pagesize:" + pagesize + ")");
            break;
        case "es":
            $page_desc.text("(page:" + page + ", pagesize:" + pagesize + ")");
            break;
        case "ca":
            $page_desc.text("(page:" + page + ", pagesize:" + pagesize + ")");
            break;
        default:
            $page_desc.text("(page:" + page + ", pagesize:" + pagesize + ")");
            break;
    }
    $('#download_modal').reveal();
});

$(".btn-group").on("click", ".btn-default", function (e) {
    if ($(this).attr('id') === "xls_but") {
        $('#info_wrap').slideDown();
    }
    else {
        $('#info_wrap').slideUp();
    }
    $('.btn-group').find('button').removeClass('btn-primary').addClass('btn-default');
    $(this).addClass('btn-primary').removeClass('btn-default');
});
$("#tiles").on("click", ".translation_p", function () {
    var $this=$(this);
    if ($this.hasClass('original')) {
        var pair = $this.attr('data-pair');
        switch (translation_param) {
            case "en":
                $this.text('Show in original');
                break;
            case "el":
                $this.text('Δείτε το πρωτότυπο');
                break;
            case "it":
                $this.text('Show in original');
                break;
            case "tr":
                $this.text('Show in original');
                break;
            case "es":
                $this.text('Show in original');
                break;
            case "ca":
                $this.text('Show in original');
                break;
            default:
                $this.text('Show in original');
                break;
        }
        $this.removeClass('original');
        $this.siblings('.title').addClass('blur');
        $.ajax({
            type: "GET",
            url: "http://translate.linguatec.org/TranslationService/Translate.asmx/translate?language_pair=" + pair + "&text=" + encodeURIComponent($this.attr('data-original')),
            dataType: "json",
            success: function (json) {
                $this.siblings('.title').text(json.translation);
                $this.siblings('.title').removeClass('blur');
                $(window).trigger('resize');
            },
            async: true
        });
    }
    else {
        switch (translation_param) {
            case "en":
                $this.text('See translation');
                break;
            case "el":
                $this.text('Δείτε τη μετάφραση');
                break;
            case "it":
                $this.text('See translation');
                break;
            case "tr":
                $this.text('See translation');
                break;
            case "es":
                $this.text('See translation');
                break;
            case "ca":
                $this.text('See translation');
                break;
            default:
                $this.text('See translation');
                break;
        }
        $this.siblings('.title').text($this.attr('data-original'));
        $this.addClass('original');
        $(window).trigger('resize');
    }
});
$("#list_table").on("click", ".translation_p_list", function (e) {
    e.stopPropagation();
    var $this=$(this);
    if ($this.hasClass('original')) {
        var pair = $this.attr('data-pair');
        switch (translation_param) {
            case "en":
                $this.text('Show in original');
                break;
            case "el":
                $this.text('Δείτε το πρωτότυπο');
                break;
            case "it":
                $this.text('Show in original');
                break;
            case "tr":
                $this.text('Show in original');
                break;
            case "es":
                $this.text('Show in original');
                break;
            case "ca":
                $this.text('Show in original');
                break;
            default:
                $this.text('Show in original');
                break;
        }
        $this.removeClass('original');
        $this.parent('.list_title').addClass('blur');
        $.ajax({
            type: "GET",
            url: "http://translate.linguatec.org/TranslationService/Translate.asmx/translate?language_pair=" + pair + "&text=" + encodeURIComponent($this.attr('data-original')),
            dataType: "json",
            success: function (json) {
                $this.parent('.list_title').removeClass('blur');
                $this.siblings('.text_title').text(json.translation);
            },
            async: true
        });
    }
    else {
        switch (translation_param) {
            case "en":
                $this.text('See translation');
                break;
            case "el":
                $this.text('Δείτε τη μετάφραση');
                break;
            case "it":
                $this.text('See translation');
                break;
            case "tr":
                $this.text('See translation');
                break;
            case "es":
                $this.text('See translation');
                break;
            case "ca":
                $this.text('See translation');
                break;
            default:
                $this.text('See translation');
                break;
        }
        $this.siblings('.text_title').text($this.attr('data-original'));
        $this.addClass('original');
    }
});
$("#list_table").on("click", ".list_title", function () {
    window.open($(this).attr('data-redirect'), '_blank');
});
$("#tiles").on("click", ".rate_menu", function () {
    $(this).parent().next('.menu_icons').css('height', $(this).parents('li').height() - 14).slideDown();
});
$("#tiles").on("click", ".close_menu", function () {
    $(this).parent().slideUp();
});
$("#tiles").on("click", ".tabs li:not(.current) a", function () {
    $(this).parent().siblings().removeClass('current');
    $(this).parent().addClass('current');
    if ($(this).hasClass('rate')) {
        $(this).parent().siblings().find('img').attr('src', 'imgs/delete-16-gray.png');
        $(this).find('img').attr('src', 'imgs/star-16-white.png');
        $(this).parents('.tabs').siblings('.rate_tab').show();
        $(this).parents('.tabs').siblings('.exclude_tab').hide();
    }
    else {
        $(this).parent().siblings().find('img').attr('src', 'imgs/star-16-gray.png');
        $(this).find('img').attr('src', 'imgs/delete-16-white.png');
        $(this).parents('.tabs').siblings('.rate_tab').hide();
        $(this).parents('.tabs').siblings('.exclude_tab').show();
    }
});

$("#tiles").on("click", ".rate_save_but", function () {
    var $this = $(this);
    var viewData = {
        "uid": user_id,
        "cid": collection_param,
        "iid": $(this).parents('li').attr('data-iid').replace(/%23/g, "#"),
        "relevance": $(this).siblings(".relevance_slider").eq(0).slider("value")
    };
    var data = JSON.stringify(viewData);
    $.ajax({
        type: 'POST',
        url: api_folder + 'relevance',
        data: data,
        success: function () {
            $this.slideUp(300, function () {
                $this.next('.refresh').show();
            });
        },
        error: function (e) {
        }
    });
});

$("#tiles").on("click", ".refresh_but", function () {
    $("#tiles").empty();
    $("#main").height(0);
    $("#end,#loadmore,#posts_info").hide();
    parse_latest(1);
});
$("#tiles").on("click", ".undo_but", function () {
    var $this = $(this);
    $this.parents('.remove').siblings('.exclude_buttons').find('input').removeAttr('disabled');
    $this.parents('.remove').slideUp(300, function () {
        $this.parents('.remove').siblings('.exclude_save_but').show();
    });
    if ($("input[name='remove_" + $this.parents('li').attr('data-iid') + "']:checked").val() === "user") {
        var viewData_user = {
            "users": []
        };
        viewData_user.users.push($this.parents('li').attr('data-uid'));
        var data_user = JSON.stringify(viewData_user);
        $.ajax({
            type: 'POST',
            url: api_folder + 'collection/' + collection_param + '/includeUsers',
            data: data_user,
            success: function () {
            },
            error: function () {
            }
        });
    }
    else {
        var viewData_item = {
            "items": []
        };
        viewData_item.items.push($this.parents('li').attr('data-iid').replace(/%23/g, "#"));
        var data_item = JSON.stringify(viewData_item);
        $.ajax({
            type: 'POST',
            url: api_folder + 'collection/' + collection_param + '/includeItems',
            data: data_item,
            success: function () {
            },
            error: function () {
            }
        });
    }
});

$("#tiles").on("click", ".remove_but", function () {
    var $this = $(this);
    var count_items = 0;
    if ($("input[name='remove_" + $this.parents('li').attr('data-iid') + "']:checked").val() === "user") {
        var listItems = $("#tiles li");
        listItems.each(function (idx, li) {
            if ($(this).attr('data-uid') === $this.parents('li').attr('data-uid')) {
                $(this).remove();
                count_items++;
            }
        });
    }
    else {
        $this.parents('li').remove();
        count_items++;
    }
    var $tiles_li = $('#tiles > li');
    var $posts_info = $('#posts_info');
    var total_items = $posts_info.text().split(' ')[0] - count_items;
    switch (translation_param) {
        case "en":
            switch (sort_param) {
                case "recency":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                    break;
                case "popularity":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most popular.');
                    break;
                case "relevance":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most relevant.');
                    break;
                default:
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
            }
            break;
        case "el":
            switch (sort_param) {
                case "recency":
                    $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή 1 - ' + $tiles_li.length + '</span> πιο προσφάτων.');
                    break;
                case "popularity":
                    $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή 1 - ' + $tiles_li.length + '</span> πιο δημοφιλή.');
                    break;
                case "relevance":
                    $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή 1 - ' + $tiles_li.length + '</span> πιο σχετικών.');
                    break;
                default:
                    $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή 1 - ' + $tiles_li.length + '</span> πιο προσφάτων.');
            }
            break;
        case "it":
            switch (sort_param) {
                case "recency":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                    break;
                case "popularity":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most popular.');
                    break;
                case "relevance":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most relevant.');
                    break;
                default:
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
            }
            break;
        case "tr":
            switch (sort_param) {
                case "recency":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                    break;
                case "popularity":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most popular.');
                    break;
                case "relevance":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most relevant.');
                    break;
                default:
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
            }
            break;
        case "es":
            switch (sort_param) {
                case "recency":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                    break;
                case "popularity":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most popular.');
                    break;
                case "relevance":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most relevant.');
                    break;
                default:
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
            }
            break;
        case "ca":
            switch (sort_param) {
                case "recency":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                    break;
                case "popularity":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most popular.');
                    break;
                case "relevance":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most relevant.');
                    break;
                default:
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
            }
            break;
        default:
            switch (sort_param) {
                case "recency":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                    break;
                case "popularity":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most popular.');
                    break;
                case "relevance":
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most relevant.');
                    break;
                default:
                    $posts_info.html(total_items + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
            }
    }
    $(window).trigger('resize');
});

$("#tiles").on("click", ".exclude_save_but", function () {
    var $this = $(this);
    $this.siblings('.exclude_buttons').find('input').attr('disabled', true);
    $this.slideUp(300, function () {
        $this.next('.remove').show();
    });
    if ($("input[name='remove_" + $this.parents('li').attr('data-iid') + "']:checked").val() === "user") {
        var viewData_user = {
            "users": []
        };
        viewData_user.users.push($this.parents('li').attr('data-uid'));
        var data_user = JSON.stringify(viewData_user);
        $.ajax({
            type: 'POST',
            url: api_folder + 'collection/' + collection_param + '/excludeUsers',
            data: data_user,
            success: function () {
                $this.slideUp(300, function () {
                    $this.next('.remove').show();
                });
            },
            error: function () {
            }
        });
    }
    else {
        var viewData_item = {
            "items": []
        };
        viewData_item.items.push($this.parents('li').attr('data-iid').replace(/%23/g, "#"));
        var data_item = JSON.stringify(viewData_item);
        $.ajax({
            type: 'POST',
            url: api_folder + 'collection/' + collection_param + '/excludeItems',
            data: data_item,
            success: function () {
                $this.slideUp(300, function () {
                    $this.next('.remove').show();
                });
            },
            error: function () {
            }
        });
    }
});

$(".flatTable").on("click", ".exclude_tag", function () {
    var $this = $(this);
    var viewData_tag = {
        "keywords": []
    };
    viewData_tag.keywords.push($this.attr('data-tag'));
    var data_tag = JSON.stringify(viewData_tag);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/excludeKeywords',
        data: data_tag,
        success: function (e) {
            if (e.notAdded.length === 0) {
                $this.slideUp(300, function () {
                    $this.next('.remove_tag').show();
                });
            }
            else {
                $this.slideUp(300, function () {
                    $this.siblings('.confirm_remove_tag').show();
                });
            }
        },
        error: function () {
        }
    });
});
$(".flatTable").on("click", ".confirm_exclude_tag_but", function () {
    var $this = $(this);
    var viewData_tag = {
        "keywords": [],
        "forceExclude": true
    };
    viewData_tag.keywords.push($this.parents('.confirm_remove_tag').siblings('.exclude_tag').attr('data-tag'));
    var data_tag = JSON.stringify(viewData_tag);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/excludeKeywords',
        data: data_tag,
        success: function (e) {
            $this.parents('.confirm_remove_tag').slideUp(300, function () {
                $this.parents('.confirm_remove_tag').siblings('.remove_tag').show();
            });
        },
        error: function () {
        }
    });
});
$("#users_images").on("click", ".exclude_user", function (e) {
    e.stopPropagation();
    var $this = $(this);
    var viewData_user = {
        "users": []
    };
    viewData_user.users.push($this.parents('.user').attr('data-uid'));
    var data_user = JSON.stringify(viewData_user);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/excludeUsers',
        data: data_user,
        success: function () {
            $this.slideUp(300, function () {
                $this.next('.remove_user').show();
            });
        },
        error: function () {
        }
    });
});

$(".flatTable").on("click", ".refresh_but_tag", function () {
    $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
    $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
    show_heatmap();
    show_stats();
    draw_social_mix(0, $('.activestat').attr('id'));
    draw_timeline();
    show_locations();
    show_active_users();
    draw_hashtags("classic");
});
$(".flatTable").on("click", ".undo_but_tag", function () {
    var $this = $(this);
    var viewData_tag = {
        "keywords": []
    };
    viewData_tag.keywords.push($this.parents('.remove_tag').siblings('.exclude_tag').attr('data-tag'));
    var data_tag = JSON.stringify(viewData_tag);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/includeKeywords',
        data: data_tag,
        success: function () {
            $this.parents('.remove_tag').slideUp(300, function () {
                $this.parents('.remove_tag').siblings('.exclude_tag').show();
            });
        },
        error: function () {
        }
    });
});
$(".flatTable").on("click", ".confirm_undo_tag_but", function () {
    var $this = $(this);
    var viewData_tag = {
        "keywords": []
    };
    viewData_tag.keywords.push($this.parents('.confirm_remove_tag').siblings('.exclude_tag').attr('data-tag'));
    var data_tag = JSON.stringify(viewData_tag);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/includeKeywords',
        data: data_tag,
        success: function () {
            $this.parents('.confirm_remove_tag').slideUp(300, function () {
                $this.parents('.confirm_remove_tag').siblings('.exclude_tag').show();
            });
        },
        error: function () {
        }
    });
});

$("#users_images").on("click", ".undo_but_user", function (e) {
    e.stopPropagation();
    var $this = $(this);
    var viewData_user = {
        "users": []
    };
    viewData_user.users.push($this.parents('.user').attr('data-uid'));
    var data_user = JSON.stringify(viewData_user);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/includeUsers',
        data: data_user,
        success: function () {
            $this.parents('.remove_user').hide(0, function () {
                $this.parents('.remove_user').siblings('.exclude_user').show();
            });
        },
        error: function () {
        }
    });
});
$("#users_images").on("click", ".refresh_but_user", function (e) {
    e.stopPropagation();
    $("#load1,#load2,#load3,#load4,#load5,#load6,.load0").show();
    $('#chart_line, .minitext, #chart_pie, #heatmap, #users_locations, #active_users, #tags').animate({opacity: 0.4}, 400);
    show_heatmap();
    show_stats();
    draw_social_mix(0, $('.activestat').attr('id'));
    draw_timeline();
    show_locations();
    show_active_users();
    draw_hashtags("classic");
});


$("#download_cancel").click(function () {
    $('#download_modal').find('.close-reveal-modal').trigger('click');
});
$('#exclude_user_list').click(function () {
    var viewData_user = {
        "users": []
    };
    $('.selected_row').each(function () {
        viewData_user.users.push($(this).attr('data-uid'));
    });
    var data_user = JSON.stringify(viewData_user);

    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/excludeUsers',
        data: data_user,
        success: function () {
            var count_items = 0;
            for (var i = 0; i < viewData_user.users.length; i++) {
                $('tr[data-uid="' + viewData_user.users[i] + '"]').hide();
                count_items++;
            }
            $('#list_actions').slideUp(500);
            $('#list_table').animate({'margin-top': 0}, 500);
            $('#deleted_msg_user').slideDown(500);

            var $posts_info = $('#posts_info');
            var total_items = $posts_info.text().split(' ')[0] - count_items;
            var page = $('#pagination_list').data('twbsPagination').getCurrentPage();
            var pagesize = $('.active_items').text();
            var start_gap = ((page - 1) * pagesize) + 1;

            switch (translation_param) {
                case "en":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                case "el":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> πιο προσφάτων.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> πιο δημοφιλή.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> πιο σχετικών.');
                            break;
                        default:
                            $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> πιο προσφάτων.');
                    }
                    break;
                case "it":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                case "tr":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                case "es":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                case "ca":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                default:
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
            }
        },
        error: function () {
        }
    });
});
$('#undo_but_user_list').click(function () {
    var viewData_user = {
        "users": []
    };
    $('tbody tr:hidden').each(function () {
        viewData_user.users.push($(this).attr('data-uid'));
    });
    viewData_user.users = unique(viewData_user.users);
    var data_user = JSON.stringify(viewData_user);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/includeUsers',
        data: data_user,
        success: function () {
            $('tbody tr:hidden').show();
            $('#deleted_msg_user').slideUp(500);
            $('#list_actions').slideDown(500);
            $('#list_table').animate({'margin-top': '43px'}, 500);
        },
        error: function () {
        }
    });
});
$('#exclude_item_list').click(function () {

    var viewData_item = {
        "items": []
    };
    $('.selected_row').each(function () {
        viewData_item.items.push($(this).attr('data-id'));
    });
    var data_item = JSON.stringify(viewData_item);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/excludeItems',
        data: data_item,
        success: function () {
            $('.selected_row').hide();
            $('#list_actions').slideUp(500);
            $('#list_table').animate({'margin-top': 0}, 500);
            $('#deleted_msg_post').slideDown(500);

            var $posts_info = $('#posts_info');
            var total_items = $posts_info.text().split(' ')[0] - viewData_item.items.length;
            var page = $('#pagination_list').data('twbsPagination').getCurrentPage();
            var pagesize = $('.active_items').text();
            var start_gap = ((page - 1) * pagesize) + 1;

            switch (translation_param) {
                case "en":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                case "el":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> πιο προσφάτων.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> πιο δημοφιλή.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> πιο σχετικών.');
                            break;
                        default:
                            $posts_info.html(total_items + ' δημοσιεύσεις. Προβολή ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> πιο προσφάτων.');
                    }
                    break;
                case "it":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                case "tr":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                case "es":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                case "ca":
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
                    break;
                default:
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(total_items + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('tbody tr:visible').length - 1) + '</span> most recent.');
                    }
            }


        },
        error: function () {
        }
    });
});
$('#undo_but_user_post').click(function () {
    var viewData_item = {
        "items": []
    };
    $('tbody tr:hidden').each(function () {
        viewData_item.items.push($(this).attr('data-id'));
    });
    var data_item = JSON.stringify(viewData_item);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + collection_param + '/includeItems',
        data: data_item,
        success: function () {
            $('tbody tr:hidden').show();
            $('#deleted_msg_post').slideUp(500);
            $('#list_actions').slideDown(500);
            $('#list_table').animate({'margin-top': '43px'}, 500);
        },
        error: function () {
        }
    });
});
$("#download_ok").click(function () {
    var name = $('#file_name').val();
    if (name === "") {
        name = $('#collection').text() + '_' + page + '_' + pagesize;
    }
    if ($('.btn-primary').attr('id') === "xls_but") {
        $(".list_table").table2excel({
            exclude: ".noExl",
            name: "Excel Document Name",
            filename: name,
            fileext: ".xls"
        });
    }
    else {
        $(".list_table").table_download({
            format: "csv",
            separator: ",",
            filename: name,
            linkname: "",
            quotes: ""
        });
    }
    $('#download_modal').find('.close-reveal-modal').trigger('click');
});
$("#list_table").on("change", "input:checkbox", function () {
    if ($(this).is(":checked")) {
        $('#deleted_msg_user,#deleted_msg_post').slideUp(500);
        $('tbody tr:hidden').remove();
        $(this).parents('tr').addClass('selected_row');
        $('#list_actions').slideDown(500);
        $('#rows_selected').text($('.selected_row').length);
        $('#list_table').animate({'margin-top': '43px'}, 500);
    }
    else {
        $(this).parents('tr').removeClass('selected_row');
        $('#rows_selected').text($('.selected_row').length);
        if ($('.selected_row').length === 0) {
            $('#list_actions').slideUp(500);
            $('#list_table').animate({'margin-top': 0}, 500);
        }
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
function pad(n) {
    return n < 10 ? '0' + n : n
}
var orderextraction = function (node) {
    return node.getAttribute('data-order');
};
$(function () {
    $.ajax({
        url: 'language.xml',
        success: function (xml) {
            $(xml).find('translation').each(function () {
                var id = $(this).attr('id');
                var text = $(this).find(translation_param).text();
                if (text) {
                    $('*[data-lang=' + id + ']').html(text);
                }
            });
        },
        async: false
    });
    var $query = $('#query');
    var $file_name = $('#file_name');
    switch (translation_param) {
        case "en":
            $query.attr("placeholder", "Search...");
            $file_name.attr("placeholder", "Name your file...");
            break;
        case "el":
            $query.attr("placeholder", "Αναζήτηση...");
            $file_name.attr("placeholder", "Ονόμασε το αρχείο...");
            break;
        case "it":
            $query.attr("placeholder", "Cerca...");
            $file_name.attr("placeholder", "Name your file...");
            break;
        case "tr":
            $query.attr("placeholder", "Ara...");
            $file_name.attr("placeholder", "Name your file...");
            break;
        case "es":
            $query.attr("placeholder", "Ara...");
            $file_name.attr("placeholder", "Name your file...");
            break;
        case "ca":
            $query.attr("placeholder", "Cerca...");
            $file_name.attr("placeholder", "Name your file...");
            break;
        default:
            $query.attr("placeholder", "Search...");
            $file_name.attr("placeholder", "Name your file...");
            break;
    }
});
function unique(list) {
    var result = [];
    $.each(list, function (i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}
$(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll > 0) {
        $("#list_actions").addClass("shadow");
    }
    else {
        $("#list_actions").removeClass("shadow");
    }
});