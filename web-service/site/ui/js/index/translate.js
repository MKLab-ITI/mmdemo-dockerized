function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}
var translation_param = gup('translation');
if (!(translation_param==="")) {
    $(function () {
        $.ajax({
            url: 'language_index.xml',
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
                $('#lang').html("English");
                break;
            case "el":
                $('#lang').html("Ελληνικά");
                break;
            case "it":
                $('#lang').html("Italian");
                break;
            case "tr":
                $('#lang').html("Türkçe");
                break;
            case "es":
                $('#lang').html("Español");
                break;
            case "ca":
                $('#lang').html("Català");
                break;
            default:
                $('#lang').html("English");
        }
    });
}
