var type = gup('type');
var dialogue_id = gup('dialogue_id');
$('.graph_title').eq(1).text(type);
$('#dialogue_link').attr('href','../specified/municipality.html?pilot='+dialogue_id.replace(/[0-9]/g, '').toLowerCase()+'&dialogue='+dialogue_id);
$('input[type=radio][name=algorithm]').change(function () {
    $('#loading').show();
    $('#graph1,#graph2,#legend,#legend_actions,#legend_toggle').css('opacity', 0);
    if ($('input[name=algorithm]:checked').val() === "nmf") {
        getData_topics('nmf');
        getData_documents('nmf');
    }
    else {
        getData_topics('lda');
        getData_documents('lda');
    }
});

var chart_topics, chart_documents;
nv.addGraph(function () {
    chart_topics = nv.models.scatterChart()
        .showDistX(true)
        .showDistY(true)
        .pointRange([200, 1000])
        .showLegend(false)
        .useVoronoi(true)
        .duration(300);

    chart_topics.tooltip.contentGenerator(function (key) {
        var term_dom = "";
        for (var i = 0; i < key.point.terms.length; i++) {
            term_dom += '<div class="term">' + key.point.terms[i] + '</div><span class="term_prob">' + (key.point.terms_prob[i] * 100).toFixed(2) + '%</span>';
        }
        return '<div class="tooltip_text">' + key.point.desc + '</div>' +
            '<ul class="statistics"><li><div class="label">Probability:</div><div class="number">' + (key.point.size * 100).toFixed(2) + '%</div></li><li><div class="label">Documents:</div><div class="number">' + key.point.documents + '</div></li><li><div class="label">Point:</div><div class="number">' + (key.point.x).toFixed(2) + ' , ' + (key.point.y).toFixed(2) + '</div></li></ul>' +
            '<div class="terms"><div class="term_wrapper">' + term_dom + '</div></div>';
    });

    chart_topics.xAxis.tickFormat(d3.format('.02f'));
    chart_topics.yAxis.tickFormat(d3.format('.02f'));
    getData_topics('lda');
    return chart_topics;
});
nv.addGraph(function () {
    chart_documents = nv.models.scatterChart()
        .showDistX(true)
        .pointRange([100, 1000])
        .showDistY(true)
        .showLegend(false)
        .useVoronoi(true)
        .duration(300);

    chart_documents.dispatch.on('renderEnd', function () {
        $('#loading').hide();
        $('#graph1,#graph2,#legend,#legend_actions,#legend_toggle').css('opacity', 1);
    });
    chart_documents.tooltip.contentGenerator(function (key) {
        return '<div class="tooltip_text">' + key.point.desc + '</div>' +
            '<ul class="statistics"><li><div class="label">Entropy:</div><div class="number">' + (key.point.entropy).toFixed(2) + '</div></li><li><div class="label">Topic:</div><div class="number">' + key.point.topic + ' (' + (key.point.topic_prob * 100).toFixed(2) + '%)</div></li><li><div class="label">Point:</div><div class="number">' + (key.point.x).toFixed(2) + ' , ' + (key.point.y).toFixed(2) + '</div></li></ul>';
    });

    chart_documents.xAxis.tickFormat(d3.format('.02f'));
    chart_documents.yAxis.tickFormat(d3.format('.02f'));
    getData_documents('lda');
    return chart_documents;
});

function getData_topics(algorithm) {
    var colors = ["#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
        "#809693", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
        "#372101", "#FFB500", "#772600", "#A079BF", "#CC0744", "#C0B9B2", "#CB7E98", "#001E09",
        "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
        "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C"];
    var data = [], terms = [], terms_prob = [];
    $.ajax({
        type: "GET",
        url: "data/" + dialogue_id + "/" + type + "/" + algorithm + "_topics.json",
        dataType: "json",
        success: function (json) {
            $('#legend').empty();
            for (var i = 0; i < json.length; i++) {
                terms.length = 0;
                terms_prob.length = 0;
                for (var t = 0; t < json[i].terms.length; t++) {
                    terms.push(json[i].terms[t].term);
                    terms_prob.push(json[i].terms[t].prob);
                }
                if (json[i].documents > 0) {
                    $('#legend').append('<div class="legend_wrapper" data-color="' + colors[i] + '"><div class="legendcolor" style="background-color:' + colors[i] + ';"></div><div class="legendtext">' + i + '.  ' + json[i].description + '</div></div>')
                    data.push({
                        "key": json[i].description,
                        "values": [
                            {
                                "x": json[i].point[0],
                                "y": json[i].point[1],
                                "size": json[i].prob_t,
                                "shape": "circle",
                                "documents": json[i].documents,
                                "desc": json[i].description,
                                "terms": terms.slice(0),
                                "topic_num": i,
                                "terms_prob": terms_prob.slice(0),
                                "color": colors[i]
                            }
                        ],
                        "color": colors[i]
                    });
                }
            }
            d3.select('#graph1 svg')
                .datum(data)
                .call(chart_topics);
        },
        error: function () {
            d3.select('#graph1 svg')
                .datum([])
                .call(chart_topics);
        },
        async: true
    });
}
function getData_documents(algorithm) {
    var colors = ["#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
        "#809693", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
        "#372101", "#FFB500", "#772600", "#A079BF", "#CC0744", "#C0B9B2", "#CB7E98", "#001E09",
        "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
        "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C"];
    var data = [];
    $.ajax({
        type: "GET",
        url: "data/" + dialogue_id + "/" + type + "/" + algorithm + "_documents.json",
        dataType: "json",
        success: function (json) {
            for (var i = 0; i < json.length; i++) {
                data.push({
                    "key": json[i].title,
                    "values": [
                        {
                            "x": json[i].point[0],
                            "y": json[i].point[1],
                            "size": 5,
                            "shape": "circle",
                            "desc": json[i].title,
                            "entropy": json[i].entropy,
                            "topic": json[i].label.topic,
                            "topic_prob": json[i].label.probability,
                            "topic_num": json[i].label.topic,
                            "color": colors[json[i].label.topic]
                        }
                    ],
                    "color": colors[json[i].label.topic]
                });
            }
            d3.select('#graph2 svg')
                .datum(data)
                .call(chart_documents);
        },
        error: function () {
            d3.select('#graph2 svg')
                .datum([])
                .call(chart_documents);
            $('#loading').hide();
            $('#graph1,#graph2,#legend,#legend_actions,#legend_toggle').css('opacity', 1);
        },
        async: true
    });
    return data;
}

$("#legend").on("click", ".legend_wrapper", function () {
    if ($(this).hasClass('off')) {
        $('#graph1 [data-color="' + $(this).attr('data-color') + '"],#graph2 [data-color="' + $(this).attr('data-color') + '"]').show();
        $(this).removeClass('off');
    }
    else {
        $(this).addClass('off');
        $('#graph1 [data-color="' + $(this).attr('data-color') + '"],#graph2 [data-color="' + $(this).attr('data-color') + '"]').hide();
    }
});

$('#show_all').click(function () {
    $('*[data-color^="#"]').show();
    $('.legend_wrapper').removeClass('off');
});

$('#hide_all').click(function () {
    $('#graph1 [data-color^="#"],#graph2 [data-color^="#"]').hide();
    $('.legend_wrapper').addClass('off');
});
$('#legend_toggle').click(function () {
    $(this).find('img').toggleClass('close_arrow');
    $('#legend_wrapper').slideToggle(500);
});
function resizedw() {
    $('#loading').show();
    $('#graph1,#graph2,#legend,#legend_actions,#legend_toggle').css('opacity', 0);
    if ($('input[name=algorithm]:checked').val() === "nmf") {
        getData_topics('nmf');
        getData_documents('nmf');
    }
    else {
        getData_topics('lda');
        getData_documents('lda');
    }
}

var doit;
window.onresize = function () {
    clearTimeout(doit);
    doit = setTimeout(resizedw, 200);
};

function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}