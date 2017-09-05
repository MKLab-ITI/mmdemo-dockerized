function draw_social_mix(flag, view) {

    var twitter = 0,
        facebook = 0,
        flickr = 0,
        youtube = 0,
        instagram = 0,
        rss = 0,
        google = 0;

    $.ajax({
        type: "GET",
        url: api_folder + "statistics?collection=" + collection_param + "&language=" + language_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&q=" + query_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            var stream, count;
            var $sources = json.sources;
            for (var i = 0; i < $sources.length; i++) {
                stream = $sources[i].field;
                count = $sources[i][view];
                switch (stream) {
                    case "Twitter":
                        twitter = count;
                        break;
                    case "Facebook":
                        facebook = count;
                        break;
                    case "Flickr":
                        flickr = count;
                        break;
                    case "Youtube":
                        youtube = count;
                        break;
                    case "GooglePlus":
                        google = count;
                        break;
                    case "Instagram":
                        instagram = count;
                        break;
                    case "RSS":
                        rss = count;
                        break;
                }
            }

            var pie_data = [{
                key: "Facebook",
                y: facebook,
                image_path: "./imgs/facebook-16-color.png"
            }, {
                key: "Twitter",
                y: twitter,
                image_path: "./imgs/twitter-16-color.png"
            }, {
                key: "Flickr",
                y: flickr,
                image_path: "./imgs/flickr-16-color.png"
            }, {
                key: "Youtube",
                y: youtube,
                image_path: "./imgs/youtube-16-color.png"
            }, {
                key: "Google+",
                y: google,
                image_path: "./imgs/google+-16-color.png"
            }, {
                key: "Instagram",
                y: instagram,
                image_path: "./imgs/instagram-16-color.png"
            }, {
                key: "RSS",
                y: rss,
                image_path: "./imgs/rss-16-color.png"
            }];

            var dummy_data = [{
                key: "<img src=" + "./imgs/facebook-16-color.png" + ">",
                y: 0,
                image_path: "./imgs/facebook-16-color.png"
            }, {
                key: "<img src=" + "./imgs/twitter-16-color.png" + ">",
                y: 0,
                image_path: "./imgs/twitter-16-color.png"
            }, {
                key: "<img src=" + "./imgs/flickr-16-color.png" + ">",
                y: 0,
                image_path: "./imgs/flickr-16-color.png"
            }, {
                key: "<img src=" + "./imgs/youtube-16-color.png" + ">",
                y: 0,
                image_path: "./imgs/youtube-16-color.png"
            }, {
                key: "<img src=" + "./imgs/google+-16-color.png" + ">",
                y: 0,
                image_path: "./imgs/google+-16-color.png"
            }, {
                key: "<img src=" + "./imgs/instagram-16-color.png" + ">",
                y: 0,
                image_path: "./imgs/instagram-16-color.png"
            }, {
                key: "<img src=" + "./imgs/rss-16-color.png" + ">",
                y: 0,
                image_path: "./imgs/rss-16-color.png"
            }, {
                key: "<img src=" + "./imgs/white.png" + ">",
                y: 100,
                image_path: "./imgs/white.png"
            }];

            var noData;
            switch (translation_param) {
                case "en":
                    noData = "No Data Available";
                    break;
                case "el":
                    noData = "Δεν υπάρχουν δεδομένα";
                    break;
                case "it":
                    noData = "Nessun dato disponibile";
                    break;
                case "tr":
                    noData = "Uygun veri bulunamadı";
                    break;
                case "es":
                    noData = "Datos no disponibles";
                    break;
                case "ca":
                    noData = "No hi ha dades disponibles";
                    break;
                default:
                    noData = "No Data Available"
            }
            nv.addGraph(function () {

                var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.key;
                    })
                    .y(function (d) {
                        return d.y;
                    })
                    .padAngle(0)
                    .donutRatio(0.65)
                    .noData(noData)
                    .labelThreshold(.05)
                    .showLabels(true)
                    .color(['#3b5998', '#00acee', '#ff0084', '#FF0202', '#d34836', '#ab7d63', '#1e90ff', '#ffffff'])
                    .labelsOutside(true)
                    .showLegend(false)
                    .title("Posts")
                    .donut(true);

                if (json.sources.length === 0) {
                    $('#load1').hide();
                    $('#chart_pie').animate({opacity: 1}, 400);
                    pie_data.length = 0;
                }

                if (flag === 1) {
                    d3.select("#chart_pie")
                        .datum(dummy_data)
                        .transition()//.duration(1500)
                        .call(chart);
                }
                setTimeout(function () {
                    d3.select("#chart_pie")
                        .datum(pie_data)
                        .transition()
                        .call(chart);
                }, 500);

                chart.dispatch.on('renderEnd', function (e) {
                    $('#load1').hide();
                    $('#chart_pie').animate({opacity: 1}, 400);
                });

                nv.utils.windowResize(chart.update);
                return chart;
            });

        },
        async: true
    });
}
