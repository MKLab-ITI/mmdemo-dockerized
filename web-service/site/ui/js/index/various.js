var user_id = gup("user_id");
if (project_logo !== "") {
    $('.header_menu').prepend('<img src="' + project_logo + '" alt="logo" class="logo">');
    $('#circle_logo').attr('src', project_logo);
}
if (project_name !== "") {
    $('.header').text(project_name);
    document.title = project_name;
}
if (project_favicon !== "") {
    var link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.href = project_favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
}
if (is_H2020) {
    $('#social_icons').after('<img class="footer_img" src="imgs/horizon.png" alt="horizon"/>');
    $('#dropdown').find('ul').css('top', '-70px');
}
if (project_url !== "") {
    $('#project_url').attr('href', project_url).text(project_name);
}
if (project_facebook !== "") {
    $('#social_icons').append('<a href="' + project_facebook + '" target="_blank"><img src="imgs/facebook-24.png"></a>');
}
if (project_twitter !== "") {
    $('#social_icons').append('<a href="' + project_twitter + '" target="_blank"><img src="imgs/twitter-24.png"></a>');
}
if (project_googleplus !== "") {
    $('#social_icons').append('<a href="' + project_googleplus + '" target="_blank"><img src="imgs/google+-24.png"></a>');
}
if (project_linkedin !== "") {
    $('#social_icons').append(' <a href="' + project_linkedin + '" target="_blank"><img src="imgs/linkedin-24.png"></a>');
}
var edit_mode = false;
var edit_id = 0;
$(window).on("scroll touchmove", function () {
    $('.first-section').toggleClass('tiny', $(document).scrollTop() > 0);
    $('.header_menu').toggleClass('tiny', $(document).scrollTop() > 0);
});

var input_selector = 'input[type=text]';
$(document).on('focus', input_selector, function () {
    $(this).siblings('label, i').addClass('active');
    if ($(this).attr('id') === "hashtag") {
        $('#hash_icon').attr('src', 'imgs/hash-blue.png');
        $('#search_icon_1').attr('src', 'imgs/search-blue.png');
    }
    else if ($(this).attr('id') === "interest") {
        $('#interest_icon').attr('src', 'imgs/interest-blue.png');
        $('#enter_icon').attr('src', 'imgs/enter-blue.png');
    }
    else if ($(this).attr('id') === "user_advanced") {
        $('#text_user_icon').attr('src', 'imgs/text_user_blue.png');
        $('#search_icon_2').attr('src', 'imgs/search-blue.png');
    }
    else {
        $('#user_icon').attr('src', 'imgs/email-blue.png');
        $('.users_icon').attr('src', 'imgs/search-blue.png');
    }
});
$(document).on('blur', input_selector, function () {
    var $inputElement = $(this);
    if ($inputElement.val().length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === undefined) {
        $inputElement.siblings('label, i').removeClass('active');
        if ($(this).attr('id') === "hashtag") {
            $('#hash_icon').attr('src', 'imgs/hash-gray.png');
            $('#search_icon_1').attr('src', 'imgs/search-gray.png');
        }
        else if ($(this).attr('id') === "interest") {
            $('#interest_icon').attr('src', 'imgs/interest-gray.png');
            $('#enter_icon').attr('src', 'imgs/enter-gray.png');
        }
        else if ($(this).attr('id') === "user_advanced") {
            $('#text_user_icon').attr('src', 'imgs/text_user.png');
            $('#search_icon_2').attr('src', 'imgs/search-gray.png');
        }
        else {
            $('#user_icon').attr('src', 'imgs/email-gray.png');
            $('.users_icon').attr('src', 'imgs/search-gray.png');
        }
    }
});

$("#hashtag").keyup(function (e) {
    if (e.keyCode === 13) {
        addtag();
    }
});

var typingTimer;
var doneTypingInterval = 1000;
$('#user_advanced').keyup(function () {
    abort();
    clearTimeout(typingTimer);
    typingTimer = setTimeout(search_adv_user, doneTypingInterval);

});

function search_adv_user() {
    if ($('#user_advanced').val().length > 1) {
        $('#users_images').hide();
        $('.Typeahead-spinner').show();
        $('#adv_loading').slideDown();
        var $user_images = $('#users_images');
        var $user_adv = $('#users_adv');
        $user_images.empty();
        var source = "";
        $('.open_adv').each(function (i, obj) {
            source = source + $(this).attr('id').substring(4) + ",";
        });
        source = source.slice(0, -1);
        last_source = source;
        $.ajax({
            url: api_folder + 'detect/users?q=' + $('#user_advanced').val() + '&source=' + source,
            type: 'GET',
            success: function (json) {
                if ($user_adv.find("li").length === 100) {
                    $user_images.addClass('users_full');
                }
                for (var i = 0; i < json.length; i++) {
                    var flag = 0;
                    $user_adv.find('li').children().each(function () {
                        if ($(this).attr('id').indexOf(json[i].source + "------" + json[i].id) > -1) {
                            flag = 1;
                        }
                    });
                    if (flag) {
                        switch (json[i].source) {
                            case "Twitter":
                                $user_images.append('<div class="user" style="background-color: lightgray"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,\'Twitter\',' + json[i].username + ');" style="border-color:#00acee"></p><p class="user_name">' + json[i].username + '</p><br> <p class="user_count">' + nFormatter(json[i].statuses_count) + ' tweets</p><img src="imgs/twitter-16-color.png" class="user_social"></div><div class="data_stats"><ul><li class="three">' + nFormatter_easy(json[i].favourites_count) + '<span>Favorites</span></li><li class="three">' + nFormatter_easy(json[i].followers_count) + '<span>Followers</span></li><li class="three">' + nFormatter_easy(json[i].friends_count) + '<span>Following</span> </li> </ul> </div><img src="imgs/add_user_green.png" class="add_user open_user" data-username="' + json[i].username + '" data-social="Twitter" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                            case "GooglePlus":
                                $user_images.append('<div class="user" style="background-color: lightgray"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,null,null);" style="border-color:#d34836"></p><p class="user_name">' + json[i].username + '</p><br> <p class="user_count">' + nFormatter(json[i].plusOneCount) + ' plusOnes</p><img src="imgs/google+-16-color.png" class="user_social"></div><div class="data_stats"><ul><li class="one">' + nFormatter_easy(json[i].circledByCount) + '<span>Circled By</span></li></ul> </div><img src="imgs/add_user_green.png" class="add_user open_user" data-username="' + json[i].username + '" data-social="GooglePlus" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                            case "Facebook":
                                $user_images.append('<div class="user" style="background-color: lightgray"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,null,null);" style="border-color:#3b5998"></p><p class="user_name">' + json[i].username + '</p><br> <p class="user_count">' + nFormatter(json[i].likes) + ' likes</p><img src="imgs/facebook-5-16.png" class="user_social"></div><div class="data_stats"><ul></ul> </div><img src="imgs/add_user_green.png" class="add_user open_user" data-username="' + json[i].username + '" data-social="Facebook" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                            case "Instagram":
                                $user_images.append('<div class="user" style="background-color: lightgray"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,null,null);" style="border-color:#ab7d63"></p><p class="user_name">' + json[i].username + '</p><br><img src="imgs/instagram-16-color.png" class="user_social"></div><div class="data_stats"><ul></ul> </div><img src="imgs/add_user_green.png" class="add_user open_user" data-username="' + json[i].username + '" data-social="Instagram" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                            case "Youtube":
                                $user_images.append('<div class="user" style="background-color: lightgray"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,null,null);" style="border-color:#FF0202"></p><p class="user_name">' + json[i].username + '</p><br> <p class="user_count">' + nFormatter(json[i].videoCount) + ' videos</p><img src="imgs/youtube-16-color.png" class="user_social"></div><div class="data_stats"><ul><li class="three">' + nFormatter_easy(json[i].subscriberCount) + '<span>Subscribers</span></li><li class="three">' + nFormatter_easy(json[i].viewCount) + '<span>Views</span></li><li class="three">' + nFormatter_easy(json[i].commentCount) + '<span>Comments</span> </li> </ul> </div><img src="imgs/add_user_green.png" class="add_user open_user" data-username="' + json[i].username + '" data-social="Youtube" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                        }
                    }
                    else {
                        switch (json[i].source) {
                            case "Twitter":
                                $user_images.append('<div class="user"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,\'Twitter\',' + json[i].username + ');" style="border-color:#00acee"></p><p class="user_name">' + json[i].username + '</p><br> <p class="user_count">' + nFormatter(json[i].statuses_count) + ' tweets</p><img src="imgs/twitter-16-color.png" class="user_social"></div><div class="data_stats"><ul><li class="three">' + nFormatter_easy(json[i].favourites_count) + '<span>Favorites</span></li><li class="three">' + nFormatter_easy(json[i].followers_count) + '<span>Followers</span></li><li class="three">' + nFormatter_easy(json[i].friends_count) + '<span>Following</span> </li> </ul> </div><img src="imgs/add_user.png" class="add_user" data-username="' + json[i].username + '" data-social="Twitter" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                            case "GooglePlus":
                                $user_images.append('<div class="user"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,null,null);" style="border-color:#d34836"></p><p class="user_name">' + json[i].username + '</p><br> <p class="user_count">' + nFormatter(json[i].plusOneCount) + ' plusOnes</p><img src="imgs/google+-16-color.png" class="user_social"></div><div class="data_stats"><ul><li class="one">' + nFormatter_easy(json[i].circledByCount) + '<span>Circled By</span></li></ul> </div><img src="imgs/add_user.png" class="add_user" data-username="' + json[i].username + '" data-social="GooglePlus" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                            case "Facebook":
                                $user_images.append('<div class="user"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,null,null);" style="border-color:#3b5998"></p><p class="user_name">' + json[i].username + '</p><br> <p class="user_count">' + nFormatter(json[i].likes) + ' likes</p><img src="imgs/facebook-5-16.png" class="user_social"></div><div class="data_stats"><ul></ul> </div><img src="imgs/add_user.png" class="add_user" data-username="' + json[i].username + '" data-social="Facebook" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                            case "Instagram":
                                $user_images.append('<div class="user"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,null,null);" style="border-color:#ab7d63"></p><p class="user_name">' + json[i].username + '</p><br><img src="imgs/instagram-16-color.png" class="user_social"></div><div class="data_stats"><ul></ul> </div><img src="imgs/add_user.png" class="add_user" data-username="' + json[i].username + '" data-social="Instagram" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                            case "Youtube":
                                $user_images.append('<div class="user"><div class="data_profile"><p style="float: left;cursor: pointer"><img data-url="' + json[i].link + '" src="' + json[i].profileImage + '" class="user_img" alt="user_img" onerror="imgError2(this,null,null);" style="border-color:#FF0202"></p><p class="user_name">' + json[i].username + '</p><br> <p class="user_count">' + nFormatter(json[i].videoCount) + ' videos</p><img src="imgs/youtube-16-color.png" class="user_social"></div><div class="data_stats"><ul><li class="three">' + nFormatter_easy(json[i].subscriberCount) + '<span>Subscribers</span></li><li class="three">' + nFormatter_easy(json[i].viewCount) + '<span>Views</span></li><li class="three">' + nFormatter_easy(json[i].commentCount) + '<span>Comments</span> </li> </ul> </div><img src="imgs/add_user.png" class="add_user" data-username="' + json[i].username + '" data-social="Youtube" data-id="' + json[i].id + '" data-name="' + json[i].name + '"/></div>');
                                break;
                        }
                    }
                }
                $user_images.show();
                particlesJS("particles-js", particles_settings);
                $(".Typeahead-spinner,#no_results").hide();
                $('#adv_loading').slideUp();
                if (json.length === 0) {
                    $('#no_results').show();
                    $('#users_images').hide();
                }
            },
            error: function (e) {
            }
        });
    }
    else {
        $(".Typeahead-spinner,#no_results").hide();
        $('#adv_loading').slideUp();
        var $user_images = $('#users_images');
        $user_images.empty();
    }
}
function addtag(tag) {
    var flag = 1;
    var count = 20 - $("#tags li").length;
    if (count > 0) {
        var tag_name = tag;
        if (tag == null) {
            tag_name = document.getElementById("hashtag").value;
        }
        var tag_arr = tag_name.split(',');
        $("#hashtag").val("");
        var length = Math.min(count, tag_arr.length);
        for (var i = 0; i < length; i++) {
            if (tag_arr[i] !== "") {
                flag = 1;
                $('#tags li').children().each(function () {
                    if ($(this).attr('id') === tag_arr[i].replace(/^\s+|\s+$/g, '')) {
                        $(this).parent().hide('slow', function () {
                            $(this).remove();
                        });
                        flag = 0;
                    }
                });
                var tag = document.getElementById('tags');
                var li = document.createElement('li');
                $(li).hide().appendTo(tag).fadeIn(600);

                var a = document.createElement('a');
                a.setAttribute('href', 'javascript:void(0);');
                a.setAttribute('id', tag_arr[i].replace(/^\s+|\s+$/g, ''));
                a.innerHTML = tag_arr[i];
                li.appendChild(a);

                var img = document.createElement('img');
                img.setAttribute('src', 'imgs/delete.png');
                img.setAttribute('class', 'delete');
                a.appendChild(img);

                if (flag) {
                    if ($("#tags li").length === 20) {
                        $("#hashtag").prop('disabled', true);
                    }
                }
            }
        }
    }
}
$("#user_RSS").keyup(function (e) {
    var $spinner = $('.Typeahead-spinner');
    $('#valid_rss').slideUp();
    if (e.keyCode === 13) {
        if ($spinner.is(":visible")) {
            abort();
        }
        $spinner.show();
        $.ajax({
            url: api_folder + 'rss/validate?rss=' + encodeURIComponent($(this).val()),
            type: 'GET',
            success: function (json) {
                $spinner.hide();
                if (json.valid) {
                    adduser(json.rss.id, json.rss.name, json.rss.username, "RSS");
                }
                else {
                    $('#valid_rss').slideDown();
                }
            },
            error: function (e) {
                $spinner.hide();
                $('#valid_rss').slideDown();
            }
        });
    }
});

function adduser($id, $name, $user, $social) {
    var flag = 1;
    var count = 100 - $("#users li").length;
    if (count > 0) {
        var tag_name = $user;
        if ($user == null) {
            tag_name = document.getElementById("user_" + $('.open').attr('id')).value;
        }
        var social = $social;
        if ($social == null) {
            social = $('.open').attr('id');
        }
        $('#user_' + $('.open').attr('id')).typeahead('val', '');

        if (tag_name !== "") {
            flag = 1;
            $('#users li').children().each(function () {
                if ($(this).attr('id').indexOf(social + "------" + $id) > -1) {
                    $(this).parent().hide('slow', function () {
                        $(this).remove();
                    });
                    flag = 0;
                }
            });
            var tag = document.getElementById('users');
            var li = document.createElement('li');
            $(li).hide().appendTo(tag).fadeIn(600);

            var a = document.createElement('a');
            a.setAttribute('href', 'javascript:void(0);');
            a.setAttribute('id', tag_name + "------" + social + "------" + $id + "------" + $name);
            a.innerHTML = tag_name;
            if ($social === "RSS") {
                a.innerHTML = $name;
                $('#user_RSS').val("");
            }
            li.appendChild(a);

            var icon = document.createElement('img');
            icon.setAttribute('class', 'user_icon');
            a.appendChild(icon);
            switch (social) {
                case "Twitter":
                    icon.setAttribute('src', 'imgs/twitter-16-black.png');
                    break;
                case "GooglePlus":
                    icon.setAttribute('src', 'imgs/google+-16-black.png');
                    break;
                case "Facebook":
                    icon.setAttribute('src', 'imgs/facebook-16-black.png');
                    break;
                case "Instagram":
                    icon.setAttribute('src', 'imgs/instagram-16-black.png');
                    break;
                case "Flickr":
                    icon.setAttribute('src', 'imgs/flickr-16-black.png');
                    break;
                case "Youtube":
                    icon.setAttribute('src', 'imgs/youtube-16-black.png');
                    break;
                case "RSS":
                    icon.setAttribute('src', 'imgs/rss-16-black.png');
                    break;
            }


            var img = document.createElement('img');
            img.setAttribute('src', 'imgs/delete.png');
            img.setAttribute('class', 'delete');
            a.appendChild(img);

            if (flag) {
                if ($("#users li").length === 100) {
                    $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_RSS,#user_Youtube").prop('disabled', true);
                }
            }
        }

    }
}

function adduser_adv($username, $social, $id, $name) {
    var count = 100 - $("#users_adv li").length;
    if (count > 0) {
        var tag = document.getElementById('users_adv');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', $username + "------" + $social + "------" + $id + "------" + $name);
        a.innerHTML = $username;
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        a.appendChild(icon);
        switch ($social) {
            case "Twitter":
                icon.setAttribute('src', 'imgs/twitter-16-black.png');
                break;
            case "GooglePlus":
                icon.setAttribute('src', 'imgs/google+-16-black.png');
                break;
            case "Facebook":
                icon.setAttribute('src', 'imgs/facebook-16-black.png');
                break;
            case "Instagram":
                icon.setAttribute('src', 'imgs/instagram-16-black.png');
                break;
            case "Flickr":
                icon.setAttribute('src', 'imgs/flickr-16-black.png');
                break;
            case "Youtube":
                icon.setAttribute('src', 'imgs/youtube-16-black.png');
                break;
            case "RSS":
                icon.setAttribute('src', 'imgs/rss-16-black.png');
                break;
        }


        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);
        if ($("#users_adv li").length === 100) {
            $('#users_images').addClass('users_full');
        }
    }
}
function deluser_adv($username, $social, $id, $name) {

    $('#users_adv li').children().each(function () {
        if ($(this).attr('id').indexOf($social + "------" + $id) > -1) {
            $(this).parent().hide('slow', function () {
                $(this).remove();
            });
        }
    });
    $('#users_images').removeClass('users_full');
}

$("#interest").keyup(function (e) {
    if (e.keyCode === 13) {
        addname();
    }
});
function addname() {
    var $interest = $('#interest');
    if ($interest.val().replace(/\s/g, '').length) {
        $('#col_name').hide().fadeIn(600).html($interest.val() + '<img src="imgs/edit-white.png" alt="edit" class="edit"/>');
        $interest.val("");
        $interest.prop('disabled', true);
    }
}

$("#user_tags").on("click", ".delete", function () {
    $(this).closest('li').hide('slow', function () {
        $(this).remove();
    });
    $("#hashtag").prop('disabled', false);

});
$("#user_users").on("click", ".delete", function () {
    $(this).closest('li').hide('slow', function () {
        $(this).remove();
    });
    $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_RSS,#user_Youtube").prop('disabled', false);
    $('#users_images').removeClass('users_full');

});
$("#user_users_adv").on("click", ".delete", function () {
    $(this).closest('li').hide('slow', function () {
        $(this).remove();
    });
    $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_RSS,#user_Youtube").prop('disabled', false);
    $('#users_images').removeClass('users_full');
    $("[data-id=" + $(this).parent().attr('id').split('------')[2] + "]").removeClass('open_user').attr('src', 'imgs/add_user.png').parent().css('background-color', 'transparent');
});
$("#search_icon_1").click(function () {
    addtag();
    $("#hashtag").blur();
});
$("#enter_icon").click(function () {
    addname();
    $("#interest").blur();
});
$("#search_icon_3").click(function () {
    adduser("0", "");
    $("#user_RSS").blur();
});

$("#examples_1").find("li").click(function () {
    $("label[for='hashtag']").removeClass('active');
    $('#hash_icon').attr('src', 'imgs/hash-gray.png');
    $('#search_icon_1').attr('src', 'imgs/search-gray.png');
    if ($("#tags li").length < 20) {
        $("#hashtag").val($(this).html());
        addtag();
    }
});
$("#example_1").click(function () {
    if ($("#users li").length < 100) {
        var flag = 1;
        $('#users li').children().each(function () {
            if ($(this).attr('id') === "Greenpeace------Twitter------3459051------Greenpeace") {
                $(this).parent().hide('slow', function () {
                    $(this).remove();
                });
                flag = 0;
            }
        });
        var tag = document.getElementById('users');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', 'Greenpeace------Twitter------3459051------Greenpeace');
        a.innerHTML = 'Greenpeace';
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        icon.setAttribute('src', 'imgs/twitter-16-black.png');
        a.appendChild(icon);

        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);

        if (flag) {
            if ($("#users li").length === 100) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_RSS,#user_Youtube").prop('disabled', true);
            }
        }
    }
});
$("#example_5").click(function () {
    if ($("#users_adv li").length < 100) {
        var flag = 1;
        $('#users_adv li').children().each(function () {
            if ($(this).attr('id') === "Greenpeace------Twitter------3459051------Greenpeace") {
                $(this).parent().hide('slow', function () {
                    $(this).remove();
                });
                flag = 0;
            }
        });
        var tag = document.getElementById('users_adv');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', 'Greenpeace------Twitter------3459051------Greenpeace');
        a.innerHTML = 'Greenpeace';
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        icon.setAttribute('src', 'imgs/twitter-16-black.png');
        a.appendChild(icon);

        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);

        if (flag) {
            if ($("#users_adv li").length === 100) {
                $('#users_images').addClass('users_full');
            }
        }
    }
});
$(".example_1").hover(
    function () {
        $(this).find('img').attr('src', 'imgs/twitter-16-color.png');
    }, function () {
        $(this).find('img').attr('src', 'imgs/twitter-16-black.png');
    }
);

$("#example_2").click(function () {
    if ($("#users li").length < 100) {
        var flag = 1;
        $('#users li').children().each(function () {
            if ($(this).attr('id') === "WWF------GooglePlus------114176126428866920097------WWF") {
                $(this).parent().hide('slow', function () {
                    $(this).remove();
                });
                flag = 0;
            }
        });
        var tag = document.getElementById('users');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', 'WWF------GooglePlus------114176126428866920097------WWF');
        a.innerHTML = 'WWF';
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        icon.setAttribute('src', 'imgs/google+-16-black.png');
        a.appendChild(icon);

        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);

        if (flag) {
            if ($("#users li").length === 100) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_RSS,#user_Youtube").prop('disabled', true);
            }
        }
    }
});
$("#example_6").click(function () {
    if ($("#users_adv li").length < 100) {
        var flag = 1;
        $('#users_adv li').children().each(function () {
            if ($(this).attr('id') === "WWF------GooglePlus------114176126428866920097------WWF") {
                $(this).parent().hide('slow', function () {
                    $(this).remove();
                });
                flag = 0;
            }
        });
        var tag = document.getElementById('users_adv');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', 'WWF------GooglePlus------114176126428866920097------WWF');
        a.innerHTML = 'WWF';
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        icon.setAttribute('src', 'imgs/google+-16-black.png');
        a.appendChild(icon);

        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);

        if (flag) {
            if ($("#users_adv li").length === 100) {
                $('#users_images').addClass('users_full');
            }
        }
    }
});
$(".example_2").hover(
    function () {
        $(this).find('img').attr('src', 'imgs/google+-16-color.png');
    }, function () {
        $(this).find('img').attr('src', 'imgs/google+-16-black.png');
    }
);

$("#example_3").click(function () {
    if ($("#users li").length < 100) {
        var flag = 1;
        $('#users li').children().each(function () {
            if ($(this).attr('id') === "CapeNature1------Facebook------137406639638143------CapeNature") {
                $(this).parent().hide('slow', function () {
                    $(this).remove();
                });
                flag = 0;
            }
        });
        var tag = document.getElementById('users');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', 'CapeNature1------Facebook------137406639638143------CapeNature');
        a.innerHTML = 'CapeNature1';
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        icon.setAttribute('src', 'imgs/facebook-16-black.png');
        a.appendChild(icon);

        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);

        if (flag) {
            if ($("#users li").length === 100) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_RSS,#user_Youtube").prop('disabled', true);
            }
        }
    }
});
$("#example_7").click(function () {
    if ($("#users_adv li").length < 100) {
        var flag = 1;
        $('#users_adv li').children().each(function () {
            if ($(this).attr('id') === "CapeNature1------Facebook------137406639638143------CapeNature") {
                $(this).parent().hide('slow', function () {
                    $(this).remove();
                });
                flag = 0;
            }
        });
        var tag = document.getElementById('users_adv');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', 'CapeNature1------Facebook------137406639638143------CapeNature');
        a.innerHTML = 'CapeNature1';
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        icon.setAttribute('src', 'imgs/facebook-16-black.png');
        a.appendChild(icon);

        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);

        if (flag) {
            if ($("#users_adv li").length === 100) {
                $('#users_images').addClass('users_full');
            }
        }
    }
});
$(".example_3").hover(
    function () {
        $(this).find('img').attr('src', 'imgs/facebook-16-color.png');
    }, function () {
        $(this).find('img').attr('src', 'imgs/facebook-16-black.png');
    }
);

$("#example_4").click(function () {
    if ($("#users li").length < 100) {
        var flag = 1;
        $('#users li').children().each(function () {
            if ($(this).attr('id') === "green4ema------Instagram------408186628------Environmental Media Assoc.") {
                $(this).parent().hide('slow', function () {
                    $(this).remove();
                });
                flag = 0;
            }
        });
        var tag = document.getElementById('users');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', 'green4ema------Instagram------408186628------Environmental Media Assoc.');
        a.innerHTML = 'green4ema';
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        icon.setAttribute('src', 'imgs/facebook-16-black.png');
        a.appendChild(icon);

        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);

        if (flag) {
            if ($("#users li").length === 100) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_RSS,#user_Youtube").prop('disabled', true);
            }
        }
    }
});
$("#example_8").click(function () {
    if ($("#users_adv li").length < 100) {
        var flag = 1;
        $('#users_adv li').children().each(function () {
            if ($(this).attr('id') === "green4ema------Instagram------408186628------Environmental Media Assoc.") {
                $(this).parent().hide('slow', function () {
                    $(this).remove();
                });
                flag = 0;
            }
        });
        var tag = document.getElementById('users_adv');
        var li = document.createElement('li');
        $(li).hide().appendTo(tag).fadeIn(600);

        var a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.setAttribute('id', 'green4ema------Instagram------408186628------Environmental Media Assoc.');
        a.innerHTML = 'green4ema';
        li.appendChild(a);

        var icon = document.createElement('img');
        icon.setAttribute('class', 'user_icon');
        icon.setAttribute('src', 'imgs/facebook-16-black.png');
        a.appendChild(icon);

        var img = document.createElement('img');
        img.setAttribute('src', 'imgs/delete.png');
        img.setAttribute('class', 'delete');
        a.appendChild(img);

        if (flag) {
            if ($("#users_adv li").length === 100) {
                $('#users_images').addClass('users_full');
            }
        }
    }
});
$("example_4").hover(
    function () {
        $(this).find('img').attr('src', 'imgs/instagram-16-color.png');
    }, function () {
        $(this).find('img').attr('src', 'imgs/instagram-16-black.png');
    }
);


$("#col_name").on("click", ".edit", function () {
    var $interest = $("#interest");
    $interest.prop('disabled', false);
    $interest.focus();
    $interest.val($("#col_name").text());
    $(this).parent().html("");
});

new Waypoint({
    element: $('.third-section'),
    handler: function (direction) {
        var $mainmenu = $('#mainmenu li');
        $mainmenu.removeClass('active');
        if (direction === "down") {
            $mainmenu.eq(0).addClass('active');
        }
    },
    offset: 150
});
new Waypoint({
    element: $('.fifth-section'),
    handler: function (direction) {
        var $mainmenu = $('#mainmenu li');
        $mainmenu.removeClass('active');
        if (direction === "down") {
            $mainmenu.eq(1).addClass('active');
        }
        else {
            $mainmenu.eq(0).addClass('active');
        }
    },
    offset: 250
});
$("#discover").click(function () {
    $('html,body').animate({
        scrollTop: $(".third-section").offset().top - 100
    }, 800);
});

$('.ff-filter-users').click(function (e) {
    e.preventDefault();
    $('.input-field:gt(1):lt(5), .Typeahead-spinner').hide();
    $('#' + $(this).attr('id') + '_input').css('display', 'inline-block');
    $('.ff-filter-users').addClass('close').removeClass('open');
    $(this).removeClass('close').addClass('open');
    $('#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Youtube').typeahead('val', '').blur();
    $('#user_RSS').val("").blur();
});

var last_source = "";
$('.ff-filter-users_adv').click(function (e) {
    e.preventDefault();
    if ($(this).hasClass('close_adv')) {
        $(this).removeClass('close_adv').addClass('open_adv');
        if ($('.Typeahead-spinner').is(":visible")) {
            abort();
            search_adv_user();
        }
        else {
            if (last_source.indexOf($(this).attr('id').substring(4)) > -1) {
                $.when($("#users_images").find("[data-social='" + $(this).attr('id').substring(4) + "']").parent().show(1000)).then(function () {
                    if ($('#users_images').find('.user:visible').length > 0) {
                        $('#no_results').hide();
                    }
                });
            }
            else {
                if ($('#user_advanced').val().length > 1) {
                    $('.Typeahead-spinner').show();
                    abort();
                    search_adv_user();
                }
            }
        }
    }
    else {
        $(this).removeClass('open_adv').addClass('close_adv');
        if ($('.Typeahead-spinner').is(":visible")) {
            abort();
            search_adv_user();
        }
        else {
            $.when($("#users_images").find("[data-social='" + $(this).attr('id').substring(4) + "']").parent().hide(1000)).then(function () {
                if ($('#users_images').find('.user:visible').length === 0) {
                    if (last_source !== "" && ($('#user_advanced').val().length > 1)) {
                        $('#no_results').show();
                    }
                }
            });
        }
    }
});

$('.stage').click(function (e) {
    if (($('#col_name').text() === "") && ($('#interest').val() === "")) {
        $('html,body').animate({
            scrollTop: $(".third-section").offset().top - 100
        }, 800);
        switch (translation_param) {
            case "en":
                $('#myModal h1').html("Missing Fields!");
                $('#myModal p').html("You have to specify a collection name.")
                $('#myModal').reveal();
                break;
            case "el":
                $('#myModal h1').html("Λείπουν κάποια πεδία!");
                $('#myModal p').html("Πρέπει να ορίσεις ένα όνομα συλλογής.");
                $('#myModal').reveal();
                break;
            case "it":
                $('#myModal h1').html("Campi incompleti!");
                $('#myModal p').html("Devi specificare il nome di una raccolta.");
                $('#myModal').reveal();
                break;
            case "tr":
                $('#myModal h1').html("Eksik alanlar!");
                $('#myModal p').html("Bir koleksiyon adı belirlemelisiniz.");
                $('#myModal').reveal();
                break;
            case "sp":
                $('#myModal h1').html("Faltan campos!");
                $('#myModal p').html("Se tiene que especificar un nombre de colección.");
                $('#myModal').reveal();
                break;
            case "ca":
                $('#myModal h1').html("T'has descuidat d'omplir algun camp!");
                $('#myModal p').html("Has d'especificar el nom d'un recull.");
                $('#myModal').reveal();
                break;
            default:
                $('#myModal h1').html("Missing Fields!");
                $('#myModal p').html("You have to specify a collection name.")
                $('#myModal').reveal();
        }
    }
    else if (($('#tags li').length === 0 ) && ($('#users').find('li').length === 0)) {
        $('html,body').animate({
            scrollTop: $(".third-section").offset().top - 100
        }, 800);
        switch (translation_param) {
            case "en":
                $('#myModal').find('h1').html("Missing Fields!");
                $('#myModal').find('p').html("You have to specify at least one keyword or a user.");
                $('#myModal').reveal();
                break;
            case "el":
                $('#myModal h1').html("Λείπουν κάποια πεδία!");
                $('#myModal p').html("Πρέπει να ορίσεις τουλάχιστον μια ετικέτα ή ένα χρήστη.");
                $('#myModal').reveal();
                break;
            case "it":
                $('#myModal h1').html("Campi incompleti!");
                $('#myModal p').html("Devi specificare almeno una parola chiave o un utente.");
                $('#myModal').reveal();
                break;
            case "tr":
                $('#myModal h1').html("Eksik alanlar!");
                $('#myModal p').html("En az bir anahtar kelime veya kullanıcı belirlemelisiniz.");
                $('#myModal').reveal();
                break;
            case "sp":
                $('#myModal h1').html("Faltan campos!");
                $('#myModal p').html("Se tiene que especificar al menos una palabra clave o un usuario.");
                $('#myModal').reveal();
                break;
            case "ca":
                $('#myModal h1').html("T'has descuidat d'omplir algun camp!");
                $('#myModal p').html("Cal que com a mínim especifiquis un usuari o una paraula clau.");
                $('#myModal').reveal();
                break;
            default:
                $('#myModal').find('h1').html("Missing Fields!");
                $('#myModal').find('p').html("You have to specify at least one keyword or a user.");
                $('#myModal').reveal();
        }
    }
    else {
        var id = (Math.floor(Math.random() * 90000) + 10000) + user_id + new Date().getTime();
        if (edit_mode) {
            id = edit_id;
        }
        var title;
        if ($('#col_name').text() !== "") {
            title = $('#col_name').text();
        }
        else {
            title = $('#interest').val();
        }
        var viewData = {
            "_id": id,
            "title": title,
            "ownerId": user_id,
            "keywords": [],
            "accounts": []
        };
        var $tagsli = $('#tags').find('li');
        for (var i = 0; i < $tagsli.length; i++) {
            viewData.keywords.push({"keyword": $tagsli.eq(i).find('a').attr('id')});
        }
        var $usersli = $('#users').find('li');
        for (var i = 0; i < $usersli.length; i++) {
            var text = $usersli.eq(i).find('a').attr('id');
            var text_arr = text.split('------');
            viewData.accounts.push({
                "username": text_arr[0],
                "source": text_arr[1],
                "id": text_arr[2],
                "name": text_arr[3]
            });
        }
        var temp = JSON.stringify(viewData);
        var url = api_folder + 'collection';
        if (edit_mode) {
            edit_mode = false;
            url = api_folder + 'collection/edit';
            $('#edit_col_heading').hide();
            $('#start_col_heading').show();
        }
        $.ajax({
            type: 'POST',
            url: url,
            data: temp,
            success: function () {
                $('html,body').animate({
                    scrollTop: $(".fifth-section").offset().top - 50
                }, 800);
                pagination = 1;
                $('.controls').find('.btn_material').removeClass('active');
                $('#all').addClass('active');
                get_collections(true);
                $('#col_name,#tags,#users').empty();
                $('#interest,.user_input').prop('disabled', false);
                $('.user_input').val("").blur();
            },
            error: function (e) {
                switch (translation_param) {
                    case "en":
                        $('#myModal h1').html("Oops. Something went wrong!");
                        $('#myModal p').html("Your collection has not be submitted. Please try again.");
                        $('#myModal').reveal();
                        break;
                    case "el":
                        $('#myModal h1').html("Κάτι πήγε στραβά!");
                        $('#myModal p').html("Η συλλογή δεν υποβλήθηκε. Προσπάθησε ξανά.");
                        $('#myModal').reveal();
                        break;
                    case "it":
                        $('#myModal h1').html("Si e' verificato un problema!");
                        $('#myModal p').html("La tua raccolta non è stata visualizzata. Prova ancora.");
                        $('#myModal').reveal();
                        break;
                    case "tr":
                        $('#myModal h1').html("Birşeyler yanlış gitti!");
                        $('#myModal p').html("Koleksiyonunuz gönderilemedi. Lütfen tekrar deneyiniz.");
                        $('#myModal').reveal();
                        break;
                    case "sp":
                        $('#myModal h1').html("Algo salió mal!");
                        $('#myModal p').html("Su colección no ha sido presentada . Por favor, inténtelo de nuevo.");
                        $('#myModal').reveal();
                        break;
                    case "ca":
                        $('#myModal h1').html("S'ha produït un error!");
                        $('#myModal p').html("El teu recull no s'ha registrat correctament. Si us plau prova-ho una altra vegada.");
                        $('#myModal').reveal();
                        break;
                    default:
                        $('#myModal h1').html("Oops. Something went wrong.");
                        $('#myModal p').html("Your collection has not be submitted. Please try again.");
                        $('#myModal').reveal();
                }
            }
        });
    }
});
$("#Container").on("click", ".restart_icon", function () {
    var $this = $(this);
    $.ajax({
        url: api_folder + 'collection/start/' + $this.siblings('.delete_icon').attr('id'),
        type: 'GET',
        success: function () {
            if ($('.controls').find('.active').attr('id') === "all") {
                $this.siblings('.details').removeClass('stop_color').addClass('run_color');
                $this.removeClass('restart_icon').addClass('stop_icon');
            }
            else {
                if (($('.collection').length) === 1 && (pagination > 1)) {
                    pagination--;
                }
                get_collections(true);
            }
        },
        error: function (e) {
            switch (translation_param) {
                case "en":
                    $('#myModal h1').html("Oops. Something went wrong!");
                    $('#myModal p').html("We couldn't delete this collection. Please try again.");
                    $('#myModal').reveal();
                    break;
                case "el":
                    $('#myModal h1').html("Κάτι πήγε στραβά!");
                    $('#myModal p').html("Η συλλογή δεν διαγράφηκε. Προσπάθησε ξανά.");
                    $('#myModal').reveal();
                    break;
                case "it":
                    $('#myModal h1').html("Si e' verificato un problema!");
                    $('#myModal p').html("Non e' stato possibile eliminare questa raccolta. Prova ancora.");
                    $('#myModal').reveal();
                    break;
                case "tr":
                    $('#myModal h1').html("Birşeyler yanlış gitti!");
                    $('#myModal p').html("Bu koleksiyonu silinemiyor. Lütfen tekrar deneyiniz.");
                    $('#myModal').reveal();
                    break;
                case "sp":
                    $('#myModal h1').html("Algo salió mal!");
                    $('#myModal p').html("No hemos podido eliminar esta colección . Por favor, inténtelo de nuevo.");
                    $('#myModal').reveal();
                    break;
                case "ca":
                    $('#myModal h1').html("S'ha produït un error!");
                    $('#myModal p').html("Aquest recull no s'ha pogut esborrar. Si us plau prova-ho una altra vegada.");
                    $('#myModal').reveal();
                    break;
                default:
                    $('#myModal h1').html("Oops. Something went wrong!");
                    $('#myModal p').html("We couldn't delete this collection. Please try again");
                    $('#myModal').reveal();
            }
        }
    });
});
$("#Container").on("click", ".delete_icon", function () {
    $.ajax({
        url: api_folder + 'collection/delete/' + $(this).attr('id'),
        type: 'GET',
        success: function () {
            if ($('.collection').length === 1) {
                pagination--;
                if (pagination === 0) {
                    pagination = 1;
                }
            }
            get_collections(true);
        },
        error: function (e) {
            switch (translation_param) {
                case "en":
                    $('#myModal h1').html("Oops. Something went wrong!");
                    $('#myModal p').html("We couldn't delete this collection. Please try again.");
                    $('#myModal').reveal();
                    break;
                case "el":
                    $('#myModal h1').html("Κάτι πήγε στραβά!");
                    $('#myModal p').html("Η συλλογή δεν διαγράφηκε. Προσπάθησε ξανά.");
                    $('#myModal').reveal();
                    break;
                case "it":
                    $('#myModal h1').html("Si e' verificato un problema!");
                    $('#myModal p').html("Non e' stato possibile eliminare questa raccolta. Prova ancora.");
                    $('#myModal').reveal();
                    break;
                case "tr":
                    $('#myModal h1').html("Birşeyler yanlış gitti!");
                    $('#myModal p').html("Bu koleksiyonu silinemiyor. Lütfen tekrar deneyiniz.");
                    $('#myModal').reveal();
                    break;
                case "sp":
                    $('#myModal h1').html("Algo salió mal!");
                    $('#myModal p').html("No hemos podido eliminar esta colección . Por favor, inténtelo de nuevo.");
                    $('#myModal').reveal();
                    break;
                case "ca":
                    $('#myModal h1').html("S'ha produït un error!");
                    $('#myModal p').html("Aquest recull no s'ha pogut esborrar. Si us plau prova-ho una altra vegada.");
                    $('#myModal').reveal();
                    break;
                default:
                    $('#myModal h1').html("Oops. Something went wrong!");
                    $('#myModal p').html("We couldn't delete this collection. Please try again");
                    $('#myModal').reveal();
            }
        }
    });
});
$("#Container").on("click", ".stop_icon", function () {
    var $this = $(this);
    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/stop/' + $this.siblings('.delete_icon').attr('id'),
        success: function () {
            if ($('.controls').find('.active').attr('id') === "all") {
                $this.siblings('.details').removeClass('run_color').addClass('stop_color');
                $this.removeClass('stop_icon').addClass('restart_icon');
            }
            else {
                if (($('.collection').length) === 1 && (pagination > 1)) {
                    pagination--;
                }
                get_collections(true);
            }
        },
        error: function (e) {
            switch (translation_param) {
                case "en":
                    $('#myModal h1').html("Oops. Something went wrong!");
                    $('#myModal p').html("Your collection has not be stopped. Please try again.");
                    $('#myModal').reveal();
                    break;
                case "el":
                    $('#myModal h1').html("Κάτι πήγε στραβά!");
                    $('#myModal p').html("Η συλλογή δεν σταμάτησε. Προσπάθησε ξανά.");
                    $('#myModal').reveal();
                    break;
                case "it":
                    $('#myModal h1').html("Si e' verificato un problema!");
                    $('#myModal p').html("La tua raccolta non si è fermata. Ti invitiamo a riprovare.");
                    $('#myModal').reveal();
                    break;
                case "tr":
                    $('#myModal h1').html("Birşeyler yanlış gitti!");
                    $('#myModal p').html("Koleksiyon durdurulamıyor. Lütfen tekrar deneyiniz.");
                    $('#myModal').reveal();
                    break;
                case "sp":
                    $('#myModal h1').html("Algo salió mal!");
                    $('#myModal p').html("Su colección no se ha detenido . Por favor, inténtelo de nuevo.");
                    $('#myModal').reveal();
                    break;
                case "ca":
                    $('#myModal h1').html("S'ha produït un error!");
                    $('#myModal p').html("El teu recull no s'ha aturat correctament. Si us plau prova-ho una altra vegada.");
                    $('#myModal').reveal();
                    break;
                default:
                    $('#myModal h1').html("Oops. Something went wrong!");
                    $('#myModal p').html("Your collection has not be stopped. Please try again.");
                    $('#myModal').reveal();
            }
        }
    });
});
$("#Container").on("click", ".edit_icon", function () {

    edit_mode = true;
    var $this = $(this);
    var id = $this.prev('.delete_icon').attr('id');
    edit_id = id;
    var col_name = $this.siblings('.overlay').find('h3').text();


    $('#tags,#users').empty();
    $('#edit_col_heading').show();
    $('#start_col_heading').hide();
    $('#edit_col_name').html(col_name);
    $('#col_name').hide().fadeIn(600).html(col_name + '<img src="imgs/edit-white.png" alt="edit" class="edit"/>');
    $('html,body').animate({
        scrollTop: $(".third-section").offset().top - 100
    }, 800);

    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/' + user_id + '/' + id,
        success: function (e) {
            $("#interest").val("").blur().prop('disabled', true);

            $.each(e.keywords, function (index, keyword) {
                addtag(keyword['keyword']);
            });

            $.each(e.accounts, function (index, user) {
                adduser(user['id'], user['name'], user['username'], user['source']);
            });
        }
    });

});
$("#Container").on("click", ".overlay", function () {
    if (translation_param) {
        $(location).attr('href', 'collection.html?collection=' + $(this).siblings('.delete_icon').attr('id') + "&language=all&topics=*&original=all&type=all&sort=recency&query=&source=Facebook,Twitter,Flickr,Youtube,RSS,GooglePlus&since=0&until=1514678400000&view=feed&translation=" + translation_param)
    }
    else {
        $(location).attr('href', 'collection.html?collection=' + $(this).siblings('.delete_icon').attr('id') + "&language=all&topics=*&original=all&type=all&sort=recency&query=&source=Facebook,Twitter,Flickr,Youtube,RSS,GooglePlus&since=0&until=1514678400000&view=feed&translation=en")
    }
});

var pagination = 1;
if (user_id != "") {
    get_collections(true);
}
else {
    switch (translation_param) {
        case "en":
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("You have to define a user id.");
            $('#myModal').reveal();
            break;
        case "el":
            $('#myModal h1').html("Κάτι πήγε στραβά!");
            $('#myModal p').html("Πρέπει να προσδιορίσετε ένα μοναδικό αναγνωριστικό για τον χρήστη.");
            $('#myModal').reveal();
            break;
        case "it":
            $('#myModal h1').html("Si e' verificato un problema!");
            $('#myModal p').html("You have to define a user id.");
            $('#myModal').reveal();
            break;
        case "tr":
            $('#myModal h1').html("Birşeyler yanlış gitti!");
            $('#myModal p').html("You have to define a user id.");
            $('#myModal').reveal();
            break;
        case "sp":
            $('#myModal h1').html("Algo salió mal!");
            $('#myModal p').html("You have to define a user id.");
            $('#myModal').reveal();
            break;
        case "ca":
            $('#myModal h1').html("S'ha produït un error!");
            $('#myModal p').html("You have to define a user id.");
            $('#myModal').reveal();
            break;
        default:
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("You have to define a user id.");
            $('#myModal').reveal();
    }
    $('.fifth-section,.fourth-section,.third-section,#mainmenu,#discover').remove();
    $('.second-section').css('min-height', $(window).height() - $('.sixth-section').height());
}

function get_collections(flag) {
    $('.no_collections,#no_stopped,#no_running').hide();
    $('.controls,#collection_loader,#Container,.well').show();
    var $tiles = $('#tiles');
    var $paginationdemo = $('#pagination-demo');
    $tiles.empty();
    $("#collection_loader").show();
    var status_param = $('.controls').find('.active').attr('id');
    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/' + user_id + '?nPerPage=6&pageNumber=' + pagination + "&status=" + status_param,
        dataType: "json",
        success: function (json) {
            if (json.count > 0) {
                if (flag) {
                    if ($paginationdemo.data("twbs-pagination")) {
                        $paginationdemo.twbsPagination('destroy');
                    }
                    $paginationdemo.twbsPagination({
                        totalPages: Math.ceil(json.count / 6),
                        visiblePages: "5",
                        initiateStartPageClick: false,
                        startPage: pagination,
                        onPageClick: function (event, page) {
                            pagination = page;
                            get_collections(false);
                        }
                    });
                }
                var data = json.collections;
                for (var i = 0; i < data.length; i++) {
                    var id = data[i]._id;
                    var status = data[i].status;
                    var title = data[i].title;
                    var stop_icon = '<div class="stop_icon"></div>';
                    var edit_icon = '<div class="edit_icon"></div>';
                    var color_state = "run_color";
                    if (status === "stopped") {
                        stop_icon = '<div class="restart_icon"></div>';
                        color_state = "stop_color";
                    }
                    var bg_img = "background-image:url('imgs/placeholder.png');";
                    if (data[i].hasOwnProperty('mediaUrl')) {
                        bg_img = "background-image: url('" + data[i].mediaUrl + "'),url('imgs/placeholder.png');";
                    }

                    var keywords = data[i].keywords;
                    var tags = "";
                    for (var k = 0; k < keywords.length; k++) {
                        tags = tags + keywords[k].keyword + ", ";
                    }
                    if (tags !== "") {
                        tags = tags.slice(0, -2);
                    }
                    else {
                        tags = "-";
                    }

                    var accounts = data[i].accounts;
                    var users = "";
                    var users_style = "margin-top:-13px";
                    var user_icon = "";
                    for (var k = 0; k < accounts.length; k++) {
                        switch (accounts[k].source) {
                            case "Twitter":
                                user_icon = "imgs/twitter-16-gray.png";
                                break;
                            case "GooglePlus":
                                user_icon = "imgs/google+-16-gray.png";
                                break;
                            case "Facebook":
                                user_icon = "imgs/facebook-16-share.png";
                                break;
                            case "RSS":
                                user_icon = "imgs/rss-16-gray.png";
                                break;
                            case "Youtube":
                                user_icon = "imgs/youtube-16-gray.png";
                                break;
                        }
                        users = users + accounts[k].name + '<img class="user_source" src="' + user_icon + '">,&nbsp;';
                    }
                    if (users !== "") {
                        users = users.slice(0, -7);
                        users = '<p>' + users + '</p>';
                    }
                    else {
                        users = "-";
                        users_style = "";
                    }

                    var items = nFormatter(data[i].items);
                    var a = new Date(data[i].creationDate);
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    var year = a.getUTCFullYear();
                    var month = months[a.getUTCMonth()];
                    var day = a.getUTCDate();
                    var date = day + ' ' + month + ' ' + year;

                    var element = '<li class="collection"><div class="tiles_li"><div class="outer"><div class="delete_icon" id="' + id + '"></div>' + edit_icon + stop_icon + '<div class="overlay"><div class="overlay_table"><div class="overlay_cell"><h3>' + title + '</h3></div></div></div><div class="tiles_img" style="' + bg_img + '"></div><div class="tags_wrapper"><img src="imgs/hash-gray.png" width="20" style="float: left;margin-right: 5px;"><div class="tags_p">' + tags + '</div></div><div class="tags_wrapper"><img src="imgs/email-gray.png" width="20" style="float: left;margin-right: 5px;"><div class="tags_p" style='+users_style+'>' + users + '</div></div><div class="details ' + color_state + '"><div class="images_count"><img src="imgs/items.png" width="20"><span class="items_count">' + items + '</span></div><div class="date">' + date + '</div></div></div></div></li>';
                    $tiles.append(element);
                    var options = {
                        autoResize: true,
                        container: $('#Container'),
                        offset: 15,
                        itemWidth: 340,
                        outerOffset: 0
                    };
                    var handler = $tiles.find('li');
                    handler.wookmark(options);
                    $("#collection_loader").hide();
                }
            }
            else {
                switch (status_param) {
                    case "all" :
                        $('.no_collections').show();
                        $('.controls,#collection_loader,#Container,.well').hide();
                        break;
                    case "running" :
                        $.ajax({
                            type: 'GET',
                            url: api_folder + 'collection/' + user_id + '?nPerPage=1&pageNumber=1&status=all',
                            dataType: "json",
                            success: function (json) {
                                if (json.count === 0) {
                                    $('.no_collections').show();
                                    $('.controls,#collection_loader,#Container,.well').hide();
                                }
                                else {
                                    $('#collection_loader,.well').hide();
                                    $('#no_running').show();
                                }
                            },
                            error: function (e) {
                                $('.no_collections').show();
                                $('.controls,#collection_loader,#Container,.well').hide();
                            }
                        });
                        break;
                    case "stopped" :
                        $.ajax({
                            type: 'GET',
                            url: api_folder + 'collection/' + user_id + '?nPerPage=1&pageNumber=1&status=all',
                            dataType: "json",
                            success: function (json) {
                                if (json.count === 0) {
                                    $('.no_collections').show();
                                    $('.controls,#collection_loader,#Container,.well').hide();
                                }
                                else {
                                    $('#collection_loader,.well').hide();
                                    $('#no_stopped').show();
                                }
                            },
                            error: function (e) {
                                $('.no_collections').show();
                                $('.controls,#collection_loader,#Container,.well').hide();
                            }
                        });
                }
            }
        },
        error: function (e) {
            $("#collection_loader,.well,.controls .btn_material").hide();
            switch (translation_param) {
                case "en":
                    $('#myModal h1').html("Oops. Something went wrong!");
                    $('#myModal p').html("Your collections can not be loaded.");
                    $('#myModal').reveal();
                    break;
                case "el":
                    $('#myModal h1').html("Κάτι πήγε στραβά!");
                    $('#myModal p').html("Δεν μπορέσαμε να φορτώσουμε τις συλλογές σας.");
                    $('#myModal').reveal();
                    break;
                case "it":
                    $('#myModal h1').html("Si e' verificato un problema!");
                    $('#myModal p').html("Le tue raccolte non possono essere caricate.");
                    $('#myModal').reveal();
                    break;
                case "tr":
                    $('#myModal h1').html("Birşeyler yanlış gitti!");
                    $('#myModal p').html("Koleksiyonlarınız yüklenemiyor.");
                    $('#myModal').reveal();
                    break;
                case "sp":
                    $('#myModal h1').html("Algo salió mal!");
                    $('#myModal p').html("No hemos podido cargar sus colecciones.");
                    $('#myModal').reveal();
                    break;
                case "ca":
                    $('#myModal h1').html("S'ha produït un error!");
                    $('#myModal p').html("Els teus reculls  no s'han pogut carregar.");
                    $('#myModal').reveal();
                    break;
                default:
                    $('#myModal h1').html("Oops. Something went wrong!");
                    $('#myModal p').html("Your collections can not be loaded.");
                    $('#myModal').reveal();
            }
        }
    });
}

$('.controls').find('.btn_material').click(function () {
    if (!($(this).hasClass(('active')))) {
        $('.controls').find('.btn_material').removeClass('active');
        $(this).addClass('active');
        pagination = 1;
        get_collections(true);
    }
});
$('.btn_discover').click(function () {
    $('html,body').animate({
        scrollTop: $(".third-section").offset().top - 100
    }, 800);
});
$("#mainmenu li").eq(0).click(function () {
    $('html,body').animate({
        scrollTop: $(".third-section").offset().top - 100
    }, 800);
});
$("#mainmenu li").eq(1).click(function () {
    $('html,body').animate({
        scrollTop: $(".fifth-section").offset().top - 100
    }, 800);
});

function nFormatter(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(0).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(0).replace(/\.0$/, '') + 'K';
    }
    return num;
}
function nFormatter_easy(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(0).replace(/\.0$/, '') + 'M';
    }
    if (num >= 10000) {
        return (num / 1000).toFixed(0).replace(/\.0$/, '') + 'K';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$("#dropdown").on("click", function (e) {
    e.preventDefault();

    if ($(this).hasClass("open")) {
        $(this).removeClass("open");
        $(this).children("ul").slideUp("fast");
    } else {
        $(this).addClass("open");
        $(this).children("ul").slideDown("fast");
    }
});

$("#dropdown li").click(function () {
    $('#lang').html($(this).text());
    $(location).attr('href', 'index.html?translation=' + $(this).attr('id') + "&user_id=" + user_id);
});

$("#text_user").click(function () {
    if ($(this).hasClass('text_user_on')) {
        $(this).attr('src', 'imgs/text-user.png');
    }
    else {
        $(this).attr('src', 'imgs/text-user-blue.png')
    }
    $(this).toggleClass('text_user_on');
});

$(".advanced").click(function (e) {
    $('[data-hide="true"]').slideUp(500);
    $('#advanced_user').slideDown(500);
    $('#users_adv').html($('#users').html());
    $('#users').empty();
});

$(".active_blue").click(function (e) {
    abort();
    $('[data-hide="true"]').slideDown(500);
    $('#advanced_user').slideUp(500);
    $('#users').html($('#users_adv').html());
    $('#users_adv').empty();
    $('#users_images').empty().hide();
    $('#no_results,.Typeahead-spinner,#adv_loading').hide();
    $('#user_advanced').val("").blur();
    if ($("#users li").length === 100) {
        $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_RSS,#user_Youtube").prop('disabled', true);
    }
});

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

$("#users_images").on("click", ".user_img", function (e) {
    e.stopPropagation();
    window.open($(this).attr('data-url'), '_blank');
});

$("#users_images").on("click", ".add_user", function (e) {
    e.stopPropagation();
    if ($(this).hasClass('open_user')) {
        $(this).attr('src', 'imgs/add_user.png');
        $(this).parent().css('background-color', 'transparent');
        $(this).removeClass('open_user');
        deluser_adv($(this).attr('data-username'), $(this).attr('data-social'), $(this).attr('data-id'), $(this).attr('data-name'));
    }
    else {
        if (!($('#users_images').hasClass('users_full'))) {
            $(this).addClass('open_user');
            $(this).attr('src', 'imgs/add_user_green.png');
            $(this).parent().css('background-color', 'lightgray');
            adduser_adv($(this).attr('data-username'), $(this).attr('data-social'), $(this).attr('data-id'), $(this).attr('data-name'));
        }
    }
});
$("#users_images").on("click", ".user", function () {
    $(this).find('.add_user').click();
});