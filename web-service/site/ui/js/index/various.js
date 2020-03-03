function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}

var user_id = gup("user_id");
$(function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGFhcG9zdG8iLCJhIjoic21tVGtEQSJ9.tH3Q3MuElddX8xe26KkoHw';
    var map = new mapboxgl.Map({
        container: 'map',
        center: [21.491211, 49.601811],
        style: 'mapbox://styles/mapbox/streets-v9',
        zoom: 3
    });

    var draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
        },
        paint: {
            "fill-color": "#ff0000"
        }
    });
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(draw);
    map.on("draw.delete", function (e) {
        $("#location_input").prop('disabled', false);
        $('.mapbox-gl-draw_polygon').attr('disabled', false);
        $('#max_locations').slideUp();
        var $polygon_count = $('#polygon_count');
        $polygon_count.text(parseInt($polygon_count.text()) - 1);
        if ((($("#tags li").length > 0) || ($("#users li").length > 0) || ($.map_get_polygon_points().features.length > 0)) && (($('#interest').val() != "") || ($('#col_name').html() != ""))) {
            $('#done_start,#done_edit').removeClass('deactivated');
        }
        else {
            $('#done_start,#done_edit').addClass('deactivated');
        }
    });
    map.on("draw.create", function (e) {
        var $polygon_count = $('#polygon_count');
        $polygon_count.text(parseInt($polygon_count.text()) + 1);
        $('#polygons_num').slideDown();
        if (parseInt($polygon_count.text()) === 5) {
            $("#location_input").val("").blur().prop('disabled', true);
            $('#max_locations').slideDown();
            $('.mapbox-gl-draw_polygon').attr('disabled', true);
        }
        if (($('#interest').val() != "") || ($('#col_name').html() != "")) {
            $('#done_start,#done_edit').removeClass('deactivated');
        }
        else {
            $('#done_start,#done_edit').addClass('deactivated');
        }
    });

    $.map_resize = function map_resize() {
        map.resize();
    };
    $.map_get_polygon_points = function map_get_polygon_points() {
        return draw.getAll();
    };
    $.map_remove_polygons = function map_remove_polygons() {
        $('#polygon_count').text(0);
        if ((($("#tags li").length > 0) || ($("#users li").length > 0)) && (($('#interest').val() != "") || ($('#col_name').html() != ""))) {
            $('#done_start,#done_edit').removeClass('deactivated');
        }
        else {
            $('#done_start,#done_edit').addClass('deactivated');
        }
        draw.deleteAll()
    };
    $.map_add_polygons = function map_add_polygons(features) {
        if (features.length > 0) {
            for (var i = 0; i < features.length; i++) {
                draw.add(features[i]);
            }
            var $polygon_count = $('#polygon_count');
            if (features.length > 1) {
                $polygon_count.text(features.length);
            }
            else {
                $polygon_count.text(parseInt($polygon_count.text()) + 1);
            }
            $('#polygons_num').slideDown();
            if (parseInt($polygon_count.text()) === 5) {
                $("#location_input").val("").blur().prop('disabled', true);
                $('#max_locations').slideDown();
                $('.mapbox-gl-draw_polygon').attr('disabled', true);
            }
            $('.error_expr_collection').slideUp();
            if (($('#interest').val() != "") || ($('#col_name').html() != "")) {
                $('#done_start,#done_edit').removeClass('deactivated');
            }
            else {
                $('#done_start,#done_edit').addClass('deactivated');
            }
        }
    };

    $.map_fly_to = function map_fly_to(long, lat) {
        map.flyTo({
            center: [long, lat],
            zoom: 6
        });
    };

    $(document).on('click', '.selectMultiple ul li', function (e) {
        var select = $(this).parent().parent();
        var li = $(this);
        if (!select.hasClass('clicked')) {
            select.addClass('clicked');
            li.prev().addClass('beforeRemove');
            li.next().addClass('afterRemove');
            li.addClass('remove');
            var a = $('<a />').addClass('notShown').html('<em>' + li.text() + '</em><i></i>').hide().appendTo(select.children('div'));
            a.slideDown(0, function () {
                setTimeout(function () {
                    a.addClass('shown');
                    select.children('div').children('span').addClass('hide');
                    select.find('option:contains(' + li.text() + ')').prop('selected', true);
                }, 0);
            });
            setTimeout(function () {
                if (li.prev().is(':last-child')) {
                    li.prev().removeClass('beforeRemove');
                }
                if (li.next().is(':first-child')) {
                    li.next().removeClass('afterRemove');
                }
                setTimeout(function () {
                    li.prev().removeClass('beforeRemove');
                    li.next().removeClass('afterRemove');
                }, 0);

                li.slideUp(0, function () {
                    li.remove();
                    select.removeClass('clicked');
                });
            }, 0);
        }
    });

    $(document).on('click', '.selectMultiple > div a', function (e) {
        var select = $(this).parent().parent();
        var self = $(this);
        self.removeClass().addClass('remove');
        select.addClass('open');
        setTimeout(function () {
            self.addClass('disappear');
            setTimeout(function () {
                self.animate({
                    width: 0,
                    height: 0,
                    padding: 0,
                    margin: 0
                }, 0, function () {
                    var li = $('<li />').text(self.children('em').text()).addClass('notShown').appendTo(select.find('ul'));
                    li.slideDown(0, function () {
                        li.addClass('show');
                        setTimeout(function () {
                            select.find('option:contains(' + self.children('em').text() + ')').prop('selected', false);
                            if (!select.find('option:selected').length) {
                                select.children('div').children('span').removeClass('hide');
                            }
                            li.removeClass();
                        }, 0);
                    });
                    self.remove();
                })
            }, 0);
        }, 0);
    });

    $(document).on('click', '.selectMultiple > div .arrow, .selectMultiple > div span', function (e) {
        $(this).parent().parent().toggleClass('open');
    });


});

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
    else if ($(this).attr('id') === "tag_advanced") {
        $('#logic_icon').attr('src', 'imgs/logic_32_blue.png');
        $('#search_icon_4').attr('src', 'imgs/search-blue.png');
    }
    else if ($(this).attr('id') === "location_input") {
        $('#location_icon').attr('src', 'imgs/location-blue.png');
        $('#search_icon_5').attr('src', 'imgs/search-blue.png');
    }
    else if ($(this).attr('id') === "query_collection") {
        $('#enter_icon_collection').attr('src', 'imgs/enter-blue.png');
    }
    else {
        $('#user_icon').attr('src', 'imgs/email-blue.png');
        $('.users_icon').attr('src', 'imgs/search-blue.png');
    }
});
$(document).on('blur', input_selector, function () {
    var $inputElement = $(this);
    if ($inputElement.val().length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === "") {
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
        else if ($(this).attr('id') === "tag_advanced") {
            $('#logic_icon').attr('src', 'imgs/logic_32_gray.png');
            $('#search_icon_4').attr('src', 'imgs/search-gray.png');
        }
        else if ($(this).attr('id') === "location_input") {
            $('#location_icon').attr('src', 'imgs/location-gray.png');
            $('#search_icon_5').attr('src', 'imgs/search-gray.png');
        }
        else if ($(this).attr('id') === "query_collection") {
            $('#enter_icon_collection').attr('src', 'imgs/enter-gray.png');
        }
        else {
            $('#user_icon').attr('src', 'imgs/email-gray.png');
            $('.users_icon').attr('src', 'imgs/search-gray.png');
        }
    }
});
$("#query_collection").keyup(function (e) {
    if (e.keyCode === 13) {
        pagination = 1;
        get_collections_normal(true);
    }
});
$("#hashtag").keyup(function (e) {
    if (e.keyCode === 13) {
        addtag($(this).val().toLowerCase());
    }
});
$("#tag_advanced").keyup(function (e) {
    if (e.keyCode === 13) {
        addtag_dragarea($(this).val().toLowerCase());
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
                    $('#max_users,#max_users_advanced').slideDown();
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
        $('.error_expr_collection').slideUp();
        var tag_arr = tag.split(',');
        $("#hashtag").val("");
        var length = Math.min(count, tag_arr.length);
        for (var i = 0; i < length; i++) {
            if (/\S/.test(tag_arr[i])) {
                flag = 1;
                $('#tags li').children().each(function () {
                    if ($(this).attr('id') === tag_arr[i].replace(/^\s+|\s+$/g, '')) {
                        var height = $(this).parent().height();
                        $(this).parent().css('height', height).hide('slow', function () {
                            $(this).remove();
                        });
                        flag = 0;
                    }
                });
                var tags = document.getElementById('tags');
                var li = document.createElement('li');
                $(li).hide().appendTo(tags).fadeIn(600);

                var a = document.createElement('a');
                a.setAttribute('href', 'javascript:void(0);');
                a.setAttribute('id', tag_arr[i].replace(/^\s+|\s+$/g, ''));
                a.innerHTML = tag_arr[i].replace(/^\s+|\s+$/g, '');
                li.appendChild(a);

                var img_edit = document.createElement('img');
                img_edit.setAttribute('src', 'imgs/edit_tag.png');
                img_edit.setAttribute('class', 'edit_tag');
                a.appendChild(img_edit);

                var img_delete = document.createElement('img');
                img_delete.setAttribute('src', 'imgs/delete.png');
                img_delete.setAttribute('class', 'delete');
                a.appendChild(img_delete);

                if (flag) {
                    if ($("#tags li").length === 20) {
                        $("#hashtag,#tag_advanced").prop('disabled', true);
                        $('#max_tags,#max_tags_advanced').slideDown();
                    }
                }
            }
        }
        if (($('#interest').val() != "") || ($('#col_name').html() != "")) {
            $('#done_start,#done_edit').removeClass('deactivated');
        }
        else {
            $('#done_start,#done_edit').addClass('deactivated');
        }
    }
}

function addtag_advanced(tag, edit) {
    var flag = 1;
    var count = 20 - $("#tags_adv li").length;
    if (count > 0) {
        var tag_arr = tag.split(',');
        $("#tag_advanced").val("");
        var length = Math.min(count, tag_arr.length);
        for (var i = 0; i < length; i++) {
            if (/\S/.test(tag_arr[i])) {
                flag = 1;
                $('#tags_adv li').children().each(function () {
                    if ($(this).attr('id') === tag_arr[i].replace(/^\s+|\s+$/g, '')) {
                        var height = $(this).parent().height();
                        $(this).parent().css('height', height).hide('slow', function () {
                            $(this).remove();
                        });
                        flag = 0;
                    }
                });
                var tags_adv = document.getElementById('tags_adv');
                var li = document.createElement('li');
                $(li).hide().appendTo(tags_adv).fadeIn(600);

                var a = document.createElement('a');
                a.setAttribute('href', 'javascript:void(0);');
                a.setAttribute('id', tag_arr[i].replace(/^\s+|\s+$/g, ''));
                a.setAttribute('data-edit', edit.replace(/^\s+|\s+$/g, ''));
                a.innerHTML = tag_arr[i].replace(/^\s+|\s+$/g, '');
                li.appendChild(a);

                var img_edit = document.createElement('img');
                img_edit.setAttribute('src', 'imgs/edit_tag.png');
                img_edit.setAttribute('class', 'edit_tag_adv');
                a.appendChild(img_edit);

                var img = document.createElement('img');
                img.setAttribute('src', 'imgs/delete.png');
                img.setAttribute('class', 'delete');
                a.appendChild(img);

                if (flag) {
                    if ($("#tags_adv li").length === 20) {
                        $("#hashtag,#tag_advanced").prop('disabled', true);
                        $('#max_tags,#max_tags_advanced').slideDown();
                    }
                }
            }
        }
    }
}

function addtag_dragarea(tag) {
    var $expression = $('#expression');
    var tag_arr = tag.split(',');
    $("#tag_advanced").val("");
    var flag = true;
    for (var i = 0; i < tag_arr.length; i++) {
        if (/\S/.test(tag_arr[i])) {
            $expression.children().each(function () {
                if ($(this).attr('id') === tag_arr[i].replace(/^\s+|\s+$/g, '')) {
                    $('.shake').eq(0).removeClass('shake');
                    var $this = $(this);
                    setTimeout(function () {
                        $this.addClass('shake');
                    }, 50);
                    flag = false;
                }
            });
            if (flag) {
                $('#error_expr').slideUp();
                $('.error_operator').removeClass('error_operator');
                $('<li id="' + tag_arr[i].replace(/^\s+|\s+$/g, '') + '" class="tag_operator operator">' + tag_arr[i].replace(/^\s+|\s+$/g, '') + '<img src="imgs/delete.png" class="delete_expression"></li>').hide().appendTo($expression).show('normal');
            }
        }
    }
}

function addlocation(long, lat, name) {
    if ($("#location_input").val() !== "") {
        if (!($('#map_button').is(":checked"))) {
            $('#map_button').click();
        }
        $("#location_input").val("");
        $('.error_expr_location').slideUp();
        var features = [];
        features.push({
            "type": "FeatureCollection",
            "features": [{
                "id": name,
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "coordinates": [[[long - 0.3, lat + 0.3], [long - 0.3, lat - 0.3], [long + 0.3, lat - 0.3], [long + 0.3, lat + 0.3], [long - 0.3, lat + 0.3]]],
                    "type": "Polygon"
                }
            }]
        });
        $.map_fly_to(long, lat);
        var array_points = $.map_get_polygon_points();
        for (var k = 0; k < array_points.features.length; k++) {
            if (array_points.features[k].id === name) {
                return;
            }
        }
        $.map_add_polygons(features);
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
        $('.error_expr_collection').slideUp();
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
                    var height = $(this).parent().height();
                    $(this).parent().css('height', height).hide('slow', function () {
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
                if (($('#interest').val() != "") || ($('#col_name').html() != "")) {
                    $('#done_start,#done_edit').removeClass('deactivated');
                }
                else {
                    $('#done_start,#done_edit').addClass('deactivated');
                }
                if ($("#users li").length === 100) {
                    $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube").prop('disabled', true);
                    $('#max_users,#max_users_advanced').slideDown();
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
            $('#max_users,#max_users_advanced').slideDown();
        }
    }
}

function deluser_adv($social, $id) {
    $('#users_adv li').children().each(function () {
        if ($(this).attr('id').indexOf($social + "------" + $id) > -1) {
            var height = $(this).parent().height();
            $(this).parent().css('height', height).hide('slow', function () {
                $(this).remove();
            });
        }
    });
    $('#users_images').removeClass('users_full');
    $('#max_users,#max_users_advanced').slideUp();
}

$("#interest").keyup(function (e) {
    $('.error_expr_collection').slideUp();
    if ((($("#tags li").length > 0) || ($("#users li").length > 0) || ($.map_get_polygon_points().features.length > 0)) && (($('#interest').val() != "") || ($('#col_name').html() != ""))) {
        $('#done_start,#done_edit').removeClass('deactivated');
    }
    else {
        $('#done_start,#done_edit').addClass('deactivated');
    }
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

$("#user_tags,#user_tags_adv").on("click", ".delete", function () {
    var height = $(this).closest('li').height();
    $(this).closest('li').css('height', height).hide('slow', function () {
        $(this).remove();
        if ((($("#tags li").length > 0) || ($("#users li").length > 0) || ($.map_get_polygon_points().features.length > 0)) && (($('#interest').val() != "") || ($('#col_name').html() != ""))) {
            $('#done_start,#done_edit').removeClass('deactivated');
        }
        else {
            $('#done_start,#done_edit').addClass('deactivated');
        }
    });
    $("#hashtag,#tag_advanced").prop('disabled', false);
    $('#max_tags,#max_tags_advanced').slideUp();

});
$("#user_tags").on("click", ".edit_tag", function () {
    if ($("#tags li").length < 20) {
        $('#hashtag').val($(this).parent().attr('id')).focus();
    }
});
$("#user_tags").on("click", ".edit_tag_adv", function () {
    var data_edit = $(this).parent().attr('data-edit');
    $('#advanced_tag_search').click();
    setTimeout(function () {
        $("#tags_adv").find("a[data-edit='" + data_edit + "']").find('.edit_tag_adv').click();
    }, 550)
});
$("#user_tags_adv").on("click", ".edit_tag", function () {
    if ($("#tags_adv li").length < 20) {
        $('#tag_advanced').val($(this).parent().attr('id')).focus();
    }
});
$("#user_tags_adv").on("click", ".edit_tag_adv", function () {
    if ($("#tags_adv li").length < 20) {
        var $expression = $('#expression');
        $expression.empty();
        var tag_arr = $(this).parent().attr('data-edit').split("S");
        for (var i = 0; i < tag_arr.length - 1; i++) {
            switch (tag_arr[i]) {
                case "PARO":
                    $expression.append('<li class="parenthesis_operator open_parenthesis operator" style="">[<img src="imgs/delete.png" class="delete_parenthesis rand-1"></li>');
                    break;
                case "PARC":
                    $expression.append('<li class="parenthesis_operator close_parenthesis operator" style="">]<img src="imgs/delete.png" class="delete_parenthesis rand-1"></li>');
                    break;
                case "AND":
                    $expression.append('<li class="logic_operator and_operator operator">AND<img src="imgs/delete.png" class="delete_expression"></li>')
                    break;
                case "OR":
                    $expression.append('<li class="logic_operator or_operator operator" style="width: 64px">OR<img src="imgs/delete.png" class="delete_expression"></li>');
                    break;
                case "NOT":
                    $expression.append('<li class="logic_operator not_operator operator">NOT<img src="imgs/delete.png" class="delete_expression"></li>')
                    break;
                default:
                    $expression.append('<li id="' + tag_arr[i] + '" class="tag_operator operator" style="">' + tag_arr[i] + '<img src="imgs/delete.png" class="delete_expression"></li>')
            }
        }
    }
});
$("#user_users").on("click", ".delete", function () {
    var height = $(this).closest('li').height();
    $(this).closest('li').css('height', height).hide('slow', function () {
        $(this).remove();
        if ((($("#tags li").length > 0) || ($("#users li").length > 0) || ($.map_get_polygon_points().features.length > 0)) && (($('#interest').val() != "") || ($('#col_name').html() != ""))) {
            $('#done_start,#done_edit').removeClass('deactivated');
        }
        else {
            $('#done_start,#done_edit').addClass('deactivated');
        }
    });
    $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube").prop('disabled', false);
    $('#max_users,#max_users_advanced').slideUp();
    $('#users_images').removeClass('users_full');

});
$("#user_users_adv").on("click", ".delete", function () {
    var height = $(this).closest('li').height();
    $(this).closest('li').css('height', height).hide('slow', function () {
        $(this).remove();
    });
    $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube").prop('disabled', false);
    $('#max_users,#max_users_advanced').slideUp();
    $('#users_images').removeClass('users_full');
    $("[data-id=" + $(this).parent().attr('id').split('------')[2] + "]").removeClass('open_user').attr('src', 'imgs/add_user.png').parent().css('background-color', 'transparent');
});
var $expression = $("#expression");
$expression.on("click", ".delete_expression", function (e) {
    var height = $(this).parent().height();
    $(this).parent().css('height', height).hide('slow', function () {
        $(this).remove();
    });
    $('#error_expr').slideUp();
    $('.error_operator').removeClass('error_operator');
});
$expression.on("click", ".delete_parenthesis", function (e) {
    var height = $(this).parent().height();
    $(this).parent().css('height', height).hide('slow', function () {
        $(this).remove();
    });
    $('.' + $(this).attr('class').split(' ')[1]).parent().css('height', height).hide('slow', function () {
        $(this).remove();
    });
    $('#error_expr').slideUp();
    $('.error_operator').removeClass('error_operator');
});

$("#search_icon_1").click(function () {
    var $hashtag = $("#hashtag");
    addtag($hashtag.val().toLowerCase());
    $hashtag.blur();
});
$("#search_icon_4").click(function () {
    $("label[for='tag_advanced']").removeClass('active');
    $('#logic_icon').attr('src', 'imgs/logic_32_gray.png');
    $('#search_icon_4').attr('src', 'imgs/search-gray.png');
    addtag_dragarea($("#tag_advanced").val().toLowerCase());
});
$("#enter_icon").click(function () {
    addname();
    $("#interest").blur();
});
$("#enter_icon_collection").click(function () {
    pagination = 1;
    $("#query_collection").blur();
    get_collections_normal(true);
});
$("#clear_query").click(function () {
    pagination = 1;
    $('#query_collection').val("").blur();
    get_collections_normal(true);
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
        addtag($(this).html().toLowerCase());
    }
});
$("#examples_2").find("li").click(function () {
    $("label[for='tag_advanced']").removeClass('active');
    $('#logic_icon').attr('src', 'imgs/logic_32_gray.png');
    $('#search_icon_4').attr('src', 'imgs/search-gray.png');
    if ($("#tags_adv li").length < 20) {
        addtag_advanced($(this).html(), $(this).attr('data-edit'));
    }
});
$("#examples_3").find("li").click(function () {
    $("label[for='location_input']").removeClass('active');
    $('#location_icon').attr('src', 'imgs/location-gray.png');
    $('#search_icon_5').attr('src', 'imgs/search-gray.png');
    if (parseInt($('#polygon_count').text()) != 5) {
        var value = $(this).html();
        geocoder.geocode({"address": value}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat(),
                    lng = results[0].geometry.location.lng(),
                    placeName = results[0].address_components[0].long_name;
                $("#location_input").val("-");
                addlocation(lng, lat, placeName);
            }
            else {
                $('.error_expr_location').slideDown();
            }
        });

    }
});
$("#example_1").click(function () {
    if ($("#users li").length < 100) {
        $('.error_expr_collection').slideUp();
        var flag = 1;
        $('#users li').children().each(function () {
            if ($(this).attr('id') === "Greenpeace------Twitter------3459051------Greenpeace") {
                var height = $(this).parent().height();
                $(this).parent().css('height', height).hide('slow', function () {
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
            if (($('#interest').val() != "") || ($('#col_name').html() != "")) {
                $('#done_start,#done_edit').removeClass('deactivated');
            }
            else {
                $('#done_start,#done_edit').addClass('deactivated');
            }
            if ($("#users li").length === 100) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube").prop('disabled', true);
                $('#max_users,#max_users_advanced').slideDown();
            }
        }
    }
});
$("#example_5").click(function () {
    if ($("#users_adv li").length < 100) {
        var flag = 1;
        $('#users_adv li').children().each(function () {
            if ($(this).attr('id') === "Greenpeace------Twitter------3459051------Greenpeace") {
                var height = $(this).parent().height();
                $(this).parent().css('height', height).hide('slow', function () {
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
                $('#max_users,#max_users_advanced').slideDown();
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
        $('.error_expr_collection').slideUp();
        var flag = 1;
        $('#users li').children().each(function () {
            if ($(this).attr('id') === "WWF------GooglePlus------114176126428866920097------WWF") {
                var height = $(this).parent().height();
                $(this).parent().css('height', height).hide('slow', function () {
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
            if (($('#interest').val() != "") || ($('#col_name').html() != "")) {
                $('#done_start,#done_edit').removeClass('deactivated');
            }
            else {
                $('#done_start,#done_edit').addClass('deactivated');
            }
            if ($("#users li").length === 100) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube").prop('disabled', true);
                $('#max_users,#max_users_advanced').slideDown();
            }
        }
    }
});
$("#example_6").click(function () {
    if ($("#users_adv li").length < 100) {
        var flag = 1;
        $('#users_adv li').children().each(function () {
            if ($(this).attr('id') === "WWF------GooglePlus------114176126428866920097------WWF") {
                var height = $(this).parent().height();
                $(this).parent().css('height', height).hide('slow', function () {
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
                $('#max_users,#max_users_advanced').slideDown();
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
        $('.error_expr_collection').slideUp();
        var flag = 1;
        $('#users li').children().each(function () {
            if ($(this).attr('id') === "CapeNature1------Facebook------137406639638143------CapeNature") {
                var height = $(this).parent().height();
                $(this).parent().css('height', height).hide('slow', function () {
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
            if (($('#interest').val() != "") || ($('#col_name').html() != "")) {
                $('#done_start,#done_edit').removeClass('deactivated');
            }
            else {
                $('#done_start,#done_edit').addClass('deactivated');
            }
            if ($("#users li").length === 100) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube").prop('disabled', true);
                $('#max_users,#max_users_advanced').slideDown();
            }
        }
    }
});
$("#example_7").click(function () {
    if ($("#users_adv li").length < 100) {
        var flag = 1;
        $('#users_adv li').children().each(function () {
            if ($(this).attr('id') === "CapeNature1------Facebook------137406639638143------CapeNature") {
                var height = $(this).parent().height();
                $(this).parent().css('height', height).hide('slow', function () {
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
                $('#max_users,#max_users_advanced').slideDown();
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
$("#Container_normal,#Container_fav").on("click", ".fav_icon", function () {
    $(this).removeClass('fav_icon').addClass('fav_icon_full');
    var $this = $(this);
    var favorite = {
        "favorite": true
    };
    var temp = JSON.stringify(favorite);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + user_id + '/' + $this.siblings('.delete_icon').attr('id') + '/favorite',
        data: temp,
        success: function () {
            if (($('#tiles_normal').find('.collection').length) === 1 && (pagination > 1)) {
                pagination--;
            }
            get_collections_normal(true);
            get_collections_fav();
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("We couldn't favorite this collection. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_normal,#Container_fav").on("click", ".fav_icon_full", function () {
    $(this).removeClass('fav_icon_full').addClass('fav_icon');
    var $this = $(this);
    var favorite = {
        "favorite": false
    };
    var temp = JSON.stringify(favorite);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + user_id + '/' + $this.siblings('.delete_icon').attr('id') + '/favorite',
        data: temp,
        success: function () {
            if (($('#tiles_normal').find('.collection').length) === 1 && (pagination > 1)) {
                pagination--;
            }
            get_collections_normal(true);
            get_collections_fav();
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("We couldn't favorite this collection. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_normal,#Container_fav").on("click", ".copy_icon", function () {
    var new_cid = (Math.floor(Math.random() * 90000) + 10000) + user_id + new Date().getTime();
    var $this = $(this);
    $.ajax({
        type: 'POST',
        url: api_folder + 'collection/' + user_id + '/' + $this.siblings('.delete_icon').attr('id') + '/replicate/' + new_cid,
        success: function () {
            if ($this.parents('ul').attr('id') === "tiles_fav") {
                get_collections_fav();
            }
            else {
                get_collections_normal(true);
            }
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("We couldn't copy this collection. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_normal").on("click", ".restart_icon", function () {
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
                if (($('#tiles_normal').find('.collection').length) === 1 && (pagination > 1)) {
                    pagination--;
                }
                get_collections_normal(true);
            }
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("We couldn't delete this collection. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_fav").on("click", ".restart_icon", function () {
    var $this = $(this);
    $.ajax({
        url: api_folder + 'collection/start/' + $this.siblings('.delete_icon').attr('id'),
        type: 'GET',
        success: function () {
            $this.siblings('.details').removeClass('stop_color').addClass('run_color');
            $this.removeClass('restart_icon').addClass('stop_icon');
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("We couldn't delete this collection. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_normal,#Container_fav").on("click", ".delete_icon", function () {
    $('.cover_delete,.tooltip_delete,.tooltip_share').hide();
    $(this).parents('.collection').find('.cover_delete').fadeIn(300);
    $(this).siblings('.tooltip_delete').fadeIn(300);
});
$("#Container_normal,#Container_fav").on("click", ".split_icon", function () {
    $('.cover_delete,.tooltip_share,.tooltip_share').hide();
    $(this).parents('.collection').find('.cover_delete').fadeIn(300);
    $(this).siblings('.tooltip_share').fadeIn(300);
});
$(document).mouseup(function (e) {
    var container = $(".delete_icon,.tooltip_share");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('.cover_delete,.tooltip_delete,.tooltip_share').hide();
    }
});
$("#Container_normal,#Container_fav").on("click", ".cancel_share", function () {
    $('.cover_delete,.tooltip_share').hide();
});
$("#Container_normal,#Container_fav").on("click", ".confirm_share", function () {
    var $this = $(this);
    if ($this.siblings('.share_input').val() != "") {
        var share_id = [];
        var input_val = $this.siblings('.share_input').val().split(',');
        for (var s = 0; s < input_val.length; s++) {
            share_id.push(input_val[s]);
        }
        var temp = JSON.stringify(share_id);

        $.ajax({
            type: 'POST',
            url: api_folder + 'collection/' + user_id + '/' + $(this).parent().siblings('.delete_icon').attr('id') + '/share',
            data: temp,
            success: function () {
                $('.cover_delete,.tooltip_share').hide();
            },
            error: function (e) {
                $('#myModal h1').html("Oops. Something went wrong!");
                $('#myModal p').html("We couldn't share this collection. Please try again.");
                $('#myModal').reveal();
            }
        });
    }

});
$("#Container_normal").on("click", ".confirm_delete", function () {
    $.ajax({
        url: api_folder + 'collection/delete/' + $(this).parent().siblings('.delete_icon').attr('id'),
        type: 'GET',
        success: function () {

            if ($('#tiles_normal').find('.collection').length === 1) {
                pagination--;
                if (pagination === 0) {
                    pagination = 1;
                }
            }
            get_collections_normal(true);
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("We couldn't delete this collection. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_fav").on("click", ".confirm_delete", function () {
    $.ajax({
        url: api_folder + 'collection/delete/' + $(this).parent().siblings('.delete_icon').attr('id'),
        type: 'GET',
        success: function () {
            get_collections_fav(true);
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("We couldn't delete this collection. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_normal").on("click", ".stop_icon", function () {
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
                if (($('#tiles_normal').find('.collection').length) === 1 && (pagination > 1)) {
                    pagination--;
                }
                get_collections_normal(true);
            }
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("Your collection has not be stopped. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_fav").on("click", ".stop_icon", function () {
    var $this = $(this);
    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/stop/' + $this.siblings('.delete_icon').attr('id'),
        success: function () {
            $this.siblings('.details').removeClass('run_color').addClass('stop_color');
            $this.removeClass('stop_icon').addClass('restart_icon');
        },
        error: function (e) {
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("Your collection has not be stopped. Please try again.");
            $('#myModal').reveal();
        }
    });
});
$("#Container_normal,#Container_fav").on("click", ".edit_icon", function () {
    if (($('#advanced_tag').is(":visible")) || ($('#advanced_user').is(":visible"))) {
        $('#advanced_user,#advanced_tag').slideUp(0);
        $('#tags_section,#users_section,#name_section,#map_input').slideDown(0);
    }
    edit_mode = true;
    var $this = $(this);
    var id = $this.prev('.delete_icon').attr('id');
    edit_id = id;
    var col_name = $this.siblings('.overlay').find('h3').text();

    $('#done_edit').removeClass('deactivated');
    $('#tags,#users').empty();
    $('#edit_col_heading,#edit_buttons').show();
    $('#start_col_heading,#start_buttons').hide();
    $('#edit_col_name').html(col_name);
    $('#col_name').hide().fadeIn(600).html(col_name + '<img src="imgs/edit-white.png" alt="edit" class="edit"/>');
    $('html,body').animate({
        scrollTop: $(".third-section").offset().top - 100
    }, 800);
    $('#interest,#hashtag,#location_input,#tag_advanced,#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube').prop('disabled', false);
    $('#interest,#hashtag,#user_RSS,#location_input').val("").blur();
    $('.mapbox-gl-draw_polygon').attr('disabled', false);
    $('#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Youtube').typeahead('val', '').blur();
    $('#max_tags,#max_tags_advanced,#max_users,#max_users_advanced,.error_expr_collection,.error_expr_location,#max_locations,#polygons_num').slideUp(0);
    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/' + user_id + '/' + id,
        success: function (e) {
            $("#interest").val("").blur().prop('disabled', true);
            $.each(e.keywords, function (index, keyword) {
                addtag(keyword['keyword']);
                if (keyword['pattern']) {
                    $("[id='" + keyword['keyword'] + "'").find('.edit_tag').removeClass('edit_tag').addClass('edit_tag_adv');
                    $("[id='" + keyword['keyword'] + "'").attr('data-edit', keyword['pattern']);
                }
            });

            $.each(e.accounts, function (index, user) {
                adduser(user['id'], user['name'], user['username'], user['source']);
            });
            var features = [];
            var lat_fly, long_fly;
            $.each(e.polygons, function (index_out, polygon) {
                features.push({
                    "type": "FeatureCollection",
                    "features": [{
                        "id": index_out + id,
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "coordinates": [[]],
                            "type": "Polygon"
                        }
                    }]
                });
                $.each(polygon, function (index, peaks) {
                    if (typeof peaks === 'object') {
                        $.each(peaks, function (index, point) {
                            features[index_out].features[0].geometry.coordinates[0].push([point['long'], point['lat']]);
                            long_fly = point['long'];
                            lat_fly = point['lat'];

                        });
                    }
                });
            });
            if ((e.polygons.length > 0) && ($('#map_button:checked').length === 0)) {
                $('#map_button').click();
            }
            setTimeout(function () {
                particlesJS("particles-js", particles_settings);
                $.map_add_polygons(features);
                $.map_fly_to(long_fly, lat_fly);
            }, 650);
            $.map_remove_polygons();
        }
    });

});
$("#Container_normal,#Container_fav").on("click", ".overlay", function () {
    $(location).attr('href', 'collection.html?collection=' + $(this).siblings('.delete_icon').attr('id') + "&language=all&topics=*&unique=false&original=all&type=all&relevance=&sort=recency&queryUser=&queryKeyword=&source=Facebook,Twitter,Flickr,Youtube,RSS,GooglePlus&since=&until=&section=feed&view=gallery")
});

var pagination = 1;
if (user_id != "") {
    get_collections_normal(true);
    get_collections_fav();
}
else {
    $('#myModal h1').html("Oops. Something went wrong!");
    $('#myModal p').html("You have to define a user id.");
    $('#myModal').reveal();
    $('.fifth-section,.fourth-section,.third-section,#mainmenu,#discover').remove();
    $('.second-section').css('min-height', $(window).height() - $('.sixth-section').height());
}
function get_collections_fav() {
    var $tiles = $('#tiles_fav');
    $tiles.empty();
    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/' + user_id,
        dataType: "json",
        success: function (json) {
            if (json.favs.length > 0) {
                var data = json.favs;
                for (var i = 0; i < data.length; i++) {
                    var id = data[i]._id;
                    var status = data[i].status;
                    var title = data[i].title;
                    var stop_icon = '<div class="stop_icon" title="Stop"></div>';
                    var split_icon = '<div class="split_icon" title="Assign"></div>';
                    var copy_icon = '<div class="copy_icon" title="Copy"></div>';
                    var edit_icon = '<div class="edit_icon" title="Edit"></div>';
                    var fav_icon = '<div class="fav_icon_full" title="Pin"></div>';
                    var color_state = "run_color";
                    if (status === "stopped") {
                        stop_icon = '<div class="restart_icon" title="Resume"></div>';
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

                    var locations = data[i].polygons;
                    var location_centroid = "";
                    for (var l = 0; l < locations.length; l++) {
                        location_centroid = location_centroid + locations[l].centroid + ", ";
                    }
                    if (location_centroid !== "") {
                        location_centroid = location_centroid.slice(0, -2);
                    }
                    else {
                        location_centroid = "-";
                    }

                    var accounts = data[i].accounts;
                    var users = "";
                    var users_style = "margin-top:-13px";
                    var user_icon = "";
                    for (var a = 0; a < accounts.length; a++) {
                        switch (accounts[a].source) {
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
                        users = users + accounts[a].name + '<img class="user_source" src="' + user_icon + '">,&nbsp;';
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
                    var creationDate = new Date(data[i].creationDate);
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    var year = creationDate.getUTCFullYear();
                    var month = months[creationDate.getUTCMonth()];
                    var day = creationDate.getUTCDate();
                    var date = day + ' ' + month + ' ' + year;

                    var element = '<li class="collection"><div class="cover_delete"></div><div class="tiles_li"><div class="outer"><div class="tooltip_delete"><p>Are you sure you want to delete this collection? This action cannot be undone!</p><span class="cancel_delete">Cancel</span><span class="confirm_delete">Yes</span></div><div class="tooltip_share"><p>Enter comma separated users ids to share collection with</p><input class="share_input" type="text" size="40" placeholder="Users Ids..." autocomplete="off"><span class="cancel_share">Cancel</span><span class="confirm_share">Share</span></div>' + fav_icon + copy_icon + split_icon + '<div class="delete_icon" title="Delete" id="' + id + '"></div>' + edit_icon + stop_icon + '<div class="overlay"><div class="overlay_table"><div class="overlay_cell"><h3>' + title + '</h3></div></div></div><div class="tiles_img" style="' + bg_img + '"></div><div class="tags_wrapper"><img src="imgs/hash-gray.png" width="20"><div class="tags_p">' + tags + '</div></div><div class="tags_wrapper"><img src="imgs/email-gray.png" width="20"><div class="tags_p" style=' + users_style + '>' + users + '</div></div><div class="tags_wrapper"><img src="imgs/location-gray.png" width="20"><div class="tags_p">' + location_centroid + '</div></div><div class="details ' + color_state + '"><div class="images_count"><img src="imgs/items.png" width="20"><span class="items_count">' + items + '</span></div><div class="date">' + date + '</div></div></div></div></li>';
                    $tiles.append(element);

                    $('#no_collections_fav,#fav_loading').hide();
                    $('#Container_fav').show();
                    var options = {
                        autoResize: true,
                        container: $('#Container_fav'),
                        offset: 15,
                        itemWidth: 340,
                        outerOffset: 0
                    };
                    var handler = $tiles.find('> li');
                    handler.wookmark(options);

                }
            }
            else {
                $('#no_collections_fav').show();
                $('#fav_loading,#Container_fav').hide();
            }
        },
        error: function (e) {
            $("#fav_loading").hide();
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("Your collections can not be loaded.");
            $('#myModal').reveal();
        }
    });
}
function get_collections_normal(flag) {
    $('#no_collections_normal,#no_stopped,#no_running,#no_query').hide();
    $('.controls,#normal_loading,#Container_normal,.well,#query_collection_wrapper').show();
    var $tiles = $('#tiles_normal');
    var $paginationdemo = $('#pagination-demo');
    $tiles.empty();
    $("#normal_loading").show();
    var status_param = $('.controls').find('.active').attr('id');
    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/' + user_id + '?nPerPage=6&pageNumber=' + pagination + "&q=" + $('#query_collection').val() + "&status=" + status_param,
        dataType: "json",
        success: function (json) {
            if (json.count > 0) {
                if (flag) {
                    if ($paginationdemo.data("twbs-pagination")) {
                        $paginationdemo.twbsPagination('destroy');
                    }
                    var first_but = "First";
                    var prev_but = "Previous";
                    var next_but = "Next";
                    var last_but = "Last";
                    $paginationdemo.twbsPagination({
                        totalPages: Math.ceil(json.count / 6),
                        visiblePages: "5",
                        initiateStartPageClick: false,
                        startPage: pagination,
                        first: first_but,
                        prev: prev_but,
                        next: next_but,
                        last: last_but,
                        onPageClick: function (event, page) {
                            pagination = page;
                            get_collections_normal(false);
                        }
                    });
                }
                var data = json.collections;
                for (var i = 0; i < data.length; i++) {
                    var id = data[i]._id;
                    var status = data[i].status;
                    var title = data[i].title;
                    var stop_icon = '<div class="stop_icon" title="Stop"></div>';
                    var split_icon = '<div class="split_icon" title="Assign"></div>';
                    var copy_icon = '<div class="copy_icon" title="Copy"></div>';
                    var edit_icon = '<div class="edit_icon" title="Edit"></div>';
                    var fav_icon = '<div class="fav_icon" title="Pin"></div>';
                    var color_state = "run_color";
                    if (status === "stopped") {
                        stop_icon = '<div class="restart_icon" title="Resume"></div>';
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

                    var locations = data[i].polygons;
                    var location_centroid = "";
                    for (var k = 0; k < locations.length; k++) {
                        location_centroid = location_centroid + locations[k].centroid + ", ";
                    }
                    if (location_centroid !== "") {
                        location_centroid = location_centroid.slice(0, -2);
                    }
                    else {
                        location_centroid = "-";
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

                    var element = '<li class="collection"><div class="cover_delete"></div><div class="tiles_li"><div class="outer"><div class="tooltip_delete"><p>Are you sure you want to delete this collection? This action cannot be undone!</p><span class="cancel_delete">Cancel</span><span class="confirm_delete">Yes</span></div><div class="tooltip_share"><p>Enter comma separated users ids to share collection with</p><input class="share_input" type="text" size="40" placeholder="Users Ids..." autocomplete="off"><span class="cancel_share">Cancel</span><span class="confirm_share">Share</span></div>' + fav_icon + copy_icon + split_icon + '<div class="delete_icon" title="Delete" id="' + id + '"></div>' + edit_icon + stop_icon + '<div class="overlay"><div class="overlay_table"><div class="overlay_cell"><h3>' + title + '</h3></div></div></div><div class="tiles_img" style="' + bg_img + '"></div><div class="tags_wrapper"><img src="imgs/hash-gray.png" width="20"><div class="tags_p">' + tags + '</div></div><div class="tags_wrapper"><img src="imgs/email-gray.png" width="20"><div class="tags_p" style=' + users_style + '>' + users + '</div></div><div class="tags_wrapper"><img src="imgs/location-gray.png" width="20"><div class="tags_p">' + location_centroid + '</div></div><div class="details ' + color_state + '"><div class="images_count"><img src="imgs/items.png" width="20"><span class="items_count">' + items + '</span></div><div class="date">' + date + '</div></div></div></div></li>';
                    $tiles.append(element);
                    var options = {
                        autoResize: true,
                        container: $('#Container_normal'),
                        offset: 15,
                        itemWidth: 340,
                        outerOffset: 0
                    };
                    var handler = $tiles.find('> li');
                    handler.wookmark(options);
                    $("#normal_loading").hide();
                }
            }
            else {
                if ($('#query_collection').val() === "") {
                    switch (status_param) {
                        case "all" :
                            $('#no_collections_normal').show();
                            $('.controls,#normal_loading,#Container_normal,.well,#query_collection_wrapper').hide();
                            break;
                        case "running" :
                            $.ajax({
                                type: 'GET',
                                url: api_folder + 'collection/' + user_id + '?nPerPage=1&pageNumber=1&status=all',
                                dataType: "json",
                                success: function (json) {
                                    if (json.count === 0) {
                                        $('#no_collections_normal').show();
                                        $('.controls,#normal_loading,#Container_normal,.well,#query_collection_wrapper').hide();
                                    }
                                    else {
                                        $('#normal_loading,.well,#query_collection_wrapper').hide();
                                        $('#no_running').show();
                                    }
                                },
                                error: function (e) {
                                    $('#no_collections_normal').show();
                                    $('.controls,#normal_loading,#Container_normal,.well,#query_collection_wrapper').hide();
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
                                        $('#no_collections_normal').show();
                                        $('.controls,#normal_loading,#Container_normal,.well,#query_collection_wrapper').hide();
                                    }
                                    else {
                                        $('#normal_loading,.well,#query_collection_wrapper').hide();
                                        $('#no_stopped').show();
                                    }
                                },
                                error: function (e) {
                                    $('#no_collections_normal').show();
                                    $('.controls,#normal_loading,#Container_normal,.well,#query_collection_wrapper').hide();
                                }
                            });
                    }
                }
                else {
                    $('#normal_loading,.well,#query_collection_wrapper').hide();
                    $('#no_query').show();
                    $('#no_query span').text($('#query_collection').val());
                }
            }
        },
        error: function (e) {
            $("#normal_loading,.well,.controls .btn_material,#query_collection_wrapper").hide();
            $('#myModal h1').html("Oops. Something went wrong!");
            $('#myModal p').html("Your collections can not be loaded.");
            $('#myModal').reveal();
        }
    });
}

$('.controls').find('.btn_material').click(function () {
    if (!($(this).hasClass(('active')))) {
        $('.controls').find('.btn_material').removeClass('active');
        $(this).addClass('active');
        pagination = 1;
        get_collections_normal(true);
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

$("#text_user").click(function () {
    if ($(this).hasClass('text_user_on')) {
        $(this).attr('src', 'imgs/text-user.png');
    }
    else {
        $(this).attr('src', 'imgs/text-user-blue.png')
    }
    $(this).toggleClass('text_user_on');
});

$("#advanced_user_search").click(function () {
    $('#tags_section,#users_section,#name_section,#map_input,.error_expr_collection,.error_expr_location').slideUp(500);
    $('#advanced_user').slideDown(500);
    $('#users_adv').html($('#users').html());
    $('#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Youtube').typeahead('val', '').blur();
    $('#user_RSS').val("").blur();
    $('#edit_buttons,#start_buttons,#map_toggle,#map,#map_desc').hide();
});

$("#advanced_tag_search").click(function () {
    $('#edit_buttons,#start_buttons,#map_toggle,#map,#map_desc').hide();
    var $tags = $('#tags');
    $('#tags_section,#users_section,#name_section,#map_input,.error_expr_collection,.error_expr_location').slideUp(500);
    $('#advanced_tag').slideDown(500);
    $('#tags_adv').html($tags.html());
    $('#hashtag').val("").blur();
    var el = document.getElementById('expression');
    Sortable.create(el, {
        scroll: false,
        onUpdate: function () {
            $('#error_expr').slideUp();
            $('.error_operator').removeClass('error_operator');
        }
    });
});
$('#add_expr').click(function () {
    validate_expression();
});

function validate_expression() {

    var valid_expr = true;
    var string_expr = "";
    var edit_expr = "";
    var $expression = $('#expression');
    var $error_exp = $('#error_expr');

    // cannot start with AND or OR or NOT
    if ($expression.find('li').eq(0).hasClass('logic_operator')) {
        $expression.find('li').eq(0).addClass('error_operator');
        $error_exp.slideDown().find('span').html("Logical query cannot start with logical operator.");
        return;
    }

    // cannot end with AND or OR or NOT
    if ($expression.find('li').last().hasClass('logic_operator')) {
        $expression.find('li').last().addClass('error_operator');
        $error_exp.slideDown().find('span').html("Logical query cannot end with logical operator.");
        return;
    }

    // there can't be two tags next to each other
    $('.tag_operator').each(function () {
        if ($(this).next('li').hasClass("tag_operator")) {
            $(this).addClass('error_operator');
            $error_exp.slideDown().find('span').html("You cannot use two tags next to each other.");
            valid_expr = false;
        }
    });
    if (!(valid_expr)) {
        return;
    }

    // there can't be two logical operators next to each other
    $('.logic_operator').each(function () {
        if ($(this).next('li').hasClass("logic_operator")) {
            $(this).addClass('error_operator');
            $error_exp.slideDown().find('span').html("You cannot use two logical operators next to each other.");
            valid_expr = false;
        }
    });
    if (!(valid_expr)) {
        return;
    }

    $('.parenthesis_operator').each(function () {
        // "(" cannot open immediately after ")"
        if ($(this).hasClass("close_parenthesis")) {
            if ($(this).next('li').hasClass("open_parenthesis")) {
                $(this).next('li').addClass('error_operator');
                $error_exp.slideDown().find('span').html("You cannot use an opening parenthesis \"[\" right after a closing parenthesis \"]\".");
                valid_expr = false;
            }
        }
        // ")" cannot close immediately after "("
        if ($(this).hasClass("open_parenthesis")) {
            if ($(this).next('li').hasClass("close_parenthesis")) {
                $(this).next('li').addClass('error_operator');
                $error_exp.slideDown().find('span').html("You cannot use a closing parenthesis \"]\" right after an opening parenthesis \"[\".");
                valid_expr = false;
            }
        }
        // cannot close bracket immediately after a logical operator
        if ($(this).hasClass("close_parenthesis")) {
            if ($(this).prev('li').hasClass("logic_operator")) {
                $(this).addClass('error_operator');
                $error_exp.slideDown().find('span').html("You cannot use a closing parenthesis \"]\" right after a logical operator.");
                valid_expr = false;
            }
        }
        //cannot use logical sign "&" or "|" right after opening a bracket
        if ($(this).hasClass("open_parenthesis")) {
            if ($(this).next('li').hasClass("logic_operator")) {
                $(this).next('li').addClass('error_operator');
                $error_exp.slideDown().find('span').html("You cannot use a logical operator right after an opening parenthesis \"[\".");
                valid_expr = false;
            }
        }
        // cannot open a bracket right after a hashtag
        if ($(this).hasClass("open_parenthesis")) {
            if ($(this).prev('li').hasClass("tag_operator")) {
                $(this).addClass('error_operator');
                $error_exp.slideDown().find('span').html("You cannot use an opening parenthesis \"[\" right after a tag.");
                valid_expr = false;
            }
        }
        // cannot use a tag right after closing a bracket
        if ($(this).hasClass("close_parenthesis")) {
            if ($(this).next('li').hasClass("tag_operator")) {
                $(this).next('li').addClass('error_operator');
                $error_exp.slideDown().find('span').html("You cannot use a tag right after a closing parenthesis \"]\".");
                valid_expr = false;
            }
        }
    });
    if (!(valid_expr)) {
        return;
    }

    //if valid expression
    $('.error_operator').removeClass('error_operator');
    $error_exp.slideUp();
    $('#clear_expr').click();
    $('.operator').each(function () {
        if ($(this).hasClass("open_parenthesis")) {
            string_expr = string_expr + "(";
            edit_expr = edit_expr + "PAROS";
        }
        else if ($(this).hasClass("close_parenthesis")) {
            string_expr = string_expr + ")";
            edit_expr = edit_expr + "PARCS"
        }
        else if ($(this).hasClass("and_operator")) {
            string_expr = string_expr + " AND ";
            edit_expr = edit_expr + "ANDS"
        }
        else if ($(this).hasClass("or_operator")) {
            string_expr = string_expr + " OR ";
            edit_expr = edit_expr + "ORS"
        }
        else if ($(this).hasClass("not_operator")) {
            string_expr = string_expr + " NOT ";
            edit_expr = edit_expr + "NOTS"
        }
        else if ($(this).hasClass("tag_operator")) {
            string_expr = string_expr + $(this).attr('id');
            edit_expr = edit_expr + $(this).attr('id') + "S";
        }
    });
    addtag_advanced(string_expr, edit_expr);
    return "added";
}

$('#clear_expr').click(function () {
    parenthesis_count = 0;
    $('#expression').children().fadeOut(500).promise().then(function () {
        $('#expression').empty();
    });
    $('#error_expr').slideUp();
});

var parenthesis_count = 0;
$('#parenthesis_add').click(function () {
    $('#error_expr').slideUp();
    $('.error_operator').removeClass('error_operator');
    parenthesis_count++;
    $('<li class="parenthesis_operator close_parenthesis operator">]<img src="imgs/delete.png" class="delete_parenthesis rand-' + parenthesis_count + '"></li>').hide().appendTo('#expression').show('normal');
    $('<li class="parenthesis_operator open_parenthesis operator">[<img src="imgs/delete.png" class="delete_parenthesis rand-' + parenthesis_count + '"></li>').hide().prependTo('#expression').show('normal');
});
$('#and_add').click(function () {
    $('#error_expr').slideUp();
    $('.error_operator').removeClass('error_operator');
    $('<li class="logic_operator and_operator operator">AND<img src="imgs/delete.png" class="delete_expression"></li>').hide().appendTo('#expression').show('normal');
});
$('#or_add').click(function () {
    $('#error_expr').slideUp();
    $('.error_operator').removeClass('error_operator');
    $('<li class="logic_operator or_operator operator" style="width: 64px">OR<img src="imgs/delete.png" class="delete_expression"></li>').hide().appendTo('#expression').show('normal');
});
$('#not_add').click(function () {
    $('#error_expr').slideUp();
    $('.error_operator').removeClass('error_operator');
    $('<li class="logic_operator not_operator operator">NOT<img src="imgs/delete.png" class="delete_expression"></li>').hide().appendTo('#expression').show('normal');
});

$("#done_users").click(function () {
    abort();
    $('#tags_section,#users_section,#name_section,#map_input').slideDown(500);
    $('#advanced_user').slideUp(500);
    $('#users').html($('#users_adv').html());
    if ((($("#tags li").length > 0) || ($("#users li").length > 0) || ($.map_get_polygon_points().features.length > 0)) && (($('#interest').val() != "") || ($('#col_name').html() != ""))) {
        $('#done_start,#done_edit').removeClass('deactivated');
    }
    else {
        $('#done_start,#done_edit').addClass('deactivated');
    }
    $('#users_adv').empty();
    $('#users_images').empty().hide();
    $('#no_results,.Typeahead-spinner,#adv_loading').hide();
    $('#user_advanced').val("").blur();
    if ($("#users").find("li").length === 100) {
        $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube").prop('disabled', true);
        $('#max_users,#max_users_advanced').slideDown();
    }
    if (edit_mode) {
        $('#edit_buttons').show();
    }
    else {
        $('#start_buttons').show();
    }
    $('#map_toggle').show();
    if ($('#map_button').is(":checked")) {
        $('#map,#map_desc').show();
        $.map_resize();
    }
});
$("#cancel_users").click(function () {
    $('#tags_section,#users_section,#name_section,#map_input').slideDown(500);
    $('#users_adv').empty();
    $('#advanced_user').slideUp(500);
    $('#users_images').empty().hide();
    $('#no_results,.Typeahead-spinner,#adv_loading').hide();
    $('#user_advanced').val("").blur();
    if ($("#users").find("li").length === 100) {
        $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube").prop('disabled', true);
        $('#max_users,#max_users_advanced').slideDown();
    }
    if (edit_mode) {
        $('#edit_buttons').show();
    }
    else {
        $('#start_buttons').show();
    }
    $('#map_toggle').show();
    if ($('#map_button').is(":checked")) {
        $('#map,#map_desc').show();
        $.map_resize();
    }
});

$("#cancel_edit").click(function () {
    $('#edit_buttons,#edit_col_heading').hide();
    edit_mode = false;
    $('#tags,#users,#col_name').empty();
    $('#interest,#hashtag,#location_input,#tag_advanced,#user_Twitter,#user_GooglePlus,#user_Facebook,#user_RSS,#user_Youtube').prop('disabled', false);
    $('#interest,#hashtag,#location_input,#user_RSS').val("").blur();
    $('.mapbox-gl-draw_polygon').attr('disabled', false);
    $('#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Youtube').typeahead('val', '').blur();
    $('#max_tags,#max_tags_advanced,#max_users,#max_users_advanced,#valid_rss,.error_expr_collection,.error_expr_location,#max_locations,#polygons_num').slideUp(0);
    $('#start_col_heading,#start_buttons').show();
    $('html,body').animate({
        scrollTop: $(".fifth-section").offset().top - 50
    }, 800);
    $('#done_start').addClass('deactivated');
    $.map_remove_polygons();
});

$("#done_tags").click(function () {
    if (validate_expression() === "added") {
        var timeout = $('#expression li').length > 0 ? 700 : 0;
        setTimeout(function () {
            $('#name_section,#users_section,#tags_section,#map_input').slideDown(500);
            $('#tags').html($('#tags_adv').html());
            if ((($("#tags li").length > 0) || ($("#users li").length > 0) || ($.map_get_polygon_points().features.length > 0)) && (($('#interest').val() != "") || ($('#col_name').html() != ""))) {
                $('#done_start,#done_edit').removeClass('deactivated');
            }
            else {
                $('#done_start,#done_edit').addClass('deactivated');
            }
            $('#tags_adv,#expression').empty();
            if ($("#tags").find("li").length === 20) {
                $("#hashtag,#tag_advanced").prop('disabled', true);
                $('#max_tags,#max_tags_advanced').slideDown();
            }
            $('#advanced_tag').slideUp(500);
            $('#tag_advanced').val("").blur();
            parenthesis_count = 0;
            $('#error_expr').slideUp();
            if (edit_mode) {
                $('#edit_buttons').show();
            }
            else {
                $('#start_buttons').show();
            }
            $('#map_toggle').show();
            if ($('#map_button').is(":checked")) {
                $('#map,#map_desc').show();
                $.map_resize();
            }
            $('#tags').find('li').css('opacity', 1);
        }, timeout);
    }
});

$("#cancel_tags").click(function () {
    $('#name_section,#users_section,#tags_section,#map_input').slideDown(500);
    $('#tags_adv,#expression').empty();
    $('#advanced_tag').slideUp(500);
    $('#tag_advanced').val("").blur();
    parenthesis_count = 0;
    $('#error_expr').slideUp();
    if ($("#tags").find("li").length === 20) {
        $("#hashtag,#tag_advanced").prop('disabled', true);
        $('#max_tags,#max_tags_advanced').slideDown();
    }
    if (edit_mode) {
        $('#edit_buttons').show();
    }
    else {
        $('#start_buttons').show();
    }
    $('#map_toggle').show();
    if ($('#map_button').is(":checked")) {
        $('#map,#map_desc').show();
        $.map_resize();
    }
});

$("#done_start,#done_edit").click(function () {
    if ($(this).hasClass('deactivated')) {
        $('.error_expr_collection').slideDown();
        if (($('#col_name').text() === "") && ($('#interest').val() === "")) {
            $('.error_expr_collection').find('span').html("You have to specify a collection name.")
        }
        else if (($('#tags li').length === 0 ) && ($('#users').find('li').length === 0) && ($.map_get_polygon_points().features.length === 0)) {
            $('.error_expr_collection').find('span').html("You have to specify at least one keyword or a user or a location.");
        }
    }
    else {
        collection_begin();
    }
});

$("#cancel_start").click(function () {
    $.map_remove_polygons();
    $('#col_name,#tags,#users').empty();
    $('.user_input').prop('disabled', false).val("").blur();
    $('.mapbox-gl-draw_polygon').attr('disabled', false);
    $('#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Youtube').typeahead('val', '').blur();
    $('#max_tags,#max_tags_advanced,#max_users,#max_users_advanced,.error_expr_collection,.error_expr_location,#max_locations,#polygons_num').slideUp();
    $('#done_start').addClass('deactivated');
    if ($('#map_button').is(":checked")) {
        $('#map_button').click();
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
        deluser_adv($(this).attr('data-social'), $(this).attr('data-id'));
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

function collection_begin() {
    $('#start_buttons').show();
    $('#done_start').addClass('deactivated');
    $('#max_tags,#max_tags_advanced,#max_users,#max_users_advanced,#max_locations,.error_expr_location,#polygons_num').slideUp();
    if ($('#map_button').is(":checked")) {
        $('#map_button').click();
    }
    var id = (Math.floor(Math.random() * 90000) + 10000) + user_id + new Date().getTime();
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
        "accounts": [],
        "polygons": []
    };
    var $tagsli = $('#tags').find('li');
    for (var i = 0; i < $tagsli.length; i++) {
        viewData.keywords.push({
            "keyword": $tagsli.eq(i).find('a').attr('id'),
            "pattern": $tagsli.eq(i).find('a').attr('data-edit')
        });
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
    var array_points = $.map_get_polygon_points();
    var polylabel_input = [[]];
    var centroid;
    for (var k = 0; k < array_points.features.length; k++) {
        viewData.polygons.push({'centroid': '', 'peaks': []});
        polylabel_input = [[]];
        centroid = [];
        for (var l = 0; l < array_points.features[k].geometry.coordinates[0].length; l++) {
            viewData.polygons[k].peaks.push({
                "long": array_points.features[k].geometry.coordinates[0][l][0],
                "lat": array_points.features[k].geometry.coordinates[0][l][1]
            });
            polylabel_input[0].push([array_points.features[k].geometry.coordinates[0][l][0], array_points.features[k].geometry.coordinates[0][l][1]]);
        }
        centroid = polylabel(polylabel_input);
        codeLatLng(function (addr, k) {
            viewData.polygons[k].centroid = addr;
            if (k === array_points.features.length - 1) {
                geocoder_ready();
            }
        }, new google.maps.LatLng(centroid[1], centroid[0]), k);
    }
    if (array_points.features.length === 0) {
        geocoder_ready();
    }
    function geocoder_ready() {
        var url = api_folder + 'collection';
        if (edit_mode) {
            viewData._id = edit_id;
            $('#edit_buttons').hide();
            edit_mode = false;
            url = api_folder + 'collection/edit';
            $('#edit_col_heading').hide();
            $('#start_col_heading').show();
        }
        var temp = JSON.stringify(viewData);
        $.ajax({
            type: 'POST',
            url: url,
            data: temp,
            success: function () {
                $.map_remove_polygons();
                $('html,body').animate({
                    scrollTop: $(".fifth-section").offset().top - 50
                }, 800);
                pagination = 1;
                $('.controls').find('.btn_material').removeClass('active');
                $('#all').addClass('active');
                get_collections_normal(true);
                $('#col_name,#tags,#users').empty();
                $('.user_input').prop('disabled', false).val("").blur();
                $('.mapbox-gl-draw_polygon').attr('disabled', false);
                $('#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Youtube').typeahead('val', '').blur();
            },
            error: function (e) {
                $('#myModal h1').html("Oops. Something went wrong!");
                $('#myModal p').html("Your collection has not be submitted. Please try again.");
                $('#myModal').reveal();
            }
        });
    }
}

$('#map_button').change(function () {
    if ($(this).is(":checked")) {
        $('#map,#map_desc').slideDown(500, function () {
            $.map_resize();
            particlesJS("particles-js", particles_settings);
        });
    }
    else {
        $('#map,#map_desc').slideUp(500, function () {
            $.map_resize();
            particlesJS("particles-js", particles_settings);
        });
    }

});
var geocoder;
function initMap() {
    var input = document.getElementById('location_input');
    geocoder = new google.maps.Geocoder;
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            geocoder.geocode({"address": $("#location_input").val()}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat(),
                        lng = results[0].geometry.location.lng(),
                        placeName = results[0].address_components[0].long_name;
                    addlocation(lng, lat, placeName);
                }
                else {
                    $('.error_expr_location').slideDown();
                }
            });
        }
        else {
            addlocation(place.geometry.location.lng(), place.geometry.location.lat(), place.name);
        }
    });
    $("#search_icon_5").click(function () {
        var $location_input = $("#location_input");
        geocoder.geocode({"address": $location_input.val()}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat(),
                    lng = results[0].geometry.location.lng(),
                    placeName = results[0].address_components[0].long_name;
                addlocation(lng, lat, placeName);
                $location_input.blur();
            }
            else {
                $('.error_expr_location').slideDown();
            }
        });
    });
}
function googleMapsCustomError() {
    $('#map_input').addClass('disabled_input');
    $('#location_input').val("Invalid Google Map Key");
    $('#location_input').css('background-image','none');
    $("label[for='location_input']").remove();
}
(function takeOverConsole() { // taken from http://tobyho.com/2012/07/27/taking-over-console-log/
    var console = window.console
    if (!console) return

    function intercept(method) {
        var original = console[method]
        console[method] = function () {
            // check message
            if (arguments[0] && arguments[0].indexOf('InvalidKeyMapError') !== -1) {
                googleMapsCustomError();
            }

            if (original.apply) {
                // Do this for normal browsers
                original.apply(console, arguments)
            } else {
                // Do this for IE
                var message = Array.prototype.slice.apply(arguments).join(' ')
                original(message)
            }
        }
    }

    var methods = ['error']; // only interested in the console.error method
    for (var i = 0; i < methods.length; i++)
        intercept(methods[i])
}());

function codeLatLng(callback, latlng, k) {
    if (geocoder) {
        geocoder.geocode({'latLng': latlng}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    for (var i = 0; i < results[0].address_components.length; i++) {
                        for (var b = 0; b < results[0].address_components[i].types.length; b++) {
                            if ((results[0].address_components[i].types[b] == "administrative_area_level_1") || (results[0].address_components[i].types[b] == "country")) {
                                callback(results[0].address_components[i].long_name, k);
                                return;
                            }
                        }
                    }
                }
                else {
                    callback("-", k);
                }
            }
        });
    }
}
