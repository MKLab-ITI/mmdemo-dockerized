function parse_search() {
    query_param = document.getElementById("query").value;
    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?collection=' + collection_param + "&language=" + language_param + "&topics=" + topic_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&sort=" + sort_param + "&query=" + query_param + "&source=" + source_param + "&since=" + since_param + "&until=" + until_param + "&section=" + section_param + "&view=" + view_param + "&translation=" + translation_param);
    $('.icon-clear').show();
    abort();
    $('#loadingbar').hide().css('width', '0%');
    $("#ff-search input[type='text']").addClass("searchon");
    $("#main").height(0);
    $("#tiles").empty();
    $("#loading").show();
    $("#end,#loadmore").hide();
    $('.informer').html("0").stop().animate({"opacity": "0"});
    if (pagelocation === "latest") {
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
