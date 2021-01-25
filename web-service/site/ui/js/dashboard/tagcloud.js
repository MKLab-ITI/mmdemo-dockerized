var days_animation = 0;
var timeouts = [];
var $this_force;
var animation_count;
var stroke = document.querySelector('.stroke');
var length = stroke.getTotalLength();
stroke.style.strokeDasharray = length;
stroke.style.strokeDashoffset = length;

var play = document.querySelector('.play');
var pause = document.querySelector('.pause');

function draw_hashtags(source) {
    $('#gates_tooltip').remove();
    $('#tags_all').empty();
    var dataent = [];
    var max_amount = -1;
    var BubbleChart, root;
    animation_count = 0;
    var top = $(".activenumber_tag .topnum").attr('id').replace('tag', '');

    BubbleChart = (function () {
        function BubbleChart() {
            var url_call;
            if (source === "animation") {
                play.classList.add('hidden');
                pause.classList.remove('hidden');//animation: d;
                var delay = ((days_animation - 1) * 3600) / 1000;
                $('.stroke').css({
                    "animation-play-state": "running",
                    "animation": "dash " + delay + "s linear infinite running"
                });
                url_call = api_folder+"terms?n=300&collection=" + collection_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&language=" + language_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param;
            }
            else {
                for (var time = 0; time < timeouts.length; time++) {
                    timeouts[time].clear();
                }
                timeouts = [];
                $('#animation_wrapper').slideUp(1000);
                $('#animate').show();
                url_call = api_folder+"terms?n=" + top + "&collection=" + collection_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&language=" + language_param + "&relevance=" + relevance_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param;
            }
            $.ajax({
                type: "GET",
                url: url_call,
                dataType: "json",
                success: function (json) {
                    var len = json.length;
                    var $flatTable=$('.flatTable');
                    $flatTable.find('tbody').empty();
                    for (var i = 0; i < len; i++) {
                        var frequency = json[i].count;
                        var token = json[i].field;
                        var typecolor = json[i].type;
                        $flatTable.find('tbody').append('<tr><td>' + token + '<div class="exclude_tag" data-tag="'+token+'"><img src="imgs/x-mark-16-red.png">Exclude</div><div class="remove_tag"><img src="imgs/check-16-green.png"><p>Changes Saved! <span class="refresh_but_tag">Refresh</span> or <span class="undo_but_tag">Undo?</span></p></div><div class="confirm_remove_tag"><img src="imgs/attention-16-red.png"><p>Entity is included in input! <span class="confirm_exclude_tag_but">Exclude</span> or <span class="confirm_undo_tag_but">Undo?</span></p></div></td><td>' + (typecolor).toUpperCase() + '</td><td>' + frequency + '</td></tr>')
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

                        dataent.push({
                            "token": token,
                            "id": id,
                            "frequency": frequency,
                            "appearance": appearance,
                            "typecolor": typecolor
                        });
                    }
                    if (len === 0) {
                        d3.select('#tags_all')
                            .append('text')
                            .attr('class', 'nvd3 nv-noData')
                            .attr('dy', '-.7em')
                            .attr('x', ($('#tags').width() / 2) - 80)
                            .attr('y', 240)
                            .text("No Data Available");
                    }
                },
                async: false
            });
            var $tags = $('#tags');
            this.data = dataent;
            this.width = $tags.width();
            this.height = $tags.height() - 240;
            this.tooltip = CustomTooltip("gates_tooltip", 'auto');

            this.center = {
                x: this.width / 2,
                y: this.height / 2
            };

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
            this.appearance_animation_centers = {
                "OFTEN": {
                    x: 340,
                    y: this.height / 2
                },
                "OCCASIONALLY": {
                    x: this.width / 2,
                    y: this.height / 2
                },
                "SELDOM": {
                    x: this.width - 340,
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
            if (source === "animation") {
                max_amount = max_amount / days_animation;
            }
            this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 65]);
            this.create_nodes();
            this.create_vis();
            this.type_centers = {
                "person": {
                    x: 310,
                    y: this.height / 2
                },
                "tag": {
                    x: this.width / 2,
                    y: this.height / 2
                },
                "organization": {
                    x: this.width - 310,
                    y: this.height / 2
                }
            };
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
            //return this.nodes.sort(function (a, b) {
            //  return a.id - b.id;
            //});
        };

        BubbleChart.prototype.create_vis = function () {
            var that;
            this.vis = d3.select("#tags_all").attr("width", this.width).attr("height", this.height);
            this.circles = this.vis.selectAll("circle").data(this.nodes, function (d) {
                return d.id;
            });
            that = this;
            this.circles.enter().append("g").attr('style', 'cursor:pointer').append("circle").attr("r", 0).attr("fill", (function (_this) {
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
            }).on("click", function (d, i) {
                return that.show_click(d, i, this);
            }).on("mouseout", function (d, i) {
                return that.hide_details(d, i, this);
            });

            this.circles.append("text").attr("text-anchor", "middle").attr("fill", "#0C0C0C").attr("font-weight", "bold").attr("font-size", function (d) {
                return (d.radius) / 2.2;
            })
                .text(function (d) {
                    return d.token;
                }).on("mouseover", function (d, i) {
                    return that.show_details(d, i, this);
                }).on("click", function (d, i) {
                    return that.show_click(d, i, this);
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
            $('#load6').hide();
            $('#tags').animate({opacity: 1}, 400);
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

        BubbleChart.prototype.display_by_type = function () {
            this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function (_this) {
                return function (e) {
                    return _this.circles.each(_this.move_towards_type(e.alpha)).attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                };
            })(this));
            this.force.start();
            this.hide_labels();
            $('#load6').hide();
            $('#tags').animate({opacity: 1}, 400);
            return this.display_labels_type();
        };

        BubbleChart.prototype.move_towards_type = function (alpha) {
            return (function (_this) {
                return function (d) {
                    var target;
                    target = _this.type_centers[d.typecolor];
                    d.x = d.x + (target.x - d.x) * (_this.damper - 0.02) * alpha * 1.1;
                    return d.y = d.y + (target.y - d.y) * (_this.damper - 0.02) * alpha * 1.1;
                };
            })(this);
        };

        BubbleChart.prototype.display_by_animation_appearance = function () {
            var $range = $("#range");
            var gap = Math.ceil(($range.data().ionRangeSlider.result.to - $range.data().ionRangeSlider.result.from) / days_animation);
            var start = $range.data().ionRangeSlider.result.from + (gap * animation_count);
            var end = start + gap;
            $("#range_animate").data("ionRangeSlider").update({
                from: start,
                to: end
            });
            end = end * 1000;
            start = start * 1000;
            var nodes = this.nodes;
            $.ajax({
                type: "GET",
                url: api_folder+"terms?n=" + top + "&collection=" + collection_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&language=" + language_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + start + "&until=" + end,
                dataType: "json",
                success: function (json) {
                    var len = json.length;
                    $('.flatTable tbody').empty();
                    for (var l = 0; l < nodes.length; l++) {
                        nodes[l].frequency = 0;
                        nodes[l].radius = 0;
                    }
                    for (var i = 0; i < len; i++) {
                        var frequency = json[i].count;
                        var token = json[i].field;
                        $('.flatTable tbody').append('<tr><td>' + token + '</td><td>' + (json[i].type).toUpperCase() + '</td><td>' + frequency + '</td></tr>')
                        var pos = nodes.map(function (e) {
                            return e.token;
                        }).indexOf(token);

                        if (pos !== -1) {

                            if (between(i, 0, Math.round(len / 10))) {
                                nodes[pos].appearance = "OFTEN";
                            }
                            if (between(i, Math.round(len / 10) + 1, Math.round(len / 2))) {
                                nodes[pos].appearance = "OCCASIONALLY";
                            }
                            if (between(i, Math.round(len / 2) + 1, len + 10)) {
                                nodes[pos].appearance = "SELDOM";
                            }
                            nodes[pos].radius = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 65])(frequency);
                            nodes[pos].frequency = frequency;
                            nodes[pos].id = i + 1;
                        }
                    }
                },
                async: false
            });
            this.circles.select("text").attr("font-size", function (d) {
                if (d.radius <= 2) {
                    d.radius = 0;
                }
                return (d.radius) / 2.2;
            });
            this.circles.select('circle').transition().duration(1000).attr("r", function (d) {
                if (d.radius <= 2) {
                    d.radius = 0;
                }
                return d.radius;
            });
            this.force.gravity(-0.04).charge(this.charge).friction(0.6).on("tick", (function (_this) {
                return function (e) {
                    return _this.circles.each(_this.move_towards_animation_appearance(e.alpha)).attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                };
            })(this));

            $this_force = this;
            this.force.start();
            if (animation_count === 0) {
                this.hide_labels();
                $('#load6,#animate').hide();
                $('#tags').animate({opacity: 1}, 400);
                $('#animation_wrapper').slideDown(1000);
            }
            if (animation_count === days_animation - 1) {
                $('#animation_wrapper').slideUp(1000);
                $('#animate').show();
            }
            animation_count++;
            return this.display_labels_appearance();
        };

        BubbleChart.prototype.move_towards_animation_appearance = function (alpha) {
            return (function (_this) {
                return function (d) {
                    var target;
                    target = _this.appearance_animation_centers[d.appearance];
                    d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
                    return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
                };
            })(this);
        };

        BubbleChart.prototype.display_by_animation_type = function () {
            var $range = $("#range");
            var gap = Math.ceil(($range.data().ionRangeSlider.result.to - $range.data().ionRangeSlider.result.from) / days_animation);
            var start = $range.data().ionRangeSlider.result.from + (gap * animation_count);
            var end = start + gap;
            $("#range_animate").data("ionRangeSlider").update({
                from: start,
                to: end
            });
            end = end * 1000;
            start = start * 1000;
            var nodes = this.nodes;
            $.ajax({
                type: "GET",
                url: api_folder+"terms?n=" + top + "&collection=" + collection_param + "&user=" + user_query_param + "&q=" + keyword_query_param + "&relevance=" + relevance_param + "&language=" + language_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + start + "&until=" + end,
                dataType: "json",
                success: function (json) {
                    $('.flatTable tbody').empty();
                    var len = json.length;
                    for (var l = 0; l < nodes.length; l++) {
                        nodes[l].frequency = 0;
                        nodes[l].radius = 0;
                    }
                    for (var i = 0; i < len; i++) {
                        var frequency = json[i].count;
                        var token = json[i].field;
                        $('.flatTable tbody').append('<tr><td>' + token + '</td><td>' + (json[i].type).toUpperCase() + '</td><td>' + frequency + '</td></tr>')
                        var pos = nodes.map(function (e) {
                            return e.token;
                        }).indexOf(token);

                        if (pos !== -1) {

                            if (between(i, 0, Math.round(len / 10))) {
                                nodes[pos].appearance = "OFTEN";
                            }
                            if (between(i, Math.round(len / 10) + 1, Math.round(len / 2))) {
                                nodes[pos].appearance = "OCCASIONALLY";
                            }
                            if (between(i, Math.round(len / 2) + 1, len + 10)) {
                                nodes[pos].appearance = "SELDOM";
                            }
                            nodes[pos].radius = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 65])(frequency);
                            nodes[pos].frequency = frequency;
                            nodes[pos].id = i + 1;
                        }
                    }
                },
                async: false
            });
            this.circles.select("text").attr("font-size", function (d) {
                if (d.radius <= 2) {
                    d.radius = 0;
                }
                return (d.radius) / 2.2;
            });
            this.circles.select('circle').transition().duration(1000).attr("r", function (d) {
                if (d.radius <= 2) {
                    d.radius = 0;
                }
                return d.radius;
            });
            this.force.gravity(-0.03).charge(this.charge).friction(0.9).on("tick", (function (_this) {
                return function (e) {
                    return _this.circles.each(_this.move_towards_animation_type(e.alpha)).attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                };
            })(this));
            this.force.start();
            if (animation_count === 0) {
                this.hide_labels();
                $('#load6,#animate').hide();
                $('#tags').animate({opacity: 1}, 400);
                $('#animation_wrapper').slideDown(1000);
            }
            if (animation_count === days_animation - 1) {
                $('#animation_wrapper').slideUp(1000);
                $('#animate').show();
            }

            animation_count++;
            return this.display_labels_type();
        };

        BubbleChart.prototype.move_towards_animation_type = function (alpha) {
            return (function (_this) {
                return function (d) {
                    var target;
                    target = _this.type_centers[d.typecolor];
                    d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
                    return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
                };
            })(this);
        };

        BubbleChart.prototype.display_labels_appearance = function () {
            var years, years_data, years_x;
            years_data = ["OFTEN", "OCCASIONALLY", "SELDOM"];
            years_x = [150, (this.width / 2), this.width - 150];
            years = this.vis.selectAll(".appearance").data(years_data);
            return years.enter().append("text").attr("class", "appearance").attr("x", (function (_this) {
                return function (d) {
                    return years_x[years_data.indexOf(d)];//years_x[d];
                };
            })(this)).attr("y", 40).attr("text-anchor", "middle").text(function (d) {
                return d;
            });
        };

        BubbleChart.prototype.hide_labels = function () {
            return this.vis.selectAll(".appearance").remove();
        };

        BubbleChart.prototype.display_labels_type = function () {
            var years, years_data, years_x;
            years_data = ["PERSON", "TAG", "ORGANIZATION"];
            years_x = [150, (this.width / 2), this.width - 150];
            years = this.vis.selectAll(".appearance").data(years_data);
            return years.enter().append("text").attr("class", "appearance").attr("x", (function (_this) {
                return function (d) {
                    return years_x[years_data.indexOf(d)];
                };
            })(this)).attr("y", 40).attr("text-anchor", "middle").text(function (d) {
                return d;
            });
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

        BubbleChart.prototype.show_click = function (data) {
            $('#query').val(data.token);
            parse_search();
        };

        return BubbleChart;

    })();

    root = typeof exports !== "undefined" && exports !== null ? exports : this;

    $(function () {
        var chart, render_vis;
        var view = $('.activesort').find('.sortzone').attr('id');
        chart = null;
        if (source === "animation") {
            if (view === "type") {
                render_vis = function () {
                    chart = new BubbleChart();
                    chart.start();
                    return root.display_animation_type();
                };
            }
            else {
                render_vis = function () {
                    chart = new BubbleChart();
                    chart.start();
                    return root.display_animation_appearance();
                };
            }
        }
        else {
            if (view === "type") {
                render_vis = function () {
                    chart = new BubbleChart();
                    chart.start();
                    return root.display_type();
                };
            }
            else {
                render_vis = function () {
                    chart = new BubbleChart();
                    chart.start();
                    return root.display_appearance();
                };
            }
        }

        root.display_appearance = (function (_this) {
            return function () {
                return chart.display_by_appearance();
            };
        })(this);
        root.display_type = (function (_this) {
            return function () {
                return chart.display_by_type();
            };
        })(this);
        root.display_animation_appearance = (function (_this) {
            return function () {
                return chart.display_by_animation_appearance();
            };
        })(this);
        root.display_animation_type = (function (_this) {
            return function () {
                return chart.display_by_animation_type();
            };
        })(this);
        root.toggle_view = (function (_this) {
            return function (view_type) {
                if (view_type === 'appearance') {
                    return root.display_appearance();
                }
                if (view_type === 'type') {
                    return root.display_type();
                }
            };
        })(this);
        return d3.csv("", render_vis);
    });
}

function CustomTooltip(tooltipId, width) {
    $("body").append("<div class='tooltip' id='" + tooltipId + "'></div>");

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

$('#animate').click(function () {
    var $range = $("#range");
    var gap = Math.ceil(($range.data().ionRangeSlider.result.to - $range.data().ionRangeSlider.result.from));
    days_animation = Math.floor(gap / 86400);
    if (days_animation < 3) {
        $('#myModal h1').html("Not Enough Data!");
        $('#myModal p').html("Time window must exceed 3 days.");
        $('#myModal').reveal();
    }
    else {
        $("#load6").show();
        $('#tags').animate({opacity: 0.4}, 400);
        draw_hashtags("animation");
        var view = $('.activesort').find('.sortzone').attr('id');
        if (view === "type") {
            for (var b = 1; b < days_animation; b++) {
                timeouts.push(new Timer(function () {
                    display_animation_type();
                }, 3500 * b));
            }
        }
        else {
            for (var i = 1; i < days_animation; i++) {
                timeouts.push(new Timer(function () {
                    display_animation_appearance();
                }, 3500 * i));
            }
        }
    }
});

function Timer(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function () {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    this.resume = function () {
        if (remaining > 0) {
            start = new Date();
            window.clearTimeout(timerId);
            timerId = window.setTimeout(callback, remaining);
        }
    };

    this.clear = function () {
        window.clearTimeout(timerId);
    };

    this.resume();
}

$('.animation_icon').click(function () {
    var $stroke = $('.stroke');
    var time;
    if (($stroke.css('animation-play-state') == "paused") || ($stroke.css('animation-play-state') == "")) {
        play.classList.add('hidden');
        pause.classList.remove('hidden');
        $stroke.css('animation-play-state', 'running');
        $this_force.force.start();
        for (time = 0; time < timeouts.length; time++) {
            timeouts[time].resume();
        }
    } else if ($stroke.css('animation-play-state') == "running") {
        pause.classList.add('hidden');
        play.classList.remove('hidden');
        $stroke.css('animation-play-state', 'paused');
        $this_force.force.stop();
        for (time = 0; time < timeouts.length; time++) {
            timeouts[time].pause();
        }
    }
    //console.log(animationDiv.style.webkitAnimationPlayState);
});
