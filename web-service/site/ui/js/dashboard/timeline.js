function settimeline_analysis_start() {
    var days = (until_param - since_param) / 86400000;
    if (days < 5) {
        $('.analysis').removeClass('activeanalysis');
        $('.analysis').eq(0).addClass('activeanalysis');
    }
    setanalysis_flag = false;
}
function draw_timeline() {
    var resolution = $(".activeanalysis .analysiszone").attr('id');
    var datenow = new Date();
    datenow.setDate(datenow.getDate() - 61);
    var date = datenow.getTime();
    switch (translation_param) {
        case "en":
            if (resolution === "hours") {
                $('#erase_analysis').html("Per Hour");
            }
            else if (resolution === "days") {
                $('#erase_analysis').html("Per Day");
            }
            else {
                $('#erase_analysis').html("Per Week");
            }
            break;
        case "el":
            if (resolution === "hours") {
                $('#erase_analysis').html("Ανά Ώρα");
            }
            else if (resolution === "days") {
                $('#erase_analysis').html("Ανά Ημέρα");
            }
            else {
                $('#erase_analysis').html("Ανά Εβδομάδα");
            }
            break;
        case "it":
            if (resolution === "hours") {
                $('#erase_analysis').html("Per Ora");
            }
            else if (resolution === "days") {
                $('#erase_analysis').html("Per Giorno");
            }
            else {
                $('#erase_analysis').html("Per Settimana");
            }
            break;
        case "tr":
            if (resolution === "hours") {
                $('#erase_analysis').html("Her Saat");
            }
            else if (resolution === "days") {
                $('#erase_analysis').html("Her Gün");
            }
            else {
                $('#erase_analysis').html("Her Hafta");
            }
            break;
        case "es":
            if (resolution === "hours") {
                $('#erase_analysis').html("Por Hora");
            }
            else if (resolution === "days") {
                $('#erase_analysis').html("Por Dia");
            }
            else {
                $('#erase_analysis').html("Por Semana");
            }
            break;
        case "ca":
            if (resolution === "hours") {
                $('#erase_analysis').html("Per Hora");
            }
            else if (resolution === "days") {
                $('#erase_analysis').html("Per Dia");
            }
            else {
                $('#erase_analysis').html("Per Setmana");
            }
            break;
        default:
            if (resolution === "hours") {
                $('#erase_analysis').html("Per Hour");
            }
            else if (resolution === "days") {
                $('#erase_analysis').html("Per Day");
            }
            else {
                $('#erase_analysis').html("Per Week");
            }
            break;
    }

    $.ajax({
        type: "GET",
        url: api_folder+"timeline?resolution=" + resolution + "&language=" + language_param + "&collection=" + collection_param + "&q=" + query_param + "&since=" + date + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            var timeline_values = [];
            var timeline = json.timeline;
            for (var i = 0; i < timeline.length; i++) {
                timeline_values.push({
                    x: parseInt(timeline[i].timestamp),
                    y: timeline[i].count
                });
            }
            var noData;
            switch (translation_param) {
                case "en":
                    noData = "No Data Available";
                    break;
                case "el":
                    noData = "Δεν υπάρχουν δεδομένα";
                    break;
                case "it":
                    noData="Nessun dato disponibile";
                    break;
                case "tr":
                    noData="Uygun veri bulunamadı";
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
                var chart = nv.models.lineWithFocusChart()
                    .showLegend(false)
                    .noData(noData)
                    .margin({"top": 15});

                if (resolution === "hours") {
                    chart.xAxis.tickFormat(function (d) {
                        return d3.time.format('%d %b at %H:%M')(new Date(d));
                    })
                        .staggerLabels(false);
                }
                else {
                    chart.xAxis.tickFormat(function (d) {
                        return d3.time.format('%d %b')(new Date(d));
                    })
                        .staggerLabels(false);
                }
                if (timeline_values.length > 2) {
                    chart.brushExtent([timeline_values[0].x, timeline_values[timeline_values.length - 1].x]);
                }
                else {
                    chart.brushExtent([0, 0])
                }
                /*switch (resolution) {
                 case "hours":
                 if (timeline_values.length > 168) {
                 chart.brushExtent([timeline_values[timeline_values.length - 175].x, timeline_values[timeline_values.length - 1].x]);
                 }
                 else if (timeline_values.length > 48) {
                 chart.brushExtent([timeline_values[0].x, timeline_values[timeline_values.length - 1].x]);
                 }
                 else {
                 chart.brushExtent([0, 0])
                 }
                 break;
                 case "days":
                 if (timeline_values.length > 7) {
                 chart.brushExtent([timeline_values[timeline_values.length - 8].x, timeline_values[timeline_values.length - 1].x]);
                 }
                 else if (timeline_values.length > 2) {
                 chart.brushExtent([timeline_values[0].x, timeline_values[timeline_values.length - 1].x]);
                 }
                 else {
                 chart.brushExtent([0, 0])
                 }
                 break;
                 case "weeks":
                 if (timeline_values.length > 1) {
                 chart.brushExtent([timeline_values[timeline_values.length - 2].x, timeline_values[timeline_values.length - 1].x]);
                 }
                 else {
                 chart.brushExtent([0, 0])
                 }
                 break;
                 }*/


                chart.x2Axis.tickFormat(function (d) {
                    return d3.time.format('%d %b')(new Date(d))
                })
                    .staggerLabels(true);

                chart.yAxis.tickFormat(d3.format("d"));

                if (Object.keys(json).length === 0) {
                    $('#load2').hide();
                    $('#chart_line').animate({opacity: 1}, 400);
                    timeline_values.length = 0;
                }
                d3.select("#chart_line")
                    .datum([{
                        area: true,
                        values: timeline_values,
                        key: "Posts",
                        color: '#00acee'
                    }])
                    .transition()
                    .call(chart);

                $('#load2').hide();
                $('#chart_line').animate({opacity: 1}, 400);
                nv.utils.windowResize(chart.update);
                return chart;
            });
        },
        async: true
    });
}