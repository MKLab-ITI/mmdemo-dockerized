var map, maxLat = 90, minLat = -90, maxLong = 180, minLong = -180, zoom = 1, centerLat = 20, centerLong = -40;

function show_heatmap() {
    if (map !== undefined) {
        map.remove();
    }
    var southWest = L.latLng(minLat, minLong),
        northEast = L.latLng(maxLat, maxLong),
        bounds = L.latLngBounds(southWest, northEast);

    L.mapbox.accessToken = 'pk.eyJ1IjoibGFhcG9zdG8iLCJhIjoic21tVGtEQSJ9.tH3Q3MuElddX8xe26KkoHw';
    map = L.mapbox.map('heatmap', 'examples.map-h68a1pf7', {
        center: [centerLat, centerLong],
        zoom: zoom,
        minZoom: 1,
        maxZoom: 11,
        maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
    })
    //console.log(bounds);
    //map.fitBounds(bounds);
    var heat = L.heatLayer([]).addTo(map);

    map.on('zoomend', function () {
        var bounds = map.getBounds();
        minLong = bounds._southWest.lng;
        maxLong = bounds._northEast.lng;
        minLat = bounds._southWest.lat;
        maxLat = bounds._northEast.lat;
        zoom = map.getZoom();
        centerLat = map.getCenter().lat;
        centerLong = map.getCenter().lng;
        map.removeLayer(heat);
        if (minLong < -180) {
            minLong = -180;
        }
        if (maxLong > 180) {
            maxLong = 180;
        }
        if (maxLat > 70) {
            maxLat = 90;
        }
        if (minLat < -50) {
            minLat = -90;
        }
        show_heatmap();
    });
    map.on('dragend', function () {
        var bounds = map.getBounds();
        minLong = bounds._southWest.lng;
        maxLong = bounds._northEast.lng;
        minLat = bounds._southWest.lat;
        maxLat = bounds._northEast.lat;
        zoom = map.getZoom();
        centerLat = map.getCenter().lat;
        centerLong = map.getCenter().lng;
        if (minLong < -180) {
            minLong = -180;
        }
        if (maxLong > 180) {
            maxLong = 180;
        }
        if (maxLat > 90) {
            maxLat = 90;
        }
        if (minLat < -90) {
            minLat = -90;
        }
    });

    $.ajax({
        type: "GET",
        url: api_folder + "heatmap/points?collection=" + collection_param + "&source=" + source_param + "&language=" + language_param + "&relevance=" + relevance_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&topicQuery=" + topic_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&minLong=" + minLong + "&maxLong=" + maxLong + "&minLat=" + minLat + "&maxLat=" + maxLat + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {
            var $json_points = json.points;
            for (var i = 0, lat, long, count; i < $json_points.length; i++) {

                lat = $json_points[i].latitude;
                long = $json_points[i].longitude;
                count = $json_points[i].count;
                if (count === 1) {
                    heat.addLatLng(L.latLng(lat, long));
                }
                else {
                    for (var k = 0, lng_step, lat_step; k < count; k++) {
                        lng_step = long + Math.random() * (json.longitudeStep);
                        lat_step = lat - Math.random() * (json.latitudeStep);
                        heat.addLatLng(L.latLng(lat_step, lng_step));
                    }
                }
            }
            $('#load3').hide();
            $('#heatmap').animate({opacity: 1}, 400);
        },
        async: true
    });
}
