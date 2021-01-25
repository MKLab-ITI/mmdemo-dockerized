var first_loading = true;
function loadimage(end, page, pagenum) {
    $("#end").hide();
    $('#tiles').imagesLoaded(function () {
        if (view_param === "gallery") {
            var options = {
                autoResize: true,
                container: $('#main'),
                offset: 10,
                itemWidth: 207,
                outerOffset: 0
            };

            var handler = $('#tiles > li');
            handler.wookmark(options);
            var doubleLabels = [
                "<i>1</i><span>Irrelevant</span>",
                "<i>2</i>",
                "<i>3</i>",
                "<i>4</i>",
                "<i>5</i><span>Relevant</span>"

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
                            var $this = $(this);
                            $this.children(":first").show();
                            $this.siblings('.refresh').slideUp(300, function () {
                                $this.siblings('.rate_save_but').slideDown();
                            });
                        }
                    }
                })
                .slider("pips", {
                    rest: "label",
                    labels: doubleLabels
                });

            $('.relevance_slider:not(".initiated")').each(function (i, obj) {
                $(this).addClass('initiated');
                var score = $(this).parents('li').attr('data-score');
                if (score == "0") {
                    $(this).slider("value", "1");
                    $(this).find('span').eq(0).hide();
                }
                else {
                    $(this).slider("value", score);
                }
            });
            if (!(first_loading)) {
                $("#loading, #loadmore").hide();
            }
            first_loading = false;

            if (end === 1) {
                $('#loadingbar').css('width', '105%');
                $('#end p').html("No more results");
                $("#end").show();
                setTimeout(function () {
                    $('#loadingbar').hide().css('width', '0%');
                }, 500);
            }
            else if (end === 99) {
                $('#end p').html("No items for keyword:<span style='color:red'> " + page.split("----------")[0] + "</span> combined with user:<span style='color:red'> " + page.split("----------")[1] + "</span>");
            }
            else if (end === 98) {
                $('#end p').html("No items for keyword:<span style='color:red'> " + page + "</span>");
            }
            else if (end === 97) {
                $('#end p').html("No items for user:<span style='color:red'> " + page + "</span>");
            }
            else if (end === 2) {
                $("#end").show();
            }

            if ((page === "latest") && (pagelocation === "latest")) {
                if ((pagenum === 1) && (end !== 1)) {
                    $('#loadingbar').show().css('width', '11%');
                    parse_latest(2);
                }
                if ((pagenum === 2) && (end !== 1)) {
                    $('#loadingbar').css('width', '22%');
                    parse_latest(3);
                }
                if ((pagenum === 3) && (end !== 1)) {
                    $('#loadingbar').css('width', '33%');
                    parse_latest(4);
                }
                if ((pagenum === 4) && (end !== 1)) {
                    $('#loadingbar').css('width', '44%');
                    parse_latest(5);
                }
                if ((pagenum === 5) && (end !== 1)) {
                    $('#loadingbar').css('width', '55%');
                    parse_latest(6);
                }
                if ((pagenum === 6) && (end !== 1)) {
                    $('#loadingbar').css('width', '66%');
                    parse_latest(7);
                }
                if ((pagenum === 7) && (end !== 1)) {
                    $('#loadingbar').css('width', '77%');
                    parse_latest(8);
                }
                if ((pagenum === 8) && (end !== 1)) {
                    $('#loadingbar').css('width', '88%');
                    parse_latest(9);
                }
                if ((pagenum === 9) && (end !== 1)) {
                    $('#loadingbar').css('width', '105%');
                    setTimeout(function () {
                        $('#loadingbar').hide().css('width', '0%');
                    }, 500);
                    more_latest();
                    parse_latest(10);
                }
            }
        }
        $('#tiles li').each(function (i, obj) {
            var score = $(this).attr('data-score');
            if (score == "0") {
                $(this).find('.ui-slider-pip-selected').removeClass('ui-slider-pip-selected');
            }
        });
    });
}