$.ajax({
    type: "GET",
    url: api_folder + "concepts?collection=" + collection_param + "&source=Facebook,Twitter,Flickr,Youtube,Instagram,RSS,GooglePlus&since=" + language_since + "&until=" + language_until,
    dataType: "json",
    success: function (json) {
        var $concepts = $("#concepts");
        for (var i = 0, count, field, sum = 0; i < json.length; i++) {
            field = json[i].field;
            count = json[i].count;
            sum += count;
            $concepts.append('<li class="sub7"><a href="#"><p>' + field + '</p><span class="label">' + nFormatter(count) + '</span></a></li>');
        }
        $concepts.find("li:first-child").remove();
        $concepts.prepend('<li class="sub7"><a href="#"><p>all</p><span class="label">' + nFormatter(sum) + '</span></a></li>');

        var $this_a;
        $(".sub7").each(function () {
            $this_a = $(this).find('a');
            var $this_p = $this_a.find('p');
            if ($this_p.text().toLowerCase() === concept_param) {
                $this_a.addClass('activelan');
                return false;
            }
        });
    },
    async: true
});
