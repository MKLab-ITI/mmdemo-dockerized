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
function addtag(tag) {
    var flag = 1;
    var count = 100 - $("#tags li").length;
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
                $(li).hide().appendTo(tag).fadeIn(400);

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
                    if ($("#tags li").length === 100) {
                        $("#hashtag").prop('disabled', true);
                    }
                }
            }
        }
    }
}
$("#user_Web").keyup(function (e) {
    if (e.keyCode === 13) {
        adduser("0", "");
    }
});
function adduser($id, $name, $user, $social) {
    var flag = 1;
    var count = 15 - $("#users li").length;
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
        $('#user_Web').val("");

        if (tag_name !== "") {
            flag = 1;
            $('#users li').children().each(function () {
                if ($(this).attr('id') === tag_name + "------" + social + "------" + $id + "------" + $name) {
                    $(this).parent().hide('slow', function () {
                        $(this).remove();
                    });
                    flag = 0;
                }
            });
            var tag = document.getElementById('users');
            var li = document.createElement('li');
            $(li).hide().appendTo(tag).fadeIn(400);

            var a = document.createElement('a');
            a.setAttribute('href', 'javascript:void(0);');
            a.setAttribute('id', tag_name + "------" + social + "------" + $id + "------" + $name);
            a.innerHTML = tag_name;
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
                case "Web":
                    icon.setAttribute('src', 'imgs/globe-16-black.png');
                    break;
            }


            var img = document.createElement('img');
            img.setAttribute('src', 'imgs/delete.png');
            img.setAttribute('class', 'delete');
            a.appendChild(img);

            if (flag) {
                if ($("#users li").length === 15) {
                    $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_Web,#user_Youtube").prop('disabled', true);
                }
            }
        }

    }
}

$("#interest").keyup(function (e) {
    if (e.keyCode === 13) {
        addname();
    }
});
function addname() {
    var $interest = $('#interest');
    if ($interest.val().replace(/\s/g, '').length) {
        $('#col_name').hide().fadeIn(400).html($interest.val() + '<img src="imgs/edit-white.png" alt="edit" class="edit"/>');
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
    $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_Web,#user_Youtube").prop('disabled', false);

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
    $("#user_Web").blur();
});

$("#examples_1").find("li").click(function () {
    if ($("#tags li").length < 100) {
        $("#hashtag").val($(this).html());
        addtag();
    }
});
$("#example_1").click(function () {
    if ($("#users li").length < 15) {
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
        $(li).hide().appendTo(tag).fadeIn(400);

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
            if ($("#users li").length === 15) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_Web,#user_Youtube").prop('disabled', true);
            }
        }
    }
});
$("#example_1").hover(
    function () {
        $(this).find('img').attr('src', 'imgs/twitter-16-color.png');
    }, function () {
        $(this).find('img').attr('src', 'imgs/twitter-16-black.png');
    }
);

$("#example_2").click(function () {
    if ($("#users li").length < 15) {
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
        $(li).hide().appendTo(tag).fadeIn(400);

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
            if ($("#users li").length === 15) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_Web,#user_Youtube").prop('disabled', true);
            }
        }
    }
});
$("#example_2").hover(
    function () {
        $(this).find('img').attr('src', 'imgs/google+-16-color.png');
    }, function () {
        $(this).find('img').attr('src', 'imgs/google+-16-black.png');
    }
);

$("#example_3").click(function () {
    if ($("#users li").length < 15) {
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
        $(li).hide().appendTo(tag).fadeIn(400);

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
            if ($("#users li").length === 15) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_Web,#user_Youtube").prop('disabled', true);
            }
        }
    }
});
$("#example_3").hover(
    function () {
        $(this).find('img').attr('src', 'imgs/facebook-16-color.png');
    }, function () {
        $(this).find('img').attr('src', 'imgs/facebook-16-black.png');
    }
);

$("#example_4").click(function () {
    if ($("#users li").length < 15) {
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
        $(li).hide().appendTo(tag).fadeIn(400);

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
            if ($("#users li").length === 15) {
                $("#user_Twitter,#user_GooglePlus,#user_Facebook,#user_Instagram,#user_Web,#user_Youtube").prop('disabled', true);
            }
        }
    }
});
$("#example_4").hover(
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
    $('.input-field:gt(1)').hide();
    $('#' + $(this).attr('id') + '_input').css('display', 'inline-block');
    $('.ff-filter-users').addClass('close').removeClass('open');
    $(this).removeClass('close').addClass('open');
});

$('.stage').click(function (e) {
    if (($('#col_name').text() === "") && ($('#interest').val() === "")) {
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
        var id = (Math.floor(Math.random() * 90000) + 10000) + "1234567890" + new Date().getTime();
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
            "ownerId": "1234567890",
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
                get_collections(1);
                $('#col_name,#tags,#users').empty();
                $('#interest').prop('disabled', false);
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

$("#Container").on("click", ".delete_icon", function () {
    $.ajax({
        url: api_folder + 'collection/delete/' + $(this).attr('id'),
        type: 'GET',
        success: function () {
            get_collections(1);
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
            $this.closest('.mix').removeClass('running').addClass('stopped');
            $this.siblings('.details').removeClass('run_color').addClass('stop_color');
            $this.remove();
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
    $('#col_name').hide().fadeIn(400).html(col_name + '<img src="imgs/edit-white.png" alt="edit" class="edit"/>');
    $('html,body').animate({
        scrollTop: $(".third-section").offset().top - 100
    }, 800);

    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/1234567890/' + id,
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
        $(location).attr('href', 'collection.html?collection=' + $(this).siblings('.delete_icon').attr('id') + "&language=all&topics=*&original=all&type=all&sort=recency&query=&source=Facebook,Twitter,Flickr,Youtube,Instagram,Web,GooglePlus&since=0&until=1514678400000&view=feed&translation=" + translation_param)
    }
    else {
        $(location).attr('href', 'collection.html?collection=' + $(this).siblings('.delete_icon').attr('id') + "&language=all&topics=*&original=all&type=all&sort=recency&query=&source=Facebook,Twitter,Flickr,Youtube,Instagram,Web,GooglePlus&since=0&until=1514678400000&view=feed&translation=en")
    }
});

var pagination = 1;
get_collections(0);

$.ajax({
    type: 'GET',
    url: api_folder + 'collection/1234567890?nPerPage=1&pageNumber=1',
    dataType: "json",
    success: function (json) {
        $('#pagination-demo').twbsPagination({
            totalPages: Math.ceil(json.count / 6),
            visiblePages: "5",
            initiateStartPageClick: false,
            onPageClick: function (event, page) {
                pagination = page;
                $('#Container').empty();
                $("#collection_loader").show();
                get_collections(1);
            }
        });
    },
    error: function (e) {
        $(".well").remove();
    }
});


function get_collections(flag) {
    var $Container = $('#Container');
    $Container.empty();
    $("#collection_loader").show();
    $.ajax({
        type: 'GET',
        url: api_folder + 'collection/1234567890?nPerPage=6&pageNumber=' + pagination,
        dataType: "json",
        success: function (json) {
            var data = json.collections;
            for (var i = 0; i < data.length; i++) {
                var id = data[i]._id;
                var status = data[i].status;
                var title = data[i].title;
                var stop_icon = '<div class="stop_icon"></div>';
                var edit_icon = '<div class="edit_icon"></div>';
                var color_state = "run_color";
                if (status === "stopped") {
                    stop_icon = '';
                    color_state = "stop_color";
                }
                var bg_img = "background-image: url('" + data[i].mediaUrl + "'),url('imgs/placeholder.png');";

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
                for (var k = 0; k < accounts.length; k++) {
                    users = users + accounts[k].name + ", ";
                }
                if (users !== "") {
                    users = users.slice(0, -2);
                }
                else {
                    users = "-";
                }

                var items = nFormatter(data[i].items);
                var a = new Date(data[i].creationDate);
                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                var year = a.getUTCFullYear();
                var month = months[a.getUTCMonth()];
                var day = a.getUTCDate();
                var date = day + ' ' + month + ' ' + year;


                var element = '<div class="mix ' + status + '" ><div class="tiles_li"><div class="outer"><div class="delete_icon" id="' + id + '"></div>' + edit_icon + stop_icon + '<div class="overlay"><div class="overlay_table"><div class="overlay_cell"><h3>' + title + '</h3></div></div></div><div class="tiles_img" style="' + bg_img + '"></div><div class="tags_wrapper"><img src="imgs/hash-gray.png" width="20" style="float: left;margin-right: 5px;"><p class="tags_p">' + tags + '</p></div><div class="tags_wrapper"><img src="imgs/email-gray.png" width="20" style="float: left;margin-right: 5px;"><p class="tags_p">' + users + '</p></div><div class="details ' + color_state + '"><div class="images_count"><img src="imgs/items.png" width="20"><span class="items_count">' + items + '</span></div><div class="date">' + date + '</div></div></div></div></div>';
                $Container.append(element);
            }
            $Container.imagesLoaded(function () {
                $Container.mixItUp();
                $("#collection_loader").hide();
                if (flag) {
                    var $btn_material = $('.btn_material');
                    $btn_material.eq(1).click();
                    $btn_material.eq(0).click();
                }
            });
        },
        error: function (e) {
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
    $(location).attr('href', 'index.html?translation=' + $(this).attr('id'));
});
