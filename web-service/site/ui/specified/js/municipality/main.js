var pilot;
var interval_carousel;
var leafletMap;
(function () {
    'use strict';

    switch (gup("pilot")) {
        case "valdemoro":
            pilot = "Valdemoro";
            break;
        case "hatay":
            pilot = "Hatay";
            break;
        case "crete":
            pilot = "Crete";
            break;
        case "mollet":
            pilot = "Mollet";
            break;
        case "locride":
            pilot = "Locride";
            break;
        case "thessaloniki":
            pilot = "Thessaloniki";
            break;
        case "europe":
            pilot = "eu";
            break;
        default:
            pilot = "-";
            $('#myModal').reveal();
    }
    draw_dialogues();
    $('.municipality_title strong').text(pilot);

    var $animatedBlock = $('.js-tool-support');
    var $animatedTileElements = $('.js-tool-tile', $animatedBlock);
    var $animatedShadowElements = $('.js-tool-shadow', $animatedBlock);
    var $window = $(window);

    $animatedTileElements.each(function (index, element) {
        var $element = $(element);
        var inactiveClass = $animatedBlock.attr('data-tool-tile-inactive');

        if (inactiveClass) {
            $element.addClass(inactiveClass);
        }
    });

    // Apply 'unanimated' class to shadow
    $animatedShadowElements.each(function (index, element) {
        var $element = $(element);
        var inactiveClass = $animatedBlock.attr('data-tool-shadow-inactive');

        if (inactiveClass) {
            $element.addClass(inactiveClass);
        }
    });

    var show_tile_animation = function () {

        // Get the current pages height
        var windowPos = $window.scrollTop() + $window.height();


        // If the animated block is now above the activation point, remove the old class and add the new one
        $animatedTileElements.each(function (index, element) {

            var $element = $(element);
            var currentBlockPosition = $animatedBlock.offset().top;
            var activationPoint = $animatedBlock.attr('data-tool-support-activation-point');

            if (activationPoint != null) {
                switch (activationPoint) {
                    case "middle":
                        activationPoint = $window.height() / 2;
                        break;
                    case "bottom":
                        activationPoint = $window.height();
                        break;
                    default:
                        activationPoint = 0;
                }

                windowPos = $window.scrollTop() + ($window.height() - activationPoint);
            }


            if (currentBlockPosition < windowPos) {
                var animationOrder = $element.attr('data-animation-order');
                var animationInterval = $animatedBlock.attr('data-animation-interval');
                var inactiveClass = $animatedBlock.attr('data-tool-tile-inactive');

                // timings for animation
                if (animationOrder === 'first') {
                    if (inactiveClass) {
                        $element.removeClass(inactiveClass);
                    }

                    $element.addClass($animatedBlock.attr('data-tool-tile-active'));
                    $animatedTileElements = $animatedTileElements.not($element); // Pop from the list
                }
                else if (animationOrder === 'second') {
                    setTimeout(function () {
                        if (inactiveClass) {
                            $element.removeClass(inactiveClass);
                        }

                        $element.addClass($animatedBlock.attr('data-tool-tile-active'));
                        $animatedTileElements = $animatedTileElements.not($element); // Pop from the list
                    }, animationInterval);
                }
                else if (animationOrder === 'third') {
                    setTimeout(function () {
                        if (inactiveClass) {
                            $element.removeClass(inactiveClass);
                        }

                        $element.addClass($animatedBlock.attr('data-tool-tile-active'));
                        $animatedTileElements = $animatedTileElements.not($element); // Pop from the list
                    }, animationInterval * 2);
                }
                else if (animationOrder === 'forth') {
                    setTimeout(function () {
                        if (inactiveClass) {
                            $element.removeClass(inactiveClass);
                        }

                        $element.addClass($animatedBlock.attr('data-tool-tile-active'));
                        $animatedTileElements = $animatedTileElements.not($element); // Pop from the list
                    }, animationInterval * 3);
                }
                else if (animationOrder === 'fifth') {
                    setTimeout(function () {
                        if (inactiveClass) {
                            $element.removeClass(inactiveClass);
                        }

                        $element.addClass($animatedBlock.attr('data-tool-tile-active'));
                        $animatedTileElements = $animatedTileElements.not($element); // Pop from the list
                    }, animationInterval * 4);
                }
            }

        });

        $animatedShadowElements.each(function (index, element) {

            var $element = $(element);
            var currentBlockPosition = $animatedBlock.offset().top;
            var activationPoint = $animatedBlock.attr('data-tool-support-activation-point');

            if (activationPoint != null) {
                switch (activationPoint) {
                    case "middle":
                        activationPoint = $window.height() / 2;
                        break;
                    case "bottom":
                        activationPoint = $window.height();
                        break;
                    default:
                        activationPoint = 0;
                }

                windowPos = $window.scrollTop() + ($window.height() - activationPoint);
            }

            if (currentBlockPosition < windowPos) {
                var animationOrder = $element.attr('data-animation-order');
                var animationInterval = $animatedBlock.attr('data-animation-interval');
                var inactiveClass = $animatedBlock.attr('data-tool-shadow-inactive');

                // timings for animation
                if (animationOrder === 'first') {
                    if (inactiveClass) {
                        $element.removeClass(inactiveClass);
                    }

                    $element.addClass($animatedBlock.attr('data-tool-shadow-active'));
                    $animatedShadowElements = $animatedShadowElements.not($element); // Pop from the list
                }
                else if (animationOrder === 'second') {
                    setTimeout(function () {
                        if (inactiveClass) {
                            $element.removeClass(inactiveClass);
                        }

                        $element.addClass($animatedBlock.attr('data-tool-shadow-active'));
                        $animatedShadowElements = $animatedShadowElements.not($element); // Pop from the list
                    }, animationInterval);
                }
                else if (animationOrder === 'third') {
                    setTimeout(function () {
                        if (inactiveClass) {
                            $element.removeClass(inactiveClass);
                        }

                        $element.addClass($animatedBlock.attr('data-tool-shadow-active'));
                        $animatedShadowElements = $animatedShadowElements.not($element); // Pop from the list
                    }, animationInterval * 2);
                }
                else if (animationOrder === 'forth') {
                    setTimeout(function () {
                        if (inactiveClass) {
                            $element.removeClass(inactiveClass);
                        }

                        $element.addClass($animatedBlock.attr('data-tool-shadow-active'));
                        $animatedShadowElements = $animatedShadowElements.not($element); // Pop from the list
                    }, animationInterval * 3);
                }
                else if (animationOrder === 'fifth') {
                    setTimeout(function () {
                        if (inactiveClass) {
                            $element.removeClass(inactiveClass);
                        }

                        $element.addClass($animatedBlock.attr('data-tool-shadow-active'));
                        $animatedShadowElements = $animatedShadowElements.not($element); // Pop from the list
                    }, animationInterval * 4);
                }
            }

        });
    };
    setTimeout(function () {
        $('.tool-support-animation-container').css('opacity', '1');
        show_tile_animation();
    }, 500);
    appear({
        init: function init() {
        },
        elements: function elements() {
            return document.getElementsByClassName('description');
        },
        appear: function appear(el) {
            $(el).css('opacity', '1').find('h3').addClass('active_line');
            switch ($(el).attr('id')) {
                case "platforms":
                    draw_pie_statistics();
                    break;
                case "influencers":
                    draw_influencers();
                    break;
                case "timeline":
                    draw_timeline();
                    break;
                case "posts":
                    draw_posts();
                    break;
                case "stats":
                    draw_stats(1);
                    break;
                case "tags":
                    setTimeout(function () {
                        draw_hashtags();
                    }, 500);
                    break;
                case "topics":
                    setTimeout(function () {
                        draw_topics();
                    }, 300);
                    break;
                case "map":
                    draw_map(true);
                    break;
            }
        },
        disappear: function disappear(el) {
        },
        bounds: -80,
        reappear: false
    });
})();

function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}

function draw_dialogues() {
    var $tabs = $('#tabs');
    $('#tracker_link').attr('href', 'http://188.214.128.140/ui/?user_id=' + pilot);
    $.ajax({
        type: "GET",
        url: api_folder + "collection/" + pilot + "?nPerPage=60&pageNumber=1&status=all",
        dataType: "json",
        success: function (json) {
            for (var d = 0; d < json.collections.length; d++) {
                if (json.collections[d].items > 50) {
                    $tabs.find('ul').append('<li data-id="' + json.collections[d]._id + '" title="' + json.collections[d].title + '">' + json.collections[d].title + '</li>');
                }
            }
            if (json.collections.length > 0) {
                var dialogue = gup('dialogue');
                if (dialogue === "") {
                    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?pilot=' + gup("pilot") + '&dialogue=' + $tabs.find('li').eq(0).attr('data-id'));
                    $tabs.find('li').eq(0).addClass('tab-current');
                }
                else {
                    $('li[data-id="' + dialogue + '"]').addClass('tab-current');
                }
            }
            else {
                $('#myModal').reveal();
            }

        },
        async: false
    });
}

function draw_pie_statistics() {
    var dialoque_id = $('.tab-current').attr('data-id');
    var twitter_count = 0, google_count = 0, facebook_count = 0, flickr_count = 0, youtube_count = 0, rss_count = 0;
    $('.pie_chart_wrapper').empty();
    $.ajax({
        type: "GET",
        url: api_folder + "statistics?collection=" + dialoque_id + "&source=Twitter,Facebook,Flickr,Youtube,RSS,GooglePlus",
        dataType: "json",
        success: function (json) {
            if (json.total > 0) {
                for (var s = 0; s < json.sources.length; s++) {
                    switch (json.sources[s].field) {
                        case "Twitter":
                            twitter_count = json.sources[s].count;
                            break;
                        case "GooglePlus":
                            google_count = json.sources[s].count;
                            break;
                        case "Facebook":
                            facebook_count = json.sources[s].count;
                            break;
                        case "Flickr":
                            flickr_count = json.sources[s].count;
                            break;
                        case "Youtube":
                            youtube_count = json.sources[s].count;
                            break;
                        case "RSS":
                            rss_count = json.sources[s].count;
                            break;
                    }
                }
                var dataset = [twitter_count, google_count, facebook_count, flickr_count, youtube_count, rss_count];
                var colors = ['#55ACEE', '#EE4134', '#43619B', '#EC2680', '#CC181E', '#F26522'];
                var platform_icons = ["imgs/twitter-32-color.png", "imgs/google_plus-32-color.png", "imgs/facebook-32-color.png", "imgs/flickr-32-color.png", "imgs/youtube-32-color.png", "imgs/rss-32-color.png"];
                var platform_names = ['Twitter', 'GooglePlus', 'Facebook', 'Flickr', 'Youtube', 'RSS'];

                var width = document.querySelector('.pie_chart_wrapper').offsetWidth;
                var height = document.querySelector('.pie_chart_wrapper').offsetHeight;
                var minOfWH = Math.min(width, height) / 2;
                var initialAnimDelay = 0;
                var arcAnimDelay = 150;
                var arcAnimDur = 1500;
                var secDur = 1500;
                var secIndividualdelay = 150;

                var radius = undefined;
                if (minOfWH > 200) {
                    radius = 200;
                } else {
                    radius = minOfWH;
                }
                var svg = d3.select('.pie_chart_wrapper').append('svg').attr({
                    'width': width,
                    'height': height
                }).append('g');

                svg.attr({
                    'transform': 'translate(' + width / 2 + ',275)'
                });
                var arc_out = 1.1, arc_in = 0.85, stroke_width = '45px', font_size = '1.3em', circle_radius = 8, left_text = -55, left_circle = -73, top_text = -80, step_text = 30;
                if (width < 510) {
                    arc_out = 0.8;
                    arc_in = 0.55;
                    stroke_width = '40px';
                    font_size = '1.1em';
                    circle_radius = 4;
                    left_circle = -68;
                    left_text = -50;
                    top_text = -50;
                    step_text = 20;
                }
                // for drawing slices
                var arc = d3.svg.arc().outerRadius(radius * arc_out).innerRadius(radius * arc_in);

                // for labels and polylines
                var outerArc = d3.svg.arc().innerRadius(radius * (arc_out + 0.35)).outerRadius(radius * (arc_in + 0.4));

                var pie = d3.layout.pie().value(function (d) {
                    return d;
                });

                svg.append("g").attr("class", "lines");
                svg.append("g").attr("class", "slices");
                svg.append("g").attr("class", "labels");
                svg.append("g").attr("class", "absolute");

                // define slice
                var slice = svg.select('.slices').datum(dataset).selectAll('path').data(pie);
                slice.enter().append('path').attr({
                    'fill': function fill(d, i) {
                        return colors[i];
                    },
                    'd': arc,
                    'stroke-width': stroke_width,
                    'transform': function transform(d, i) {
                        return 'rotate(-180, 0, 0)';
                    }
                }).style('opacity', 0).transition().delay(function (d, i) {
                    return i * arcAnimDelay + initialAnimDelay;
                }).duration(arcAnimDur).ease('elastic').style('opacity', 1).attr('transform', 'rotate(0,0,0)');

                slice.transition().delay(function (d, i) {
                    return arcAnimDur + i * secIndividualdelay;
                }).duration(secDur).attr('stroke-width', '5px');

                var midAngle = function midAngle(d) {
                    return d.startAngle + (d.endAngle - d.startAngle) / 2;
                };

                var text = svg.select(".labels").selectAll("text").data(pie(dataset));

                text.enter().append("svg:image").style("opacity", 0)
                    .attr("xlink:href", function (d, index) {
                        return platform_icons[index]
                    })
                    .attr("width", 32)
                    .attr("height", 32)
                    .attr('transform', function (d) {
                        // calculate outerArc centroid for 'this' slice
                        var pos = outerArc.centroid(d);
                        // define left and right alignment of text labels
                        pos[0] = (radius * (midAngle(d) < Math.PI ? 1 : -1)) - (31 * (midAngle(d) < Math.PI ? 0 : 1));
                        pos[1] -= 16;
                        return 'translate(' + pos + ')';
                    }).transition().delay(function (d, i) {
                        return arcAnimDur + i * secIndividualdelay;
                    }).duration(secDur).style('opacity', function (d) {
                        return Math.round((d.data / json.total) * 100) >= 5 ? 1 : 0;
                    });


                var center_text = svg.select(".absolute").selectAll("text").data(pie(dataset));

                center_text.enter().append('text').attr('dy', '0.35em').attr('font-size', font_size).style("opacity", 0).style('fill', function (d, i) {
                    return colors[i];
                }).text(function (d, i) {
                    return platform_names[i] + '  ' + Math.round((d.data / json.total) * 100) + '%';
                }).attr('transform', function (d, index) {
                    var left = left_text;
                    var top = (top_text + index * step_text);
                    return 'translate(' + left + ',' + top + ')';
                }).transition().delay(function (d, i) {
                    return arcAnimDur + i * secIndividualdelay;
                }).duration(secDur).style('opacity', function (d) {
                    return ((1 - 0.4) / (100 - 0) * (d.data - 100) + 1);
                    //(max'-min')/(max-min)*(value-max)+max'
                });


                center_text.enter().append('circle').attr('r', circle_radius).style("opacity", 0).style('fill', function (d, i) {
                    return colors[i];
                }).attr('transform', function (d, index) {
                    var left = left_circle;
                    var top = (top_text + index * step_text);
                    return 'translate(' + left + ',' + top + ')';
                }).transition().delay(function (d, i) {
                    return arcAnimDur + i * secIndividualdelay;
                }).duration(secDur).style('opacity', function (d) {
                    return ((1 - 0.4) / (100 - 0) * (d.data - 100) + 1);
                    //(max'-min')/(max-min)*(value-max)+max'
                });

                var polyline = svg.select(".lines").selectAll("polyline").data(pie(dataset));

                polyline.enter().append("polyline").style("opacity", function (d) {
                    return Math.round((d.data / json.total) * 100) >= 5 ? 0.5 : 0;
                }).attr('points', function (d) {
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), arc.centroid(d), arc.centroid(d)];
                }).transition().duration(secDur).delay(function (d, i) {
                    return arcAnimDur + i * secIndividualdelay;
                }).attr('points', function (d) {
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), outerArc.centroid(d), pos];
                });
            }
            else {
                $('.pie_chart_wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
            }
        },
        error: function () {
            $('.pie_chart_wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
        },
        async: true
    });
}

function draw_influencers() {
    var $influencers_wrapper = $('#influencers_wrapper');
    var dialoque_id = $('.tab-current').attr('data-id');
    $influencers_wrapper.find('.noData').remove();
    $influencers_wrapper.addClass('initial');
    $.ajax({
        type: "GET",
        url: api_folder + "users?n=15&collection=" + dialoque_id + "&source=Twitter,Facebook,Flickr,Youtube,RSS,GooglePlus",
        dataType: "json",
        success: function (json) {
            $('.circle-container, #influencers_wrapper hr').show();
            var color, icon;
            if (json.length > 0) {
                for (var u = 0; u < json.length; u++) {
                    switch (true) {
                        case /Twitter/.test(json[u].id):
                            color = '#55ACEE';
                            icon = 'imgs/twitter-24-white.png';
                            break;
                        case /GooglePlus/.test(json[u].id):
                            color = '#EE4134';
                            icon = 'imgs/google_plus-24-white.png';
                            break;
                        case /Facebook/.test(json[u].id):
                            color = '#43619B';
                            icon = 'imgs/facebook-24-white.png';
                            break;
                        case /Flickr/.test(json[u].id):
                            color = '#EC2680';
                            icon = 'imgs/flickr-24-white.png';
                            break;
                        case /Youtube/.test(json[u].id):
                            color = '#CC181E';
                            icon = 'imgs/youtube-24-white.png';
                            break;
                        case /RSS/.test(json[u].id):
                            color = '#F26522';
                            icon = 'imgs/rss-24-white.png';
                            break;
                    }
                    var $circle = $('#circle-' + (u + 1));
                    if (json[u].profileImage === "imgs/noprofile.gif") {
                        json[u].profileImage = "http://getfavicon.appspot.com/" + json[u].pageUrl;
                    }
                    $circle.find('.front').attr('style', 'background:url("' + json[u].profileImage + '"), url("imgs/no-avatar.png") no-repeat;');
                    $circle.find('.back').css('background-color', color);
                    $circle.find('.back a').attr('href', json[u].pageUrl).text(json[u].username);
                    $circle.find('.circle_source_icon').attr('src', icon);
                    $circle.find('.circle-posts').text(nFormatter(json[u].count) + " post(s)");
                }
                $('#influencers_wrapper').addClass('prep-activate');
                setTimeout(function () {
                    $('#influencers_wrapper').addClass('activate');
                }, 200);
                if (json.length < 15) {
                    $('.circle-container:gt(' + (json.length - 1) + ')').hide();
                }
            }
            else {
                $('.circle-container, #influencers_wrapper hr').hide();
                $('#influencers_wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
            }
        },
        error: function () {
            $('.circle-container, #influencers_wrapper hr').hide();
            $('#influencers_wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
        },
        async: true
    });
}

function draw_timeline() {
    var dialoque_id = $('.tab-current').attr('data-id');
    $('.curtain').remove();
    $.ajax({
        type: "GET",
        url: api_folder + "timeline?resolution=days&collection=" + dialoque_id + "&source=Twitter,Facebook,Flickr,Youtube,RSS,GooglePlus",
        dataType: "json",
        success: function (json) {
            var timeline_values = [];
            var timeline = json.timeline;
            for (var i = 0; i < timeline.length; i++) {
                timeline_values.push({
                    x: new Date(timeline[i].date).getTime(),
                    y: timeline[i].count
                });
            }
            var noData = "No Data Available";
            nv.addGraph(function () {
                var chart = nv.models.lineChart()
                    .interpolate("monotone")
                    .showLegend(false)
                    .noData(noData);

                chart.xAxis.tickFormat(function (d) {
                    return d3.time.format("%d %b %y")(new Date(d));
                }).staggerLabels(true).tickPadding(15);

                chart.yAxis.tickFormat(d3.format("d")).tickPadding(15);
                chart.xScale(d3.time.scale());
                d3.select("#chart_line")
                    .datum([{
                        area: true,
                        values: timeline_values,
                        key: "Posts",
                        color: '#47a3da'
                    }])
                    .call(chart);
                nv.utils.windowResize(chart.update);

                if (timeline_values.length > 0) {
                    var curtain = d3.select("#chart_line").append('rect')
                        .attr('x', -1 * $('#chart_line').width())
                        .attr('y', -1 * 500)
                        .attr('height', 500)
                        .attr('width', $('#chart_line').width())
                        .attr('class', 'curtain')
                        .attr('transform', 'rotate(180)')
                        .style('fill', '#27292C');

                    var t = d3.select("#chart_line").transition()
                        .delay(300)
                        .duration(1500)
                        .ease('linear');

                    t.select('rect.curtain')
                        .attr('width', 0);
                }
                return chart;
            });
        },
        error: function () {
            nv.addGraph(function () {
                var chart = nv.models.lineChart()
                    .interpolate("monotone")
                    .showLegend(false)
                    .noData("No Data Available");

                d3.select("#chart_line")
                    .datum([{
                        area: true,
                        values: [],
                        key: "Posts",
                        color: '#47a3da'
                    }])
                    .call(chart);
                nv.utils.windowResize(chart.update);
                return chart;
            });
        },
        async: true
    });
}

function draw_posts() {
    var $ca_container = $('#ca-container');
    var dialoque_id = $('.tab-current').attr('data-id');
    $ca_container.html('<div class="ca-wrapper"></div>');
    $('.ca-navigation').find('ul').empty();
    clearInterval(interval_carousel);
    current_position = 0;
    $.ajax({
        type: "GET",
        url: api_folder + "items?collection=" + dialoque_id + "&nPerPage=10&pageNumber=1&source=Facebook,Twitter,Flickr,Youtube,RSS,GooglePlus&sort=popularity&unique=true&original=original",
        dataType: "json",
        success: function (json) {
            if (json.total > 0) {
                var icon, shares;
                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                for (var i = 0; i < json.items.length; i++) {
                    switch (json.items[i].source) {
                        case "Twitter":
                            icon = 'imgs/twitter-32-color.png';
                            shares = nFormatter(json.items[i].shares) + ' retweets';
                            break;
                        case "GooglePlus":
                            icon = 'imgs/google_plus-32-color.png';
                            shares = nFormatter(json.items[i].shares) + ' shares';
                            break;
                        case "Facebook":
                            icon = 'imgs/facebook-32-color.png';
                            shares = nFormatter(json.items[i].shares) + ' shares';
                            break;
                        case "Flickr":
                            icon = 'imgs/flickr-32-color.png';
                            shares = nFormatter(json.items[i].views) + ' views';
                            break;
                        case "Youtube":
                            icon = 'imgs/youtube-32-color.png';
                            shares = nFormatter(json.items[i].views) + ' views';
                            break;
                        case "RSS":
                            icon = 'imgs/rss-32-color.png';
                            shares = nFormatter(json.items[i].shares) + ' shares';
                            break;
                    }
                    var display_time = new Date(json.items[i].publicationTime * 1);
                    var month = months[display_time.getUTCMonth()];
                    var date = display_time.getUTCDate();
                    var time = date + ' ' + month;

                    if (json.items[i].type === "item") {
                        $('.ca-wrapper').append('<div class="ca-item"> <div class="ca-item-main"> <h4 class="no-media"> <span class="ca-quote">&ldquo;</span> <span>' + json.items[i].title + '</span> </h4> <div class="ca-user no-media"><span class="ca-userpic" style="background: url(' + json.items[i].user.profileImage + '), url(imgs/no-avatar.png);"></span> <a href="' + json.items[i].user.pageUrl + '" class="ca-username" target="_blank">' + json.items[i].user.username + '</a> </div> <div class="ca-footer"> <img src="' + icon + '"> <span class="ca-share">' + shares + '</span> <span class="ca-timestamp">' + time + '</span> </div> <a href="' + json.items[i].pageUrl + '" class="ca-link" target="_blank">Original Post</a> <div class="ca-count">#' + (i + 1) + '</div> </div> </div>');
                    }
                    else {
                        $('.ca-wrapper').append('<div class="ca-item"> <div class="ca-item-main"> <div class="ca-icon" style=" background: url(' + json.items[i].mediaUrl + ') no-repeat;"></div> <h4> <span class="ca-quote">&ldquo;</span> <span>' + json.items[i].title + '</span> </h4> <div class="ca-user"><span class="ca-userpic" style="background: url(' + json.items[i].user.profileImage + '), url(imgs/no-avatar.png);"></span> <a href="' + json.items[i].user.pageUrl + '" class="ca-username" target="_blank">' + json.items[i].user.username + '</a> </div> <div class="ca-footer"> <img src="' + icon + '"> <span class="ca-share">' + shares + '</span> <span class="ca-timestamp">' + time + '</span> </div> <a href="' + json.items[i].pageUrl + '" class="ca-link" target="_blank">Original Post</a> <div class="ca-count">#' + (i + 1) + '</div> </div> </div>')
                    }
                    $('.ca-navigation ul').append('<li></li>');
                }
                switch ($('.ca-container').width()) {
                    case 710:
                        $('.ca-navigation ul li:lt(3)').addClass('ca-active');
                        break;
                    case 470:
                        $('.ca-navigation ul li:lt(2)').addClass('ca-active');
                        break;
                    case 235:
                        $('.ca-navigation ul li:lt(1)').addClass('ca-active');
                        break;
                }
                $('#ca-container').contentcarousel().slideDown(1500, function () {
                    $('.ca-navigation').slideDown(1500, function () {
                        setcarousel();
                    });
                });
            }
            else {
                $('.ca-container').show();
                $('.ca-wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
            }
        },
        error: function () {
            $('.ca-container').show();
            $('.ca-wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
        },
        async: true
    });
    function setcarousel() {
        clearInterval(interval_carousel);
        interval_carousel = setInterval(function () {
            $('.ca-nav-next').click();
        }, 2000);
    }

    $ca_container.on('mouseenter', '.ca-wrapper, .ca-nav-prev, .ca-nav-next', function (event) {
        clearInterval(interval_carousel);
    }).on('mouseleave', '.ca-wrapper, .ca-nav-prev, .ca-nav-next', function (event) {
        setcarousel();
    });

}

function draw_stats(first_call) {
    var users, reach, endorsement, posts;
    var $stats_wrapper = $('#stats_wrapper');
    var dialoque_id = $('.tab-current').attr('data-id');
    $stats_wrapper.find('.noData').remove();
    $stats_wrapper.addClass('initial');
    $.ajax({
        type: "GET",
        url: api_folder + "statistics?collection=" + dialoque_id + "&source=Twitter,Facebook,Flickr,Youtube,RSS,GooglePlus",
        dataType: "json",
        success: function (json) {
            if (json.total > 0) {
                $('.stats_items').show();
                users = nFormatter(json.users);
                reach = nFormatter(json.reach);
                endorsement = nFormatter(json.endorsement);
                posts = nFormatter(json.total);

                var comma_separator_number_step;

                $('.stats_items').eq(0).css('opacity', 1);
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('');
                if (posts.indexOf('M') > -1) {
                    comma_separator_number_step = $.animateNumber.numberStepFactories.append('M');
                }
                if (posts.indexOf('K') > -1) {
                    comma_separator_number_step = $.animateNumber.numberStepFactories.append('K');
                }
                $('#posts_num').prop('number', parseInt($('#posts_num').html())).animateNumber({
                        number: posts,
                        numberStep: comma_separator_number_step
                    },
                    (first_call * 1000) + 1000);


                setTimeout(function () {
                    $('.stats_items').eq(1).css('opacity', 1);
                    comma_separator_number_step = $.animateNumber.numberStepFactories.append('');
                    if (users.indexOf('M') > -1) {
                        comma_separator_number_step = $.animateNumber.numberStepFactories.append('M');
                    }
                    if (users.indexOf('K') > -1) {
                        comma_separator_number_step = $.animateNumber.numberStepFactories.append('K');
                    }
                    $('#users_num').prop('number', $('#users_num').html()).animateNumber({
                            number: users,
                            numberStep: comma_separator_number_step
                        },
                        (first_call * 1000) + 1000);
                }, first_call * 500);
                setTimeout(function () {
                    $('.stats_items').eq(2).css('opacity', 1);
                    comma_separator_number_step = $.animateNumber.numberStepFactories.append('');
                    if (endorsement.indexOf('M') > -1) {
                        comma_separator_number_step = $.animateNumber.numberStepFactories.append('M');
                    }
                    if (endorsement.indexOf('K') > -1) {
                        comma_separator_number_step = $.animateNumber.numberStepFactories.append('K');
                    }
                    $('#endo_num').prop('number', $('#endo_num').html()).animateNumber({
                            number: endorsement,
                            numberStep: comma_separator_number_step
                        },
                        (first_call * 1000) + 1000);
                }, first_call * 1000);
                setTimeout(function () {
                    $('.stats_items').eq(3).css('opacity', 1);
                    comma_separator_number_step = $.animateNumber.numberStepFactories.append('');
                    if (reach.indexOf('M') > -1) {
                        comma_separator_number_step = $.animateNumber.numberStepFactories.append('M');
                    }
                    if (reach.indexOf('K') > -1) {
                        comma_separator_number_step = $.animateNumber.numberStepFactories.append('K');
                    }
                    $('#reach_num').prop('number', $('#reach_num').html()).animateNumber({
                            number: reach,
                            numberStep: comma_separator_number_step
                        },
                        (first_call * 1000) + 1000);
                }, first_call * 1500);
            }
            else {
                $('.stats_items').hide();
                $('#stats_wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
            }
        },
        error: function () {
            $('.stats_items').hide();
            $('#stats_wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
        },
        async: true
    });
}

function draw_hashtags() {
    var dialoque_id = $('.tab-current').attr('data-id');
    var tags_array = [];
    var max_amount = -1;
    var BubbleChart, root;
    $('#legend_tags').show(1500).css('visibility', 'visible');
    $('#tags_wrapper').empty();
    $('#tags_tooltip').remove();

    BubbleChart = (function () {
        function BubbleChart() {
            var noData = "No Data Available";
            $.ajax({
                type: "GET",
                url: api_folder + "terms?n=15&collection=" + dialoque_id + "&source=Twitter,Facebook,Flickr,Youtube,RSS,GooglePlus",
                dataType: "json",
                success: function (json) {
                    var len = json.length;
                    for (var i = 0; i < len; i++) {
                        var frequency = json[i].count;
                        var token = json[i].field;
                        var typecolor = json[i].type;

                        var appearance;
                        var id = i + 1;
                        if (between(i, 0, Math.round(len / 10))) {
                            appearance = "OFTEN";
                        }
                        if (between(i, Math.round(len / 10) + 1, Math.round(len / 2))) {
                            appearance = "OCCASIONALLY";
                        }
                        if (between(i, Math.round(len / 2) + 1, len + 10)) {
                            appearance = "SELDOM";
                        }

                        tags_array.push({
                            "token": token,
                            "id": id,
                            "frequency": frequency,
                            "appearance": appearance,
                            "typecolor": typecolor
                        });
                    }
                    if (tags_array.length === 0) {
                        d3.select('#tags_wrapper')
                            .append('text')
                            .attr('class', 'nvd3 nv-noData')
                            .attr('dy', '-.7em')
                            .attr('x', ($('#tags').width() / 2) - 80)
                            .attr('y', 240)
                            .text(noData);
                        $('#legend_tags').css('visibility', 'hidden');
                    }
                },
                error: function () {
                    d3.select('#tags_wrapper')
                        .append('text')
                        .attr('class', 'nvd3 nv-noData')
                        .attr('dy', '-.7em')
                        .attr('x', ($('#tags').width() / 2) - 80)
                        .attr('y', 240)
                        .text(noData);
                    $('#legend_tags').css('visibility', 'hidden');
                },
                async: false
            });
            var $tags = $('#tags_wrapper');
            this.data = tags_array;
            this.width = $tags.width();
            this.height = $tags.height();
            this.tooltip = CustomTooltip("tags_tooltip", 'auto');

            this.appearance_centers = {
                "OFTEN": {
                    x: 220,
                    y: this.height / 2
                },
                "OCCASIONALLY": {
                    x: this.width / 2,
                    y: this.height / 2
                },
                "SELDOM": {
                    x: this.width - 220,
                    y: this.height / 2
                }
            };

            this.layout_gravity = -0.01;
            this.damper = 0.1;
            this.vis = null;
            this.nodes = [];
            this.force = null;
            this.circles = null;
            this.fill_color = d3.scale.ordinal().domain(["person", "tag", "organization"]).range(["#89A894", "#0B7189", "#745B5E"]);
            max_amount = d3.max(this.data, function (d) {
                return parseInt(d.frequency);
            });
            this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([0, 60]);
            this.create_nodes();
            this.create_vis();
        }

        BubbleChart.prototype.create_nodes = function () {
            this.data.forEach((function (_this) {
                return function (d) {
                    var node;
                    node = {
                        id: d.id,
                        radius: _this.radius_scale(parseInt(d.frequency)),
                        frequency: d.frequency,
                        token: d.token,
                        typecolor: d.typecolor,
                        appearance: d.appearance,
                        x: Math.random() * 900,
                        y: Math.random() * 900
                    };
                    return _this.nodes.push(node);
                };
            })(this));
        };

        BubbleChart.prototype.create_vis = function () {
            var that;
            this.vis = d3.select("#tags_wrapper").attr("width", this.width).attr("height", this.height);
            this.circles = this.vis.selectAll("circle").data(this.nodes, function (d) {
                return d.id;
            });
            that = this;
            this.circles.enter().append("g").append("circle").attr("r", 0).attr("fill", (function (_this) {
                return function (d) {
                    return _this.fill_color(d.typecolor);
                };
            })(this)).attr("stroke-width", 3).attr("stroke", (function (_this) {
                return function (d) {
                    return d3.rgb(_this.fill_color(d.typecolor)).darker();
                };
            })(this)).attr("id", function (d) {
                return "bubble_" + d.id;
            }).on("mouseover", function (d, i) {
                return that.show_details(d, i, this);
            }).on("mouseout", function (d, i) {
                return that.hide_details(d, i, this);
            });

            this.circles.append("text").attr("text-anchor", "middle").attr("fill", "#ecf0f1").attr("font-weight", "bold").attr("font-size", function (d) {
                return (d.radius) / 2.2;
            }).text(function (d) {
                return d.token;
            }).on("mouseover", function (d, i) {
                return that.show_details(d, i, this);
            }).on("mouseout", function (d, i) {
                return that.hide_details(d, i, this);
            });

            return this.circles.select('circle').transition().duration(1000).attr("r", function (d) {
                return d.radius;
            });
        };

        BubbleChart.prototype.charge = function (d) {
            return d.radius * d.radius / -8;
        };

        BubbleChart.prototype.start = function () {
            return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
        };

        BubbleChart.prototype.display_by_appearance = function () {
            this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function (_this) {
                return function (e) {
                    return _this.circles.each(_this.move_towards_appearance(e.alpha)).attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                };
            })(this));
            this.force.start();
            this.hide_labels();
            return this.display_labels_appearance();
        };

        BubbleChart.prototype.move_towards_appearance = function (alpha) {
            return (function (_this) {
                return function (d) {
                    var target;
                    target = _this.appearance_centers[d.appearance];
                    d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
                    return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
                };
            })(this);
        };

        BubbleChart.prototype.display_labels_appearance = function () {
            if (tags_array.length > 0) {
                var years, years_data, years_x;
                years_data = ["OFTEN", "OCCASIONALLY", "SELDOM"];
                years_x = [150, (this.width / 1.9), this.width - 150];
                years = this.vis.selectAll(".tags_title").data(years_data);
                return years.enter().append("text").attr("class", "tags_title").attr("x", (function (_this) {
                    return function (d) {
                        return years_x[years_data.indexOf(d)];
                    };
                })(this)).attr("y", 40).text(function (d) {
                    return d;
                });
            }
        };

        BubbleChart.prototype.hide_labels = function () {
            return this.vis.selectAll(".tags_title").remove();
        };
        BubbleChart.prototype.show_details = function (data, i, element) {

            if (element.tagName === "text") {
                jQuery(element).siblings('circle').attr("stroke", "black");
            }
            else {
                d3.select(element).attr("stroke", "black");
            }

            var content;
            content = "<span class=\"name\">Token:</span><span class=\"value\"> " + data.token + "</span><br/>";
            content += "<span class=\"name\">Type:</span><span class=\"value\"> " + (data.typecolor).toUpperCase() + "</span><br/>";
            content += "<span class=\"name\">Frequency:</span><span class=\"value\"> " + nFormatter(data.frequency) + "</span><br/>";
            content += "<span class=\"name\">Appearance:</span><span class=\"value\"> " + data.appearance + "</span><br/>";
            content += "<span class=\"name\">Order:</span><span class=\"value\"> " + data.id + "</span><br/>";

            return this.tooltip.showTooltip(content, d3.event);
        };

        BubbleChart.prototype.hide_details = function (data, i, element) {
            if (element.tagName === "text") {
                if (!(jQuery(element).siblings('circle').is(":hover"))) {

                    jQuery(element).siblings('circle').eq(0).attr("stroke", (function (_this) {
                        return function () {
                            return d3.rgb(jQuery(this).attr('fill')).darker();
                        };
                    })(this));
                    return this.tooltip.hideTooltip();
                }
            }
            else {
                d3.select(element).attr("stroke", (function (_this) {
                    return function (d) {
                        return d3.rgb(_this.fill_color(d.typecolor)).darker();
                    };
                })(this));
                return this.tooltip.hideTooltip();
            }
        };

        return BubbleChart;

    })();

    root = typeof exports !== "undefined" && exports !== null ? exports : this;

    var chart, render_vis;
    chart = null;

    render_vis = function () {
        chart = new BubbleChart();
        chart.start();
        return root.display_appearance();
    };

    root.display_appearance = (function (_this) {
        return function () {
            return chart.display_by_appearance();
        };
    })(this);
    return d3.csv("", render_vis);
}

function draw_topics() {
    $('#legend_concepts').show().css('visibility', 'visible');
    var $topics_chart_wrapper = $('.topics_chart_wrapper');
    var $tab_current = $('.tab-current');
    var dialoque_id = $tab_current.attr('data-id');
    var $topic_chart = $('.topics_chart');
    var $topic_main = $('#topic_main');
    $topic_chart.removeClass('open');
    $topic_chart.find('ul').empty();
    $topics_chart_wrapper.find('.noData').remove();
    $topics_chart_wrapper.addClass('initial');

    $.ajax({
        type: "GET",
        url: api_folder + "concepts?n=10&collection=" + dialoque_id + "&source=Twitter,Facebook,Flickr,Youtube,RSS,GooglePlus",
        dataType: "json",
        success: function (json) {
            if (json.length > 0) {
                var count_percentage = [];
                $topic_chart.show();
                $topic_main.text($tab_current.text());
                $topic_main.css('opacity', 1);
                $('figure').css('opacity', 1);
                for (var c = 0; c < json.length; c++) {
                    $topic_chart.find('ul').append("<li> <input id='" + c + "' type='checkbox'> <label title='" + json[c].field.replace(/_/g, " ") + "' for='" + c + "'>" + json[c].field.replace(/_/g, " ") + "</label> </li>");
                    count_percentage.push(json[c].count);
                }
                var total = count_percentage.reduce(function (a, b) {
                    return a + b;
                }, 0);
                for (var co = 0; co < count_percentage.length; co++) {
                    count_percentage[co] = count_percentage[co] / total;
                }
                for (co = 0; co < count_percentage.length; co++) {
                    switch (true) {
                        case (count_percentage[co] < 0.2):
                            $topic_chart.find('li').eq(co).find('label').addClass('concept_small');
                            break;
                        case (count_percentage[co] < 0.5):
                            $topic_chart.find('li').eq(co).find('label').addClass('concept_medium');
                            break;
                        case (count_percentage[co] < 0.8):
                            $topic_chart.find('li').eq(co).find('label').addClass('concept_large');
                            break;
                        default:
                            break;
                    }
                }
                setTimeout(function () {
                    $topic_chart.toggleClass('open');
                    var li = $topic_chart.find('li');
                    var deg = $topic_chart.hasClass('half') ? 180 / (li.length - 1) : 360 / li.length;
                    for (var i = 0; i < li.length; i++) {
                        var d = $topic_chart.hasClass('half') ? (i * deg) - 90 : i * deg;
                        $topic_chart.hasClass('open') ? rotate(li[i], d) : rotate(li[i], angleStart);
                    }
                }, 100);
            }
            else {
                $topic_chart.hide();
                $('#legend_concepts').css('visibility', 'hidden');
                $('.topics_chart_wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
            }
        },
        error: function () {
            $topic_chart.hide();
            $('#legend_concepts').css('visibility', 'hidden');
            $('.topics_chart_wrapper').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
        },
        async: true
    });
}

function draw_map(first_call) {
    var $mapContainer = $('#mapContainer');
    var dialoque_id = $('.tab-current').attr('data-id');
    var cscale;
    $mapContainer.find('.noData').remove();
    $mapContainer.removeClass('noShadow');
    $('#hex-svg').remove();
    $mapContainer.css('opacity', 1);
    $.ajax({
        type: "GET",
        url: api_folder + "heatmap/points?collection=" + dialoque_id + "&source=Facebook,Twitter,Flickr,Youtube,RSS,GooglePlus",
        dataType: "json",
        success: function (json) {
            $('.leaflet-map-pane, .leaflet-control-container').show();
            if (first_call) {
                leafletMap = L.mapbox.map('mapContainer', 'delimited.ge9h4ffl', {
                    center: [20, -40],
                    zoom: 2,
                    minZoom: 1,
                    maxZoom: 11,
                    maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
                });
            }
            if (json.points.length > 0) {
                L.HexbinLayer = L.Class.extend({
                    includes: L.Mixin.Events,
                    initialize: function (rawData, options) {
                        this.levels = {};
                        this.layout = d3.hexbin().radius(10);
                        this.rscale = d3.scale.sqrt().range([0, 10]).clamp(true);
                        this.rwData = rawData;
                        this.config = options;
                    },
                    project: function (x) {
                        var point = this.map.latLngToLayerPoint([x[1], x[0]]);
                        return [point.x, point.y];
                    },
                    getBounds: function (d) {
                        var b = d3.geo.bounds(d);
                        return L.bounds(this.project([b[0][0], b[1][1]]), this.project([b[1][0], b[0][1]]));
                    },
                    update: function () {
                        var pad = 100, xy = this.getBounds(this.rwData), zoom = this.map.getZoom();

                        this.container
                            .attr("width", xy.getSize().x + (2 * pad))
                            .attr("height", xy.getSize().y + (2 * pad))
                            .style("margin-left", (xy.min.x - pad) + "px")
                            .style("margin-top", (xy.min.y - pad) + "px");

                        if (!(zoom in this.levels)) {
                            this.levels[zoom] = this.container.append("g").attr("class", "zoom-" + zoom);
                            this.genHexagons(this.levels[zoom]);
                            this.levels[zoom].attr("transform", "translate(" + -(xy.min.x - pad) + "," + -(xy.min.y - pad) + ")");
                        }
                        if (this.curLevel) {
                            this.curLevel.style("display", "none");
                        }
                        this.curLevel = this.levels[zoom];
                        this.curLevel.style("display", "inline");
                    },
                    genHexagons: function (container) {
                        var data = this.rwData.features.map(function (d) {
                            var coords = this.project(d.geometry.coordinates)
                            return [coords[0], coords[1], d.properties];
                        }, this);

                        var bins = this.layout(data);
                        var hexagons = container.selectAll(".hexagon").data(bins);

                        var counts = [];
                        bins.map(function (elem) {
                            counts.push(elem.length)
                        });
                        this.rscale.domain([0, (average(counts) + (standardDeviation(counts) * 3))]);

                        var path = hexagons.enter().append("path").attr("class", "hexagon");
                        this.config.style.call(this, path);

                        that = this;
                        hexagons
                            .attr("d", function (d) {
                                return that.layout.hexagon(that.rscale(d.length));
                            })
                            .attr("transform", function (d) {
                                return "translate(" + d.x + "," + d.y + ")";
                            })
                            .on("mouseover", function (d) {
                                that.config.mouse.call(this, d[0][2].posts);
                                d3.select("#map_tooltip")
                                    .style("visibility", "visible")
                                    .style("top", function () {
                                        return (d3.event.pageY - 40) + "px"
                                    })
                                    .style("left", function () {
                                        return (d3.event.pageX - 95) + "px";
                                    })
                            })
                            .on("mouseout", function (d) {
                                d3.select("#map_tooltip").style("visibility", "hidden")
                            });
                    },
                    addTo: function (map) {
                        map.addLayer(this);
                        return this;
                    },
                    onAdd: function (map) {
                        this.map = map;
                        var overlayPane = this.map.getPanes().overlayPane;

                        if (!this.container || overlayPane.empty) {
                            this.container = d3.select(overlayPane)
                                .append('svg')
                                .attr("id", "hex-svg")
                                .attr('class', 'leaflet-layer leaflet-zoom-hide');
                        }
                        map.on({'moveend': this.update}, this);
                        this.update();
                    }
                });
                L.hexbinLayer = function (data, styleFunction) {
                    return new L.HexbinLayer(data, styleFunction);
                };

                var data = [], max = -1;
                for (var i = 0; i < json.points.length; i++) {
                    if (json.points[i].count > max) {
                        max = json.points[i].count;
                    }
                    data.push({
                        properties: {
                            posts: json.points[i].count
                        },
                        type: "Feature",
                        geometry: {
                            coordinates: [json.points[i].longitude, json.points[i].latitude],
                            type: "Point"
                        }
                    });
                }
                cscale = d3.scale.linear().domain([1, max]).range(["#00FF00", "#FF0000"]);
                var geoData = {type: "FeatureCollection", features: data};
                L.hexbinLayer(geoData, {
                    style: hexbinStyle,
                    mouse: map_tooltip
                }).addTo(leafletMap);
            }
            else {
                $('.leaflet-map-pane, .leaflet-control-container').hide();
                $mapContainer.addClass('noShadow').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
            }
        },
        error: function () {
            $('.leaflet-map-pane, .leaflet-control-container').hide();
            $mapContainer.addClass('noShadow').append($('<p class="noData">No Data Available</p>').hide().fadeIn(2000));
        },
        async: true
    });

    function hexbinStyle(hexagons) {
        hexagons
            .attr("stroke", "black")
            .attr("fill", function (d) {
                var avg = d3.mean(d, function (d) {
                    return +d[2].posts;
                });
                return cscale(avg);
            });
    }

    function map_tooltip(data) {
        $('#map_tooltip_no').text(data);
    }
}

$(window).resize(function () {
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function () {
        draw_pie_statistics();
        draw_hashtags();

        var $navigation_li = $('.ca-navigation ul li');
        $('.ca-active').removeClass('ca-active');
        switch ($('.ca-container').width()) {
            case 710:
                $navigation_li.eq(current_position % 10).addClass('ca-active');
                $navigation_li.eq((current_position + 1) % 10).addClass('ca-active');
                $navigation_li.eq((current_position + 2) % 10).addClass('ca-active');
                break;
            case 470:
                $navigation_li.eq(current_position % 10).addClass('ca-active');
                $navigation_li.eq((current_position + 1) % 10).addClass('ca-active');
                break;
            case 235:
                $navigation_li.eq(current_position % 10).addClass('ca-active');
                break;
        }
    }, 250);

});
$(window).scroll(function () {
    var $row = $('.row'), $tabs = $('#tabs');
    if ($(this).scrollTop() > $row.eq(0).height() + $row.eq(1).height() + $row.eq(2).height()) {
        $tabs.addClass('sticky');
    }
    else {
        $tabs.removeClass('sticky');
    }
});

$("#tabs").on("click", "li", function () {
    if (!($(this).hasClass('tab-current'))) {
        $('.tab-current').removeClass('tab-current');
        $(this).addClass('tab-current');

        window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?pilot=' + gup("pilot") + '&dialogue=' + $(this).attr('data-id'));


        if ($('.pie_chart_wrapper').children().length > 0) {
            draw_pie_statistics();
        }

        if ($('#influencers_wrapper').hasClass('initial')) {
            draw_influencers();
        }

        if ($('#chart_line').children().length > 0) {
            draw_timeline();
        }

        if ($('.ca-wrapper').children().length > 0) {
            draw_posts();
        }

        if ($('#stats_wrapper').hasClass('initial')) {
            draw_stats(0);
        }

        if ($('#tags_wrapper').children().length > 0) {
            draw_hashtags();
        }

        if ($('.topics_chart_wrapper').hasClass('initial')) {
            draw_topics();
        }

        if ($('#mapContainer').children().length > 0) {
            draw_map(false);
        }
    }
});
function nFormatter(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(0).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(0).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}
function CustomTooltip(tooltipId, width) {
    $("body").append("<div class='nvtooltip' id='" + tooltipId + "'></div>");

    if (width) {
        $("#" + tooltipId).css("width", width);
    }

    hideTooltip();

    function showTooltip(content, event) {
        $("#" + tooltipId).html(content).show();
        updatePosition(event);
    }

    function hideTooltip() {
        $("#" + tooltipId).hide();
    }

    function updatePosition(event) {
        var ttid = "#" + tooltipId;
        var xOffset = 20;
        var yOffset = 10;

        var ttw = jQuery(ttid).width();
        var tth = jQuery(ttid).height();
        var wscrY = jQuery(window).scrollTop();
        var wscrX = jQuery(window).scrollLeft();
        var curX = (document.all) ? event.clientX + wscrX : event.pageX;
        var curY = (document.all) ? event.clientY + wscrY : event.pageY;
        var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > jQuery(window).width()) ? curX - ttw - xOffset * 2 : curX + xOffset;
        if (ttleft < wscrX + xOffset) {
            ttleft = wscrX + xOffset;
        }
        var tttop = ((curY - wscrY + yOffset * 2 + tth) > jQuery(window).height()) ? curY - tth - yOffset * 2 : curY + yOffset;
        if (tttop < wscrY + yOffset) {
            tttop = curY + yOffset;
        }
        jQuery(ttid).css('top', tttop + 'px').css('left', ttleft + 'px');
    }

    return {
        showTooltip: showTooltip,
        hideTooltip: hideTooltip,
        updatePosition: updatePosition
    };
}
function between(x, min, max) {
    return x >= min && x <= max;
}
function rotate(li, d) {
    $({d: 0}).animate({d: d}, {
        step: function (now) {
            $(li)
                .css({transform: 'rotate(' + now + 'deg)'})
                .find('label')
                .css({transform: 'rotate(' + (-now) + 'deg)'});
        }, duration: 0
    });
}
function standardDeviation(values) {
    var avg = average(values);

    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = average(squareDiffs);

    return Math.sqrt(avgSquareDiff);
}

function average(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
}
$(window).on('beforeunload', function () {
    $(window).scrollTop(0);
});