function parse_latest(pagenum) {
    $.ajax({
        type: "GET",
        url: api_folder + "items?collection=" + collection_param + "&nPerPage=5&pageNumber=" + pagenum + "&user=" + user_query_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&source=" + source_param + "&unique=" + unique_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&language=" + language_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            if (pagelocation === "latest") {
                var title, source, publicationTime, shared, screenname, profileimage, uid, id, relevance_score, page, userpage, thumb, colorclass, iconsource, onerror, style_favicon, style_icon, language;

                $('#tiles,#posts_info').show();
                $("#languages").empty();
                for (var l = 0, count, lang; l < json.languages.length; l++) {
                    lang = json.languages[l].field;
                    count = json.languages[l].count;
                    $("#languages").append('<li class="sub1"><a href="#">' + lang.toUpperCase() + ' <span class="label">' + nFormatter(count) + '</span></a></li>')
                }
                $(".sub1").each(function () {
                    $this_a = $(this).find('a');
                    if ($this_a.text().split(' ')[0].toLowerCase() === language_param) {
                        $this_a.addClass('activelan');
                        return false;
                    }
                });
                $("#topics").empty();
                var $topics = json.topics;
                for (var t = 0, items, label, query; t < $topics.length; t++) {
                    label = $topics[t].label;
                    items = $topics[t].items;
                    query = $topics[t].query;
                    $("#topics").append('<li class="sub5"><a href="#"><p data-query="' + query + '">' + label + '</p><span class="label">' + nFormatter(items) + '</span></a></li>');
                }
                $(".sub5").each(function () {
                    $this_a = $(this).find('a');
                    var $this_p = $this_a.find('p');
                    if ($this_p.data("query") === topic_param) {
                        $this_a.addClass('activelan');
                        return false;
                    }
                });
                for (var i = 0; i < json.items.length; i++) {
                    title = json.items[i].title;
                    if (title === "") {
                        title = "-";
                    }
                    style_favicon = "";
                    style_icon = "";
                    source = json.items[i].source;
                    publicationTime = json.items[i].publicationTime;
                    language = json.items[i].language;
                    screenname = json.items[i].user.username;
                    relevance_score = "0";
                    if (json.items[i].hasOwnProperty('relevance')) {
                        relevance_score = json.items[i].relevance;
                    }
                    profileimage = json.items[i].user.profileImage;
                    id = json.items[i].id.replace(/#/g, "%23");
                    uid = json.items[i].user.id;
                    if (json.items[i].hasOwnProperty('pageUrl')) {
                        page = json.items[i].pageUrl;
                    } else {
                        page = "404.html";
                    }

                    if (json.items[i].user.hasOwnProperty('pageUrl')) {
                        userpage = json.items[i].user.pageUrl;
                    } else {
                        userpage = "404.html";
                    }
                    onerror = false;
                    switch (source) {
                        case "Youtube":
                            shared = nFormatter(json.items[i].views) + " views";
                            screenname = json.items[i].user.name;
                            iconsource = 'imgs/youtube-16-black.png';
                            colorclass = 'color youtubecolor';
                            break;
                        case "Twitter":
                            shared = nFormatter(json.items[i].shares) + " retweets";
                            iconsource = 'imgs/twitter-16-black.png';
                            colorclass = 'color twittercolor';
                            onerror = true;
                            break;
                        case "Flickr":
                            shared = nFormatter(json.items[i].views) + " views";
                            iconsource = 'imgs/flickr-16-black.png';
                            colorclass = 'color flickrcolor';
                            break;
                        case "Facebook":
                            shared = nFormatter(json.items[i].shares) + " shares";
                            iconsource = 'imgs/facebook-16-black.png';
                            colorclass = 'color facebookcolor';
                            break;
                        case "GooglePlus":
                            shared = nFormatter(json.items[i].shares) + " shares";
                            iconsource = 'imgs/google+-16-black.png';
                            colorclass = 'color googlecolor';
                            break;
                        case "RSS":
                            shared = nFormatter(json.items[i].shares) + " shares";
                            screenname = json.items[i].user.name;
                            profileimage = 'http://www.google.com/s2/favicons?domain=' + userpage;
                            style_favicon = "width:32px;height:32px";
                            style_icon = "top:37px";
                            iconsource = 'imgs/rss-16-black.png';
                            colorclass = 'color rsscolor';
                            break;
                        default:
                            shared = "0 views";
                            iconsource = 'imgs/rss-16-black.png';
                            colorclass = 'color rsscolor';
                    }
                    if (onerror) {
                        onerror = "imgError2(this,'Twitter','" + json.items[i].user.username + "');"
                    }
                    else {
                        onerror = "imgError2(this,null,null);"
                    }


                    var display_time = new Date(publicationTime * 1);
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    var year = display_time.getUTCFullYear();
                    var month = months[display_time.getUTCMonth()];
                    var date = display_time.getUTCDate();
                    var time = date + ' ' + month + ' ' + year;

                    var titles = document.getElementById("tiles");
                    var li = document.createElement('li');
                    li.setAttribute('data-iid', id);
                    li.setAttribute('data-time', '' + publicationTime / 1000);
                    li.setAttribute('data-uid', uid);
                    li.setAttribute('data-score', relevance_score);
                    titles.appendChild(li);

                    var divouter = document.createElement('div');
                    divouter.setAttribute('class', 'outer');
                    li.appendChild(divouter);

                    if (profileimage === "imgs/noprofile.gif") {
                        profileimage = "http://getfavicon.appspot.com/" + page;
                    }

                    if (json.items[i].type === "item") {
                        li.setAttribute('class', 'text_item');
                        var a = document.createElement('a');
                        a.setAttribute('href', '#');
                        a.setAttribute('onclick', 'return false;');
                        a.setAttribute('style', 'cursor:default');
                        divouter.appendChild(a);

                        var profile = document.createElement('img');
                        profile.setAttribute('src', profileimage);
                        profile.setAttribute('class', 'ff-userpic');
                        profile.setAttribute('style', 'margin: -15px auto 0;' + style_favicon);
                        profile.setAttribute('onerror', onerror);
                        profile.setAttribute('onclick', 'redirect("' + userpage + '")');
                        divouter.appendChild(profile);

                        if (json.items[i].hasOwnProperty('relevance')) {
                            var rating = document.createElement('p');
                            rating.setAttribute('class', 'star_rating');
                            rating.innerHTML = '<img src="imgs/star_icon.png">' + json.items[i].relevance;
                            divouter.appendChild(rating);
                        }

                        var name = document.createElement('span');
                        name.setAttribute('class', 'ff-name');
                        name.innerText = screenname;
                        divouter.appendChild(name);

                        var p = document.createElement('p');
                        p.innerHTML = title;
                        p.setAttribute('class', 'title');
                        divouter.appendChild(p);

                        var menu_actions = document.createElement('div');
                        menu_actions.setAttribute('class', 'menu_actions');
                        divouter.appendChild(menu_actions);

                        var menu_icons = document.createElement('div');
                        menu_icons.setAttribute('class', 'menu_icons');
                        divouter.appendChild(menu_icons);

                        menu_actions.innerHTML = '<p class="rate_menu">Click to Rate</p>';
                        menu_icons.innerHTML = '<span class="close_menu">×</span><ul class="tabs"><li class="current"><a class="rate" href="javascript:void(0)"><img src="imgs/star-16-white.png">Rate</a></li><li><a class="exclude" href="javascript:void(0)"><img src="imgs/delete-16-gray.png">Exclude</a></li></ul><div class="rate_tab"><div class="relevance_slider"></div><button type="button" class="btn btn-secondary rate_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="refresh"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="refresh_but">Refresh?</span></p></div></div><div class="exclude_tab"><div class="exclude_buttons"><input id="exclude_user_' + uid + '" type="radio" name="remove_' + id + '" value="user"><label for="exclude_user_' + uid + '">Exclude User</label> <input id="exclude_item_' + id + '" type="radio" name="remove_' + id + '" value="item" checked> <label for="exclude_item_' + id + '">Exclude Item</label></div><button type="button" class="btn btn-secondary exclude_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="remove"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="remove_but">Remove item(s)</span> or <span class="undo_but">Undo?</span></p></div></div></div>';


                        var colored = document.createElement('div');
                        colored.setAttribute('class', colorclass);
                        divouter.appendChild(colored);

                        var icon = document.createElement('img');
                        icon.setAttribute('class', 'icon');
                        icon.setAttribute('src', iconsource);
                        divouter.appendChild(icon);

                        var icon2outer = document.createElement('div');
                        icon2outer.setAttribute('class', 'icon2outer');
                        icon2outer.setAttribute('style', style_icon);
                        if (typeof InstallTrigger !== 'undefined') {
                            if (style_icon !== "") {
                                icon2outer.setAttribute('style', 'top:37px;');
                            }
                            else {
                                icon2outer.setAttribute('style', 'top:55px;');
                            }
                        }
                        icon2outer.setAttribute('onclick', 'redirect("' + page + '");');
                        a.appendChild(icon2outer);

                        var icon2 = document.createElement('img');
                        icon2.setAttribute('class', 'icon2');
                        icon2.setAttribute('src', 'imgs/redirect-24.png');
                        icon2outer.appendChild(icon2);

                        var timestamp = document.createElement('p');
                        timestamp.innerHTML = time;
                        timestamp.setAttribute('class', 'time');
                        divouter.appendChild(timestamp);

                        var sharedvalue = document.createElement('p');
                        sharedvalue.innerHTML = shared;
                        sharedvalue.setAttribute('class', 'shared');
                        divouter.appendChild(sharedvalue);

                    } else {
                        li.setAttribute('class', 'media_item');
                        if (json.items[i].mediaType === "image") {
                            thumb = json.items[i].mediaUrl;
                        } else {
                            thumb = json.items[i].thumbnail;
                        }

                        var a = document.createElement('a');
                        a.setAttribute('href', thumb);
                        a.setAttribute('onclick', 'return false;');
                        a.setAttribute('rel', 'lightbox');
                        a.setAttribute('rev', '<div style="display:none" class="redirect">' + page + '</div><p class="lbp">' + screenname + '</p><img class="lbimg" src="' + profileimage + '"width=50 height=50 onerror="' + onerror + '" data-link="' + userpage + '"><p class="lbp2">' + title + '</p><p class="lbp3">' + shared + '</p><p class="lbp4">  ' + time + '</p>');
                        divouter.appendChild(a);

                        var img = document.createElement('img');
                        img.setAttribute('src', thumb);
                        img.setAttribute('width', '195');
                        img.setAttribute('onerror', 'imgError1(this);');
                        a.appendChild(img);

                        var profile = document.createElement('img');
                        profile.setAttribute('src', profileimage);
                        profile.setAttribute('class', 'ff-userpic');
                        profile.setAttribute('style', style_favicon);
                        profile.setAttribute('onerror', onerror);
                        profile.setAttribute('onclick', 'redirect("' + userpage + '")');
                        divouter.appendChild(profile);

                        if (json.items[i].hasOwnProperty('relevance')) {
                            var rating = document.createElement('p');
                            rating.setAttribute('class', 'star_rating star_rating_media');
                            rating.innerHTML = '<img src="imgs/star_icon.png">' + json.items[i].relevance
                            divouter.appendChild(rating);
                        }

                        var name = document.createElement('span');
                        name.setAttribute('class', 'ff-name');
                        name.innerText = screenname;
                        divouter.appendChild(name);

                        var p = document.createElement('p');
                        p.innerHTML = title;
                        p.setAttribute('class', 'title');
                        divouter.appendChild(p);

                        var menu_actions = document.createElement('div');
                        menu_actions.setAttribute('class', 'menu_actions');
                        divouter.appendChild(menu_actions);

                        var menu_icons = document.createElement('div');
                        menu_icons.setAttribute('class', 'menu_icons');
                        divouter.appendChild(menu_icons);

                        menu_actions.innerHTML = '<p class="rate_menu">Click to Rate</p>';
                        menu_icons.innerHTML = '<span class="close_menu">×</span><ul class="tabs"><li class="current"><a class="rate" href="javascript:void(0)"><img src="imgs/star-16-white.png">Rate</a></li><li><a class="exclude" href="javascript:void(0)"><img src="imgs/delete-16-gray.png">Exclude</a></li></ul><div class="rate_tab"><div class="relevance_slider"></div><button type="button" class="btn btn-secondary rate_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="refresh"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="refresh_but">Refresh?</span></p></div></div><div class="exclude_tab"><div class="exclude_buttons"><input id="exclude_user_' + uid + '" type="radio" name="remove_' + id + '" value="user"><label for="exclude_user_' + uid + '">Exclude User</label> <input id="exclude_item_' + id + '" type="radio" name="remove_' + id + '" value="item" checked> <label for="exclude_item_' + id + '">Exclude Item</label></div><button type="button" class="btn btn-secondary exclude_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="remove"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="remove_but">Remove item(s)</span> or <span class="undo_but">Undo?</span></p></div></div></div>';


                        var colored = document.createElement('div');
                        colored.setAttribute('class', colorclass);
                        divouter.appendChild(colored);

                        var icon = document.createElement('img');
                        icon.setAttribute('class', 'icon');
                        icon.setAttribute('src', iconsource);
                        divouter.appendChild(icon);

                        var icon2outer = document.createElement('div');
                        icon2outer.setAttribute('class', 'icon2outer');
                        icon2outer.setAttribute('onclick', 'redirect("' + page + '");');
                        icon2outer.setAttribute('style', 'top:-17px;');
                        a.appendChild(icon2outer);

                        var icon2 = document.createElement('img');
                        icon2.setAttribute('class', 'icon2');
                        icon2.setAttribute('src', 'imgs/redirect-24.png');
                        icon2outer.appendChild(icon2);

                        var timestamp = document.createElement('p');
                        timestamp.innerHTML = time;
                        timestamp.setAttribute('class', 'time');
                        divouter.appendChild(timestamp);

                        var sharedvalue = document.createElement('p');
                        sharedvalue.innerHTML = shared;
                        sharedvalue.setAttribute('class', 'shared');
                        divouter.appendChild(sharedvalue);

                    }
                }

                var $posts_info = $('#posts_info');
                var $tiles_li = $('#tiles > li');
                switch (sort_param) {
                    case "recency":
                        $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                        break;
                    case "popularity":
                        $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most popular.');
                        break;
                    case "relevance":
                        $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most relevant.');
                        break;
                    default:
                        $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                }

                if (json.items.length === 5) {
                    loadimage(0, "latest", pagenum);
                }

                if ((json.items.length >= 0) && (json.items.length < 5)) {
                    loadimage(1, "dummylatest", pagenum);
                    $(window).unbind('.more_latest');
                }

                if ((json.items.length === 0) && (pagenum === 1)) {
                    $("#loading,#posts_info").hide();//+ "&user=" + user_query_param
                    if ((keyword_query_param !== "") && (user_query_param !== "")) {
                        $('#myModal h1').html("No results!");
                        $('#myModal p').html("There are no results for this keyword and user combination");
                        $('#myModal').reveal();
                        loadimage(99, keyword_query_param + "----------" + user_query_param, 12);
                    }
                    else if (keyword_query_param !== "") {
                        $('#myModal h1').html("No results!");
                        $('#myModal p').html("There are no results for this keyword");
                        $('#myModal').reveal();
                        loadimage(98, keyword_query_param, 12);
                    }
                    else if (user_query_param !== "") {
                        $('#myModal h1').html("No results!");
                        $('#myModal p').html("There are no results for this user");
                        $('#myModal').reveal();
                        loadimage(97, user_query_param, 12);
                    }
                    else {
                        $('#myModal h1').html("No results!");
                        $('#myModal p').html("The internet is not talking about that collection.");
                        $('#myModal').reveal();
                        loadimage(1, "dummylatest", pagenum);
                    }

                }
            }
        },
        async: true
    });
}

function parse_latest_list(pagenum) {
    var items = $('.active_items').text();
    $('#list_actions,#deleted_msg_user,#deleted_msg_post').slideUp(500);
    $('#list_table').animate({'margin-top': 0}, 500);
    $('tbody tr:hidden').remove();
    $.ajax({
        type: "GET",
        url: api_folder + "items?collection=" + collection_param + "&nPerPage=" + items + "&user=" + user_query_param + "&pageNumber=" + pagenum + "&relevance=" + relevance_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&source=" + source_param + "&unique=" + unique_param + "&sort=" + sort_param + "&language=" + language_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            if (pagelocation === "latest") {
                var $update_field = $("#update_field");
                $("#loading").hide();
                if ((json.items.length === 0) && (pagenum === 1)) {
                    $update_field.html("Last item in current view: -");
                    var $myModal = $('#myModal');
                    var $end = $('#end');
                    $('.list_table,#posts_info,#download_icon,.well').hide();
                    if ((keyword_query_param !== "") && (user_query_param !== "")) {
                        $myModal.find('h1').html("No results!");
                        $myModal.find('p').html("The internet is not talking about this keyword and user combination.");
                        $myModal.reveal();
                        $end.find('p').html("No items for keyword:<span style='color:red'> " + keyword_query_param + "</span> combined with user:<span style='color:red'> " + user_query_param + "</span>");
                        $end.show();
                    }
                    else if (keyword_query_param !== "") {
                        $myModal.find('h1').html("No results!");
                        $myModal.find('p').html("The internet is not talking about this keyword.");
                        $myModal.reveal();
                        $end.find('p').html("No items for keyword:<span style='color:red'> " + keyword_query_param + "</span>");
                        $end.show();
                    }
                    else if (user_query_param !== "") {
                        $myModal.find('h1').html("No results!");
                        $myModal.find('p').html("The internet is not talking about this user.");
                        $myModal.reveal();
                        $end.find('p').html("No items for user:<span style='color:red'> " + user_query_param + "</span>");
                        $end.show();
                    }
                    else {
                        $myModal.find('h1').html("No results!");
                        $myModal.find('p').html("The internet is not talking about that collection.");
                        $myModal.reveal();
                        $end.find('p').html("No more results");
                        $end.show();
                    }
                }
                else {
                    if (pagenum === 1) {

                        var publicationTime_list = json.items[0].publicationTime;
                        var time_list = publicationTime_list / 1000;
                        var range = "minutes";
                        var seconds = parseInt(new Date().getTime() / 1000);
                        var now = seconds - time_list;
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
                        $update_field.html("Last item in current view:&nbsp;" + now + "&nbsp;" + range + " ago");
                    }
                    var first_but, prev_but, next_but, last_but;
                    first_but = "First";
                    prev_but = "Previous";
                    next_but = "Next";
                    last_but = "Last";
                    var title, source, publicationTime, shared, shared_order, relevance_order, screenname, profileimage, page, userpage, thumb, colorclass, iconsource, onerror, uid, id, language;
                    var $pagination_list = $('#pagination_list');
                    $('.list_table,#posts_info,#download_icon,.well').show();
                    if ($pagination_list.data("twbs-pagination")) {
                        $pagination_list.twbsPagination('destroy');
                    }
                    $pagination_list.twbsPagination({
                        totalPages: Math.ceil(json.total / json.nPerPage),
                        initiateStartPageClick: false,
                        startPage: pagenum,
                        first: first_but,
                        prev: prev_but,
                        next: next_but,
                        last: last_but,
                        onPageClick: function (event, page) {
                            $(".list_table tbody").empty();
                            $('.well,#posts_info,#download_icon').hide();
                            $('#loading').show();
                            parse_latest_list(page);
                        }
                    });
                    $("#languages").empty();
                    for (var l = 0, count, lang; l < json.languages.length; l++) {
                        lang = json.languages[l].field;
                        count = json.languages[l].count;
                        $("#languages").append('<li class="sub1"><a href="#">' + lang.toUpperCase() + ' <span class="label">' + nFormatter(count) + '</span></a></li>')
                    }
                    $(".sub1").each(function () {
                        $this_a = $(this).find('a');
                        if ($this_a.text().split(' ')[0].toLowerCase() === language_param) {
                            $this_a.addClass('activelan');
                            return false;
                        }
                    });
                    $("#topics").empty();
                    var $topics = json.topics;
                    for (var t = 0, items, label, query; t < $topics.length; t++) {
                        label = $topics[t].label;
                        items = $topics[t].items;
                        query = $topics[t].query;
                        $("#topics").append('<li class="sub5"><a href="#"><p data-query="' + query + '">' + label + '</p><span class="label">' + nFormatter(items) + '</span></a></li>');
                    }
                    $(".sub5").each(function () {
                        $this_a = $(this).find('a');
                        var $this_p = $this_a.find('p');
                        if ($this_p.data("query") === topic_param) {
                            $this_a.addClass('activelan');
                            return false;
                        }
                    });
                    for (var i = 0; i < json.items.length; i++) {

                        uid = json.items[i].user.id;
                        id = json.items[i].id;
                        title = json.items[i].title.replace(/"/g, "\'");
                        if (title === "") {
                            title = "-";
                        }
                        source = json.items[i].source;
                        publicationTime = json.items[i].publicationTime;
                        language = json.items[i].language;
                        screenname = json.items[i].user.username;

                        if (json.items[i].hasOwnProperty('pageUrl')) {
                            page = json.items[i].pageUrl;
                        } else {
                            page = "404.html";
                        }

                        if (json.items[i].user.hasOwnProperty('pageUrl')) {
                            userpage = json.items[i].user.pageUrl;
                        } else {
                            userpage = "404.html";
                        }

                        profileimage = json.items[i].user.profileImage;
                        if (profileimage === "imgs/noprofile.gif") {
                            profileimage = "http://getfavicon.appspot.com/" + page;
                        }
                        relevance_order = 0;
                        if (json.items[i].hasOwnProperty('relevance')) {
                            relevance_order = json.items[i].relevance;
                        }
                        onerror = false;
                        switch (source) {
                            case "Youtube":
                                shared = nFormatter(json.items[i].views) + " views";
                                shared_order = json.items[i].views;
                                screenname = json.items[i].user.name;
                                iconsource = 'imgs/youtube-16-color.png';
                                colorclass = 'avatar-source youtubecolor';
                                break;
                            case "Twitter":
                                shared = nFormatter(json.items[i].shares) + " retweets";
                                shared_order = json.items[i].shares;
                                iconsource = 'imgs/twitter-16-color.png';
                                colorclass = 'avatar-source twittercolor';
                                onerror = true;
                                break;
                            case "Flickr":
                                shared = nFormatter(json.items[i].views) + " views";
                                shared_order = json.items[i].views;
                                iconsource = 'imgs/flickr-16-color.png';
                                colorclass = 'avatar-source flickrcolor';
                                break;
                            case "Facebook":
                                shared = nFormatter(json.items[i].shares) + " shares";
                                shared_order = json.items[i].shares;
                                iconsource = 'imgs/facebook-16-color.png';
                                colorclass = 'avatar-source facebookcolor';
                                break;
                            case "GooglePlus":
                                shared = nFormatter(json.items[i].shares) + " shares";
                                shared_order = json.items[i].shares;
                                iconsource = 'imgs/google+-16-color.png';
                                colorclass = 'avatar-source googlecolor';
                                break;
                            case "RSS":
                                shared = nFormatter(json.items[i].shares) + " shares";
                                shared_order = json.items[i].shares;
                                screenname = json.items[i].user.name;
                                profileimage = 'http://www.google.com/s2/favicons?domain=' + userpage;
                                iconsource = 'imgs/rss-16-color.png';
                                colorclass = 'avatar-source rsscolor';
                                break;
                            default:
                                shared = "0 views";
                                shared_order = 0;
                                iconsource = 'imgs/rss-16-color.png';
                                colorclass = 'avatar-source rsscolor';
                        }
                        if (onerror) {
                            onerror = "imgError2(this,'Twitter','" + json.items[i].user.username + "');"
                        }
                        else {
                            onerror = "imgError2(this,null,null);"
                        }

                        var display_time = new Date(publicationTime * 1);
                        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        var year = display_time.getUTCFullYear();
                        var month = months[display_time.getUTCMonth()];
                        var date = display_time.getUTCDate();
                        var hours = pad(display_time.getUTCHours());
                        var minutes = pad(display_time.getUTCMinutes());
                        var time = date + ' ' + month + ' ' + year + ' <span style\'color: #676a6c;font-weight: bold\'>at</span> ' + hours + ':' + minutes;

                        var td_selection = '<td><div class="checkbox_table"><input type="checkbox" value="1" id="checkbox_table' + i + '" name=""><label for="checkbox_table' + i + '"></label></div></td>';
                        var td_user = '<td data-order="' + screenname + '"><div class="list_avatar"><div class="avatar_wrapper"><img src="' + profileimage + '" class="img-avatar" onerror="' + onerror + '" onclick="redirect(\'' + userpage + '\')"><span class="' + colorclass + '"></span></div><div class="avatar_name" onclick="redirect(\'' + userpage + '\')">' + screenname + '</div></div></td>';
                        var td_text = '<td data-order="' + title + '"><div class="list_title" data-redirect=' + page + '><p class="text_title">' + title + '</p></div></td>';
                        var td_date = ' <td data-order="' + display_time.getTime() + '"><div class="list_date">' + time + '</div></td>';
                        var td_source = ' <td data-order="' + source + '"><img class="list_source_icon" src="' + iconsource + '"></td>';
                        var td_popularity = ' <td data-order="' + shared_order + '"><div class="list_shares">' + shared + '</div></td>';
                        var td_relevance = ' <td data-order="' + relevance_order + '"><div class="relevance_changed"><img src="imgs/check-circle-16-green.png">Saved</div><div class="relevance_slider"></div></td>';
                        var td_url = ' <td data-order="' + page + '"><div class="list_shares">' + page + '</div></td>';

                        var td_media;
                        if (json.items[i].type === "item") {
                            td_media = '<td><span class="missing_media">-</span></td>';
                        }
                        else {
                            if (json.items[i].mediaType === "image") {
                                thumb = json.items[i].mediaUrl;
                            } else {
                                thumb = json.items[i].thumbnail;
                            }
                            td_media = '<td><a href="' + thumb + '" onclick="return false;" rel="lightbox" rev="<div style=\'display:none\' class=\'redirect\'>' + page + '</div><p class=\'lbp\'>' + screenname + '</p><img class=\'lbimg\' src=\'' + profileimage + '\' width=50 height=50 onerror=\'' + onerror + '\' data-link=\'' + userpage + '\'><p class=\'lbp2\'>' + title + '</p><p class=\'lbp3\'>' + shared + '</p><p class=\'lbp4\'>  ' + time + '</p>"><img class="list_media" src="' + thumb + '" width="24" onerror="imgError1(this);"></a></td>';
                        }
                        var td = td_selection + td_user + td_text + td_media + td_date + td_source + td_popularity + td_relevance + td_url;
                        $('.list_table tbody').append('<tr data-uid="' + uid + '" data-id="' + id + '">' + td + '</tr>');
                    }

                    var $posts_info = $('#posts_info');
                    var start_gap = ((pagenum - 1) * items) + 1;
                    switch (sort_param) {
                        case "recency":
                            $posts_info.html(json.total + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('.list_table tbody tr').length - 1) + '</span> most recent.');
                            break;
                        case "popularity":
                            $posts_info.html(json.total + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('.list_table tbody tr').length - 1) + '</span> most popular.');
                            break;
                        case "relevance":
                            $posts_info.html(json.total + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('.list_table tbody tr').length - 1) + '</span> most relevant.');
                            break;
                        default:
                            $posts_info.html(json.total + ' posts. Showing ' + start_gap + ' - ' + (start_gap + $('.list_table tbody tr').length - 1) + '</span> most recent.');
                    }
                    /*var $list_table = $("#list_table");
                    var column;
                    if ($('.tablesorter-headerAsc').length === 1) {
                        column = $('.tablesorter-headerAsc').index();
                        $list_table.trigger("destroy");
                        $list_table.tablesorter({
                            headers: {0: {sorter: false}, 2: {sorter: false},3: {sorter: false},5: {sorter: false},7: {sorter: false}},
                            sortList: [[column, 0]],
                            textExtraction: orderextraction
                        });
                    }
                    else if ($('.tablesorter-headerDesc').length === 1) {
                        column = $('.tablesorter-headerDesc').index();
                        $list_table.trigger("destroy");
                        $list_table.tablesorter({
                            headers: {0: {sorter: false}, 2: {sorter: false},3: {sorter: false},5: {sorter: false},7: {sorter: false}},
                            sortList: [[column, 1]],
                            textExtraction: orderextraction
                        });
                    }
                    else {
                        $list_table.trigger("destroy");
                        $list_table.tablesorter({
                            headers: {0: {sorter: false}, 2: {sorter: false},3: {sorter: false},5: {sorter: false},7: {sorter: false}},
                            textExtraction: orderextraction
                        });
                    }*/
                    var doubleLabels = [
                        "<i>1</i>",
                        "<i>2</i>",
                        "<i>3</i>",
                        "<i>4</i>",
                        "<i>5</i>"
                    ];
                    $(".relevance_slider")
                        .slider()
                        .slider("pips", "destroy");
                    $(".relevance_slider")
                        .slider({
                            max: 5,
                            min: 1,
                            animate: 400,
                            change: function (event, ui) {
                                if (event.originalEvent) {
                                    $('#deleted_msg_user,#deleted_msg_post').slideUp(500);
                                    $('tbody tr:hidden').remove();
                                    var $this = $(this);
                                    $(this).find('.ui-state-default').show();
                                    $this.parents('td').attr('data-order', ui.value);
                                    $("#list_table").trigger("update");
                                    var viewData = {
                                        "uid": user_id,
                                        "cid": collection_param,
                                        "iid": $(this).parents('tr').attr('data-id'),
                                        "relevance": ui.value
                                    };
                                    var data = JSON.stringify(viewData);
                                    $.ajax({
                                        type: 'POST',
                                        url: api_folder + 'relevance',
                                        data: data,
                                        success: function () {
                                            $this.siblings('.relevance_changed').slideDown(500, function () {
                                                $(this).delay(500).slideUp(500);
                                            });
                                        },
                                        error: function (e) {
                                        }
                                    });
                                }
                            }
                        })
                        .slider("pips", {
                            rest: "label",
                            labels: doubleLabels
                        });
                    $('.relevance_slider:not(".initiated")').each(function () {
                        $(this).addClass('initiated');
                        var score = $(this).parents('td').attr('data-order');
                        if (score == "0") {
                            $(this).slider("value", "1");
                            $(this).find('.ui-state-default').hide();
                            $(this).find('.ui-slider-pip-selected').removeClass('ui-slider-pip-selected');
                        }
                        else {
                            $(this).slider("value", score);
                        }
                    });
                }
            }
        },
        async: true
    });
}

function more_latest() {
    var pagenum = 10;
    $(window).unbind('.more_latest');
    $(window).bind("scroll.more_latest", function () {
        if ((($('#main').height()) + 53) <= ($(window).height() + $(window).scrollTop())) {
            $("#loadmore").show();
            pagenum++;
            $.ajax({
                type: "GET",
                url: api_folder + "items?collection=" + collection_param + "&nPerPage=5&pageNumber=" + pagenum + "&user=" + user_query_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&relevance=" + relevance_param + "&source=" + source_param + "&sort=" + sort_param + "&unique=" + unique_param + "&language=" + language_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
                dataType: "json",
                success: function (json) {
                    if (pagelocation === "latest") {
                        var end = 0;
                        var title, source, publicationTime, shared, screenname, profileimage, uid, id, relevance_score, page, userpage, thumb, colorclass, iconsource, onerror, style_favicon, style_icon, language;
                        for (var i = 0; i < json.items.length; i++) {

                            title = json.items[i].title;

                            if (title === "") {
                                title = "-";
                            }
                            style_favicon = "";
                            style_icon = "";
                            source = json.items[i].source;
                            publicationTime = json.items[i].publicationTime;
                            language = json.items[i].language;
                            screenname = json.items[i].user.username;
                            relevance_score = "0";
                            if (json.items[i].hasOwnProperty('relevance')) {
                                relevance_score = json.items[i].relevance;
                            }
                            profileimage = json.items[i].user.profileImage;
                            id = json.items[i].id.replace(/#/g, "%23");
                            uid = json.items[i].user.id;

                            if (json.items[i].hasOwnProperty('pageUrl')) {
                                page = json.items[i].pageUrl;
                            } else {
                                page = "404.html";
                            }

                            if (json.items[i].user.hasOwnProperty('pageUrl')) {
                                userpage = json.items[i].user.pageUrl;
                            } else {
                                userpage = "404.html";
                            }
                            onerror = false;
                            switch (source) {
                                case "Youtube":
                                    shared = nFormatter(json.items[i].views) + " views";
                                    screenname = json.items[i].user.name;
                                    iconsource = 'imgs/youtube-16-black.png';
                                    colorclass = 'color youtubecolor';
                                    break;
                                case "Twitter":
                                    shared = nFormatter(json.items[i].shares) + " retweets";
                                    iconsource = 'imgs/twitter-16-black.png';
                                    colorclass = 'color twittercolor';
                                    onerror = true;
                                    break;
                                case "Flickr":
                                    shared = nFormatter(json.items[i].views) + " views";
                                    iconsource = 'imgs/flickr-16-black.png';
                                    colorclass = 'color flickrcolor';
                                    break;
                                case "Facebook":
                                    shared = nFormatter(json.items[i].shares) + " shares";
                                    iconsource = 'imgs/facebook-16-black.png';
                                    colorclass = 'color facebookcolor';
                                    break;
                                case "GooglePlus":
                                    shared = nFormatter(json.items[i].shares) + " shares";
                                    iconsource = 'imgs/google+-16-black.png';
                                    colorclass = 'color googlecolor';
                                    break;
                                case "RSS":
                                    shared = nFormatter(json.items[i].shares) + " shares";
                                    screenname = json.items[i].user.name;
                                    profileimage = 'http://www.google.com/s2/favicons?domain=' + userpage;
                                    style_favicon = "width:32px;height:32px;";
                                    style_icon = "top:37px";
                                    iconsource = 'imgs/rss-16-black.png';
                                    colorclass = 'color rsscolor';
                                    break;
                                default:
                                    shared = "0 views";
                                    iconsource = 'imgs/rss-16-black.png';
                                    colorclass = 'color rsscolor';
                            }
                            if (onerror) {
                                onerror = "imgError2(this,'Twitter','" + json.items[i].user.username + "');"
                            }
                            else {
                                onerror = "imgError2(this,null,null);"
                            }

                            var display_time = new Date(publicationTime * 1);
                            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            var year = display_time.getUTCFullYear();
                            var month = months[display_time.getUTCMonth()];
                            var date = display_time.getUTCDate();
                            var time = date + ' ' + month + ' ' + year;

                            var titles = document.getElementById("tiles");
                            var li = document.createElement('li');
                            li.setAttribute('data-iid', id);
                            li.setAttribute('data-time', '' + publicationTime / 1000);
                            li.setAttribute('data-uid', uid);
                            li.setAttribute('data-score', relevance_score);
                            titles.appendChild(li);

                            var divouter = document.createElement('div');
                            divouter.setAttribute('class', 'outer');
                            li.appendChild(divouter);

                            if (profileimage === "imgs/noprofile.gif") {
                                profileimage = "http://getfavicon.appspot.com/" + page;
                            }

                            if (json.items[i].type === "item") {
                                li.setAttribute('class', 'text_item');
                                var a = document.createElement('a');
                                a.setAttribute('href', '#');
                                a.setAttribute('onclick', 'return false;');
                                a.setAttribute('style', 'cursor:default');
                                divouter.appendChild(a);

                                var profile = document.createElement('img');
                                profile.setAttribute('src', profileimage);
                                profile.setAttribute('class', 'ff-userpic');
                                profile.setAttribute('style', 'margin: -15px auto 0;' + style_favicon);
                                profile.setAttribute('onerror', onerror);
                                profile.setAttribute('onclick', 'redirect("' + userpage + '")');
                                divouter.appendChild(profile);

                                if (json.items[i].hasOwnProperty('relevance')) {
                                    var rating = document.createElement('p');
                                    rating.setAttribute('class', 'star_rating');
                                    rating.innerHTML = '<img src="imgs/star_icon.png">' + json.items[i].relevance
                                    divouter.appendChild(rating);
                                }

                                var name = document.createElement('span');
                                name.setAttribute('class', 'ff-name');
                                name.innerText = screenname;
                                divouter.appendChild(name);

                                var p = document.createElement('p');
                                p.innerHTML = title;
                                p.setAttribute('class', 'title');
                                divouter.appendChild(p);

                                var menu_actions = document.createElement('div');
                                menu_actions.setAttribute('class', 'menu_actions');
                                divouter.appendChild(menu_actions);

                                var menu_icons = document.createElement('div');
                                menu_icons.setAttribute('class', 'menu_icons');
                                divouter.appendChild(menu_icons);

                                menu_actions.innerHTML = '<p class="rate_menu">Click to Rate</p>';
                                menu_icons.innerHTML = '<span class="close_menu">×</span><ul class="tabs"><li class="current"><a class="rate" href="javascript:void(0)"><img src="imgs/star-16-white.png">Rate</a></li><li><a class="exclude" href="javascript:void(0)"><img src="imgs/delete-16-gray.png">Exclude</a></li></ul><div class="rate_tab"><div class="relevance_slider"></div><button type="button" class="btn btn-secondary rate_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="refresh"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="refresh_but">Refresh?</span></p></div></div><div class="exclude_tab"><div class="exclude_buttons"><input id="exclude_user_' + uid + '" type="radio" name="remove_' + id + '" value="user"><label for="exclude_user_' + uid + '">Exclude User</label> <input id="exclude_item_' + id + '" type="radio" name="remove_' + id + '" value="item" checked> <label for="exclude_item_' + id + '">Exclude Item</label></div><button type="button" class="btn btn-secondary exclude_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="remove"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="remove_but">Remove item(s)</span> or <span class="undo_but">Undo?</span></p></div></div></div>';

                                var colored = document.createElement('div');
                                colored.setAttribute('class', colorclass);
                                divouter.appendChild(colored);

                                var icon = document.createElement('img');
                                icon.setAttribute('class', 'icon');
                                icon.setAttribute('src', iconsource);
                                divouter.appendChild(icon);

                                var icon2outer = document.createElement('div');
                                icon2outer.setAttribute('style', style_icon);
                                icon2outer.setAttribute('class', 'icon2outer');
                                if (typeof InstallTrigger !== 'undefined') {
                                    if (typeof InstallTrigger !== 'undefined') {
                                        if (style_icon !== "") {
                                            icon2outer.setAttribute('style', 'top:37px;');
                                        }
                                        else {
                                            icon2outer.setAttribute('style', 'top:55px;');
                                        }
                                    }
                                }
                                icon2outer.setAttribute('onclick', 'redirect("' + page + '");');
                                a.appendChild(icon2outer);

                                var icon2 = document.createElement('img');
                                icon2.setAttribute('class', 'icon2');
                                icon2.setAttribute('src', 'imgs/redirect-24.png');
                                icon2outer.appendChild(icon2);

                                var timestamp = document.createElement('p');
                                timestamp.innerHTML = time;
                                timestamp.setAttribute('class', 'time');
                                divouter.appendChild(timestamp);

                                var sharedvalue = document.createElement('p');
                                sharedvalue.innerHTML = shared;
                                sharedvalue.setAttribute('class', 'shared');
                                divouter.appendChild(sharedvalue);

                            }
                            else {
                                li.setAttribute('class', 'media_item');
                                if (json.items[i].mediaType === "image") {
                                    thumb = json.items[i].mediaUrl;
                                } else {
                                    thumb = json.items[i].thumbnail;
                                }

                                var a = document.createElement('a');
                                a.setAttribute('href', thumb);
                                a.setAttribute('onclick', 'return false;');
                                a.setAttribute('rel', 'lightbox');
                                a.setAttribute('rev', '<div style="display:none" class="redirect">' + page + '</div><p class="lbp">' + screenname + '</p><img class="lbimg" src="' + profileimage + '"width=50 height=50 onerror="' + onerror + '" data-link="' + userpage + '"><p class="lbp2">' + title + '</p><p class="lbp3">' + shared + '</p><p class="lbp4">  ' + time + '</p>');
                                divouter.appendChild(a);

                                var img = document.createElement('img');
                                img.setAttribute('src', thumb);
                                img.setAttribute('width', '195');
                                img.setAttribute('onerror', 'imgError1(this);');
                                a.appendChild(img);

                                var profile = document.createElement('img');
                                profile.setAttribute('src', profileimage);
                                profile.setAttribute('class', 'ff-userpic');
                                profile.setAttribute('style', style_favicon);
                                profile.setAttribute('onerror', onerror);
                                profile.setAttribute('onclick', 'redirect("' + userpage + '")');
                                divouter.appendChild(profile);

                                if (json.items[i].hasOwnProperty('relevance')) {
                                    var rating = document.createElement('p');
                                    rating.setAttribute('class', 'star_rating star_rating_media');
                                    rating.innerHTML = '<img src="imgs/star_icon.png">' + json.items[i].relevance
                                    divouter.appendChild(rating);
                                }

                                var name = document.createElement('span');
                                name.setAttribute('class', 'ff-name');
                                name.innerText = screenname;
                                divouter.appendChild(name);

                                var p = document.createElement('p');
                                p.innerHTML = title;
                                p.setAttribute('class', 'title');
                                divouter.appendChild(p);

                                var menu_actions = document.createElement('div');
                                menu_actions.setAttribute('class', 'menu_actions');
                                divouter.appendChild(menu_actions);

                                var menu_icons = document.createElement('div');
                                menu_icons.setAttribute('class', 'menu_icons');
                                divouter.appendChild(menu_icons);

                                menu_actions.innerHTML = '<p class="rate_menu">Click to Rate</p>';
                                menu_icons.innerHTML = '<span class="close_menu">×</span><ul class="tabs"><li class="current"><a class="rate" href="javascript:void(0)"><img src="imgs/star-16-white.png">Rate</a></li><li><a class="exclude" href="javascript:void(0)"><img src="imgs/delete-16-gray.png">Exclude</a></li></ul><div class="rate_tab"><div class="relevance_slider"></div><button type="button" class="btn btn-secondary rate_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="refresh"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="refresh_but">Refresh?</span></p></div></div><div class="exclude_tab"><div class="exclude_buttons"><input id="exclude_user_' + uid + '" type="radio" name="remove_' + id + '" value="user"><label for="exclude_user_' + uid + '">Exclude User</label> <input id="exclude_item_' + id + '" type="radio" name="remove_' + id + '" value="item" checked> <label for="exclude_item_' + id + '">Exclude Item</label></div><button type="button" class="btn btn-secondary exclude_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="remove"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="remove_but">Remove item(s)</span> or <span class="undo_but">Undo?</span></p></div></div></div>';

                                var colored = document.createElement('div');
                                colored.setAttribute('class', colorclass);
                                divouter.appendChild(colored);

                                var icon = document.createElement('img');
                                icon.setAttribute('class', 'icon');
                                icon.setAttribute('src', iconsource);
                                divouter.appendChild(icon);

                                var icon2outer = document.createElement('div');
                                icon2outer.setAttribute('class', 'icon2outer');
                                icon2outer.setAttribute('onclick', 'redirect("' + page + '");');
                                icon2outer.setAttribute('style', 'top:-17px;');
                                a.appendChild(icon2outer);

                                var icon2 = document.createElement('img');
                                icon2.setAttribute('class', 'icon2');
                                icon2.setAttribute('src', 'imgs/redirect-24.png');
                                icon2outer.appendChild(icon2);

                                var timestamp = document.createElement('p');
                                timestamp.innerHTML = time;
                                timestamp.setAttribute('class', 'time');
                                divouter.appendChild(timestamp);

                                var sharedvalue = document.createElement('p');
                                sharedvalue.innerHTML = shared;
                                sharedvalue.setAttribute('class', 'shared');
                                divouter.appendChild(sharedvalue);

                            }
                        }
                        var $posts_info = $('#posts_info');
                        var $tiles_li = $('#tiles > li');
                        switch (sort_param) {
                            case "recency":
                                $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                                break;
                            case "popularity":
                                $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most popular.');
                                break;
                            case "relevance":
                                $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most relevant.');
                                break;
                            default:
                                $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + '</span> most recent.');
                        }
                        if (json.items.length === 0) {
                            end = 1;
                            $(window).unbind('.more_latest');
                        }
                        loadimage(end, "dummylatest", pagenum);
                    }
                }
                ,
                async: true
            });


        }
    });
}

function parse_new(count) {
    $.ajax({
        type: "GET",
        url: api_folder + "items?collection=" + collection_param + "&nPerPage=" + count + "&pageNumber=1&q=" + keyword_query_param + "&user=" + user_query_param + "&source=" + source_param + "&relevance=" + relevance_param + "&relevance=" + relevance_param + "&sort=" + sort_param + "&language=" + language_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            if (pagelocation === "latest") {
                var title, source, publicationTime, shared, screenname, profileimage, uid, id, relevance_score, page, userpage, thumb, colorclass, iconsource, onerror, style_favicon, style_icon, language;
                for (var i = 0; i < json.items.length; i++) {
                    title = json.items[i].title;
                    if (title === "") {
                        title = "-";
                    }
                    style_favicon = "";
                    style_icon = "";
                    source = json.items[i].source;
                    publicationTime = json.items[i].publicationTime;
                    language = json.items[i].language;
                    screenname = json.items[i].user.username;
                    relevance_score = "0";
                    if (json.items[i].hasOwnProperty('relevance')) {
                        relevance_score = json.items[i].relevance;
                    }
                    profileimage = json.items[i].user.profileImage;
                    id = json.items[i].id.replace(/#/g, "%23");
                    uid = json.items[i].user.id;
                    if (json.items[i].hasOwnProperty('pageUrl')) {
                        page = json.items[i].pageUrl;
                    } else {
                        page = "404.html";
                    }

                    if (json.items[i].user.hasOwnProperty('pageUrl')) {
                        userpage = json.items[i].user.pageUrl;
                    } else {
                        userpage = "404.html";
                    }
                    onerror = false;
                    switch (source) {
                        case "Youtube":
                            shared = nFormatter(json.items[i].views) + " views";
                            screenname = json.items[i].user.name;
                            iconsource = 'imgs/youtube-16-black.png';
                            colorclass = 'color youtubecolor';
                            break;
                        case "Twitter":
                            shared = nFormatter(json.items[i].shares) + " retweets";
                            iconsource = 'imgs/twitter-16-black.png';
                            colorclass = 'color twittercolor';
                            onerror = true;
                            break;
                        case "Flickr":
                            shared = nFormatter(json.items[i].views) + " views";
                            iconsource = 'imgs/flickr-16-black.png';
                            colorclass = 'color flickrcolor';
                            break;
                        case "Facebook":
                            shared = nFormatter(json.items[i].shares) + " shares";
                            iconsource = 'imgs/facebook-16-black.png';
                            colorclass = 'color facebookcolor';
                            break;
                        case "GooglePlus":
                            shared = nFormatter(json.items[i].shares) + " shares";
                            iconsource = 'imgs/google+-16-black.png';
                            colorclass = 'color googlecolor';
                            break;
                        case "RSS":
                            shared = nFormatter(json.items[i].shares) + " shares";
                            screenname = json.items[i].user.name;
                            profileimage = 'http://www.google.com/s2/favicons?domain=' + userpage;
                            style_favicon = "width:32px;height:32px;";
                            style_icon = "top:37px";
                            iconsource = 'imgs/rss-16-black.png';
                            colorclass = 'color rsscolor';
                            break;
                        default:
                            shared = "0 views";
                            iconsource = 'imgs/rss-16-black.png';
                            colorclass = 'color rsscolor';
                    }
                    if (onerror) {
                        onerror = "imgError2(this,'Twitter','" + json.items[i].user.username + "');"
                    }
                    else {
                        onerror = "imgError2(this,null,null);"
                    }

                    var display_time = new Date(publicationTime * 1);
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    var year = display_time.getUTCFullYear();
                    var month = months[display_time.getUTCMonth()];
                    var date = display_time.getUTCDate();
                    var time = date + ' ' + month + ' ' + year;

                    var titles = document.getElementById("tiles");
                    var li = document.createElement('li');
                    li.setAttribute('data-iid', id);
                    li.setAttribute('data-time', '' + publicationTime / 1000);
                    li.setAttribute('data-uid', uid);
                    li.setAttribute('data-score', relevance_score);
                    titles.insertBefore(li, titles.childNodes[0]);

                    var divouter = document.createElement('div');
                    divouter.setAttribute('class', 'outer');
                    li.appendChild(divouter);

                    if (profileimage === "imgs/noprofile.gif") {
                        profileimage = "http://getfavicon.appspot.com/" + page;
                    }

                    if (json.items[i].type === "item") {
                        li.setAttribute('class', 'text_item');
                        var a = document.createElement('a');
                        a.setAttribute('href', '#');
                        a.setAttribute('onclick', 'return false;');
                        a.setAttribute('style', 'cursor:default');
                        divouter.appendChild(a);

                        var profile = document.createElement('img');
                        profile.setAttribute('src', profileimage);
                        profile.setAttribute('class', 'ff-userpic');
                        profile.setAttribute('style', 'margin: -15px auto 0;' + style_favicon);
                        profile.setAttribute('onerror', onerror);
                        profile.setAttribute('onclick', 'redirect("' + userpage + '")');
                        divouter.appendChild(profile);

                        if (json.items[i].hasOwnProperty('relevance')) {
                            var rating = document.createElement('p');
                            rating.setAttribute('class', 'star_rating');
                            rating.innerHTML = '<img src="imgs/star_icon.png">' + json.items[i].relevance
                            divouter.appendChild(rating);
                        }

                        var name = document.createElement('span');
                        name.setAttribute('class', 'ff-name');
                        name.innerText = screenname;
                        divouter.appendChild(name);

                        var p = document.createElement('p');
                        p.innerHTML = title;
                        p.setAttribute('class', 'title');
                        divouter.appendChild(p);

                        var menu_actions = document.createElement('div');
                        menu_actions.setAttribute('class', 'menu_actions');
                        divouter.appendChild(menu_actions);

                        var menu_icons = document.createElement('div');
                        menu_icons.setAttribute('class', 'menu_icons');
                        divouter.appendChild(menu_icons);

                        menu_actions.innerHTML = '<p class="rate_menu">Click to Rate</p>';
                        menu_icons.innerHTML = '<span class="close_menu">×</span><ul class="tabs"><li class="current"><a class="rate" href="javascript:void(0)"><img src="imgs/star-16-white.png">Rate</a></li><li><a class="exclude" href="javascript:void(0)"><img src="imgs/delete-16-gray.png">Exclude</a></li></ul><div class="rate_tab"><div class="relevance_slider"></div><button type="button" class="btn btn-secondary rate_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="refresh"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="refresh_but">Refresh?</span></p></div></div><div class="exclude_tab"><div class="exclude_buttons"><input id="exclude_user_' + uid + '" type="radio" name="remove_' + id + '" value="user"><label for="exclude_user_' + uid + '">Exclude User</label> <input id="exclude_item_' + id + '" type="radio" name="remove_' + id + '" value="item" checked> <label for="exclude_item_' + id + '">Exclude Item</label></div><button type="button" class="btn btn-secondary exclude_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="remove"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="remove_but">Remove item(s)</span> or <span class="undo_but">Undo?</span></p></div></div></div>';

                        var colored = document.createElement('div');
                        colored.setAttribute('class', colorclass);
                        divouter.appendChild(colored);

                        var icon = document.createElement('img');
                        icon.setAttribute('class', 'icon');
                        icon.setAttribute('src', iconsource);
                        divouter.appendChild(icon);

                        var icon2outer = document.createElement('div');
                        icon2outer.setAttribute('class', 'icon2outer');
                        icon2outer.setAttribute('style', style_icon);
                        if (typeof InstallTrigger !== 'undefined') {
                            if (typeof InstallTrigger !== 'undefined') {
                                if (style_icon !== "") {
                                    icon2outer.setAttribute('style', 'top:37px;');
                                }
                                else {
                                    icon2outer.setAttribute('style', 'top:55px;');
                                }
                            }
                        }
                        icon2outer.setAttribute('onclick', 'redirect("' + page + '");');
                        a.appendChild(icon2outer);

                        var icon2 = document.createElement('img');
                        icon2.setAttribute('class', 'icon2');
                        icon2.setAttribute('src', 'imgs/redirect-24.png');
                        icon2outer.appendChild(icon2);

                        var timestamp = document.createElement('p');
                        timestamp.innerHTML = time;
                        timestamp.setAttribute('class', 'time');
                        divouter.appendChild(timestamp);

                        var sharedvalue = document.createElement('p');
                        sharedvalue.innerHTML = shared;
                        sharedvalue.setAttribute('class', 'shared');
                        divouter.appendChild(sharedvalue);

                    } else {
                        li.setAttribute('class', 'media_item');
                        if (json.items[i].mediaType === "image") {
                            thumb = json.items[i].mediaUrl;
                        } else {
                            thumb = json.items[i].thumbnail;
                        }

                        var a = document.createElement('a');
                        a.setAttribute('href', thumb);
                        a.setAttribute('onclick', 'return false;');
                        a.setAttribute('rel', 'lightbox');
                        a.setAttribute('rev', '<div style="display:none" class="redirect">' + page + '</div><p class="lbp">' + screenname + '</p><img class="lbimg" src="' + profileimage + '"width=50 height=50 onerror="' + onerror + '" data-link="' + userpage + '"><p class="lbp2">' + title + '</p><p class="lbp3">' + shared + '</p><p class="lbp4">  ' + time + '</p>');
                        divouter.appendChild(a);

                        var img = document.createElement('img');
                        img.setAttribute('src', thumb);
                        img.setAttribute('width', '195');
                        img.setAttribute('onerror', 'imgError1(this);');
                        a.appendChild(img);

                        var profile = document.createElement('img');
                        profile.setAttribute('src', profileimage);
                        profile.setAttribute('class', 'ff-userpic');
                        profile.setAttribute('style', style_favicon);
                        profile.setAttribute('onerror', onerror);
                        profile.setAttribute('onclick', 'redirect("' + userpage + '")');
                        divouter.appendChild(profile);

                        if (json.items[i].hasOwnProperty('relevance')) {
                            var rating = document.createElement('p');
                            rating.setAttribute('class', 'star_rating star_rating_media');
                            rating.innerHTML = '<img src="imgs/star_icon.png">' + json.items[i].relevance
                            divouter.appendChild(rating);
                        }

                        var name = document.createElement('span');
                        name.setAttribute('class', 'ff-name');
                        name.innerText = screenname;
                        divouter.appendChild(name);

                        var p = document.createElement('p');
                        p.innerHTML = title;
                        p.setAttribute('class', 'title');
                        divouter.appendChild(p);

                        var menu_actions = document.createElement('div');
                        menu_actions.setAttribute('class', 'menu_actions');
                        divouter.appendChild(menu_actions);

                        var menu_icons = document.createElement('div');
                        menu_icons.setAttribute('class', 'menu_icons');
                        divouter.appendChild(menu_icons);

                        menu_actions.innerHTML = '<p class="rate_menu">Click to Rate</p>';
                        menu_icons.innerHTML = '<span class="close_menu">×</span><ul class="tabs"><li class="current"><a class="rate" href="javascript:void(0)"><img src="imgs/star-16-white.png">Rate</a></li><li><a class="exclude" href="javascript:void(0)"><img src="imgs/delete-16-gray.png">Exclude</a></li></ul><div class="rate_tab"><div class="relevance_slider"></div><button type="button" class="btn btn-secondary rate_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="refresh"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="refresh_but">Refresh?</span></p></div></div><div class="exclude_tab"><div class="exclude_buttons"><input id="exclude_user_' + uid + '" type="radio" name="remove_' + id + '" value="user"><label for="exclude_user_' + uid + '">Exclude User</label> <input id="exclude_item_' + id + '" type="radio" name="remove_' + id + '" value="item" checked> <label for="exclude_item_' + id + '">Exclude Item</label></div><button type="button" class="btn btn-secondary exclude_save_but"><img src="imgs/save-white_16.png">SAVE</button><div class="remove"><img src="imgs/check-circle-16-green.png"><p>Changes Saved! <span class="remove_but">Remove item(s)</span> or <span class="undo_but">Undo?</span></p></div></div></div>';


                        var colored = document.createElement('div');
                        colored.setAttribute('class', colorclass);
                        divouter.appendChild(colored);

                        var icon = document.createElement('img');
                        icon.setAttribute('class', 'icon');
                        icon.setAttribute('src', iconsource);
                        divouter.appendChild(icon);

                        var icon2outer = document.createElement('div');
                        icon2outer.setAttribute('class', 'icon2outer');
                        icon2outer.setAttribute('onclick', 'redirect("' + page + '");');
                        icon2outer.setAttribute('style', 'top:-17px;');
                        a.appendChild(icon2outer);

                        var icon2 = document.createElement('img');
                        icon2.setAttribute('class', 'icon2');
                        icon2.setAttribute('src', 'imgs/redirect-24.png');
                        icon2outer.appendChild(icon2);

                        var timestamp = document.createElement('p');
                        timestamp.innerHTML = time;
                        timestamp.setAttribute('class', 'time');
                        divouter.appendChild(timestamp);

                        var sharedvalue = document.createElement('p');
                        sharedvalue.innerHTML = shared;
                        sharedvalue.setAttribute('class', 'shared');
                        divouter.appendChild(sharedvalue);

                    }
                }
                var $posts_info = $('#posts_info');
                var $tiles_li = $('#tiles > li');
                switch (sort_param) {
                    case "recency":
                        $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + ' most recent.');
                        break;
                    case "popularity":
                        $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + ' most popular.');
                        break;
                    case "relevance":
                        $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + ' most relevant.');
                        break;
                    default:
                        $posts_info.html(json.total + ' posts. Showing 1 - ' + $tiles_li.length + ' most recent.');
                }
                loadimage(2, "dummylatest", 12);
            }
        },
        async: true
    });
}
