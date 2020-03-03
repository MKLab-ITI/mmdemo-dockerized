var collection_param = gup('collection');
var language_param = gup('language');
var unique_param = gup('unique');
var sort_param = gup('sort');
var original_param = gup('original');
var type_param = gup('type');
var topic_param = gup('topics').replace(/%20/g, ' ');
var keyword_query_param = gup('queryKeyword').replace(/%20/g, ' ');
var user_query_param = gup('queryUser').replace(/%20/g, ' ');
var source_param = gup('source');
var since_param = gup('since');
var until_param = gup('until');
var relevance_param = gup('relevance');
var section_param = gup('section');
var view_param = gup("view");
var language_since;
var language_until;
var setanalysis_flag = true;
var pagelocation;
var slider, collection_status;
var $this_a;

if (since_param != "") {
    $('#date_input_from').val(moment.unix(since_param / 1000).format("DD/MM/YYYY"))
}
if (until_param != "") {
    $('#date_input_to').val(moment.unix(until_param / 1000).format("DD/MM/YYYY"))
}

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

var flag_relevance = true;
$(".sub7").each(function () {
    $this_a = $(this).find('a');
    if (relevance_param.indexOf($this_a.data('id').toString()) > -1) {
        $this_a.addClass('activelan');
        flag_relevance = false;
    }
});
if (flag_relevance) {
    $('.sub7').eq(0).find('a').addClass('activelan');
    relevance_param = "";
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
            collection_status = json.status;
            language_since = moment(new Date(json.since)).format("X") * 1000;
            language_until = moment(new Date(json.stopDate)).format("X") * 1000;
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
            if (keyword_query_param !== "") {
                $('#clear_keyword_search').show();
                $("#query_keyword").addClass("searchon");
                $('#query_keyword').val(decodeURI(keyword_query_param));
            }
            if (user_query_param !== "") {
                $('#clear_user_search').show();
                $("#query_user").addClass("searchon");
                $('#query_user').val(decodeURI(user_query_param));
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
                $('.inlist').addClass("dash");
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
            var $items_filters = $('#items_filters');
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
            if (language_param != "all") {
                $items_filters.append('<a href="#" class="filter_item" id="language_filter">Language: ' + language_param.toUpperCase() + '<span></span></a>')
            }
            if (topic_param != "*") {
                $items_filters.append('<a href="#" class="filter_item" id="topics_filter">Topic: ' + topic_param + '<span></span></a>')
            }
            if (unique_param != "false") {
                $items_filters.append('<a href="#" class="filter_item" id="unique_filter">Unique: True<span></span></a>')
            }
            if (original_param != "all") {
                $items_filters.append('<a href="#" class="filter_item" id="original_filter">Original: ' + original_param + '<span></span></a>')
            }
            if (type_param != "all") {
                $items_filters.append('<a href="#" class="filter_item" id="type_filter">Type: ' + type_param + '<span></span></a>')
            }
            if (relevance_param != "") {
                $items_filters.append('<a href="#" class="filter_item" id="relevance_filter">Relevance: ' + relevance_param + '<span></span></a>')
            }
            if (sort_param != "recency") {
                $items_filters.append('<a href="#" class="filter_item" id="sort_filter">Sort: ' + sort_param + '<span></span></a>')
            }
            if (since_param != "") {
                $items_filters.append('<a href="#" class="filter_item" id="since_filter">Since: ' + moment.unix(since_param / 1000).format("DD/MM/YYYY") + '<span></span></a>')
            }
            if (until_param != "") {
                $items_filters.append('<a href="#" class="filter_item" id="until_filter">Until: ' + moment.unix(until_param / 1000).format("DD/MM/YYYY") + '<span></span></a>')
            }

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
                    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
                    $("#tiles").empty();
                    $("#main").show(0);
                    $("#loading").show();
                    $("#end,#loadmore,#dashboard").hide();
                    $("#chart_pie,#chart_line").empty();
                    $("#posts_num,#users_num,#reach_num,#endo_num").html(0);
                    $(window).unbind('.more_latest');
                    $("#hop5,.nav-sidebar:eq(0),.ff-search,.ff-filter-holder").stop(true, true).slideDown(800);
                    $("#update_field").stop(true, true).slideDown(800, function () {
                        resizedw("manually");
                    });
                    $('.inlist').removeClass("dash");
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
                window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
                $("#tiles").empty();
                $("#main").hide(0);
                $("#end,#loadmore,#list_actions,#deleted_msg_user,#deleted_msg_post").hide();
                $('.informer').html("0").stop().animate({"opacity": "0"});
                $("#hop5").stop(true, true).slideUp(800);
                $("#update_field").stop(true, true).slideUp(800, function () {
                    resizedw("manually");
                });
                $('.inlist').addClass("dash");
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
                }, 900);//cause a little bit laggy
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
        window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
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
            $('#language_filter').remove();
            if (language_param != "all") {
                $('#items_filters').append('<a href="#" class="filter_item" id="language_filter">Language: ' + language_param.toUpperCase() + '<span></span></a>')
            }
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
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
            $('#sort_filter').remove();
            if (sort_param != "recency") {
                $('#items_filters').append('<a href="#" class="filter_item" id="sort_filter">Sort: ' + capitalizeFirstLetter(sort_param) + '<span></span></a>')
            }
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
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
            $('#original_filter').remove();
            if (original_param != "all") {
                $('#items_filters').append('<a href="#" class="filter_item" id="original_filter">Original: ' + capitalizeFirstLetter(original_param) + '<span></span></a>')
            }
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
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
            $('#type_filter').remove();
            if (type_param != "all") {
                $('#items_filters').append('<a href="#" class="filter_item" id="type_filter">Type: ' + capitalizeFirstLetter(type_param) + '<span></span></a>')
            }
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
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
            unique_param = $(".sub6 .activelan").data('id').toString();
            $('#unique_filter').remove();
            if (unique_param != "false") {
                $('#items_filters').append('<a href="#" class="filter_item" id="unique_filter">Unique: True<span></span></a>')
            }
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
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
    $("#settings").on("click", ".sub7", function (e) {
        e.preventDefault();
        if (($(this).find('a').attr('data-id') === "all")) {
            if (!($(this).find('a').hasClass('activelan'))) {
                abort();
                $('#loadingbar').hide().css('width', '0%');
                $('#relevance_filter').remove();
                $('.sub7 a').removeClass('activelan');
                $(this).find('a').addClass('activelan');
                relevance_param = "";
                window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
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
        }
        else {
            abort();
            $('#loadingbar').hide().css('width', '0%');
            $('#relevance_filter').remove();
            $('.sub7 a[data-id="all"]').removeClass('activelan');
            $(this).find('a').toggleClass('activelan');
            var relevance_arr = [];
            $('.sub7 a.activelan').each(function (i, obj) {
                relevance_arr.push($(this).attr('data-id'))
            });
            relevance_param = relevance_arr.join(",");
            $('#items_filters').append('<a href="#" class="filter_item" id="relevance_filter">Relevance: ' + relevance_param + '<span></span></a>')
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
            if (relevance_param === "") {
                $('.sub7 a[data-id="all"]').addClass('activelan');
                $('#relevance_filter').remove();
            }
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
            $('#topics_filter').remove();
            if (topic_param != "*") {
                $('#items_filters').append('<a href="#" class="filter_item" id="topics_filter">Topic: ' + topic_param + '<span></span></a>')
            }
            window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
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
    $('.ff-search').on("keyup", "#query_keyword,#query_user", function (e) {
        if (e.keyCode === 13) {
            parse_search();
        }
    });
    $('#icon_search_keyword,#icon_search_user').click(function (e) {
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

    $('#date_input_from').datetimepicker({
        timepicker: false,
        format: 'd/m/Y',
        allowTimes: [
            '00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'
        ]
    });
    $('#date_input_to').datetimepicker({
        timepicker: false,
        format: 'd/m/Y',
        allowTimes: [
            '00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'
        ]
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
            $("#update_field").html("Last item in current view: -");
        }
        else {
            var seconds = parseInt(new Date().getTime() / 1000);
            var now = seconds - time;
            now = Math.floor(now / 60);

            if (now > 60) {
                now = Math.floor(now / 60);
                range = "hours";
                if (now > 24) {
                    now = Math.floor(now / 24);
                    range = "days";
                }
            }
            if (now < 0) {
                now = 0;
            }
            $("#update_field").html("Last item in current view:&nbsp;" + now + "&nbsp;" + range + " ago");
        }
    }, 1000);
}

var titletop, intervalID;

function interval() {
    clearInterval(intervalID);
    var titlelast, different = 0;
    intervalID = setInterval(function () {
        if (different === 0) {
            titlelast = $('#tiles').find('li').eq(0).attr('data-iid');
        } else {
            titlelast = titletop;
        }
        $.ajax({
            type: "GET",
            url: api_folder + "items?collection=" + collection_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&nPerPage=12&pageNumber=1&source=" + source_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&language=" + language_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
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
    window.location.href = "index.html?user_id=" + user_id;
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
        window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);

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
$('#clear_keyword_search').click(function () {
    keyword_query_param = "";
    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
    document.getElementById("query_keyword").value = "";
    $("#query_keyword").removeClass("searchon");
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
$('#clear_user_search').click(function () {
    user_query_param = "";
    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);
    document.getElementById("query_user").value = "";
    $("#query_user").removeClass("searchon");
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
    $page_desc.text("(page:" + page + ", pagesize:" + pagesize + ")");
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
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
$("#items_filters").on("click", ".filter_item span", function (e) {
    switch ($(this).parent().attr('id')) {
        case "language_filter":
            $('.sub1').eq(0).click();
            break;
        case "topics_filter":
            $('.sub5').eq(0).click();
            break;
        case "original_filter":
            $('.sub3').eq(0).click();
            break;
        case "type_filter":
            $('.sub4').eq(0).click();
            break;
        case "unique_filter":
            $('.sub6').eq(0).click();
            break;
        case "relevance_filter":
            $('.sub7').eq(0).click();
            break;
        case "sort_filter":
            $('.sub2').eq(0).click();
            break;
        case "since_filter":
            $('#date_input_from').val("");
            $('#date_search').click();
            break;
        case "until_filter":
            $('#date_input_to').val("");
            $('#date_search').click();
            break;
    }
    $(this).parent().remove();
});
$('#date_search').click(function () {
    since_param = "";
    until_param = "";
    if ($('#date_input_from').val() != "") {
        since_param = moment($('#date_input_from').val(), 'DD/MM/YYYY').unix() * 1000;
        $('#since_filter').remove();
        $('#items_filters').append('<a href="#" class="filter_item" id="since_filter">Since: ' + moment.unix(since_param / 1000).format("DD/MM/YYYY") + '<span></span></a>')
    }
    if ($('#date_input_to').val() != "") {
        until_param = moment($('#date_input_to').val(), 'DD/MM/YYYY').unix() * 1000;
        $('#until_filter').remove();
        $('#items_filters').append('<a href="#" class="filter_item" id="until_filter">Until: ' + moment.unix(until_param / 1000).format("DD/MM/YYYY") + '<span></span></a>')
    }
    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&queryUser=" + user_query_param + "&queryKeyword=" + keyword_query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param);

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
});
$('#reset_filters').click(function () {
    $('.filter_item span').click();
});
