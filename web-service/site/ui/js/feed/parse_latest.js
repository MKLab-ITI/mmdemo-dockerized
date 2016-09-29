function parse_latest(pagenum) {
    $.ajax({
        type: "GET",
        url: api_folder + "items?collection=" + collection_param + "&nPerPage=5&pageNumber=" + pagenum + "&q=" + query_param + "&source=" + source_param + "&unique=" + unique_param + "&sort=" + sort_param + "&language=" + language_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            if (pagelocation === "latest") {
                var title, source, publicationTime, shared, screenname, profileimage, id, page, userpage, thumb, colorclass, iconsource, onerror, style_favicon, style_icon;

                for (var i = 0; i < json.length; i++) {

                    title = json[i].title;

                    if (title === "") {
                        title = "-";
                    }
                    style_favicon = "";
                    style_icon = "";
                    source = json[i].source;
                    publicationTime = json[i].publicationTime;

                    screenname = json[i].user.username;

                    profileimage = json[i].user.profileImage;
                    id = json[i].id;

                    if (json[i].hasOwnProperty('pageUrl')) {
                        page = json[i].pageUrl;
                    } else {
                        page = "404.html";
                    }

                    if (json[i].user.hasOwnProperty('pageUrl')) {
                        userpage = json[i].user.pageUrl;
                    } else {
                        userpage = "404.html";
                    }
                    onerror = false;
                    switch (source) {
                        case "Youtube":
                            shared = nFormatter(json[i].views) + " views";
                            screenname = json[i].user.name;
                            iconsource = 'imgs/youtube-16-black.png';
                            colorclass = 'color youtubecolor';
                            break;
                        case "Twitter":
                            shared = nFormatter(json[i].shares) + " retweets";
                            iconsource = 'imgs/twitter-16-black.png';
                            colorclass = 'color twittercolor';
                            onerror = true;
                            break;
                        case "Flickr":
                            shared = nFormatter(json[i].views) + " views";
                            iconsource = 'imgs/flickr-16-black.png';
                            colorclass = 'color flickrcolor';
                            break;
                        case "Facebook":
                            shared = nFormatter(json[i].shares) + " shares";
                            iconsource = 'imgs/facebook-16-black.png';
                            colorclass = 'color facebookcolor';
                            break;
                        case "GooglePlus":
                            shared = nFormatter(json[i].shares) + " shares";
                            iconsource = 'imgs/google+-16-black.png';
                            colorclass = 'color googlecolor';
                            break;
                        case "Instagram":
                            shared = nFormatter(json[i].views) + " views";
                            iconsource = 'imgs/instagram-16-black.png';
                            colorclass = 'color instagramcolor';
                            break;
                        case "RSS":
                            shared = nFormatter(json[i].shares) + " shares";
                            screenname = json[i].user.name;
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
                        onerror = "imgError2(this,'Twitter','" + json[i].user.username + "');"
                    }
                    else {
                        onerror = "imgError2(this,null,null);"
                    }
                    id = id.replace(/#/g, "%23");

                    var a = new Date(publicationTime * 1);
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    var year = a.getFullYear();
                    var month = months[a.getMonth()];
                    var date = a.getDate();
                    var time = date + ' ' + month + ' ' + year;

                    var titles = document.getElementById("tiles");
                    var li = document.createElement('li');
                    titles.appendChild(li);

                    var divouter = document.createElement('div');
                    divouter.setAttribute('class', 'outer');
                    li.appendChild(divouter);

                    if (profileimage === "imgs/noprofile.gif") {
                        profileimage = "http://getfavicon.appspot.com/" + page;
                    }

                    if (json[i].type === "item") {

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

                        var name = document.createElement('span');
                        name.setAttribute('class', 'ff-name');
                        name.innerText = screenname;
                        divouter.appendChild(name);

                        var p = document.createElement('p');
                        p.innerHTML = title;
                        p.setAttribute('class', 'title');
                        divouter.appendChild(p);

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

                        var seconds = document.createElement('p');
                        seconds.innerHTML = publicationTime / 1000;
                        seconds.setAttribute('class', 'seconds');
                        seconds.setAttribute('style', 'display:none');
                        divouter.appendChild(seconds);

                        var ids = document.createElement('p');
                        ids.innerHTML = id;
                        ids.setAttribute('class', 'ids');
                        ids.setAttribute('style', 'display:none');
                        divouter.appendChild(ids);

                        var sharedvalue = document.createElement('p');
                        sharedvalue.innerHTML = shared;
                        sharedvalue.setAttribute('class', 'shared');
                        divouter.appendChild(sharedvalue);

                    } else {

                        if (json[i].mediaType === "image") {
                            thumb = json[i].mediaUrl;
                        } else {
                            thumb = json[i].thumbnail;
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

                        var name = document.createElement('span');
                        name.setAttribute('class', 'ff-name');
                        name.innerText = screenname;
                        divouter.appendChild(name);

                        var p = document.createElement('p');
                        p.innerHTML = title;
                        p.setAttribute('class', 'title');
                        divouter.appendChild(p);

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

                        var seconds = document.createElement('p');
                        seconds.innerHTML = publicationTime / 1000;
                        seconds.setAttribute('class', 'seconds');
                        seconds.setAttribute('style', 'display:none');
                        divouter.appendChild(seconds);

                        var ids = document.createElement('p');
                        ids.innerHTML = id;
                        ids.setAttribute('class', 'ids');
                        ids.setAttribute('style', 'display:none');
                        divouter.appendChild(ids);

                        var sharedvalue = document.createElement('p');
                        sharedvalue.innerHTML = shared;
                        sharedvalue.setAttribute('class', 'shared');
                        divouter.appendChild(sharedvalue);

                    }
                }
                if (json.length === 5) {
                    loadimage(0, "latest", pagenum);
                }

                if ((json.length >= 0) && (json.length < 5)) {
                    loadimage(1, "dummylatest", pagenum);
                    $(window).unbind('.more_latest');
                }

                if ((json.length === 0) && (pagenum === 1)) {
                    $("#loading").hide();
                    if (query_param !== "") {
                        switch (translation_param) {
                            case "en":
                                $('#myModal h1').html("No results!");
                                $('#myModal p').html("The internet is not talking about that keyword.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "el":
                                $('#myModal h1').html("Κανένα Αποτέλεσμα!");
                                $('#myModal p').html("Δεν υπάρχουν αποτελέσματα για αυτήν την ετικέτα.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "it":
                                $('#myModal h1').html("Nessun risultato!");
                                $('#myModal p').html("Nessun risultato per questa parola chiave.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "tr":
                                $('#myModal h1').html("Sonuç bulunamadı!");
                                $('#myModal p').html("Bu anahtar kelimeyle ilgili sonuç bulunamadı.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "sp":
                                $('#myModal h1').html("¡No hay resultados!");
                                $('#myModal p').html("No existen resultados para esta etiqueta.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "ca":
                                $('#myModal h1').html("No s'ha trobat cap resultat!");
                                $('#myModal p').html("A Internet no hi ha cap referència rellevant sobre aquesta paraula clau.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            default:
                                $('#myModal h1').html("No results!");
                                $('#myModal p').html("The internet is not talking about that keyword.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                        }
                    }
                    else {
                        switch (translation_param) {
                            case "en":
                                $('#myModal h1').html("No results!");
                                $('#myModal p').html("The internet is not talking about that collection.");
                                $('#myModal').reveal();
                                loadimage(1, "dummylatest", pagenum);
                                break;
                            case "el":
                                $('#myModal h1').html("Κανένα Αποτέλεσμα!");
                                $('#myModal p').html("Δεν υπάρχουν αποτελέσματα για αυτήν την συλλογή.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "it":
                                $('#myModal h1').html("Nessun risultato!");
                                $('#myModal p').html("Nessun risultato per questa raccolta.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "tr":
                                $('#myModal h1').html("Sonuç bulunamadı!");
                                $('#myModal p').html("Bu koleksiyonla ilgili sonuç bulunamadı.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "sp":
                                $('#myModal h1').html("¡No hay resultados!");
                                $('#myModal p').html("No hay resultados para esta colección.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            case "ca":
                                $('#myModal h1').html("No s'ha trobat cap resultat!");
                                $('#myModal p').html("A Internet no hi ha cap referència rellevant sobre aquest recull.");
                                $('#myModal').reveal();
                                loadimage(99, query_param, 12);
                                break;
                            default:
                                $('#myModal h1').html("No results!");
                                $('#myModal p').html("The internet is not talking about that collection.");
                                $('#myModal').reveal();
                                loadimage(1, "dummylatest", pagenum);
                        }
                    }

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
        if ((($('#main').height()) + 25) <= ($(window).height() + $(window).scrollTop())) {

            $("#loadmore").show();
            pagenum++;

            $.ajax({
                type: "GET",
                url: api_folder + "items?collection=" + collection_param + "&nPerPage=5&pageNumber=" + pagenum + "&q=" + query_param + "&source=" + source_param + "&sort=" + sort_param + "&unique=" + unique_param + "&language=" + language_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
                dataType: "json",
                success: function (json) {
                    if (pagelocation === "latest") {
                        var end = 0;
                        var title, source, publicationTime, shared, screenname, profileimage, id, page, userpage, thumb, colorclass, iconsource, onerror, style_favicon, style_icon;


                        for (var i = 0; i < json.length; i++) {

                            title = json[i].title;

                            if (title === "") {
                                title = "-";
                            }
                            style_favicon = "";
                            style_icon = "";
                            source = json[i].source;
                            publicationTime = json[i].publicationTime;
                            screenname = json[i].user.username;

                            profileimage = json[i].user.profileImage;
                            id = json[i].id;


                            if (json[i].hasOwnProperty('pageUrl')) {
                                page = json[i].pageUrl;
                            } else {
                                page = "404.html";
                            }

                            if (json[i].user.hasOwnProperty('pageUrl')) {
                                userpage = json[i].user.pageUrl;
                            } else {
                                userpage = "404.html";
                            }
                            onerror = false;
                            switch (source) {
                                case "Youtube":
                                    shared = nFormatter(json[i].views) + " views";
                                    screenname = json[i].user.name;
                                    iconsource = 'imgs/youtube-16-black.png';
                                    colorclass = 'color youtubecolor';
                                    break;
                                case "Twitter":
                                    shared = nFormatter(json[i].shares) + " retweets";
                                    iconsource = 'imgs/twitter-16-black.png';
                                    colorclass = 'color twittercolor';
                                    onerror = true;
                                    break;
                                case "Flickr":
                                    shared = nFormatter(json[i].views) + " views";
                                    iconsource = 'imgs/flickr-16-black.png';
                                    colorclass = 'color flickrcolor';
                                    break;
                                case "Facebook":
                                    shared = nFormatter(json[i].shares) + " shares";
                                    iconsource = 'imgs/facebook-16-black.png';
                                    colorclass = 'color facebookcolor';
                                    break;
                                case "GooglePlus":
                                    shared = nFormatter(json[i].shares) + " shares";
                                    iconsource = 'imgs/google+-16-black.png';
                                    colorclass = 'color googlecolor';
                                    break;
                                case "Instagram":
                                    shared = nFormatter(json[i].views) + " views";
                                    iconsource = 'imgs/instagram-16-black.png';
                                    colorclass = 'color instagramcolor';
                                    break;
                                case "RSS":
                                    shared = nFormatter(json[i].shares) + " shares";
                                    screenname = json[i].user.name;
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
                                onerror = "imgError2(this,'Twitter','" + json[i].user.username + "');"
                            }
                            else {
                                onerror = "imgError2(this,null,null);"
                            }
                            id = id.replace(/#/g, "%23");

                            var a = new Date(publicationTime * 1);
                            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            var year = a.getFullYear();
                            var month = months[a.getMonth()];
                            var date = a.getDate();
                            var time = date + ' ' + month + ' ' + year;

                            var titles = document.getElementById("tiles");
                            var li = document.createElement('li');
                            titles.appendChild(li);

                            var divouter = document.createElement('div');
                            divouter.setAttribute('class', 'outer');
                            li.appendChild(divouter);

                            if (profileimage === "imgs/noprofile.gif") {
                                profileimage = "http://getfavicon.appspot.com/" + page;
                            }

                            if (json[i].type === "item") {

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

                                var name = document.createElement('span');
                                name.setAttribute('class', 'ff-name');
                                name.innerText = screenname;
                                divouter.appendChild(name);

                                var p = document.createElement('p');
                                p.innerHTML = title;
                                p.setAttribute('class', 'title');
                                divouter.appendChild(p);

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

                                var seconds = document.createElement('p');
                                seconds.innerHTML = publicationTime / 1000;
                                seconds.setAttribute('class', 'seconds');
                                seconds.setAttribute('style', 'display:none');
                                divouter.appendChild(seconds);

                                var ids = document.createElement('p');
                                ids.innerHTML = id;
                                ids.setAttribute('class', 'ids');
                                ids.setAttribute('style', 'display:none');
                                divouter.appendChild(ids);

                                var sharedvalue = document.createElement('p');
                                sharedvalue.innerHTML = shared;
                                sharedvalue.setAttribute('class', 'shared');
                                divouter.appendChild(sharedvalue);

                            } else {

                                if (json[i].mediaType === "image") {
                                    thumb = json[i].mediaUrl;
                                } else {
                                    thumb = json[i].thumbnail;
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

                                var name = document.createElement('span');
                                name.setAttribute('class', 'ff-name');
                                name.innerText = screenname;
                                divouter.appendChild(name);

                                var p = document.createElement('p');
                                p.innerHTML = title;
                                p.setAttribute('class', 'title');
                                divouter.appendChild(p);

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

                                var seconds = document.createElement('p');
                                seconds.innerHTML = publicationTime / 1000;
                                seconds.setAttribute('class', 'seconds');
                                seconds.setAttribute('style', 'display:none');
                                divouter.appendChild(seconds);

                                var ids = document.createElement('p');
                                ids.innerHTML = id;
                                ids.setAttribute('class', 'ids');
                                ids.setAttribute('style', 'display:none');
                                divouter.appendChild(ids);

                                var sharedvalue = document.createElement('p');
                                sharedvalue.innerHTML = shared;
                                sharedvalue.setAttribute('class', 'shared');
                                divouter.appendChild(sharedvalue);

                            }
                        }
                        if (json.length === 0) {
                            end = 1;
                            $(window).unbind('.more_latest');
                        }

                        loadimage(end, "dummylatest", pagenum);
                    }
                },
                async: true
            });


        }
    });
}

function parse_new(count) {


    $.ajax({
        type: "GET",
        url: api_folder + "items?collection=" + collection_param + "&nPerPage=" + count + "&pageNumber=1&q=" + query_param + "&source=" + source_param + "&sort=" + sort_param + "&language=" + language_param + "&unique=" + unique_param + "&original=" + original_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            if (pagelocation === "latest") {
                var title, source, publicationTime, shared, screenname, profileimage, id, page, userpage, thumb, colorclass, iconsource, onerror, style_favicon, style_icon;


                for (var i = 0; i < json.length; i++) {

                    title = json[i].title;

                    if (title === "") {
                        title = "-";
                    }
                    style_favicon = "";
                    style_icon = "";
                    source = json[i].source;
                    publicationTime = json[i].publicationTime;

                    screenname = json[i].user.username;

                    profileimage = json[i].user.profileImage;
                    id = json[i].id;

                    if (json[i].hasOwnProperty('pageUrl')) {
                        page = json[i].pageUrl;
                    } else {
                        page = "404.html";
                    }

                    if (json[i].user.hasOwnProperty('pageUrl')) {
                        userpage = json[i].user.pageUrl;
                    } else {
                        userpage = "404.html";
                    }
                    onerror = false;
                    switch (source) {
                        case "Youtube":
                            shared = nFormatter(json[i].views) + " views";
                            screenname = json[i].user.name;
                            iconsource = 'imgs/youtube-16-black.png';
                            colorclass = 'color youtubecolor';
                            break;
                        case "Twitter":
                            shared = nFormatter(json[i].shares) + " retweets";
                            iconsource = 'imgs/twitter-16-black.png';
                            colorclass = 'color twittercolor';
                            onerror = true;
                            break;
                        case "Flickr":
                            shared = nFormatter(json[i].views) + " views";
                            iconsource = 'imgs/flickr-16-black.png';
                            colorclass = 'color flickrcolor';
                            break;
                        case "Facebook":
                            shared = nFormatter(json[i].shares) + " shares";
                            iconsource = 'imgs/facebook-16-black.png';
                            colorclass = 'color facebookcolor';
                            break;
                        case "GooglePlus":
                            shared = nFormatter(json[i].shares) + " shares";
                            iconsource = 'imgs/google+-16-black.png';
                            colorclass = 'color googlecolor';
                            break;
                        case "Instagram":
                            shared = nFormatter(json[i].views) + " views";
                            iconsource = 'imgs/instagram-16-black.png';
                            colorclass = 'color instagramcolor';
                            break;
                        case "RSS":
                            shared = nFormatter(json[i].shares) + " shares";
                            screenname = json[i].user.name;
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
                        onerror = "imgError2(this,'Twitter','" + json[i].user.username + "');"
                    }
                    else {
                        onerror = "imgError2(this,null,null);"
                    }
                    id = id.replace(/#/g, "%23");

                    var display_time = new Date(publicationTime * 1);
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    var year = display_time.getFullYear();
                    var month = months[display_time.getMonth()];
                    var date = display_time.getDate();
                    var time = date + ' ' + month + ' ' + year;

                    var titles = document.getElementById("tiles");
                    var li = document.createElement('li');
                    titles.insertBefore(li, titles.childNodes[0]);

                    var divouter = document.createElement('div');
                    divouter.setAttribute('class', 'outer');
                    li.appendChild(divouter);

                    if (profileimage === "imgs/noprofile.gif") {
                        profileimage = "http://getfavicon.appspot.com/" + page;
                    }

                    if (json[i].type === "item") {

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

                        var name = document.createElement('span');
                        name.setAttribute('class', 'ff-name');
                        name.innerText = screenname;
                        divouter.appendChild(name);

                        var p = document.createElement('p');
                        p.innerHTML = title;
                        p.setAttribute('class', 'title');
                        divouter.appendChild(p);

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

                        var seconds = document.createElement('p');
                        seconds.innerHTML = publicationTime / 1000;
                        seconds.setAttribute('class', 'seconds');
                        seconds.setAttribute('style', 'display:none');
                        divouter.appendChild(seconds);

                        var ids = document.createElement('p');
                        ids.innerHTML = id;
                        ids.setAttribute('class', 'ids');
                        ids.setAttribute('style', 'display:none');
                        divouter.appendChild(ids);

                        var sharedvalue = document.createElement('p');
                        sharedvalue.innerHTML = shared;
                        sharedvalue.setAttribute('class', 'shared');
                        divouter.appendChild(sharedvalue);

                    } else {

                        if (json[i].mediaType === "image") {
                            thumb = json[i].mediaUrl;
                        } else {
                            thumb = json[i].thumbnail;
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

                        var name = document.createElement('span');
                        name.setAttribute('class', 'ff-name');
                        name.innerText = screenname;
                        divouter.appendChild(name);

                        var p = document.createElement('p');
                        p.innerHTML = title;
                        p.setAttribute('class', 'title');
                        divouter.appendChild(p);

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

                        var seconds = document.createElement('p');
                        seconds.innerHTML = publicationTime / 1000;
                        seconds.setAttribute('class', 'seconds');
                        seconds.setAttribute('style', 'display:none');
                        divouter.appendChild(seconds);

                        var ids = document.createElement('p');
                        ids.innerHTML = id;
                        ids.setAttribute('class', 'ids');
                        ids.setAttribute('style', 'display:none');
                        divouter.appendChild(ids);

                        var sharedvalue = document.createElement('p');
                        sharedvalue.innerHTML = shared;
                        sharedvalue.setAttribute('class', 'shared');
                        divouter.appendChild(sharedvalue);

                    }
                }
                loadimage(2, "dummylatest", 12);
            }
        },
        async: true
    });

}
