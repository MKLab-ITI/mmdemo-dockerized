var current_direction = 0, countall = 0;

function show_locations() {
    if (typeof google === "object" && typeof google.visualization === "object") {
        current_direction = 0;
        draw_locations();
    } else {
        google.load('visualization', '1.0', {
            packages: ['corechart'],
            callback: function () {
                current_direction = 0;
                draw_locations();
            }
        })
    }
}

function draw_locations() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Country');
    data.addColumn('number', 'Count');

    var g1, g2, g3;

    $.ajax({
        type: "GET",
        url: api_folder + "top/country?collection=" + collection_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&language=" + language_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            countall = 0;
            var $values = json.values;
            $values.shift();
            for (var i = 0; i < $values.length; i++) {

                var country = $values[i].field;
                var count = $values[i].count;
                countall += count;

                data.addRow([country, parseInt(count)]);
            }

            var options = {
                displayMode: 'regions',
                colorAxis: {
                    colors: ["#38e4c3", "#21e1bc", "#1cccab", "#19b698", "#16a085", "#138973", "#107360"]
                },
                legend: 'none',
                tooltip: {isHtml: true},
                keepAspectRatio: true,
                backgroundColor: '#2D353C',
                datalessRegionColor: '#BDC3C7',
                defaultColor: '#BDC3C7'
            };

            var chart = new google.visualization.GeoChart(document.getElementById('locations'));
            chart.draw(data, options);
            var $gages = $('#gages');
            switch ($values.length) {
                case 0:
                    $gages.html('<div class="no-data">No Data Available</div>');
                    break;
                case 1:
                    $gages.html('<div id="g1"></div>');
                    $('#g1').css('width', '100%');
                    g1 = new JustGage({
                        id: "g1",
                        value: $values[0].count * 100 / countall,
                        min: 0,
                        max: 100,
                        title: $values[0].field,
                        label: "of users",
                        showMinMax: false,
                        startAnimationType: "bounce",
                        startAnimationTime: 2000,
                        refreshAnimationTime: 2000,
                        refreshAnimationType: "bounce",
                        gaugeColor: "lightgray",
                        levelColors: ["#107360"],
                        symbol: "%",
                        donut: true,
                        gaugeWidthScale: 0.6,
                        counter: true
                    });
                    break;
                case 2:
                    $gages.html('<div id="g1"></div><div id="g2"></div>');
                    $('#g1,#g2').css('width', '50%');
                    g1 = new JustGage({
                        id: "g1",
                        value: $values[0].count * 100 / countall,
                        min: 0,
                        max: 100,
                        title: $values[0].field,
                        label: "of users",
                        showMinMax: false,
                        startAnimationType: "bounce",
                        startAnimationTime: 2000,
                        refreshAnimationTime: 2000,
                        refreshAnimationType: "bounce",
                        gaugeColor: "lightgray",
                        levelColors: ["#107360"],
                        symbol: "%",
                        donut: true,
                        gaugeWidthScale: 0.6,
                        counter: true
                    });

                    g2 = new JustGage({
                        id: "g2",
                        value: $values[1].count * 100 / countall,
                        min: 0,
                        max: 100,
                        title: $values[1].field,
                        label: "of users",
                        showMinMax: false,
                        startAnimationType: "bounce",
                        startAnimationTime: 2000,
                        refreshAnimationTime: 2000,
                        refreshAnimationType: "bounce",
                        gaugeColor: "lightgray",
                        levelColors: ["#19b698"],
                        symbol: "%",
                        donut: true,
                        gaugeWidthScale: 0.6,
                        counter: true
                    });
                    break;
                default:
                    $gages.html('<img src="imgs/arrow-89-24.png" class="arrow3" id="arrow3-left"/><div id="g1"></div><div id="g2"></div><div id="g3"></div><img src="imgs/arrow-25-24.png" class="arrow3" id="arrow3-right"/>');
                    if ($values.length > 3) {
                        $('.arrow3').eq(1).show();
                    }
                    $('#g1,#g2,#g3').css('width', '33.3%');
                    g1 = new JustGage({
                        id: "g1",
                        value: $values[0].count * 100 / countall,
                        min: 0,
                        max: 100,
                        title: $values[0].field,
                        label: "of users",
                        showMinMax: false,
                        startAnimationType: "bounce",
                        startAnimationTime: 2000,
                        refreshAnimationTime: 2000,
                        refreshAnimationType: "bounce",
                        gaugeColor: "lightgray",
                        levelColors: ["#107360"],
                        symbol: "%",
                        donut: true,
                        gaugeWidthScale: 0.6,
                        counter: true
                    });

                    g2 = new JustGage({
                        id: "g2",
                        value: $values[1].count * 100 / countall,
                        min: 0,
                        max: 100,
                        title: $values[1].field,
                        label: "of users",
                        showMinMax: false,
                        startAnimationType: "bounce",
                        startAnimationTime: 2000,
                        refreshAnimationTime: 2000,
                        refreshAnimationType: "bounce",
                        gaugeColor: "lightgray",
                        levelColors: ["#19b698"],
                        symbol: "%",
                        donut: true,
                        gaugeWidthScale: 0.6,
                        counter: true
                    });

                    g3 = new JustGage({
                        id: "g3",
                        value: $values[2].count * 100 / countall,
                        min: 0,
                        max: 100,
                        title: $values[2].field,
                        label: "of users",
                        showMinMax: false,
                        startAnimationType: "bounce",
                        refreshAnimationTime: 2000,
                        refreshAnimationType: "bounce",
                        startAnimationTime: 2000,
                        gaugeColor: "lightgray",
                        levelColors: ["#38e4c3"],
                        symbol: "%",
                        donut: true,
                        gaugeWidthScale: 0.6,
                        counter: true
                    });
                    break;
            }
            $('#load4').hide();
            $('#users_locations').animate({opacity: 1}, 400);
        },
        async: true
    });
}

function draw_gages(direction) {
    var g1, g2, g3;

    if (direction === 'right') {
        current_direction++;
        $.ajax({
            type: "GET",
            url: api_folder + "top/country?collection=" + collection_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&language=" + language_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
            dataType: "json",
            success: function (json) {
                var $values = json.values;
                $values.shift();
                switch ($values.length - (current_direction * 3)) {
                    case 1:
                        $('#gages').html('<img src="imgs/arrow-89-24.png" class="arrow3" id="arrow3-left"/><div id="g1"></div><img src="imgs/arrow-25-24.png" class="arrow3" id="arrow3-right"/>');
                        $('#g1').css('width', '100%');
                        $('.arrow3').eq(0).show();
                        g1 = new JustGage({
                            id: "g1",
                            value: $values[current_direction * 3].count * 100 / countall,
                            min: 0,
                            max: 100,
                            title: $values[current_direction * 3].field,
                            label: "of users",
                            showMinMax: false,
                            startAnimationType: "bounce",
                            startAnimationTime: 2000,
                            refreshAnimationTime: 2000,
                            refreshAnimationType: "bounce",
                            gaugeColor: "lightgray",
                            levelColors: ["#107360"],
                            symbol: "%",
                            donut: true,
                            gaugeWidthScale: 0.6,
                            counter: true
                        });
                        break;
                    case 2:
                        $('#gages').html('<img src="imgs/arrow-89-24.png" class="arrow3" id="arrow3-left"/><div id="g1"></div><div id="g2"></div><div id="g3"></div><img src="imgs/arrow-25-24.png" class="arrow3" id="arrow3-right"/>');
                        $('#g1,#g2').css('width', '50%');
                        $('.arrow3').eq(0).show();
                        g1 = new JustGage({
                            id: "g1",
                            value: $values[current_direction * 3].count * 100 / countall,
                            min: 0,
                            max: 100,
                            title: $values[current_direction * 3].field,
                            label: "of users",
                            showMinMax: false,
                            startAnimationType: "bounce",
                            startAnimationTime: 2000,
                            refreshAnimationTime: 2000,
                            refreshAnimationType: "bounce",
                            gaugeColor: "lightgray",
                            levelColors: ["#107360"],
                            symbol: "%",
                            donut: true,
                            gaugeWidthScale: 0.6,
                            counter: true
                        });

                        g2 = new JustGage({
                            id: "g2",
                            value: $values[(current_direction * 3) + 1].count * 100 / countall,
                            min: 0,
                            max: 100,
                            title: $values[(current_direction * 3) + 1].field,
                            label: "of users",
                            showMinMax: false,
                            startAnimationType: "bounce",
                            startAnimationTime: 2000,
                            refreshAnimationTime: 2000,
                            refreshAnimationType: "bounce",
                            gaugeColor: "lightgray",
                            levelColors: ["#19b698"],
                            symbol: "%",
                            donut: true,
                            gaugeWidthScale: 0.6,
                            counter: true
                        });
                        break;
                    default:
                        $('#gages').html('<img src="imgs/arrow-89-24.png" class="arrow3" id="arrow3-left"/><div id="g1"></div><div id="g2"></div><div id="g3"></div><img src="imgs/arrow-25-24.png" class="arrow3" id="arrow3-right"/>');
                        $('#g1,#g2,#g3').css('width', '33.3%');
                        $('.arrow3').show();
                        if ($values.length === (current_direction * 3) + 3) {
                            $('.arrow3').eq(1).hide();
                        }
                        g1 = new JustGage({
                            id: "g1",
                            value: $values[current_direction * 3].count * 100 / countall,
                            min: 0,
                            max: 100,
                            title: $values[current_direction * 3].field,
                            label: "of users",
                            showMinMax: false,
                            startAnimationType: "bounce",
                            startAnimationTime: 2000,
                            refreshAnimationTime: 2000,
                            refreshAnimationType: "bounce",
                            gaugeColor: "lightgray",
                            levelColors: ["#107360"],
                            symbol: "%",
                            donut: true,
                            gaugeWidthScale: 0.6,
                            counter: true
                        });

                        g2 = new JustGage({
                            id: "g2",
                            value: $values[(current_direction * 3) + 1].count * 100 / countall,
                            min: 0,
                            max: 100,
                            title: $values[(current_direction * 3) + 1].field,
                            label: "of users",
                            showMinMax: false,
                            startAnimationType: "bounce",
                            startAnimationTime: 2000,
                            refreshAnimationTime: 2000,
                            refreshAnimationType: "bounce",
                            gaugeColor: "lightgray",
                            levelColors: ["#19b698"],
                            symbol: "%",
                            donut: true,
                            gaugeWidthScale: 0.6,
                            counter: true
                        });

                        g3 = new JustGage({
                            id: "g3",
                            value: $values[(current_direction * 3) + 2].count * 100 / countall,
                            min: 0,
                            max: 100,
                            title: $values[(current_direction * 3) + 2].field,
                            label: "of users",
                            showMinMax: false,
                            startAnimationType: "bounce",
                            refreshAnimationTime: 2000,
                            refreshAnimationType: "bounce",
                            startAnimationTime: 2000,
                            gaugeColor: "lightgray",
                            levelColors: ["#38e4c3"],
                            symbol: "%",
                            donut: true,
                            gaugeWidthScale: 0.6,
                            counter: true
                        });
                        break;
                }
            },
            async: true
        });
    }
    else {
        current_direction--;
        $.ajax({
            type: "GET",
            url: api_folder + "top/country?collection=" + collection_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&language=" + language_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
            dataType: "json",
            success: function (json) {
                var $values = json.values;
                $values.shift();
                $('#gages').html('<img src="imgs/arrow-89-24.png" class="arrow3" id="arrow3-left"/><div id="g1"></div><div id="g2"></div><div id="g3"></div><img src="imgs/arrow-25-24.png" class="arrow3" id="arrow3-right"/>');
                $('#g1,#g2,#g3').css('width', '33.3%');
                if (current_direction === 0) {
                    $('.arrow3').eq(1).show();
                }
                else {
                    $('.arrow3').show();
                }
                g1 = new JustGage({
                    id: "g1",
                    value: $values[current_direction * 3].count * 100 / countall,
                    min: 0,
                    max: 100,
                    title: $values[current_direction * 3].field,
                    label: "of users",
                    showMinMax: false,
                    startAnimationType: "bounce",
                    startAnimationTime: 2000,
                    refreshAnimationTime: 2000,
                    refreshAnimationType: "bounce",
                    gaugeColor: "lightgray",
                    levelColors: ["#107360"],
                    symbol: "%",
                    donut: true,
                    gaugeWidthScale: 0.6,
                    counter: true
                });

                g2 = new JustGage({
                    id: "g2",
                    value: $values[(current_direction * 3) + 1].count * 100 / countall,
                    min: 0,
                    max: 100,
                    title: $values[(current_direction * 3) + 1].field,
                    label: "of users",
                    showMinMax: false,
                    startAnimationType: "bounce",
                    startAnimationTime: 2000,
                    refreshAnimationTime: 2000,
                    refreshAnimationType: "bounce",
                    gaugeColor: "lightgray",
                    levelColors: ["#19b698"],
                    symbol: "%",
                    donut: true,
                    gaugeWidthScale: 0.6,
                    counter: true
                });

                g3 = new JustGage({
                    id: "g3",
                    value: $values[(current_direction * 3) + 2].count * 100 / countall,
                    min: 0,
                    max: 100,
                    title: $values[(current_direction * 3) + 2].field,
                    label: "of users",
                    showMinMax: false,
                    startAnimationType: "bounce",
                    refreshAnimationTime: 2000,
                    refreshAnimationType: "bounce",
                    startAnimationTime: 2000,
                    gaugeColor: "lightgray",
                    levelColors: ["#38e4c3"],
                    symbol: "%",
                    donut: true,
                    gaugeWidthScale: 0.6,
                    counter: true
                });
            },
            async: true
        });


    }

}
