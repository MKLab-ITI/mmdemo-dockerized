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
            var doubleLabels = []
            switch (translation_param) {
                case "en":
                    doubleLabels = [
                        "<i>1</i><span>Irrelevant</span>",
                        "<i>2</i>",
                        "<i>3</i>",
                        "<i>4</i>",
                        "<i>5</i><span>Relevant</span>"

                    ];
                    break;
                case "el":
                    doubleLabels = [
                        "<i>1</i><span>Άσχετο</span>",
                        "<i>2</i>",
                        "<i>3</i>",
                        "<i>4</i>",
                        "<i>5</i><span>Σχετικό</span>"
                    ];
                    break;
                case "it":
                    doubleLabels = [
                        "<i>1</i><span>Irrelevant</span>",
                        "<i>2</i>",
                        "<i>3</i>",
                        "<i>4</i>",
                        "<i>5</i><span>Relevant</span>"
                    ];
                    break;
                case "tr":
                    doubleLabels = [
                        "<i>1</i><span>Irrelevant</span>",
                        "<i>2</i>",
                        "<i>3</i>",
                        "<i>4</i>",
                        "<i>5</i><span>Relevant</span>"
                    ];
                    break;
                case "es":
                    doubleLabels = [
                        "<i>1</i><span>Irrelevant</span>",
                        "<i>2</i>",
                        "<i>3</i>",
                        "<i>4</i>",
                        "<i>5</i><span>Relevant</span>"
                    ];
                    break;
                case "ca":
                    doubleLabels = [
                        "<i>1</i><span>Irrelevant</span>",
                        "<i>2</i>",
                        "<i>3</i>",
                        "<i>4</i>",
                        "<i>5</i><span>Relevant</span>"
                    ];
                    break;
                default:
                    doubleLabels = [
                        "<i>1</i><span>Irrelevant</span>",
                        "<i>2</i>",
                        "<i>3</i>",
                        "<i>4</i>",
                        "<i>5</i><span>Relevant</span>"
                    ];
            }

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
                $(this).slider("value", $(this).parents('li').attr('data-score'));
            });
            if (!(first_loading)) {
                $("#loading, #loadmore").hide();
            }
            first_loading = false;

            if (end === 1) {
                var noData;
                switch (translation_param) {
                    case "en":
                        noData = "No more results";
                        break;
                    case "el":
                        noData = "Τέλος Αποτελεσμάτων";
                        break;
                    case "it":
                        noData = "Nessun ulteriore risultato";
                        break;
                    case "tr":
                        noData = "Daha fazla sonuç bulunamadı";
                        break;
                    case "es":
                        noData = "No hay más resultados";
                        break;
                    case "ca":
                        noData = "No hi ha més resultats";
                        break;
                    default:
                        noData = "No more results";
                }
                $('#loadingbar').css('width', '105%');
                $('#end p').html(noData);
                $("#end").show();
                setTimeout(function () {
                    $('#loadingbar').hide().css('width', '0%');
                }, 500);
            }
            else if (end === 99) {
                var noData2;
                switch (translation_param) {
                    case "en":
                        noData2 = "No items for keyword:";
                        break;
                    case "el":
                        noData2 = "Δεν υπάρχουν δημοσιεύσεις για:";
                        break;
                    case "it":
                        noData2 = "Nessun oggetto per la parola chiave:";
                        break;
                    case "tr":
                        noData2 = "Bu anahtar kelimeye uygun sonuç bulunamadı:";
                        break;
                    case "es":
                        noData2 = "No hay datos para la palabra clave:";
                        break;
                    case "ca":
                        noData2 = "No hi ha dades relacionades amb la paraula clau:";
                        break;
                    default:
                        noData2 = "No items for keyword:";
                }
                $('#end p').html(noData2 + "<span style='color:red'> " + page + "</span>");
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
    });
}