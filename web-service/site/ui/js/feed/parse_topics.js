$.ajax({
    type: "GET",
    url: api_folder + "topics?collection=" + collection_param + "&source=Facebook,Twitter,Flickr,Youtube,RSS,GooglePlus&since=" + language_since + "&until=" + language_until,
    dataType: "json",
    success: function (json) {

        var $topics = json.topics;
        for (var i = 0, items, label, query; i < $topics.length; i++) {
            label = $topics[i].label;
            items = $topics[i].items;
            query = $topics[i].query;
            $("#topics").append('<li class="sub5"><a href="#"><p data-query="' + query + '">' + label + '</p><span class="label">' + nFormatter(items) + '</span></a></li>');
        }
        $("#topics").find("li:first-child").remove();

        var $this_a;
        $(".sub5").each(function () {
            $this_a = $(this).find('a');
            var $this_p = $this_a.find('p');
            if ($this_p.data("query") === topic_param) {
                $this_a.addClass('activelan');
                return false;
            }
        });
    },
    async: true
});
