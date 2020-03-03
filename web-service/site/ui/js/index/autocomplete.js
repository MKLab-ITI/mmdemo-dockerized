$(function () {
    twitter_autocomplete();
    googleplus_autocomplete();
    facebook_autocomplete();
    youtube_autocomplete();
});

function twitter_autocomplete() {
    var engine, remoteHost, template, empty;

    $.support.cors = true;

    remoteHost = api_folder + 'search/users';
    template = Handlebars.compile($("#result-template_twitter").html());
    empty = Handlebars.compile($("#empty-template_twitter").html());

    engine = new Bloodhound({
        identify: function (o) {
            return o.id_str;
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'screen_name'),
        dupDetector: function (a, b) {
            return a.id_str === b.id_str;
        },
        remote: {
            url: remoteHost + '?q=%QUERY&source=Twitter',
            wildcard: '%QUERY'
        }
    });

    function engineWithDefaults(q, sync, async) {
        engine.search(q, sync, async);
    }

    $('#user_Twitter').typeahead({
        hint: false,
        menu: $('.Typeahead-menu'),
        minLength: 2,
        classNames: {
            open: 'is-open',
            empty: 'is-empty',
            cursor: 'is-active',
            suggestion: 'Typeahead-suggestion',
            selectable: 'Typeahead-selectable'
        }
    }, {
        source: engineWithDefaults,
        displayKey: 'username',
        limit: 40,
        templates: {
            suggestion: template,
            empty: empty
        }
    }).on('typeahead:asyncrequest', function () {
        $('.Typeahead-spinner').show();
    }).on('typeahead:asynccancel typeahead:asyncreceive', function () {
        $('.Typeahead-spinner').hide();
    });

}
function googleplus_autocomplete() {
    var engine, remoteHost, template, empty;

    $.support.cors = true;

    remoteHost = api_folder + 'search/users';
    template = Handlebars.compile($("#result-template_googleplus").html());
    empty = Handlebars.compile($("#empty-template_googleplus").html());

    engine = new Bloodhound({
        identify: function (o) {
            return o.id_str;
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'screen_name'),
        dupDetector: function (a, b) {
            return a.id_str === b.id_str;
        },
        remote: {
            url: remoteHost + '?source=GooglePlus&q=%QUERY',
            wildcard: '%QUERY'
        }
    });

    function engineWithDefaults(q, sync, async) {
        engine.search(q, sync, async);
    }

    $('#user_GooglePlus').typeahead({
        hint: false,
        menu: $('.Typeahead-menu'),
        minLength: 2,
        classNames: {
            open: 'is-open',
            empty: 'is-empty',
            cursor: 'is-active',
            suggestion: 'Typeahead-suggestion',
            selectable: 'Typeahead-selectable'
        }
    }, {
        source: engineWithDefaults,
        displayKey: 'username',
        limit: 40,
        templates: {
            suggestion: template,
            empty: empty
        }
    }).on('typeahead:asyncrequest', function () {
        $('.Typeahead-spinner').show();
    }).on('typeahead:asynccancel typeahead:asyncreceive', function () {
        $('.Typeahead-spinner').hide();
    });

}
function facebook_autocomplete() {
    var engine, remoteHost, template, empty;

    $.support.cors = true;

    remoteHost = api_folder + 'search/users';
    template = Handlebars.compile($("#result-template_facebook").html());
    empty = Handlebars.compile($("#empty-template_facebook").html());

    engine = new Bloodhound({
        identify: function (o) {
            return o.id_str;
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'screen_name'),
        dupDetector: function (a, b) {
            return a.id_str === b.id_str;
        },
        remote: {
            url: remoteHost + '?source=Facebook&q=%QUERY',
            wildcard: '%QUERY'
        }
    });

    function engineWithDefaults(q, sync, async) {
        engine.search(q, sync, async);
    }

    $('#user_Facebook').typeahead({
        hint: false,
        menu: $('.Typeahead-menu'),
        minLength: 2,
        classNames: {
            open: 'is-open',
            empty: 'is-empty',
            cursor: 'is-active',
            suggestion: 'Typeahead-suggestion',
            selectable: 'Typeahead-selectable'
        }
    }, {
        source: engineWithDefaults,
        displayKey: 'username',
        limit: 40,
        templates: {
            suggestion: template,
            empty: empty
        }
    }).on('typeahead:asyncrequest', function () {
        $('.Typeahead-spinner').show();
    }).on('typeahead:asynccancel typeahead:asyncreceive', function () {
        $('.Typeahead-spinner').hide();
    });
}
function youtube_autocomplete() {
    var engine, remoteHost, template, empty;

    $.support.cors = true;

    remoteHost = api_folder + 'search/users';
    template = Handlebars.compile($("#result-template_youtube").html());
    empty = Handlebars.compile($("#empty-template_youtube").html());

    engine = new Bloodhound({
        identify: function (o) {
            return o.id_str;
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'screen_name'),
        dupDetector: function (a, b) {
            return a.id_str === b.id_str;
        },
        remote: {
            url: remoteHost + '?source=Youtube&q=%QUERY',
            wildcard: '%QUERY'
        }
    });

    function engineWithDefaults(q, sync, async) {
        engine.search(q, sync, async);
    }

    $('#user_Youtube').typeahead({
        hint: false,
        menu: $('.Typeahead-menu'),
        minLength: 2,
        classNames: {
            open: 'is-open',
            empty: 'is-empty',
            cursor: 'is-active',
            suggestion: 'Typeahead-suggestion',
            selectable: 'Typeahead-selectable'
        }
    }, {
        source: engineWithDefaults,
        displayKey: 'name',
        limit: 40,
        templates: {
            suggestion: template,
            empty: empty
        }
    }).on('typeahead:asyncrequest', function () {
        $('.Typeahead-spinner').show();
    }).on('typeahead:asynccancel typeahead:asyncreceive', function () {
        $('.Typeahead-spinner').hide();
    });

}