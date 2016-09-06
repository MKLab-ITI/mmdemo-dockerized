function show_active_users() {
    var username, count, id, barchart_values = [], color_bar, icon, onerror;
    var top = $(".activenumber .topnum").attr('id').replace('num', '');


    $('#users_images').empty().animate({opacity: 0}, 100);

    $.ajax({
        type: "GET",
        url: api_folder + "users?n=" + top + "&collection=" + collection_param + "&q=" + query_param + "&language=" + language_param + "&original=" + original_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            var noData, posts_name;
            switch (translation_param) {
                case "en":
                    noData = "No Data Available";
                    posts_name = "posts";
                    break;
                case "el":
                    noData = "Δεν υπάρχουν δεδομένα";
                    posts_name = "δημοσιεύσεις";
                    break;
                case "it":
                    noData = "Nessun dato disponibile";
                    posts_name = "post";
                    break;
                case "tr":
                    noData = "Uygun veri bulunamadı";
                    posts_name = "gönderiler";
                    break;
                case "sp":
                    noData = "Datos no disponibles";
                    posts_name = "mensajes";
                    break;
                case "ca":
                    noData = "No hi ha dades disponibles";
                    posts_name = "comentaris";
                    break;
                default:
                    noData = "No Data Available";
                    posts_name = "posts";
            }
            for (var i = 0; i < json.length; i++) {
                username = json[i].username;
                count = json[i].count;
                id = json[i].id.substring(0, json[i].id.indexOf('#'));
                if (id === "Youtube") {
                    username = json[i].name;
                }
                onerror = false;
                switch (id) {
                    case "Web":
                        color_bar = "#808080";
                        icon = "imgs/globe-16-color.png";
                        break;
                    case "Twitter":
                        color_bar = "#00acee";
                        icon = "imgs/twitter-16-color.png";
                        onerror = true;
                        break;
                    case "Facebook":
                        color_bar = "#3b5998";
                        icon = "imgs/facebook-5-16.png";
                        break;
                    case "Flickr":
                        color_bar = "#ff0084";
                        icon = "imgs/flickr-16-color.png";
                        break;
                    case "Youtube":
                        color_bar = "#FF0202";
                        icon = "imgs/youtube-16-color.png";
                        break;
                    case "Instagram":
                        color_bar = "#ab7d63";
                        icon = "imgs/instagram-16-color.png";
                        break;
                    case "GooglePlus":
                        color_bar = "#d34836";
                        icon = "imgs/google+-16-color.png";
                        break;
                }
                barchart_values.push({
                    "label": username,
                    "value": count,
                    "color": color_bar,
                    "url": json[i].pageUrl
                });
                if (onerror) {
                    onerror = "imgError2(this,'Twitter','" + json[i].username + "');"
                }
                else {
                    onerror = "imgError2(this,null,null);"
                }
                $('#users_images').append('<div class="user"><p style="float: left;"><img data-url="' + json[i].pageUrl + '"src="' + json[i].profileImage.replace('normal', '400x400') + '" class="user_img" alt="user_img" onerror="' + onerror + '" style="border-color:' + color_bar + '"/></p><p class="user_name">' + username + '</p><br/><p class="user_count">' + count + ' ' + posts_name + '</p><img src="' + icon + '" alt="error_icon" class="user_social"/></div>')

            }
            var data_bar = [{
                key: "Users",
                values: barchart_values
            }];


            nv.addGraph(function () {
                var chart = nv.models.discreteBarChart()
                    .x(function (d) {
                        return d.label;
                    })
                    .y(function (d) {
                        return d.value;
                    })
                    .staggerLabels(true)
                    .showValues(false)
                    .noData(noData)
                    .duration(2000)
                    .margin({bottom: 10, left: 35, top: 26})
                    .showXAxis(false);

                chart.yAxis.tickFormat(d3.format("s"));

                chart.tooltip.contentGenerator(function (key) {
                    var image;
                    switch (key.data.color) {
                        case "#808080":
                            image = "imgs/globe-16-color.png";
                            break;
                        case "#00acee":
                            image = "imgs/twitter-16-color.png";
                            break;
                        case "#3b5998":
                            image = "imgs/facebook-5-16.png";
                            break;
                        case "#ff0084":
                            image = "imgs/flickr-16-color.png";
                            break;
                        case "#FF0202":
                            image = "imgs/youtube-16-color.png";
                            break;
                        case "#ab7d63":
                            image = "imgs/instagram-16-color.png";
                            break;
                        case "#d34836":
                            image = "imgs/google+-16-color.png";
                            break;
                    }
                    return "<img src='" + image + "' class='tooltip_img' /><p><strong>" + key.data.label + "</strong><br>" + nFormatter(key.data.value) + "</p>";
                });

                d3.select('#barchart_users')
                    .datum(data_bar)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            }, function () {
                d3.selectAll(".nv-bar").on('click',
                    function (e) {
                        window.open(e.url, '_blank');
                    });
            });

            $('#users_images').animate({opacity: 1}, 1500);
            $('#active_users').animate({opacity: 1}, 400);
            $('#load5').hide();
        },
        async: true
    });
}