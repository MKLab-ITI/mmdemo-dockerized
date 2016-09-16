$.ajax({
    type: "GET",
    url: api_folder+"top/language?collection=" + collection_param + "&source=Facebook,Twitter,Flickr,Youtube,Instagram,RSS,GooglePlus&since="+language_since+"&until="+language_until,
    dataType: "json",
    success: function (json) {

        var $values = json.values;
        for (var i = 0, count, lang; i < $values.length; i++) {
            lang = $values[i].field;
            count = $values[i].count;

            $("#languages").append('<li class="sub1"><a href="#">' + lang.toUpperCase() + ' <span class="label">' + nFormatter(count) + '</span></a></li>')
        }

        var $this_a;
        $(".sub1").each(function() {
            $this_a=$(this).find('a');
            if($this_a.text().split(' ')[0].toLowerCase()===language_param){
                $this_a.addClass('activelan');
                return false;
            }
        });
    },
    async: true
});

