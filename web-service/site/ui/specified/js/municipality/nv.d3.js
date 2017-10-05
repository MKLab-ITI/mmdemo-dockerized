/* nvd3 version 1.8.1 (https://github.com/novus/nvd3) 2015-04-03 */
(function () {

// set up main nv object
    var nv = {};

// the major global objects under the nv namespace
    nv.dev = false; //set false when in production
    nv.tooltip = nv.tooltip || {}; // For the tooltip system
    nv.utils = nv.utils || {}; // Utility subsystem
    nv.models = nv.models || {}; //stores all the possible models/components
    nv.charts = {}; //stores all the ready to use charts
    nv.logs = {}; //stores some statistics and potential error messages
    nv.dom = {}; //DOM manipulation functions

    nv.dispatch = d3.dispatch('render_start', 'render_end');

// Function bind polyfill
// Needed ONLY for phantomJS as it's missing until version 2.0 which is unreleased as of this comment
// https://github.com/ariya/phantomjs/issues/10522
// http://kangax.github.io/compat-table/es5/#Function.prototype.bind
// phantomJS is used for running the test suite
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis
                            ? this
                            : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }

//  Development render timers - disabled if dev = false
    if (nv.dev) {
        nv.dispatch.on('render_start', function (e) {
            nv.logs.startTime = +new Date();
        });

        nv.dispatch.on('render_end', function (e) {
            nv.logs.endTime = +new Date();
            nv.logs.totalTime = nv.logs.endTime - nv.logs.startTime;
            nv.log('total', nv.logs.totalTime); // used for development, to keep track of graph generation times
        });
    }

// Logs all arguments, and returns the last so you can test things in place
// Note: in IE8 console.log is an object not a function, and if modernizr is used
// then calling Function.prototype.bind with with anything other than a function
// causes a TypeError to be thrown.
    nv.log = function () {
        if (nv.dev && window.console && console.log && console.log.apply)
            console.log.apply(console, arguments);
        else if (nv.dev && window.console && typeof console.log == "function" && Function.prototype.bind) {
            var log = Function.prototype.bind.call(console.log, console);
            log.apply(console, arguments);
        }
        return arguments[arguments.length - 1];
    };

// print console warning, should be used by deprecated functions
    nv.deprecated = function (name, info) {
        if (console && console.warn) {
            console.warn('nvd3 warning: `' + name + '` has been deprecated. ', info || '');
        }
    };

// The nv.render function is used to queue up chart rendering
// in non-blocking async functions.
// When all queued charts are done rendering, nv.dispatch.render_end is invoked.
    nv.render = function render(step) {
        // number of graphs to generate in each timeout loop
        step = step || 1;

        nv.render.active = true;
        nv.dispatch.render_start();

        var renderLoop = function () {
            var chart, graph;

            for (var i = 0; i < step && (graph = nv.render.queue[i]); i++) {
                chart = graph.generate();
                if (typeof graph.callback == typeof(Function)) graph.callback(chart);
            }

            nv.render.queue.splice(0, i);

            if (nv.render.queue.length) {
                setTimeout(renderLoop);
            }
            else {
                nv.dispatch.render_end();
                nv.render.active = false;
            }
        };

        setTimeout(renderLoop);
    };

    nv.render.active = false;
    nv.render.queue = [];

    /*
     Adds a chart to the async rendering queue. This method can take arguments in two forms:
     nv.addGraph({
     generate: <Function>
     callback: <Function>
     })

     or

     nv.addGraph(<generate Function>, <callback Function>)

     The generate function should contain code that creates the NVD3 model, sets options
     on it, adds data to an SVG element, and invokes the chart model. The generate function
     should return the chart model.  See examples/lineChart.html for a usage example.

     The callback function is optional, and it is called when the generate function completes.
     */
    nv.addGraph = function (obj) {
        if (typeof arguments[0] === typeof(Function)) {
            obj = {generate: arguments[0], callback: arguments[1]};
        }

        nv.render.queue.push(obj);

        if (!nv.render.active) {
            nv.render();
        }
    };

// Node/CommonJS exports
    if (typeof(module) !== 'undefined' && typeof(exports) !== 'undefined') {
        module.exports = nv;
    }

    if (typeof(window) !== 'undefined') {
        window.nv = nv;
    }
    /* Facade for queueing DOM write operations
     * with Fastdom (https://github.com/wilsonpage/fastdom)
     * if available.
     * This could easily be extended to support alternate
     * implementations in the future.
     */
    nv.dom.write = function (callback) {
        if (window.fastdom !== undefined) {
            return fastdom.write(callback);
        }
        return callback();
    };

    /* Facade for queueing DOM read operations
     * with Fastdom (https://github.com/wilsonpage/fastdom)
     * if available.
     * This could easily be extended to support alternate
     * implementations in the future.
     */
    nv.dom.read = function (callback) {
        if (window.fastdom !== undefined) {
            return fastdom.read(callback);
        }
        return callback();
    };
    /* Utility class to handle creation of an interactive layer.
     This places a rectangle on top of the chart. When you mouse move over it, it sends a dispatch
     containing the X-coordinate. It can also render a vertical line where the mouse is located.

     dispatch.elementMousemove is the important event to latch onto.  It is fired whenever the mouse moves over
     the rectangle. The dispatch is given one object which contains the mouseX/Y location.
     It also has 'pointXValue', which is the conversion of mouseX to the x-axis scale.
     */
    nv.interactiveGuideline = function () {
        "use strict";

        var tooltip = nv.models.tooltip();
        tooltip.duration(0).hideDelay(0)._isInteractiveLayer(true).hidden(false);

        //Public settings
        var width = null;
        var height = null;

        //Please pass in the bounding chart's top and left margins
        //This is important for calculating the correct mouseX/Y positions.
        var margin = {left: 0, top: 0}
            , xScale = d3.scale.linear()
            , dispatch = d3.dispatch('elementMousemove', 'elementMouseout', 'elementClick', 'elementDblclick')
            , showGuideLine = true;
        //Must pass in the bounding chart's <svg> container.
        //The mousemove event is attached to this container.
        var svgContainer = null;

        // check if IE by looking for activeX
        var isMSIE = "ActiveXObject" in window;


        function layer(selection) {
            selection.each(function (data) {
                var container = d3.select(this);
                var availableWidth = (width || 960), availableHeight = (height || 400);
                var wrap = container.selectAll("g.nv-wrap.nv-interactiveLineLayer")
                    .data([data]);
                var wrapEnter = wrap.enter()
                    .append("g").attr("class", " nv-wrap nv-interactiveLineLayer");
                wrapEnter.append("g").attr("class", "nv-interactiveGuideLine");

                if (!svgContainer) {
                    return;
                }

                function mouseHandler() {
                    var d3mouse = d3.mouse(this);
                    var mouseX = d3mouse[0];
                    var mouseY = d3mouse[1];
                    var subtractMargin = true;
                    var mouseOutAnyReason = false;
                    if (isMSIE) {
                        /*
                         D3.js (or maybe SVG.getScreenCTM) has a nasty bug in Internet Explorer 10.
                         d3.mouse() returns incorrect X,Y mouse coordinates when mouse moving
                         over a rect in IE 10.
                         However, d3.event.offsetX/Y also returns the mouse coordinates
                         relative to the triggering <rect>. So we use offsetX/Y on IE.
                         */
                        mouseX = d3.event.offsetX;
                        mouseY = d3.event.offsetY;

                        /*
                         On IE, if you attach a mouse event listener to the <svg> container,
                         it will actually trigger it for all the child elements (like <path>, <circle>, etc).
                         When this happens on IE, the offsetX/Y is set to where ever the child element
                         is located.
                         As a result, we do NOT need to subtract margins to figure out the mouse X/Y
                         position under this scenario. Removing the line below *will* cause
                         the interactive layer to not work right on IE.
                         */
                        if (d3.event.target.tagName !== "svg") {
                            subtractMargin = false;
                        }

                        if (d3.event.target.className.baseVal.match("nv-legend")) {
                            mouseOutAnyReason = true;
                        }

                    }

                    if (subtractMargin) {
                        mouseX -= margin.left;
                        mouseY -= margin.top;
                    }

                    /* If mouseX/Y is outside of the chart's bounds,
                     trigger a mouseOut event.
                     */
                    if (mouseX < 0 || mouseY < 0
                        || mouseX > availableWidth || mouseY > availableHeight
                        || (d3.event.relatedTarget && d3.event.relatedTarget.ownerSVGElement === undefined)
                        || mouseOutAnyReason
                    ) {

                        if (isMSIE) {
                            if (d3.event.relatedTarget
                                && d3.event.relatedTarget.ownerSVGElement === undefined
                                && (d3.event.relatedTarget.className === undefined
                                || d3.event.relatedTarget.className.match(tooltip.nvPointerEventsClass))) {

                                return;
                            }
                        }
                        dispatch.elementMouseout({
                            mouseX: mouseX,
                            mouseY: mouseY
                        });
                        layer.renderGuideLine(null); //hide the guideline
                        tooltip.hidden(true);
                        return;
                    } else {
                        tooltip.hidden(false);
                    }

                    var pointXValue = xScale.invert(mouseX);
                    dispatch.elementMousemove({
                        mouseX: mouseX,
                        mouseY: mouseY,
                        pointXValue: pointXValue
                    });

                    //If user double clicks the layer, fire a elementDblclick
                    if (d3.event.type === "dblclick") {
                        dispatch.elementDblclick({
                            mouseX: mouseX,
                            mouseY: mouseY,
                            pointXValue: pointXValue
                        });
                    }

                    // if user single clicks the layer, fire elementClick
                    if (d3.event.type === 'click') {
                        dispatch.elementClick({
                            mouseX: mouseX,
                            mouseY: mouseY,
                            pointXValue: pointXValue
                        });
                    }
                }

                svgContainer
                    .on("touchmove", mouseHandler)
                    .on("mousemove", mouseHandler, true)
                    .on("mouseout", mouseHandler, true)
                    .on("dblclick", mouseHandler)
                    .on("click", mouseHandler)
                ;

                layer.guideLine = null;
                //Draws a vertical guideline at the given X postion.
                layer.renderGuideLine = function (x) {
                    if (!showGuideLine) return;
                    if (layer.guideLine && layer.guideLine.attr("x1") === x) return;
                    nv.dom.write(function () {
                        var line = wrap.select(".nv-interactiveGuideLine")
                            .selectAll("line")
                            .data((x != null) ? [nv.utils.NaNtoZero(x)] : [], String);
                        line.enter()
                            .append("line")
                            .attr("class", "nv-guideline")
                            .attr("x1", function (d) {
                                return d;
                            })
                            .attr("x2", function (d) {
                                return d;
                            })
                            .attr("y1", availableHeight)
                            .attr("y2", 0);
                        line.exit().remove();
                    });
                }
            });
        }

        layer.dispatch = dispatch;
        layer.tooltip = tooltip;

        layer.margin = function (_) {
            if (!arguments.length) return margin;
            margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
            margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
            return layer;
        };

        layer.width = function (_) {
            if (!arguments.length) return width;
            width = _;
            return layer;
        };

        layer.height = function (_) {
            if (!arguments.length) return height;
            height = _;
            return layer;
        };

        layer.xScale = function (_) {
            if (!arguments.length) return xScale;
            xScale = _;
            return layer;
        };

        layer.showGuideLine = function (_) {
            if (!arguments.length) return showGuideLine;
            showGuideLine = _;
            return layer;
        };

        layer.svgContainer = function (_) {
            if (!arguments.length) return svgContainer;
            svgContainer = _;
            return layer;
        };

        return layer;
    };

    /* Utility class that uses d3.bisect to find the index in a given array, where a search value can be inserted.
     This is different from normal bisectLeft; this function finds the nearest index to insert the search value.

     For instance, lets say your array is [1,2,3,5,10,30], and you search for 28.
     Normal d3.bisectLeft will return 4, because 28 is inserted after the number 10.  But interactiveBisect will return 5
     because 28 is closer to 30 than 10.

     Unit tests can be found in: interactiveBisectTest.html

     Has the following known issues:
     * Will not work if the data points move backwards (ie, 10,9,8,7, etc) or if the data points are in random order.
     * Won't work if there are duplicate x coordinate values.
     */
    nv.interactiveBisect = function (values, searchVal, xAccessor) {
        "use strict";
        if (!(values instanceof Array)) {
            return null;
        }
        var _xAccessor;
        if (typeof xAccessor !== 'function') {
            _xAccessor = function (d) {
                return d.x;
            }
        } else {
            _xAccessor = xAccessor;
        }
        var _cmp = function (d, v) {
            // Accessors are no longer passed the index of the element along with
            // the element itself when invoked by d3.bisector.
            //
            // Starting at D3 v3.4.4, d3.bisector() started inspecting the
            // function passed to determine if it should consider it an accessor
            // or a comparator. This meant that accessors that take two arguments
            // (expecting an index as the second parameter) are treated as
            // comparators where the second argument is the search value against
            // which the first argument is compared.
            return _xAccessor(d) - v;
        };

        var bisect = d3.bisector(_cmp).left;
        var index = d3.max([0, bisect(values, searchVal) - 1]);
        var currentValue = _xAccessor(values[index]);

        if (typeof currentValue === 'undefined') {
            currentValue = index;
        }

        if (currentValue === searchVal) {
            return index; //found exact match
        }

        var nextIndex = d3.min([index + 1, values.length - 1]);
        var nextValue = _xAccessor(values[nextIndex]);

        if (typeof nextValue === 'undefined') {
            nextValue = nextIndex;
        }

        if (Math.abs(nextValue - searchVal) >= Math.abs(currentValue - searchVal)) {
            return index;
        } else {
            return nextIndex
        }
    };

    /*
     Returns the index in the array "values" that is closest to searchVal.
     Only returns an index if searchVal is within some "threshold".
     Otherwise, returns null.
     */
    nv.nearestValueIndex = function (values, searchVal, threshold) {
        "use strict";
        var yDistMax = Infinity, indexToHighlight = null;
        values.forEach(function (d, i) {
            var delta = Math.abs(searchVal - d);
            if (delta <= yDistMax && delta < threshold) {
                yDistMax = delta;
                indexToHighlight = i;
            }
        });
        return indexToHighlight;
    };
    /* Tooltip rendering model for nvd3 charts.
     window.nv.models.tooltip is the updated,new way to render tooltips.

     window.nv.tooltip.show is the old tooltip code.
     window.nv.tooltip.* also has various helper methods.
     */
    (function () {
        "use strict";

        /* Model which can be instantiated to handle tooltip rendering.
         Example usage:
         var tip = nv.models.tooltip().gravity('w').distance(23)
         .data(myDataObject);

         tip();    //just invoke the returned function to render tooltip.
         */
        nv.models.tooltip = function () {

            /*
             Tooltip data. If data is given in the proper format, a consistent tooltip is generated.
             Example Format of data:
             {
             key: "Date",
             value: "August 2009",
             series: [
             {key: "Series 1", value: "Value 1", color: "#000"},
             {key: "Series 2", value: "Value 2", color: "#00f"}
             ]
             }
             */
            var data = null;
            var gravity = 'w'   //Can be 'n','s','e','w'. Determines how tooltip is positioned.
                , distance = 25   //Distance to offset tooltip from the mouse location.
                , snapDistance = 0   //Tolerance allowed before tooltip is moved from its current position (creates 'snapping' effect)
                , fixedTop = null //If not null, this fixes the top position of the tooltip.
                , classes = null  //Attaches additional CSS classes to the tooltip DIV that is created.
                , chartContainer = null   //Parent dom element of the SVG that holds the chart.
                , hidden = true  // start off hidden, toggle with hide/show functions below
                , hideDelay = 400  // delay before the tooltip hides after calling hide()
                , tooltip = null // d3 select of tooltipElem below
                , tooltipElem = null  //actual DOM element representing the tooltip.
                , position = {left: null, top: null}   //Relative position of the tooltip inside chartContainer.
                , offset = {left: 0, top: 0}   //Offset of tooltip against the pointer
                , enabled = true  //True -> tooltips are rendered. False -> don't render tooltips.
                , duration = 100 // duration for tooltip movement
                , headerEnabled = true
                ;

            // set to true by interactive layer to adjust tooltip positions
            // eventually we should probably fix interactive layer to get the position better.
            // for now this is needed if you want to set chartContainer for normal tooltips, else it "fixes" it to broken
            var isInteractiveLayer = false;

            //Generates a unique id when you create a new tooltip() object
            var id = "nvtooltip-" + Math.floor(Math.random() * 100000);

            //CSS class to specify whether element should not have mouse events.
            var nvPointerEventsClass = "nv-pointer-events-none";

            //Format function for the tooltip values column
            var valueFormatter = function (d, i) {
                return d;
            };

            //Format function for the tooltip header value.
            var headerFormatter = function (d) {
                return d;
            };

            var keyFormatter = function (d, i) {
                return d;
            };

            //By default, the tooltip model renders a beautiful table inside a DIV.
            //You can override this function if a custom tooltip is desired.
            var contentGenerator = function (d) {
                if (d === null) {
                    return '';
                }

                var table = d3.select(document.createElement("table"));
                if (headerEnabled) {
                    var theadEnter = table.selectAll("thead")
                        .data([d])
                        .enter().append("thead");

                    theadEnter.append("tr")
                        .append("td")
                        .attr("colspan", 3)
                        .append("strong")
                        .classed("x-value", true)
                        .html(headerFormatter(d.value));
                }

                var tbodyEnter = table.selectAll("tbody")
                    .data([d])
                    .enter().append("tbody");

                var trowEnter = tbodyEnter.selectAll("tr")
                    .data(function (p) {
                        return p.series
                    })
                    .enter()
                    .append("tr")
                    .classed("highlight", function (p) {
                        return p.highlight
                    });

                trowEnter.append("td")
                    .classed("legend-color-guide", true)
                    .append("div")
                    .style("background-color", function (p) {
                        return p.color
                    });

                trowEnter.append("td")
                    .classed("key", true)
                    .html(function (p, i) {
                        return keyFormatter(p.key, i)
                    });

                trowEnter.append("td")
                    .classed("value", true)
                    .html(function (p, i) {
                        return p.value
                    });//.html(function(p, i) { return nFormatter(p.value) });


                trowEnter.selectAll("td").each(function (p) {
                    if (p.highlight) {
                        var opacityScale = d3.scale.linear().domain([0, 1]).range(["#fff", p.color]);
                        var opacity = 0.6;
                        d3.select(this)
                            .style("border-bottom-color", opacityScale(opacity))
                            .style("border-top-color", opacityScale(opacity))
                        ;
                    }
                });

                var html = table.node().outerHTML;
                if (d.footer !== undefined)
                    html += "<div class='footer'>" + d.footer + "</div>";
                return html;

            };

            var dataSeriesExists = function (d) {
                if (d && d.series) {
                    if (d.series instanceof Array) {
                        return !!d.series.length;
                    }
                    // if object, it's okay just convert to array of the object
                    if (d.series instanceof Object) {
                        d.series = [d.series];
                        return true;
                    }
                }
                return false;
            };

            var calcTooltipPosition = function (pos) {
                if (!tooltipElem) return;

                nv.dom.read(function () {
                    var height = parseInt(tooltipElem.offsetHeight, 10),
                        width = parseInt(tooltipElem.offsetWidth, 10),
                        windowWidth = nv.utils.windowSize().width,
                        windowHeight = nv.utils.windowSize().height,
                        scrollTop = window.pageYOffset,
                        scrollLeft = window.pageXOffset,
                        left, top;

                    windowHeight = window.innerWidth >= document.body.scrollWidth ? windowHeight : windowHeight - 16;
                    windowWidth = window.innerHeight >= document.body.scrollHeight ? windowWidth : windowWidth - 16;


                    //Helper functions to find the total offsets of a given DOM element.
                    //Looks up the entire ancestry of an element, up to the first relatively positioned element.
                    var tooltipTop = function (Elem) {
                        var offsetTop = top;
                        do {
                            if (!isNaN(Elem.offsetTop)) {
                                offsetTop += (Elem.offsetTop);
                            }
                            Elem = Elem.offsetParent;
                        } while (Elem);
                        return offsetTop;
                    };
                    var tooltipLeft = function (Elem) {
                        var offsetLeft = left;
                        do {
                            if (!isNaN(Elem.offsetLeft)) {
                                offsetLeft += (Elem.offsetLeft);
                            }
                            Elem = Elem.offsetParent;
                        } while (Elem);
                        return offsetLeft;
                    };

                    // calculate position based on gravity
                    var tLeft, tTop;
                    switch (gravity) {
                        case 'e':
                            left = pos[0] - width - distance;
                            top = pos[1] - (height / 2);
                            tLeft = tooltipLeft(tooltipElem);
                            tTop = tooltipTop(tooltipElem);
                            if (tLeft < scrollLeft) left = pos[0] + distance > scrollLeft ? pos[0] + distance : scrollLeft - tLeft + left;
                            if (tTop < scrollTop) top = scrollTop - tTop + top;
                            if (tTop + height > scrollTop + windowHeight) top = scrollTop + windowHeight - tTop + top - height;
                            break;
                        case 'w':
                            left = pos[0] + distance;
                            top = pos[1] - (height / 2);
                            tLeft = tooltipLeft(tooltipElem);
                            tTop = tooltipTop(tooltipElem);
                            if (tLeft + width > windowWidth) left = pos[0] - width - distance;
                            if (tTop < scrollTop) top = scrollTop + 5;
                            if (tTop + height > scrollTop + windowHeight) top = scrollTop + windowHeight - tTop + top - height;
                            break;
                        case 'n':
                            left = pos[0] - (width / 2) - 5;
                            top = pos[1] + distance;
                            tLeft = tooltipLeft(tooltipElem);
                            tTop = tooltipTop(tooltipElem);
                            if (tLeft < scrollLeft) left = scrollLeft + 5;
                            if (tLeft + width > windowWidth) left = left - width / 2 + 5;
                            if (tTop + height > scrollTop + windowHeight) top = scrollTop + windowHeight - tTop + top - height;
                            break;
                        case 's':
                            left = pos[0] - (width / 2);
                            top = pos[1] - height - distance;
                            tLeft = tooltipLeft(tooltipElem);
                            tTop = tooltipTop(tooltipElem);
                            if (tLeft < scrollLeft) left = scrollLeft + 5;
                            if (tLeft + width > windowWidth) left = left - width / 2 + 5;
                            if (scrollTop > tTop) top = scrollTop;
                            break;
                        case 'none':
                            left = pos[0];
                            top = pos[1] - distance;
                            tLeft = tooltipLeft(tooltipElem);
                            tTop = tooltipTop(tooltipElem);
                            break;
                    }

                    // adjust tooltip offsets
                    left -= offset.left;
                    top -= offset.top;

                    // using tooltip.style('transform') returns values un-usable for tween
                    var box = tooltipElem.getBoundingClientRect();
                    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                    var old_translate = 'translate(' + (box.left + scrollLeft) + 'px, ' + (box.top + scrollTop) + 'px)';
                    var new_translate = 'translate(' + left + 'px, ' + top + 'px)';
                    var translateInterpolator = d3.interpolateString(old_translate, new_translate);

                    var is_hidden = tooltip.style('opacity') < 0.1;

                    // delay hiding a bit to avoid flickering
                    if (hidden) {
                        tooltip
                            .transition()
                            .delay(hideDelay)
                            .duration(0)
                            .style('opacity', 0);
                    } else {
                        tooltip
                            .interrupt() // cancel running transitions
                            .transition()
                            .duration(is_hidden ? 0 : duration)
                            // using tween since some versions of d3 can't auto-tween a translate on a div
                            .styleTween('transform', function (d) {
                                return translateInterpolator;
                            }, 'important')
                            // Safari has its own `-webkit-transform` and does not support `transform` 
                            // transform tooltip without transition only in Safari
                            .style('-webkit-transform', new_translate)
                            .style('opacity', 1);
                    }


                });
            };

            //In situations where the chart is in a 'viewBox', re-position the tooltip based on how far chart is zoomed.
            function convertViewBoxRatio() {
                if (chartContainer) {
                    var svg = d3.select(chartContainer);
                    if (svg.node().tagName !== "svg") {
                        svg = svg.select("svg");
                    }
                    var viewBox = (svg.node()) ? svg.attr('viewBox') : null;
                    if (viewBox) {
                        viewBox = viewBox.split(' ');
                        var ratio = parseInt(svg.style('width'), 10) / viewBox[2];

                        position.left = position.left * ratio;
                        position.top = position.top * ratio;
                    }
                }
            }

            //Creates new tooltip container, or uses existing one on DOM.
            function initTooltip() {
                if (!tooltip) {
                    var body;
                    if (chartContainer) {
                        body = chartContainer;
                    } else {
                        body = document.body;
                    }
                    //Create new tooltip div if it doesn't exist on DOM.
                    tooltip = d3.select(body).append("div")
                        .attr("class", "nvtooltip " + (classes ? classes : "xy-tooltip"))
                        .attr("id", id);
                    tooltip.style("top", 0).style("left", 0);
                    tooltip.style('opacity', 0);
                    tooltip.selectAll("div, table, td, tr").classed(nvPointerEventsClass, true);
                    tooltip.classed(nvPointerEventsClass, true);
                    tooltipElem = tooltip.node();
                }
            }

            //Draw the tooltip onto the DOM.
            function nvtooltip() {
                if (!enabled) return;
                if (!dataSeriesExists(data)) return;

                convertViewBoxRatio();

                var left = position.left;
                var top = (fixedTop !== null) ? fixedTop : position.top;

                nv.dom.write(function () {
                    initTooltip();
                    // generate data and set it into tooltip
                    // Bonus - If you override contentGenerator and return falsey you can use something like
                    //         React or Knockout to bind the data for your tooltip
                    var newContent = contentGenerator(data);
                    if (newContent) {
                        tooltipElem.innerHTML = newContent;
                    }

                    if (chartContainer && isInteractiveLayer) {
                        nv.dom.read(function () {
                            var svgComp = chartContainer.getElementsByTagName("svg")[0];
                            var svgOffset = {left: 0, top: 0};
                            if (svgComp) {
                                var svgBound = svgComp.getBoundingClientRect();
                                var chartBound = chartContainer.getBoundingClientRect();
                                var svgBoundTop = svgBound.top;

                                //Defensive code. Sometimes, svgBoundTop can be a really negative
                                //  number, like -134254. That's a bug.
                                //  If such a number is found, use zero instead. FireFox bug only
                                if (svgBoundTop < 0) {
                                    var containerBound = chartContainer.getBoundingClientRect();
                                    svgBoundTop = (Math.abs(svgBoundTop) > containerBound.height) ? 0 : svgBoundTop;
                                }
                                svgOffset.top = Math.abs(svgBoundTop - chartBound.top);
                                svgOffset.left = Math.abs(svgBound.left - chartBound.left);
                            }
                            //If the parent container is an overflow <div> with scrollbars, subtract the scroll offsets.
                            //You need to also add any offset between the <svg> element and its containing <div>
                            //Finally, add any offset of the containing <div> on the whole page.
                            left += chartContainer.offsetLeft + svgOffset.left - 2 * chartContainer.scrollLeft;
                            top += chartContainer.offsetTop + svgOffset.top - 2 * chartContainer.scrollTop;

                            if (snapDistance && snapDistance > 0) {
                                top = Math.floor(top / snapDistance) * snapDistance;
                            }
                            calcTooltipPosition([left, top]);
                        });
                    } else {
                        calcTooltipPosition([left, top]);
                    }
                });

                return nvtooltip;
            }

            nvtooltip.nvPointerEventsClass = nvPointerEventsClass;
            nvtooltip.options = nv.utils.optionsFunc.bind(nvtooltip);

            nvtooltip._options = Object.create({}, {
                // simple read/write options
                duration: {
                    get: function () {
                        return duration;
                    }, set: function (_) {
                        duration = _;
                    }
                },
                gravity: {
                    get: function () {
                        return gravity;
                    }, set: function (_) {
                        gravity = _;
                    }
                },
                distance: {
                    get: function () {
                        return distance;
                    }, set: function (_) {
                        distance = _;
                    }
                },
                snapDistance: {
                    get: function () {
                        return snapDistance;
                    }, set: function (_) {
                        snapDistance = _;
                    }
                },
                classes: {
                    get: function () {
                        return classes;
                    }, set: function (_) {
                        classes = _;
                    }
                },
                chartContainer: {
                    get: function () {
                        return chartContainer;
                    }, set: function (_) {
                        chartContainer = _;
                    }
                },
                fixedTop: {
                    get: function () {
                        return fixedTop;
                    }, set: function (_) {
                        fixedTop = _;
                    }
                },
                enabled: {
                    get: function () {
                        return enabled;
                    }, set: function (_) {
                        enabled = _;
                    }
                },
                hideDelay: {
                    get: function () {
                        return hideDelay;
                    }, set: function (_) {
                        hideDelay = _;
                    }
                },
                contentGenerator: {
                    get: function () {
                        return contentGenerator;
                    }, set: function (_) {
                        contentGenerator = _;
                    }
                },
                valueFormatter: {
                    get: function () {
                        return valueFormatter;
                    }, set: function (_) {
                        valueFormatter = _;
                    }
                },
                headerFormatter: {
                    get: function () {
                        return headerFormatter;
                    }, set: function (_) {
                        headerFormatter = _;
                    }
                },
                keyFormatter: {
                    get: function () {
                        return keyFormatter;
                    }, set: function (_) {
                        keyFormatter = _;
                    }
                },
                headerEnabled: {
                    get: function () {
                        return headerEnabled;
                    }, set: function (_) {
                        headerEnabled = _;
                    }
                },

                // internal use only, set by interactive layer to adjust position.
                _isInteractiveLayer: {
                    get: function () {
                        return isInteractiveLayer;
                    }, set: function (_) {
                        isInteractiveLayer = !!_;
                    }
                },

                // options with extra logic
                position: {
                    get: function () {
                        return position;
                    }, set: function (_) {
                        position.left = _.left !== undefined ? _.left : position.left;
                        position.top = _.top !== undefined ? _.top : position.top;
                    }
                },
                offset: {
                    get: function () {
                        return offset;
                    }, set: function (_) {
                        offset.left = _.left !== undefined ? _.left : offset.left;
                        offset.top = _.top !== undefined ? _.top : offset.top;
                    }
                },
                hidden: {
                    get: function () {
                        return hidden;
                    }, set: function (_) {
                        if (hidden != _) {
                            hidden = !!_;
                            nvtooltip();
                        }
                    }
                },
                data: {
                    get: function () {
                        return data;
                    }, set: function (_) {
                        // if showing a single data point, adjust data format with that
                        if (_.point) {
                            _.value = _.point.x;
                            _.series = _.series || {};
                            _.series.value = _.point.y;
                            _.series.color = _.point.color || _.series.color;
                        }
                        data = _;
                    }
                },

                // read only properties
                tooltipElem: {
                    get: function () {
                        return tooltipElem;
                    }, set: function (_) {
                    }
                },
                id: {
                    get: function () {
                        return id;
                    }, set: function (_) {
                    }
                }
            });

            nv.utils.initOptions(nvtooltip);
            return nvtooltip;
        };

    })();


    /*
     Gets the browser window size

     Returns object with height and width properties
     */
    nv.utils.windowSize = function () {
        // Sane defaults
        var size = {width: 640, height: 480};

        // Most recent browsers use
        if (window.innerWidth && window.innerHeight) {
            size.width = window.innerWidth;
            size.height = window.innerHeight;
            return (size);
        }

        // IE can use depending on mode it is in
        if (document.compatMode == 'CSS1Compat' &&
            document.documentElement &&
            document.documentElement.offsetWidth) {

            size.width = document.documentElement.offsetWidth;
            size.height = document.documentElement.offsetHeight;
            return (size);
        }

        // Earlier IE uses Doc.body
        if (document.body && document.body.offsetWidth) {
            size.width = document.body.offsetWidth;
            size.height = document.body.offsetHeight;
            return (size);
        }

        return (size);
    };

    /*
     Binds callback function to run when window is resized
     */
    nv.utils.windowResize = function (handler) {
        if (window.addEventListener) {
            window.addEventListener('resize', handler);
        } else {
            nv.log("ERROR: Failed to bind to window.resize with: ", handler);
        }
        // return object with clear function to remove the single added callback.
        return {
            callback: handler,
            clear: function () {
                window.removeEventListener('resize', handler);
            }
        }
    };


    /*
     Backwards compatible way to implement more d3-like coloring of graphs.
     Can take in nothing, an array, or a function/scale
     To use a normal scale, get the range and pass that because we must be able
     to take two arguments and use the index to keep backward compatibility
     */
    nv.utils.getColor = function (color) {
        //if you pass in nothing, get default colors back
        if (color === undefined) {
            return nv.utils.defaultColor();

            //if passed an array, turn it into a color scale
            // use isArray, instanceof fails if d3 range is created in an iframe
        } else if (Array.isArray(color)) {
            var color_scale = d3.scale.ordinal().range(color);
            return function (d, i) {
                var key = i === undefined ? d : i;
                return d.color || color_scale(key);
            };

            //if passed a function or scale, return it, or whatever it may be
            //external libs, such as angularjs-nvd3-directives use this
        } else {
            //can't really help it if someone passes rubbish as color
            return color;
        }
    };


    /*
     Default color chooser uses a color scale of 20 colors from D3
     https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
     */
    nv.utils.defaultColor = function () {
        // get range of the scale so we'll turn it into our own function.
        return nv.utils.getColor(d3.scale.category20().range());
    };


    /*
     Returns a color function that takes the result of 'getKey' for each series and
     looks for a corresponding color from the dictionary
     */
    nv.utils.customTheme = function (dictionary, getKey, defaultColors) {
        // use default series.key if getKey is undefined
        getKey = getKey || function (series) {
                return series.key
            };
        defaultColors = defaultColors || d3.scale.category20().range();

        // start at end of default color list and walk back to index 0
        var defIndex = defaultColors.length;

        return function (series, index) {
            var key = getKey(series);
            if (typeof dictionary[key] === 'function') {
                return dictionary[key]();
            } else if (dictionary[key] !== undefined) {
                return dictionary[key];
            } else {
                // no match in dictionary, use a default color
                if (!defIndex) {
                    // used all the default colors, start over
                    defIndex = defaultColors.length;
                }
                defIndex = defIndex - 1;
                return defaultColors[defIndex];
            }
        };
    };



    /*
     For when we want to approximate the width in pixels for an SVG:text element.
     Most common instance is when the element is in a display:none; container.
     Forumla is : text.length * font-size * constant_factor
     */
    nv.utils.calcApproxTextWidth = function (svgTextElem) {
        if (typeof svgTextElem.style === 'function'
            && typeof svgTextElem.text === 'function') {

            var fontSize = parseInt(svgTextElem.style("font-size").replace("px", ""), 10);
            var textLength = svgTextElem.text().length;
            return textLength * fontSize * 0.5;
        }
        return 0;
    };


    /*
     Numbers that are undefined, null or NaN, convert them to zeros.
     */
    nv.utils.NaNtoZero = function (n) {
        if (typeof n !== 'number'
            || isNaN(n)
            || n === null
            || n === Infinity
            || n === -Infinity) {

            return 0;
        }
        return n;
    };

    /*
     Add a way to watch for d3 transition ends to d3
     */
    d3.selection.prototype.watchTransition = function (renderWatch) {
        var args = [this].concat([].slice.call(arguments, 1));
        return renderWatch.transition.apply(renderWatch, args);
    };


    /*
     Helper object to watch when d3 has rendered something
     */
    nv.utils.renderWatch = function (dispatch, duration) {
        if (!(this instanceof nv.utils.renderWatch)) {
            return new nv.utils.renderWatch(dispatch, duration);
        }

        var _duration = duration !== undefined ? duration : 250;
        var renderStack = [];
        var self = this;

        this.models = function (models) {
            models = [].slice.call(arguments, 0);
            models.forEach(function (model) {
                model.__rendered = false;
                (function (m) {
                    m.dispatch.on('renderEnd', function (arg) {
                        m.__rendered = true;
                        self.renderEnd('model');
                    });
                })(model);

                if (renderStack.indexOf(model) < 0) {
                    renderStack.push(model);
                }
            });
            return this;
        };

        this.reset = function (duration) {
            if (duration !== undefined) {
                _duration = duration;
            }
            renderStack = [];
        };

        this.transition = function (selection, args, duration) {
            args = arguments.length > 1 ? [].slice.call(arguments, 1) : [];

            if (args.length > 1) {
                duration = args.pop();
            } else {
                duration = _duration !== undefined ? _duration : 250;
            }
            selection.__rendered = false;

            if (renderStack.indexOf(selection) < 0) {
                renderStack.push(selection);
            }

            if (duration === 0) {
                selection.__rendered = true;
                selection.delay = function () {
                    return this;
                };
                selection.duration = function () {
                    return this;
                };
                return selection;
            } else {
                if (selection.length === 0) {
                    selection.__rendered = true;
                } else if (selection.every(function (d) {
                        return !d.length;
                    })) {
                    selection.__rendered = true;
                } else {
                    selection.__rendered = false;
                }

                var n = 0;
                return selection
                    .transition()
                    .duration(duration)
                    .each(function () {
                        ++n;
                    })
                    .each('end', function (d, i) {
                        if (--n === 0) {
                            selection.__rendered = true;
                            self.renderEnd.apply(this, args);
                        }
                    });
            }
        };

        this.renderEnd = function () {
            if (renderStack.every(function (d) {
                    return d.__rendered;
                })) {
                renderStack.forEach(function (d) {
                    d.__rendered = false;
                });
                dispatch.renderEnd.apply(this, arguments);
            }
        }

    };


    /*
     Takes multiple objects and combines them into the first one (dst)
     example:  nv.utils.deepExtend({a: 1}, {a: 2, b: 3}, {c: 4});
     gives:  {a: 2, b: 3, c: 4}
     */
    nv.utils.deepExtend = function (dst) {
        var sources = arguments.length > 1 ? [].slice.call(arguments, 1) : [];
        sources.forEach(function (source) {
            for (var key in source) {
                var isArray = dst[key] instanceof Array;
                var isObject = typeof dst[key] === 'object';
                var srcObj = typeof source[key] === 'object';

                if (isObject && !isArray && srcObj) {
                    nv.utils.deepExtend(dst[key], source[key]);
                } else {
                    dst[key] = source[key];
                }
            }
        });
    };


    /*
     state utility object, used to track d3 states in the models
     */
    nv.utils.state = function () {
        if (!(this instanceof nv.utils.state)) {
            return new nv.utils.state();
        }
        var state = {};
        var _self = this;
        var _setState = function () {
        };
        var _getState = function () {
            return {};
        };
        var init = null;
        var changed = null;

        this.dispatch = d3.dispatch('change', 'set');

        this.dispatch.on('set', function (state) {
            _setState(state, true);
        });

        this.getter = function (fn) {
            _getState = fn;
            return this;
        };

        this.setter = function (fn, callback) {
            if (!callback) {
                callback = function () {
                };
            }
            _setState = function (state, update) {
                fn(state);
                if (update) {
                    callback();
                }
            };
            return this;
        };

        this.init = function (state) {
            init = init || {};
            nv.utils.deepExtend(init, state);
        };

        var _set = function () {
            var settings = _getState();

            if (JSON.stringify(settings) === JSON.stringify(state)) {
                return false;
            }

            for (var key in settings) {
                if (state[key] === undefined) {
                    state[key] = {};
                }
                state[key] = settings[key];
                changed = true;
            }
            return true;
        };

        this.update = function () {
            if (init) {
                _setState(init, false);
                init = null;
            }
            if (_set.call(this)) {
                this.dispatch.change(state);
            }
        };

    };


    /*
     Snippet of code you can insert into each nv.models.* to give you the ability to
     do things like:
     chart.options({
     showXAxis: true,
     tooltips: true
     });

     To enable in the chart:
     chart.options = nv.utils.optionsFunc.bind(chart);
     */
    nv.utils.optionsFunc = function (args) {
        if (args) {
            d3.map(args).forEach((function (key, value) {
                if (typeof this[key] === "function") {
                    this[key](value);
                }
            }).bind(this));
        }
        return this;
    };


    /*
     numTicks:  requested number of ticks
     data:  the chart data

     returns the number of ticks to actually use on X axis, based on chart data
     to avoid duplicate ticks with the same value
     */
    nv.utils.calcTicksX = function (numTicks, data) {
        // find max number of values from all data streams
        var numValues = 1;
        var i = 0;
        for (i; i < data.length; i += 1) {
            var stream_len = data[i] && data[i].values ? data[i].values.length : 0;
            numValues = stream_len > numValues ? stream_len : numValues;
        }
        nv.log("Requested number of ticks: ", numTicks);
        nv.log("Calculated max values to be: ", numValues);
        // make sure we don't have more ticks than values to avoid duplicates
        numTicks = numTicks > numValues ? numTicks = numValues - 1 : numTicks;
        // make sure we have at least one tick
        numTicks = numTicks < 1 ? 1 : numTicks;
        // make sure it's an integer
        numTicks = Math.floor(numTicks);
        nv.log("Calculating tick count as: ", numTicks);
        return numTicks;
    };


    /*
     returns number of ticks to actually use on Y axis, based on chart data
     */
    nv.utils.calcTicksY = function (numTicks, data) {
        // currently uses the same logic but we can adjust here if needed later
        return nv.utils.calcTicksX(numTicks, data);
    };


    /*
     Add a particular option from an options object onto chart
     Options exposed on a chart are a getter/setter function that returns chart
     on set to mimic typical d3 option chaining, e.g. svg.option1('a').option2('b');

     option objects should be generated via Object.create() to provide
     the option of manipulating data via get/set functions.
     */
    nv.utils.initOption = function (chart, name) {
        // if it's a call option, just call it directly, otherwise do get/set
        if (chart._calls && chart._calls[name]) {
            chart[name] = chart._calls[name];
        } else {
            chart[name] = function (_) {
                if (!arguments.length) return chart._options[name];
                chart._overrides[name] = true;
                chart._options[name] = _;
                return chart;
            };
            // calling the option as _option will ignore if set by option already
            // so nvd3 can set options internally but the stop if set manually
            chart['_' + name] = function (_) {
                if (!arguments.length) return chart._options[name];
                if (!chart._overrides[name]) {
                    chart._options[name] = _;
                }
                return chart;
            }
        }
    };


    /*
     Add all options in an options object to the chart
     */
    nv.utils.initOptions = function (chart) {
        chart._overrides = chart._overrides || {};
        var ops = Object.getOwnPropertyNames(chart._options || {});
        var calls = Object.getOwnPropertyNames(chart._calls || {});
        ops = ops.concat(calls);
        for (var i in ops) {
            nv.utils.initOption(chart, ops[i]);
        }
    };


    /*
     Inherit options from a D3 object
     d3.rebind makes calling the function on target actually call it on source
     Also use _d3options so we can track what we inherit for documentation and chained inheritance
     */
    nv.utils.inheritOptionsD3 = function (target, d3_source, oplist) {
        target._d3options = oplist.concat(target._d3options || []);
        oplist.unshift(d3_source);
        oplist.unshift(target);
        d3.rebind.apply(this, oplist);
    };


    /*
     Remove duplicates from an array
     */
    nv.utils.arrayUnique = function (a) {
        return a.sort().filter(function (item, pos) {
            return !pos || item != a[pos - 1];
        });
    };


    /*
     Keeps a list of custom symbols to draw from in addition to d3.svg.symbol
     Necessary since d3 doesn't let you extend its list -_-
     Add new symbols by doing nv.utils.symbols.set('name', function(size){...});
     */
    nv.utils.symbolMap = d3.map();


    /*
     Replaces d3.svg.symbol so that we can look both there and our own map
     */
    nv.utils.symbol = function () {
        var type,
            size = 64;

        function symbol(d, i) {
            var t = type.call(this, d, i);
            var s = size.call(this, d, i);
            if (d3.svg.symbolTypes.indexOf(t) !== -1) {
                return d3.svg.symbol().type(t).size(s)();
            } else {
                return nv.utils.symbolMap.get(t)(s);
            }
        }

        symbol.type = function (_) {
            if (!arguments.length) return type;
            type = d3.functor(_);
            return symbol;
        };
        symbol.size = function (_) {
            if (!arguments.length) return size;
            size = d3.functor(_);
            return symbol;
        };
        return symbol;
    };


    /*
     Inherit option getter/setter functions from source to target
     d3.rebind makes calling the function on target actually call it on source
     Also track via _inherited and _d3options so we can track what we inherit
     for documentation generation purposes and chained inheritance
     */
    nv.utils.inheritOptions = function (target, source) {
        // inherit all the things
        var ops = Object.getOwnPropertyNames(source._options || {});
        var calls = Object.getOwnPropertyNames(source._calls || {});
        var inherited = source._inherited || [];
        var d3ops = source._d3options || [];
        var args = ops.concat(calls).concat(inherited).concat(d3ops);
        args.unshift(source);
        args.unshift(target);
        d3.rebind.apply(this, args);
        // pass along the lists to keep track of them, don't allow duplicates
        target._inherited = nv.utils.arrayUnique(ops.concat(calls).concat(inherited).concat(ops).concat(target._inherited || []));
        target._d3options = nv.utils.arrayUnique(d3ops.concat(target._d3options || []));
    };


    /*
     Runs common initialize code on the svg before the chart builds
     */
    nv.utils.initSVG = function (svg) {
        svg.classed({'nvd3-svg': true});
    };


    /*
     Sanitize and provide default for the container height.
     */
    nv.utils.sanitizeHeight = function (height, container) {
        return (height || parseInt(container.style('height')) || 400);
    };


    /*
     Sanitize and provide default for the container width.
     */
    nv.utils.sanitizeWidth = function (width, container) {
        return (width || parseInt(container.style('width')) || 960);
    };


    /*
     Calculate the available height for a chart.
     */
    nv.utils.availableHeight = function (height, container, margin) {
        return nv.utils.sanitizeHeight(height, container) - margin.top - margin.bottom;
    };

    /*
     Calculate the available width for a chart.
     */
    nv.utils.availableWidth = function (width, container, margin) {
        return nv.utils.sanitizeWidth(width, container) - margin.left - margin.right;
    };

    /*
     Clear any rendered chart components and display a chart's 'noData' message
     */
    nv.utils.noData = function (chart, container) {
        var opt = chart.options(),
            margin = opt.margin(),
            noData = opt.noData(),
            data = (noData == null) ? ["No Data Available."] : [noData],
            height = nv.utils.availableHeight(opt.height(), container, margin),
            width = nv.utils.availableWidth(opt.width(), container, margin),
            x = margin.left + width / 2,
            y = margin.top + height / 2;

        //Remove any previously created chart components
        container.selectAll('g').remove();

        var noDataText = container.selectAll('.nv-noData').data(data);

        noDataText.enter().append('text')
            .attr('class', 'nvd3 nv-noData')
            .attr('dy', '-.7em');

        if (container[0][0].id === "chart_pie") {
            noDataText
                .attr('x', ($('#chart_pie').width() / 2) - 80)
                .attr('y', ($('#chart_pie').height() / 2))
                .text(function (t) {
                    return t;
                });
        }
        else if (container[0][0].id === "chart_line") {
            noDataText
                .attr('x', ($('#chart_line').width() / 2) - 80)
                .attr('y', ($('#chart_line').height() / 2) + 23)
                .text(function (t) {
                    return t;
                });
        }
        else if (container[0][0].id === "barchart_users") {
            noDataText
                .attr('x', ($('#barchart_users').width() / 2) - 80)
                .attr('y', 235)
                .text(function (t) {
                    return t;
                });
        }
    };
    nv.models.axis = function () {
        "use strict";

        //============================================================
        // Public Variables with Default Settings
        //------------------------------------------------------------

        var axis = d3.svg.axis();
        var scale = d3.scale.linear();

        var margin = {top: 0, right: 0, bottom: 0, left: 0}
            , width = 75 //only used for tickLabel currently
            , height = 60 //only used for tickLabel currently
            , axisLabelText = null
            , showMaxMin = true //TODO: showMaxMin should be disabled on all ordinal scaled axes
            , rotateLabels = 0
            , rotateYLabel = true
            , staggerLabels = false
            , isOrdinal = false
            , ticks = null
            , axisLabelDistance = 0
            , duration = 250
            , dispatch = d3.dispatch('renderEnd')
            ;
        axis
            .scale(scale)
            .orient('bottom')
            .tickFormat(function (d) {
                return d
            })
        ;

        //============================================================
        // Private Variables
        //------------------------------------------------------------

        var scale0;
        var renderWatch = nv.utils.renderWatch(dispatch, duration);

        function chart(selection) {
            renderWatch.reset();
            selection.each(function (data) {
                var container = d3.select(this);
                nv.utils.initSVG(container);

                // Setup containers and skeleton of chart
                var wrap = container.selectAll('g.nv-wrap.nv-axis').data([data]);
                var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-axis');
                var gEnter = wrapEnter.append('g');
                var g = wrap.select('g');

                if (ticks !== null)
                    axis.ticks(ticks);
                else if (axis.orient() == 'top' || axis.orient() == 'bottom')
                    axis.ticks(Math.abs(scale.range()[1] - scale.range()[0]) / 100);

                //TODO: consider calculating width/height based on whether or not label is added, for reference in charts using this component
                g.watchTransition(renderWatch, 'axis').call(axis);

                scale0 = scale0 || axis.scale();

                var fmt = axis.tickFormat();
                if (fmt == null) {
                    fmt = scale0.tickFormat();
                }

                var axisLabel = g.selectAll('text.nv-axislabel')
                    .data([axisLabelText || null]);
                axisLabel.exit().remove();

                var xLabelMargin;
                var axisMaxMin;
                var w;
                switch (axis.orient()) {
                    case 'top':
                        axisLabel.enter().append('text').attr('class', 'nv-axislabel');
                        if (scale.range().length < 2) {
                            w = 0;
                        } else if (scale.range().length === 2) {
                            w = scale.range()[1];
                        } else {
                            w = scale.range()[scale.range().length - 1] + (scale.range()[1] - scale.range()[0]);
                        }
                        axisLabel
                            .attr('text-anchor', 'middle')
                            .attr('y', 0)
                            .attr('x', w / 2);
                        if (showMaxMin) {
                            axisMaxMin = wrap.selectAll('g.nv-axisMaxMin')
                                .data(scale.domain());
                            axisMaxMin.enter().append('g').attr('class', 'nv-axisMaxMin').append('text');
                            axisMaxMin.exit().remove();
                            axisMaxMin
                                .attr('transform', function (d, i) {
                                    return 'translate(' + nv.utils.NaNtoZero(scale(d)) + ',0)'
                                })
                                .select('text')
                                .attr('dy', '-0.5em')
                                .attr('y', -axis.tickPadding())
                                .attr('text-anchor', 'middle')
                                .text(function (d, i) {
                                    var v = fmt(d);
                                    return ('' + v).match('NaN') ? '' : v;
                                });
                            axisMaxMin.watchTransition(renderWatch, 'min-max top')
                                .attr('transform', function (d, i) {
                                    return 'translate(' + nv.utils.NaNtoZero(scale.range()[i]) + ',0)'
                                });
                        }
                        break;
                    case 'bottom':
                        xLabelMargin = axisLabelDistance + 36;
                        var maxTextWidth = 30;
                        var textHeight = 0;
                        var xTicks = g.selectAll('g').select("text");
                        var rotateLabelsRule = '';
                        if (rotateLabels % 360) {
                            //Calculate the longest xTick width
                            xTicks.each(function (d, i) {
                                var box = this.getBoundingClientRect();
                                var width = box.width;
                                textHeight = box.height;
                                if (width > maxTextWidth) maxTextWidth = width;
                            });
                            rotateLabelsRule = 'rotate(' + rotateLabels + ' 0,' + (textHeight / 2 + axis.tickPadding()) + ')';
                            //Convert to radians before calculating sin. Add 30 to margin for healthy padding.
                            var sin = Math.abs(Math.sin(rotateLabels * Math.PI / 180));
                            xLabelMargin = (sin ? sin * maxTextWidth : maxTextWidth) + 30;
                            //Rotate all xTicks
                            xTicks
                                .attr('transform', rotateLabelsRule)
                                .style('text-anchor', rotateLabels % 360 > 0 ? 'start' : 'end');
                        }
                        axisLabel.enter().append('text').attr('class', 'nv-axislabel');
                        if (scale.range().length < 2) {
                            w = 0;
                        } else if (scale.range().length === 2) {
                            w = scale.range()[1];
                        } else {
                            w = scale.range()[scale.range().length - 1] + (scale.range()[1] - scale.range()[0]);
                        }
                        axisLabel
                            .attr('text-anchor', 'middle')
                            .attr('y', xLabelMargin)
                            .attr('x', w / 2);
                        if (showMaxMin) {
                            //if (showMaxMin && !isOrdinal) {
                            axisMaxMin = wrap.selectAll('g.nv-axisMaxMin')
                                //.data(scale.domain())
                                .data([scale.domain()[0], scale.domain()[scale.domain().length - 1]]);
                            axisMaxMin.enter().append('g').attr('class', 'nv-axisMaxMin').append('text');
                            axisMaxMin.exit().remove();
                            axisMaxMin
                                .attr('transform', function (d, i) {
                                    return 'translate(' + nv.utils.NaNtoZero((scale(d) + (isOrdinal ? scale.rangeBand() / 2 : 0))) + ',0)'
                                })
                                .select('text')
                                .attr('dy', '.71em')
                                .attr('y', axis.tickPadding())
                                .attr('transform', rotateLabelsRule)
                                .style('text-anchor', rotateLabels ? (rotateLabels % 360 > 0 ? 'start' : 'end') : 'middle')
                                .text(function (d, i) {
                                    var v = fmt(d);
                                    return ('' + v).match('NaN') ? '' : v;
                                });
                            axisMaxMin.watchTransition(renderWatch, 'min-max bottom')
                                .attr('transform', function (d, i) {
                                    return 'translate(' + nv.utils.NaNtoZero((scale(d) + (isOrdinal ? scale.rangeBand() / 2 : 0))) + ',0)'
                                });
                        }
                        if (staggerLabels)
                            xTicks
                                .attr('transform', function (d, i) {
                                    return 'translate(0,' + (i % 2 == 0 ? '0' : '12') + ')'
                                });

                        break;
                    case 'right':
                        axisLabel.enter().append('text').attr('class', 'nv-axislabel');
                        axisLabel
                            .style('text-anchor', rotateYLabel ? 'middle' : 'begin')
                            .attr('transform', rotateYLabel ? 'rotate(90)' : '')
                            .attr('y', rotateYLabel ? (-Math.max(margin.right, width) + 12) : -10) //TODO: consider calculating this based on largest tick width... OR at least expose this on chart
                            .attr('x', rotateYLabel ? (d3.max(scale.range()) / 2) : axis.tickPadding());
                        if (showMaxMin) {
                            axisMaxMin = wrap.selectAll('g.nv-axisMaxMin')
                                .data(scale.domain());
                            axisMaxMin.enter().append('g').attr('class', 'nv-axisMaxMin').append('text')
                                .style('opacity', 0);
                            axisMaxMin.exit().remove();
                            axisMaxMin
                                .attr('transform', function (d, i) {
                                    return 'translate(0,' + nv.utils.NaNtoZero(scale(d)) + ')'
                                })
                                .select('text')
                                .attr('dy', '.32em')
                                .attr('y', 0)
                                .attr('x', axis.tickPadding())
                                .style('text-anchor', 'start')
                                .text(function (d, i) {
                                    var v = fmt(d);
                                    return ('' + v).match('NaN') ? '' : v;
                                });
                            axisMaxMin.watchTransition(renderWatch, 'min-max right')
                                .attr('transform', function (d, i) {
                                    return 'translate(0,' + nv.utils.NaNtoZero(scale.range()[i]) + ')'
                                })
                                .select('text')
                                .style('opacity', 1);
                        }
                        break;
                    case 'left':
                        /*
                         //For dynamically placing the label. Can be used with dynamically-sized chart axis margins
                         var yTicks = g.selectAll('g').select("text");
                         yTicks.each(function(d,i){
                         var labelPadding = this.getBoundingClientRect().width + axis.tickPadding() + 16;
                         if(labelPadding > width) width = labelPadding;
                         });
                         */
                        axisLabel.enter().append('text').attr('class', 'nv-axislabel');
                        axisLabel
                            .style('text-anchor', rotateYLabel ? 'middle' : 'end')
                            .attr('transform', rotateYLabel ? 'rotate(-90)' : '')
                            .attr('y', rotateYLabel ? (-Math.max(margin.left, width) + 25 - (axisLabelDistance || 0)) : -10)
                            .attr('x', rotateYLabel ? (-d3.max(scale.range()) / 2) : -axis.tickPadding());
                        if (showMaxMin) {
                            axisMaxMin = wrap.selectAll('g.nv-axisMaxMin')
                                .data(scale.domain());
                            axisMaxMin.enter().append('g').attr('class', 'nv-axisMaxMin').append('text')
                                .style('opacity', 0);
                            axisMaxMin.exit().remove();
                            axisMaxMin
                                .attr('transform', function (d, i) {
                                    return 'translate(0,' + nv.utils.NaNtoZero(scale0(d)) + ')'
                                })
                                .select('text')
                                .attr('dy', '.32em')
                                .attr('y', 0)
                                .attr('x', -axis.tickPadding())
                                .attr('text-anchor', 'end')
                                .text(function (d, i) {
                                    var v = fmt(d);
                                    return ('' + v).match('NaN') ? '' : v;
                                });
                            axisMaxMin.watchTransition(renderWatch, 'min-max right')
                                .attr('transform', function (d, i) {
                                    return 'translate(0,' + nv.utils.NaNtoZero(scale.range()[i]) + ')'
                                })
                                .select('text')
                                .style('opacity', 1);
                        }
                        break;
                }
                axisLabel.text(function (d) {
                    return d
                });

                if (showMaxMin && (axis.orient() === 'left' || axis.orient() === 'right')) {
                    //check if max and min overlap other values, if so, hide the values that overlap
                    g.selectAll('g') // the g's wrapping each tick
                        .each(function (d, i) {
                            d3.select(this).select('text').attr('opacity', 1);
                            if (scale(d) < scale.range()[1] + 10 || scale(d) > scale.range()[0] - 10) { // 10 is assuming text height is 16... if d is 0, leave it!
                                if (d > 1e-10 || d < -1e-10) // accounts for minor floating point errors... though could be problematic if the scale is EXTREMELY SMALL
                                    d3.select(this).attr('opacity', 0);

                                d3.select(this).select('text').attr('opacity', 0); // Don't remove the ZERO line!!
                            }
                        });

                    //if Max and Min = 0 only show min, Issue #281
                    if (scale.domain()[0] == scale.domain()[1] && scale.domain()[0] == 0) {
                        wrap.selectAll('g.nv-axisMaxMin').style('opacity', function (d, i) {
                            return !i ? 1 : 0
                        });
                    }
                }

                if (showMaxMin && (axis.orient() === 'top' || axis.orient() === 'bottom')) {
                    var maxMinRange = [];
                    wrap.selectAll('g.nv-axisMaxMin')
                        .each(function (d, i) {
                            try {
                                if (i) // i== 1, max position
                                    maxMinRange.push(scale(d) - this.getBoundingClientRect().width - 4);  //assuming the max and min labels are as wide as the next tick (with an extra 4 pixels just in case)
                                else // i==0, min position
                                    maxMinRange.push(scale(d) + this.getBoundingClientRect().width + 4)
                            } catch (err) {
                                if (i) // i== 1, max position
                                    maxMinRange.push(scale(d) - 4);  //assuming the max and min labels are as wide as the next tick (with an extra 4 pixels just in case)
                                else // i==0, min position
                                    maxMinRange.push(scale(d) + 4);
                            }
                        });
                    // the g's wrapping each tick
                    g.selectAll('g').each(function (d, i) {
                        if (scale(d) < maxMinRange[0] || scale(d) > maxMinRange[1]) {
                            if (d > 1e-10 || d < -1e-10) // accounts for minor floating point errors... though could be problematic if the scale is EXTREMELY SMALL
                                d3.select(this).remove();
                            else
                                d3.select(this).select('text').remove(); // Don't remove the ZERO line!!
                        }
                    });
                }

                //Highlight zero tick line
                g.selectAll('.tick')
                    .filter(function (d) {
                        /*
                         The filter needs to return only ticks at or near zero.
                         Numbers like 0.00001 need to count as zero as well,
                         and the arithmetic trick below solves that.
                         */
                        return !parseFloat(Math.round(d * 100000) / 1000000) && (d !== undefined)
                    })
                    .classed('zero', true);

                //store old scales for use in transitions on update
                scale0 = scale.copy();

            });

            renderWatch.renderEnd('axis immediate');
            return chart;
        }

        //============================================================
        // Expose Public Variables
        //------------------------------------------------------------

        // expose chart's sub-components
        chart.axis = axis;
        chart.dispatch = dispatch;

        chart.options = nv.utils.optionsFunc.bind(chart);
        chart._options = Object.create({}, {
            // simple options, just get/set the necessary values
            axisLabelDistance: {
                get: function () {
                    return axisLabelDistance;
                }, set: function (_) {
                    axisLabelDistance = _;
                }
            },
            staggerLabels: {
                get: function () {
                    return staggerLabels;
                }, set: function (_) {
                    staggerLabels = _;
                }
            },
            rotateLabels: {
                get: function () {
                    return rotateLabels;
                }, set: function (_) {
                    rotateLabels = _;
                }
            },
            rotateYLabel: {
                get: function () {
                    return rotateYLabel;
                }, set: function (_) {
                    rotateYLabel = _;
                }
            },
            showMaxMin: {
                get: function () {
                    return showMaxMin;
                }, set: function (_) {
                    showMaxMin = _;
                }
            },
            axisLabel: {
                get: function () {
                    return axisLabelText;
                }, set: function (_) {
                    axisLabelText = _;
                }
            },
            height: {
                get: function () {
                    return height;
                }, set: function (_) {
                    height = _;
                }
            },
            ticks: {
                get: function () {
                    return ticks;
                }, set: function (_) {
                    ticks = _;
                }
            },
            width: {
                get: function () {
                    return width;
                }, set: function (_) {
                    width = _;
                }
            },

            // options that require extra logic in the setter
            margin: {
                get: function () {
                    return margin;
                }, set: function (_) {
                    margin.top = _.top !== undefined ? _.top : margin.top;
                    margin.right = _.right !== undefined ? _.right : margin.right;
                    margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
                    margin.left = _.left !== undefined ? _.left : margin.left;
                }
            },
            duration: {
                get: function () {
                    return duration;
                }, set: function (_) {
                    duration = _;
                    renderWatch.reset(duration);
                }
            },
            scale: {
                get: function () {
                    return scale;
                }, set: function (_) {
                    scale = _;
                    axis.scale(scale);
                    isOrdinal = typeof scale.rangeBands === 'function';
                    nv.utils.inheritOptionsD3(chart, scale, ['domain', 'range', 'rangeBand', 'rangeBands']);
                }
            }
        });

        nv.utils.initOptions(chart);
        nv.utils.inheritOptionsD3(chart, axis, ['orient', 'tickValues', 'tickSubdivide', 'tickSize', 'tickPadding', 'tickFormat']);
        nv.utils.inheritOptionsD3(chart, scale, ['domain', 'range', 'rangeBand', 'rangeBands']);

        return chart;
    };
    nv.models.legend = function () {
        "use strict";

        //============================================================
        // Public Variables with Default Settings
        //------------------------------------------------------------

        var margin = {top: 5, right: 0, bottom: 5, left: 0}
            , width = 400
            , height = 20
            , getKey = function (d) {
                return d.key
            }
            , color = nv.utils.defaultColor()
            , align = true
            , padding = 28 //define how much space between legend items.
            , rightAlign = true
            , updateState = true   //If true, legend will update data.disabled and trigger a 'stateChange' dispatch.
            , radioButtonMode = false   //If true, clicking legend items will cause it to behave like a radio button. (only one can be selected at a time)
            , dispatch = d3.dispatch('legendClick', 'legendDblclick', 'legendMouseover', 'legendMouseout', 'stateChange')
            ;

        function chart(selection) {
            selection.each(function (data) {
                var availableWidth = width - margin.left - margin.right,
                    container = d3.select(this);
                nv.utils.initSVG(container);

                // Setup containers and skeleton of chart
                var wrap = container.selectAll('g.nv-legend').data([data]);
                var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-legend').append('g');
                var g = wrap.select('g');

                wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                var series = g.selectAll('.nv-series')
                    .data(function (d) {
                        return d;
                    });
                var seriesEnter = series.enter().append('g').attr('class', 'nv-series')

                seriesEnter.append('circle')
                    .style('stroke-width', 2)
                    .attr('class', 'nv-legend-symbol')
                    .attr('r', 5);
                seriesEnter.append('text')
                    .attr('text-anchor', 'start')
                    .attr('class', 'nv-legend-text')
                    .attr('dy', '.32em')
                    .attr('dx', '8');

                series
                    .on('mouseover', function (d, i) {
                        dispatch.legendMouseover(d, i);  //TODO: Make consistent with other event objects
                    })
                    .on('mouseout', function (d, i) {
                        dispatch.legendMouseout(d, i);
                    })
                    .on('click', function (d, i) {
                        dispatch.legendClick(d, i);
                        // make sure we re-get data in case it was modified
                        var data = series.data();
                        if (updateState) {
                            if (radioButtonMode) {
                                //Radio button mode: set every series to disabled,
                                //  and enable the clicked series.
                                data.forEach(function (series) {
                                    series.disabled = true
                                });
                                d.disabled = false;
                            }
                            else {
                                d.disabled = !d.disabled;
                                if (data.every(function (series) {
                                        return series.disabled
                                    })) {
                                    //the default behavior of NVD3 legends is, if every single series
                                    // is disabled, turn all series' back on.
                                    data.forEach(function (series) {
                                        series.disabled = false
                                    });
                                }
                            }
                            dispatch.stateChange({
                                disabled: data.map(function (d) {
                                    return !!d.disabled
                                })
                            });
                        }
                    })
                    .on('dblclick', function (d, i) {
                        dispatch.legendDblclick(d, i);
                        if (updateState) {
                            // make sure we re-get data in case it was modified
                            var data = series.data();
                            //the default behavior of NVD3 legends, when double clicking one,
                            // is to set all other series' to false, and make the double clicked series enabled.
                            data.forEach(function (series) {
                                series.disabled = true;
                            });
                            d.disabled = false;
                            dispatch.stateChange({
                                disabled: data.map(function (d) {
                                    return !!d.disabled
                                })
                            });
                        }
                    });

                series.classed('nv-disabled', function (d) {
                    return d.disabled
                });
                series.exit().remove();
                series.select('circle')
                    .style('fill', function (d, i) {
                        return d.color || color(d, i)
                    })
                    .style('stroke', function (d, i) {
                        return d.color || color(d, i)
                    });
                series.select('text').text(getKey);

                //TODO: implement fixed-width and max-width options (max-width is especially useful with the align option)
                // NEW ALIGNING CODE, TODO: clean up
                if (align) {

                    var seriesWidths = [];
                    series.each(function (d, i) {
                        var legendText = d3.select(this).select('text');
                        var nodeTextLength;
                        try {
                            nodeTextLength = legendText.node().getComputedTextLength();
                            // If the legendText is display:none'd (nodeTextLength == 0), simulate an error so we approximate, instead
                            if (nodeTextLength <= 0) throw Error();
                        }
                        catch (e) {
                            nodeTextLength = nv.utils.calcApproxTextWidth(legendText);
                        }

                        seriesWidths.push(nodeTextLength + padding);
                    });

                    var seriesPerRow = 0;
                    var legendWidth = 0;
                    var columnWidths = [];

                    while (legendWidth < availableWidth && seriesPerRow < seriesWidths.length) {
                        columnWidths[seriesPerRow] = seriesWidths[seriesPerRow];
                        legendWidth += seriesWidths[seriesPerRow++];
                    }
                    if (seriesPerRow === 0) seriesPerRow = 1; //minimum of one series per row

                    while (legendWidth > availableWidth && seriesPerRow > 1) {
                        columnWidths = [];
                        seriesPerRow--;

                        for (var k = 0; k < seriesWidths.length; k++) {
                            if (seriesWidths[k] > (columnWidths[k % seriesPerRow] || 0))
                                columnWidths[k % seriesPerRow] = seriesWidths[k];
                        }

                        legendWidth = columnWidths.reduce(function (prev, cur, index, array) {
                            return prev + cur;
                        });
                    }

                    var xPositions = [];
                    for (var i = 0, curX = 0; i < seriesPerRow; i++) {
                        xPositions[i] = curX;
                        curX += columnWidths[i];
                    }

                    series
                        .attr('transform', function (d, i) {
                            return 'translate(' + xPositions[i % seriesPerRow] + ',' + (5 + Math.floor(i / seriesPerRow) * 20) + ')';
                        });

                    //position legend as far right as possible within the total width
                    if (rightAlign) {
                        g.attr('transform', 'translate(' + (width - margin.right - legendWidth) + ',' + margin.top + ')');
                    }
                    else {
                        g.attr('transform', 'translate(0' + ',' + margin.top + ')');
                    }

                    height = margin.top + margin.bottom + (Math.ceil(seriesWidths.length / seriesPerRow) * 20);

                } else {

                    var ypos = 5,
                        newxpos = 5,
                        maxwidth = 0,
                        xpos;
                    series
                        .attr('transform', function (d, i) {
                            var length = d3.select(this).select('text').node().getComputedTextLength() + padding;
                            xpos = newxpos;

                            if (width < margin.left + margin.right + xpos + length) {
                                newxpos = xpos = 5;
                                ypos += 20;
                            }

                            newxpos += length;
                            if (newxpos > maxwidth) maxwidth = newxpos;

                            return 'translate(' + xpos + ',' + ypos + ')';
                        });

                    //position legend as far right as possible within the total width
                    g.attr('transform', 'translate(' + (width - margin.right - maxwidth) + ',' + margin.top + ')');

                    height = margin.top + margin.bottom + ypos + 15;
                }
            });

            return chart;
        }

        //============================================================
        // Expose Public Variables
        //------------------------------------------------------------

        chart.dispatch = dispatch;
        chart.options = nv.utils.optionsFunc.bind(chart);

        chart._options = Object.create({}, {
            // simple options, just get/set the necessary values
            width: {
                get: function () {
                    return width;
                }, set: function (_) {
                    width = _;
                }
            },
            height: {
                get: function () {
                    return height;
                }, set: function (_) {
                    height = _;
                }
            },
            key: {
                get: function () {
                    return getKey;
                }, set: function (_) {
                    getKey = _;
                }
            },
            align: {
                get: function () {
                    return align;
                }, set: function (_) {
                    align = _;
                }
            },
            rightAlign: {
                get: function () {
                    return rightAlign;
                }, set: function (_) {
                    rightAlign = _;
                }
            },
            padding: {
                get: function () {
                    return padding;
                }, set: function (_) {
                    padding = _;
                }
            },
            updateState: {
                get: function () {
                    return updateState;
                }, set: function (_) {
                    updateState = _;
                }
            },
            radioButtonMode: {
                get: function () {
                    return radioButtonMode;
                }, set: function (_) {
                    radioButtonMode = _;
                }
            },

            // options that require extra logic in the setter
            margin: {
                get: function () {
                    return margin;
                }, set: function (_) {
                    margin.top = _.top !== undefined ? _.top : margin.top;
                    margin.right = _.right !== undefined ? _.right : margin.right;
                    margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
                    margin.left = _.left !== undefined ? _.left : margin.left;
                }
            },
            color: {
                get: function () {
                    return color;
                }, set: function (_) {
                    color = nv.utils.getColor(_);
                }
            }
        });

        nv.utils.initOptions(chart);

        return chart;
    };
    nv.models.line = function () {
        "use strict";
        //============================================================
        // Public Variables with Default Settings
        //------------------------------------------------------------

        var scatter = nv.models.scatter()
            ;

        var margin = {top: 0, right: 0, bottom: 0, left: 0}
            , width = 960
            , height = 500
            , strokeWidth = 1.5
            , color = nv.utils.defaultColor() // a function that returns a color
            , getX = function (d) {
                return d.x
            } // accessor to get the x value from a data point
            , getY = function (d) {
                return d.y
            } // accessor to get the y value from a data point
            , defined = function (d, i) {
                return !isNaN(getY(d, i)) && getY(d, i) !== null
            } // allows a line to be not continuous when it is not defined
            , isArea = function (d) {
                return d.area
            } // decides if a line is an area or just a line
            , clipEdge = false // if true, masks lines within x and y scale
            , x //can be accessed via chart.xScale()
            , y //can be accessed via chart.yScale()
            , interpolate = "linear" // controls the line interpolation
            , duration = 250
            , dispatch = d3.dispatch('elementClick', 'elementMouseover', 'elementMouseout', 'renderEnd')
            ;

        scatter
            .pointSize(16) // default size
            .pointDomain([16, 256]) //set to speed up calculation, needs to be unset if there is a custom size accessor
        ;

        //============================================================


        //============================================================
        // Private Variables
        //------------------------------------------------------------

        var x0, y0 //used to store previous scales
            , renderWatch = nv.utils.renderWatch(dispatch, duration)
            ;

        //============================================================


        function chart(selection) {
            renderWatch.reset();
            renderWatch.models(scatter);
            selection.each(function (data) {
                var availableWidth = width - margin.left - margin.right,
                    availableHeight = height - margin.top - margin.bottom,
                    container = d3.select(this);
                nv.utils.initSVG(container);

                // Setup Scales
                x = scatter.xScale();
                y = scatter.yScale();

                x0 = x0 || x;
                y0 = y0 || y;

                // Setup containers and skeleton of chart
                var wrap = container.selectAll('g.nv-wrap.nv-line').data([data]);
                var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-line');
                var defsEnter = wrapEnter.append('defs');
                var gEnter = wrapEnter.append('g');
                var g = wrap.select('g');

                gEnter.append('g').attr('class', 'nv-groups');
                gEnter.append('g').attr('class', 'nv-scatterWrap');

                wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                scatter
                    .width(availableWidth)
                    .height(availableHeight);

                var scatterWrap = wrap.select('.nv-scatterWrap');
                scatterWrap.call(scatter);

                defsEnter.append('clipPath')
                    .attr('id', 'nv-edge-clip-' + scatter.id())
                    .append('rect');

                wrap.select('#nv-edge-clip-' + scatter.id() + ' rect')
                    .attr('width', availableWidth)
                    .attr('height', (availableHeight > 0) ? availableHeight : 0);

                g.attr('clip-path', clipEdge ? 'url(#nv-edge-clip-' + scatter.id() + ')' : '');
                scatterWrap
                    .attr('clip-path', clipEdge ? 'url(#nv-edge-clip-' + scatter.id() + ')' : '');

                var groups = wrap.select('.nv-groups').selectAll('.nv-group')
                    .data(function (d) {
                        return d
                    }, function (d) {
                        return d.key
                    });
                groups.enter().append('g')
                    .style('stroke-opacity', 1e-6)
                    .style('stroke-width', function (d) {
                        return d.strokeWidth || strokeWidth
                    })
                    .style('fill-opacity', 1e-6);

                groups.exit().remove();

                groups
                    .attr('class', function (d, i) {
                        return (d.classed || '') + ' nv-group nv-series-' + i;
                    })
                    .classed('hover', function (d) {
                        return d.hover
                    })
                    .style('fill', function (d, i) {
                        return color(d, i)
                    })
                    .style('stroke', function (d, i) {
                        return color(d, i)
                    });
                groups.watchTransition(renderWatch, 'line: groups')
                    .style('stroke-opacity', 1)
                    .style('fill-opacity', function (d) {
                        return d.fillOpacity || .5
                    });

                var areaPaths = groups.selectAll('path.nv-area')
                    .data(function (d) {
                        return isArea(d) ? [d] : []
                    }); // this is done differently than lines because I need to check if series is an area
                areaPaths.enter().append('path')
                    .attr('class', 'nv-area')
                    .attr('d', function (d) {
                        return d3.svg.area()
                            .interpolate(interpolate)
                            .defined(defined)
                            .x(function (d, i) {
                                return nv.utils.NaNtoZero(x0(getX(d, i)))
                            })
                            .y0(function (d, i) {
                                return nv.utils.NaNtoZero(y0(getY(d, i)))
                            })
                            .y1(function (d, i) {
                                return y0(y.domain()[0] <= 0 ? y.domain()[1] >= 0 ? 0 : y.domain()[1] : y.domain()[0])
                            })
                            //.y1(function(d,i) { return y0(0) }) //assuming 0 is within y domain.. may need to tweak this
                            .apply(this, [d.values])
                    });
                groups.exit().selectAll('path.nv-area')
                    .remove();

                areaPaths.watchTransition(renderWatch, 'line: areaPaths')
                    .attr('d', function (d) {
                        return d3.svg.area()
                            .interpolate(interpolate)
                            .defined(defined)
                            .x(function (d, i) {
                                return nv.utils.NaNtoZero(x(getX(d, i)))
                            })
                            .y0(function (d, i) {
                                return nv.utils.NaNtoZero(y(getY(d, i)))
                            })
                            .y1(function (d, i) {
                                return y(y.domain()[0] <= 0 ? y.domain()[1] >= 0 ? 0 : y.domain()[1] : y.domain()[0])
                            })
                            //.y1(function(d,i) { return y0(0) }) //assuming 0 is within y domain.. may need to tweak this
                            .apply(this, [d.values])
                    });

                var linePaths = groups.selectAll('path.nv-line')
                    .data(function (d) {
                        return [d.values]
                    });

                linePaths.enter().append('path')
                    .attr('class', 'nv-line')
                    .attr('d',
                    d3.svg.line()
                        .interpolate(interpolate)
                        .defined(defined)
                        .x(function (d, i) {
                            return nv.utils.NaNtoZero(x0(getX(d, i)))
                        })
                        .y(function (d, i) {
                            return nv.utils.NaNtoZero(y0(getY(d, i)))
                        })
                );

                linePaths.watchTransition(renderWatch, 'line: linePaths')
                    .attr('d',
                    d3.svg.line()
                        .interpolate(interpolate)
                        .defined(defined)
                        .x(function (d, i) {
                            return nv.utils.NaNtoZero(x(getX(d, i)))
                        })
                        .y(function (d, i) {
                            return nv.utils.NaNtoZero(y(getY(d, i)))
                        })
                );

                //store old scales for use in transitions on update
                x0 = x.copy();
                y0 = y.copy();
            });
            renderWatch.renderEnd('line immediate');
            return chart;
        }


        //============================================================
        // Expose Public Variables
        //------------------------------------------------------------

        chart.dispatch = dispatch;
        chart.scatter = scatter;
        // Pass through events
        scatter.dispatch.on('elementClick', function () {
            dispatch.elementClick.apply(this, arguments);
        });
        scatter.dispatch.on('elementMouseover', function () {
            dispatch.elementMouseover.apply(this, arguments);
        });
        scatter.dispatch.on('elementMouseout', function () {
            dispatch.elementMouseout.apply(this, arguments);
        });

        chart.options = nv.utils.optionsFunc.bind(chart);

        chart._options = Object.create({}, {
            // simple options, just get/set the necessary values
            width: {
                get: function () {
                    return width;
                }, set: function (_) {
                    width = _;
                }
            },
            height: {
                get: function () {
                    return height;
                }, set: function (_) {
                    height = _;
                }
            },
            defined: {
                get: function () {
                    return defined;
                }, set: function (_) {
                    defined = _;
                }
            },
            interpolate: {
                get: function () {
                    return interpolate;
                }, set: function (_) {
                    interpolate = _;
                }
            },
            clipEdge: {
                get: function () {
                    return clipEdge;
                }, set: function (_) {
                    clipEdge = _;
                }
            },

            // options that require extra logic in the setter
            margin: {
                get: function () {
                    return margin;
                }, set: function (_) {
                    margin.top = _.top !== undefined ? _.top : margin.top;
                    margin.right = _.right !== undefined ? _.right : margin.right;
                    margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
                    margin.left = _.left !== undefined ? _.left : margin.left;
                }
            },
            duration: {
                get: function () {
                    return duration;
                }, set: function (_) {
                    duration = _;
                    renderWatch.reset(duration);
                    scatter.duration(duration);
                }
            },
            isArea: {
                get: function () {
                    return isArea;
                }, set: function (_) {
                    isArea = d3.functor(_);
                }
            },
            x: {
                get: function () {
                    return getX;
                }, set: function (_) {
                    getX = _;
                    scatter.x(_);
                }
            },
            y: {
                get: function () {
                    return getY;
                }, set: function (_) {
                    getY = _;
                    scatter.y(_);
                }
            },
            color: {
                get: function () {
                    return color;
                }, set: function (_) {
                    color = nv.utils.getColor(_);
                    scatter.color(color);
                }
            }
        });

        nv.utils.inheritOptions(chart, scatter);
        nv.utils.initOptions(chart);

        return chart;
    };
    nv.models.lineChart = function () {
        "use strict";

        //============================================================
        // Public Variables with Default Settings
        //------------------------------------------------------------

        var lines = nv.models.line()
            , xAxis = nv.models.axis()
            , yAxis = nv.models.axis()
            , legend = nv.models.legend()
            , interactiveLayer = nv.interactiveGuideline()
            , tooltip = nv.models.tooltip()
            ;

        var margin = {top: 30, right: 20, bottom: 50, left: 60}
            , color = nv.utils.defaultColor()
            , width = null
            , height = null
            , showLegend = true
            , showXAxis = true
            , showYAxis = true
            , rightAlignYAxis = false
            , useInteractiveGuideline = false
            , x
            , y
            , state = nv.utils.state()
            , defaultState = null
            , noData = null
            , dispatch = d3.dispatch('tooltipShow', 'tooltipHide', 'stateChange', 'changeState', 'renderEnd')
            , duration = 250
            ;

        // set options on sub-objects for this chart
        xAxis.orient('bottom').tickPadding(7);
        yAxis.orient(rightAlignYAxis ? 'right' : 'left');
        tooltip.valueFormatter(function (d, i) {
            return yAxis.tickFormat()(d, i);
        }).headerFormatter(function (d, i) {
            return xAxis.tickFormat()(d, i);
        });


        //============================================================
        // Private Variables
        //------------------------------------------------------------

        var renderWatch = nv.utils.renderWatch(dispatch, duration);

        var stateGetter = function (data) {
            return function () {
                return {
                    active: data.map(function (d) {
                        return !d.disabled
                    })
                };
            }
        };

        var stateSetter = function (data) {
            return function (state) {
                if (state.active !== undefined)
                    data.forEach(function (series, i) {
                        series.disabled = !state.active[i];
                    });
            }
        };

        function chart(selection) {
            renderWatch.reset();
            renderWatch.models(lines);
            if (showXAxis) renderWatch.models(xAxis);
            if (showYAxis) renderWatch.models(yAxis);

            selection.each(function (data) {
                var container = d3.select(this),
                    that = this;
                nv.utils.initSVG(container);
                var availableWidth = nv.utils.availableWidth(width, container, margin),
                    availableHeight = nv.utils.availableHeight(height, container, margin);

                chart.update = function () {
                    if (duration === 0)
                        container.call(chart);
                    else
                        container.transition().duration(duration).call(chart)
                };
                chart.container = this;

                state
                    .setter(stateSetter(data), chart.update)
                    .getter(stateGetter(data))
                    .update();

                // DEPRECATED set state.disableddisabled
                state.disabled = data.map(function (d) {
                    return !!d.disabled
                });

                if (!defaultState) {
                    var key;
                    defaultState = {};
                    for (key in state) {
                        if (state[key] instanceof Array)
                            defaultState[key] = state[key].slice(0);
                        else
                            defaultState[key] = state[key];
                    }
                }

                // Display noData message if there's nothing to show.
                if (!data || !data.length || !data.filter(function (d) {
                        return d.values.length
                    }).length) {
                    nv.utils.noData(chart, container)
                    return chart;
                } else {
                    container.selectAll('.nv-noData').remove();
                }


                // Setup Scales
                x = lines.xScale();
                y = lines.yScale();

                // Setup containers and skeleton of chart
                var wrap = container.selectAll('g.nv-wrap.nv-lineChart').data([data]);
                var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-lineChart').append('g');
                var g = wrap.select('g');

                gEnter.append("rect").style("opacity", 0);
                gEnter.append('g').attr('class', 'nv-x nv-axis');
                gEnter.append('g').attr('class', 'nv-y nv-axis');
                gEnter.append('g').attr('class', 'nv-linesWrap');
                gEnter.append('g').attr('class', 'nv-legendWrap');
                gEnter.append('g').attr('class', 'nv-interactive');

                g.select("rect")
                    .attr("width", availableWidth)
                    .attr("height", (availableHeight > 0) ? availableHeight : 0);

                // Legend
                if (showLegend) {
                    legend.width(availableWidth);

                    g.select('.nv-legendWrap')
                        .datum(data)
                        .call(legend);

                    if (margin.top != legend.height()) {
                        margin.top = legend.height();
                        availableHeight = nv.utils.availableHeight(height, container, margin);
                    }

                    wrap.select('.nv-legendWrap')
                        .attr('transform', 'translate(0,' + (-margin.top) + ')')
                }

                wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                if (rightAlignYAxis) {
                    g.select(".nv-y.nv-axis")
                        .attr("transform", "translate(" + availableWidth + ",0)");
                }

                //Set up interactive layer
                if (useInteractiveGuideline) {
                    interactiveLayer
                        .width(availableWidth)
                        .height(availableHeight)
                        .margin({left: margin.left, top: margin.top})
                        .svgContainer(container)
                        .xScale(x);
                    wrap.select(".nv-interactive").call(interactiveLayer);
                }

                lines
                    .width(availableWidth)
                    .height(availableHeight)
                    .color(data.map(function (d, i) {
                        return d.color || color(d, i);
                    }).filter(function (d, i) {
                        return !data[i].disabled
                    }));


                var linesWrap = g.select('.nv-linesWrap')
                    .datum(data.filter(function (d) {
                        return !d.disabled
                    }));

                linesWrap.call(lines);

                // Setup Axes
                if (showXAxis) {
                    xAxis
                        .scale(x)
                        ._ticks(nv.utils.calcTicksX(availableWidth / 100, data))
                        .tickSize(-availableHeight, 0);

                    g.select('.nv-x.nv-axis')
                        .attr('transform', 'translate(0,' + y.range()[0] + ')');
                    g.select('.nv-x.nv-axis')
                        .call(xAxis);
                }

                if (showYAxis) {
                    yAxis
                        .scale(y)
                        ._ticks(nv.utils.calcTicksY(availableHeight / 36, data))
                        .tickSize(-availableWidth, 0);

                    g.select('.nv-y.nv-axis')
                        .call(yAxis);
                }

                //============================================================
                // Event Handling/Dispatching (in chart's scope)
                //------------------------------------------------------------

                legend.dispatch.on('stateChange', function (newState) {
                    for (var key in newState)
                        state[key] = newState[key];
                    dispatch.stateChange(state);
                    chart.update();
                });

                interactiveLayer.dispatch.on('elementMousemove', function (e) {
                    lines.clearHighlights();
                    var singlePoint, pointIndex, pointXLocation, allData = [];
                    data
                        .filter(function (series, i) {
                            series.seriesIndex = i;
                            return !series.disabled;
                        })
                        .forEach(function (series, i) {
                            pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.x());
                            lines.highlightPoint(i, pointIndex, true);
                            var point = series.values[pointIndex];
                            if (point === undefined) return;
                            if (singlePoint === undefined) singlePoint = point;
                            if (pointXLocation === undefined) pointXLocation = chart.xScale()(chart.x()(point, pointIndex));
                            allData.push({
                                key: series.key,
                                value: chart.y()(point, pointIndex),
                                color: color(series, series.seriesIndex)
                            });
                        });
                    //Highlight the tooltip entry based on which point the mouse is closest to.
                    if (allData.length > 2) {
                        var yValue = chart.yScale().invert(e.mouseY);
                        var domainExtent = Math.abs(chart.yScale().domain()[0] - chart.yScale().domain()[1]);
                        var threshold = 0.03 * domainExtent;
                        var indexToHighlight = nv.nearestValueIndex(allData.map(function (d) {
                            return d.value
                        }), yValue, threshold);
                        if (indexToHighlight !== null)
                            allData[indexToHighlight].highlight = true;
                    }

                    var xValue = xAxis.tickFormat()(chart.x()(singlePoint, pointIndex));
                    interactiveLayer.tooltip
                        .position({left: e.mouseX + margin.left, top: e.mouseY + margin.top})
                        .chartContainer(that.parentNode)
                        .valueFormatter(function (d, i) {
                            return yAxis.tickFormat()(d);
                        })
                        .data({
                            value: xValue,
                            series: allData
                        })();

                    interactiveLayer.renderGuideLine(pointXLocation);

                });

                interactiveLayer.dispatch.on('elementClick', function (e) {
                    var pointXLocation, allData = [];

                    data.filter(function (series, i) {
                        series.seriesIndex = i;
                        return !series.disabled;
                    }).forEach(function (series) {
                        var pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.x());
                        var point = series.values[pointIndex];
                        if (typeof point === 'undefined') return;
                        if (typeof pointXLocation === 'undefined') pointXLocation = chart.xScale()(chart.x()(point, pointIndex));
                        var yPos = chart.yScale()(chart.y()(point, pointIndex));
                        allData.push({
                            point: point,
                            pointIndex: pointIndex,
                            pos: [pointXLocation, yPos],
                            seriesIndex: series.seriesIndex,
                            series: series
                        });
                    });

                    lines.dispatch.elementClick(allData);
                });

                interactiveLayer.dispatch.on("elementMouseout", function (e) {
                    lines.clearHighlights();
                });

                dispatch.on('changeState', function (e) {
                    if (typeof e.disabled !== 'undefined' && data.length === e.disabled.length) {
                        data.forEach(function (series, i) {
                            series.disabled = e.disabled[i];
                        });

                        state.disabled = e.disabled;
                    }

                    chart.update();
                });

            });

            renderWatch.renderEnd('lineChart immediate');
            return chart;
        }

        //============================================================
        // Event Handling/Dispatching (out of chart's scope)
        //------------------------------------------------------------

        lines.dispatch.on('elementMouseover.tooltip', function (evt) {
            tooltip.data(evt).position(evt.pos).hidden(false);
        });

        lines.dispatch.on('elementMouseout.tooltip', function (evt) {
            tooltip.hidden(true)
        });

        //============================================================
        // Expose Public Variables
        //------------------------------------------------------------

        // expose chart's sub-components
        chart.dispatch = dispatch;
        chart.lines = lines;
        chart.legend = legend;
        chart.xAxis = xAxis;
        chart.yAxis = yAxis;
        chart.interactiveLayer = interactiveLayer;
        chart.tooltip = tooltip;

        chart.dispatch = dispatch;
        chart.options = nv.utils.optionsFunc.bind(chart);

        chart._options = Object.create({}, {
            // simple options, just get/set the necessary values
            width: {
                get: function () {
                    return width;
                }, set: function (_) {
                    width = _;
                }
            },
            height: {
                get: function () {
                    return height;
                }, set: function (_) {
                    height = _;
                }
            },
            showLegend: {
                get: function () {
                    return showLegend;
                }, set: function (_) {
                    showLegend = _;
                }
            },
            showXAxis: {
                get: function () {
                    return showXAxis;
                }, set: function (_) {
                    showXAxis = _;
                }
            },
            showYAxis: {
                get: function () {
                    return showYAxis;
                }, set: function (_) {
                    showYAxis = _;
                }
            },
            defaultState: {
                get: function () {
                    return defaultState;
                }, set: function (_) {
                    defaultState = _;
                }
            },
            noData: {
                get: function () {
                    return noData;
                }, set: function (_) {
                    noData = _;
                }
            },

            // deprecated options
            tooltips: {
                get: function () {
                    return tooltip.enabled();
                }, set: function (_) {
                    // deprecated after 1.7.1
                    nv.deprecated('tooltips', 'use chart.tooltip.enabled() instead');
                    tooltip.enabled(!!_);
                }
            },
            tooltipContent: {
                get: function () {
                    return tooltip.contentGenerator();
                }, set: function (_) {
                    // deprecated after 1.7.1
                    nv.deprecated('tooltipContent', 'use chart.tooltip.contentGenerator() instead');
                    tooltip.contentGenerator(_);
                }
            },

            // options that require extra logic in the setter
            margin: {
                get: function () {
                    return margin;
                }, set: function (_) {
                    margin.top = _.top !== undefined ? _.top : margin.top;
                    margin.right = _.right !== undefined ? _.right : margin.right;
                    margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
                    margin.left = _.left !== undefined ? _.left : margin.left;
                }
            },
            duration: {
                get: function () {
                    return duration;
                }, set: function (_) {
                    duration = _;
                    renderWatch.reset(duration);
                    lines.duration(duration);
                    xAxis.duration(duration);
                    yAxis.duration(duration);
                }
            },
            color: {
                get: function () {
                    return color;
                }, set: function (_) {
                    color = nv.utils.getColor(_);
                    legend.color(color);
                    lines.color(color);
                }
            },
            rightAlignYAxis: {
                get: function () {
                    return rightAlignYAxis;
                }, set: function (_) {
                    rightAlignYAxis = _;
                    yAxis.orient(rightAlignYAxis ? 'right' : 'left');
                }
            },
            useInteractiveGuideline: {
                get: function () {
                    return useInteractiveGuideline;
                }, set: function (_) {
                    useInteractiveGuideline = _;
                    if (useInteractiveGuideline) {
                        lines.interactive(false);
                        lines.useVoronoi(false);
                    }
                }
            }
        });

        nv.utils.inheritOptions(chart, lines);
        nv.utils.initOptions(chart);

        return chart;
    };
    nv.models.scatter = function () {
        "use strict";

        //============================================================
        // Public Variables with Default Settings
        //------------------------------------------------------------

        var margin = {top: 0, right: 0, bottom: 0, left: 0}
            , width = null
            , height = null
            , color = nv.utils.defaultColor() // chooses color
            , id = Math.floor(Math.random() * 100000) //Create semi-unique ID incase user doesn't select one
            , x = d3.scale.linear()
            , y = d3.scale.linear()
            , z = d3.scale.linear() //linear because d3.svg.shape.size is treated as area
            , getX = function (d) {
                return d.x
            } // accessor to get the x value
            , getY = function (d) {
                return d.y
            } // accessor to get the y value
            , getSize = function (d) {
                return d.size || 1
            } // accessor to get the point size
            , getShape = function (d) {
                return d.shape || 'circle'
            } // accessor to get point shape
            , forceX = [] // List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
            , forceY = [] // List of numbers to Force into the Y scale
            , forceSize = [] // List of numbers to Force into the Size scale
            , interactive = true // If true, plots a voronoi overlay for advanced point intersection
            , pointActive = function (d) {
                return !d.notActive
            } // any points that return false will be filtered out
            , padData = false // If true, adds half a data points width to front and back, for lining up a line chart with a bar chart
            , padDataOuter = .1 //outerPadding to imitate ordinal scale outer padding
            , clipEdge = false // if true, masks points within x and y scale
            , clipVoronoi = true // if true, masks each point with a circle... can turn off to slightly increase performance
            , showVoronoi = false // display the voronoi areas
            , clipRadius = function () {
                return 25
            } // function to get the radius for voronoi point clips
            , xDomain = null // Override x domain (skips the calculation from data)
            , yDomain = null // Override y domain
            , xRange = null // Override x range
            , yRange = null // Override y range
            , sizeDomain = null // Override point size domain
            , sizeRange = null
            , singlePoint = false
            , dispatch = d3.dispatch('elementClick', 'elementDblClick', 'elementMouseover', 'elementMouseout', 'renderEnd')
            , useVoronoi = true
            , duration = 250
            ;


        //============================================================
        // Private Variables
        //------------------------------------------------------------

        var x0, y0, z0 // used to store previous scales
            , timeoutID
            , needsUpdate = false // Flag for when the points are visually updating, but the interactive layer is behind, to disable tooltips
            , renderWatch = nv.utils.renderWatch(dispatch, duration)
            , _sizeRange_def = [16, 256]
            ;

        function chart(selection) {
            renderWatch.reset();
            selection.each(function (data) {
                var container = d3.select(this);
                var availableWidth = nv.utils.availableWidth(width, container, margin),
                    availableHeight = nv.utils.availableHeight(height, container, margin);

                nv.utils.initSVG(container);

                //add series index to each data point for reference
                data.forEach(function (series, i) {
                    series.values.forEach(function (point) {
                        point.series = i;
                    });
                });

                // Setup Scales
                // remap and flatten the data for use in calculating the scales' domains
                var seriesData = (xDomain && yDomain && sizeDomain) ? [] : // if we know xDomain and yDomain and sizeDomain, no need to calculate.... if Size is constant remember to set sizeDomain to speed up performance
                    d3.merge(
                        data.map(function (d) {
                            return d.values.map(function (d, i) {
                                return {x: getX(d, i), y: getY(d, i), size: getSize(d, i)}
                            })
                        })
                    );

                x.domain(xDomain || d3.extent(seriesData.map(function (d) {
                        return d.x;
                    }).concat(forceX)))

                if (padData && data[0])
                    x.range(xRange || [(availableWidth * padDataOuter + availableWidth) / (2 * data[0].values.length), availableWidth - availableWidth * (1 + padDataOuter) / (2 * data[0].values.length)]);
                //x.range([availableWidth * .5 / data[0].values.length, availableWidth * (data[0].values.length - .5)  / data[0].values.length ]);
                else
                    x.range(xRange || [0, availableWidth]);

                y.domain(yDomain || d3.extent(seriesData.map(function (d) {
                        return d.y
                    }).concat(forceY)))
                    .range(yRange || [availableHeight, 0]);

                z.domain(sizeDomain || d3.extent(seriesData.map(function (d) {
                        return d.size
                    }).concat(forceSize)))
                    .range(sizeRange || _sizeRange_def);

                // If scale's domain don't have a range, slightly adjust to make one... so a chart can show a single data point
                singlePoint = x.domain()[0] === x.domain()[1] || y.domain()[0] === y.domain()[1];

                if (x.domain()[0] === x.domain()[1])
                    x.domain()[0] ?
                        x.domain([x.domain()[0] - x.domain()[0] * 0.01, x.domain()[1] + x.domain()[1] * 0.01])
                        : x.domain([-1, 1]);

                if (y.domain()[0] === y.domain()[1])
                    y.domain()[0] ?
                        y.domain([y.domain()[0] - y.domain()[0] * 0.01, y.domain()[1] + y.domain()[1] * 0.01])
                        : y.domain([-1, 1]);

                if (isNaN(x.domain()[0])) {
                    x.domain([-1, 1]);
                }

                if (isNaN(y.domain()[0])) {
                    y.domain([-1, 1]);
                }

                x0 = x0 || x;
                y0 = y0 || y;
                z0 = z0 || z;

                // Setup containers and skeleton of chart
                var wrap = container.selectAll('g.nv-wrap.nv-scatter').data([data]);
                var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-scatter nv-chart-' + id);
                var defsEnter = wrapEnter.append('defs');
                var gEnter = wrapEnter.append('g');
                var g = wrap.select('g');

                wrap.classed('nv-single-point', singlePoint);
                gEnter.append('g').attr('class', 'nv-groups');
                gEnter.append('g').attr('class', 'nv-point-paths');

                wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                defsEnter.append('clipPath')
                    .attr('id', 'nv-edge-clip-' + id)
                    .append('rect');

                wrap.select('#nv-edge-clip-' + id + ' rect')
                    .attr('width', availableWidth)
                    .attr('height', (availableHeight > 0) ? availableHeight : 0);

                g.attr('clip-path', clipEdge ? 'url(#nv-edge-clip-' + id + ')' : '');

                function updateInteractiveLayer() {
                    needsUpdate = false;

                    if (!interactive) return false;

                    var vertices = d3.merge(data.map(function (group, groupIndex) {
                            return group.values
                                .map(function (point, pointIndex) {
                                    // *Adding noise to make duplicates very unlikely
                                    // *Injecting series and point index for reference
                                    /* *Adding a 'jitter' to the points, because there's an issue in d3.geom.voronoi.
                                     */
                                    var pX = getX(point, pointIndex);
                                    var pY = getY(point, pointIndex);

                                    return [x(pX) + Math.random() * 1e-4,
                                        y(pY) + Math.random() * 1e-4,
                                        groupIndex,
                                        pointIndex, point]; //temp hack to add noise until I think of a better way so there are no duplicates
                                })
                                .filter(function (pointArray, pointIndex) {
                                    return pointActive(pointArray[4], pointIndex); // Issue #237.. move filter to after map, so pointIndex is correct!
                                })
                        })
                    );

                    // inject series and point index for reference into voronoi
                    if (useVoronoi === true) {

                        if (vertices.length == 0) return false;  // No active points, we're done
                        if (vertices.length < 3) {
                            // Issue #283 - Adding 2 dummy points to the voronoi b/c voronoi requires min 3 points to work
                            vertices.push([x.range()[0] - 20, y.range()[0] - 20, null, null]);
                            vertices.push([x.range()[1] + 20, y.range()[1] + 20, null, null]);
                            vertices.push([x.range()[0] - 20, y.range()[0] + 20, null, null]);
                            vertices.push([x.range()[1] + 20, y.range()[1] - 20, null, null]);
                        }

                        // keep voronoi sections from going more than 10 outside of graph
                        // to avoid overlap with other things like legend etc
                        var bounds = d3.geom.polygon([
                            [-10, -10],
                            [-10, height + 10],
                            [width + 10, height + 10],
                            [width + 10, -10]
                        ]);

                        var voronoi = d3.geom.voronoi(vertices).map(function (d, i) {
                            return {
                                'data': bounds.clip(d),
                                'series': vertices[i][2],
                                'point': vertices[i][3]
                            }
                        });

                        // nuke all voronoi paths on reload and recreate them
                        wrap.select('.nv-point-paths').selectAll('path').remove();
                        var pointPaths = wrap.select('.nv-point-paths').selectAll('path').data(voronoi);
                        var vPointPaths = pointPaths
                                .enter().append("svg:path")
                                .attr("d", function (d) {
                                    if (!d || !d.data || d.data.length === 0)
                                        return 'M 0 0';
                                    else
                                        return "M" + d.data.join(",") + "Z";
                                })
                                .attr("id", function (d, i) {
                                    return "nv-path-" + i;
                                })
                                .attr("clip-path", function (d, i) {
                                    return "url(#nv-clip-" + i + ")";
                                })
                            ;

                        // good for debugging point hover issues
                        if (showVoronoi) {
                            vPointPaths.style("fill", d3.rgb(230, 230, 230))
                                .style('fill-opacity', 0.4)
                                .style('stroke-opacity', 1)
                                .style("stroke", d3.rgb(200, 200, 200));
                        }

                        if (clipVoronoi) {
                            // voronoi sections are already set to clip,
                            // just create the circles with the IDs they expect
                            wrap.select('#nv-point-clips').remove();
                            var clips = wrap.append("svg:g").attr("id", "nv-point-clips");
                            clips.selectAll("clipPath")
                                .data(vertices)
                                .enter().append("svg:clipPath")
                                .attr("id", function (d, i) {
                                    return "nv-clip-" + i;
                                })
                                .append("svg:circle")
                                .attr('cx', function (d) {
                                    return d[0];
                                })
                                .attr('cy', function (d) {
                                    return d[1];
                                })
                                .attr('r', clipRadius);
                        }

                        var mouseEventCallback = function (d, mDispatch) {
                            if (needsUpdate) return 0;
                            var series = data[d.series];
                            if (series === undefined) return;
                            var point = series.values[d.point];
                            point['color'] = color(series, d.series);

                            // standardize attributes for tooltip.
                            point['x'] = getX(point);
                            point['y'] = getY(point);

                            // can't just get box of event node since it's actually a voronoi polygon
                            var box = container.node().getBoundingClientRect();
                            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                            var pos = {
                                left: x(getX(point, d.point)) + box.left + scrollLeft + margin.left + 10,
                                top: y(getY(point, d.point)) + box.top + scrollTop + margin.top + 10
                            };

                            mDispatch({
                                point: point,
                                series: series,
                                pos: pos,
                                seriesIndex: d.series,
                                pointIndex: d.point
                            });
                        };

                        pointPaths
                            .on('click', function (d) {
                                mouseEventCallback(d, dispatch.elementClick);
                            })
                            .on('dblclick', function (d) {
                                mouseEventCallback(d, dispatch.elementDblClick);
                            })
                            .on('mouseover', function (d) {
                                mouseEventCallback(d, dispatch.elementMouseover);
                            })
                            .on('mouseout', function (d, i) {
                                mouseEventCallback(d, dispatch.elementMouseout);
                            });

                    } else {
                        /*
                         // bring data in form needed for click handlers
                         var dataWithPoints = vertices.map(function(d, i) {
                         return {
                         'data': d,
                         'series': vertices[i][2],
                         'point': vertices[i][3]
                         }
                         });
                         */

                        // add event handlers to points instead voronoi paths
                        wrap.select('.nv-groups').selectAll('.nv-group')
                            .selectAll('.nv-point')
                            //.data(dataWithPoints)
                            //.style('pointer-events', 'auto') // recativate events, disabled by css
                            .on('click', function (d, i) {
                                //nv.log('test', d, i);
                                if (needsUpdate || !data[d.series]) return 0; //check if this is a dummy point
                                var series = data[d.series],
                                    point = series.values[i];

                                dispatch.elementClick({
                                    point: point,
                                    series: series,
                                    pos: [x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top],
                                    seriesIndex: d.series,
                                    pointIndex: i
                                });
                            })
                            .on('dblclick', function (d, i) {
                                if (needsUpdate || !data[d.series]) return 0; //check if this is a dummy point
                                var series = data[d.series],
                                    point = series.values[i];

                                dispatch.elementDblClick({
                                    point: point,
                                    series: series,
                                    pos: [x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top],
                                    seriesIndex: d.series,
                                    pointIndex: i
                                });
                            })
                            .on('mouseover', function (d, i) {
                                if (needsUpdate || !data[d.series]) return 0; //check if this is a dummy point
                                var series = data[d.series],
                                    point = series.values[i];

                                dispatch.elementMouseover({
                                    point: point,
                                    series: series,
                                    pos: [x(getX(point, i)) + margin.left, y(getY(point, i)) + margin.top],
                                    seriesIndex: d.series,
                                    pointIndex: i,
                                    color: color(d, i)
                                });
                            })
                            .on('mouseout', function (d, i) {
                                if (needsUpdate || !data[d.series]) return 0; //check if this is a dummy point
                                var series = data[d.series],
                                    point = series.values[i];

                                dispatch.elementMouseout({
                                    point: point,
                                    series: series,
                                    seriesIndex: d.series,
                                    pointIndex: i,
                                    color: color(d, i)
                                });
                            });
                    }
                }

                needsUpdate = true;
                var groups = wrap.select('.nv-groups').selectAll('.nv-group')
                    .data(function (d) {
                        return d
                    }, function (d) {
                        return d.key
                    });
                groups.enter().append('g')
                    .style('stroke-opacity', 1e-6)
                    .style('fill-opacity', 1e-6);
                groups.exit()
                    .remove();
                groups
                    .attr('class', function (d, i) {
                        return 'nv-group nv-series-' + i
                    })
                    .classed('hover', function (d) {
                        return d.hover
                    });
                groups.watchTransition(renderWatch, 'scatter: groups')
                    .style('fill', function (d, i) {
                        return color(d, i)
                    })
                    .style('stroke', function (d, i) {
                        return color(d, i)
                    })
                    .style('stroke-opacity', 1)
                    .style('fill-opacity', .5);

                // create the points, maintaining their IDs from the original data set
                var points = groups.selectAll('path.nv-point')
                    .data(function (d) {
                        return d.values.map(
                            function (point, pointIndex) {
                                return [point, pointIndex]
                            }).filter(
                            function (pointArray, pointIndex) {
                                return pointActive(pointArray[0], pointIndex)
                            })
                    });
                points.enter().append('path')
                    .style('fill', function (d) {
                        return d.color
                    })
                    .style('stroke', function (d) {
                        return d.color
                    })
                    .attr('transform', function (d) {
                        return 'translate(' + x0(getX(d[0], d[1])) + ',' + y0(getY(d[0], d[1])) + ')'
                    })
                    .attr('d',
                    nv.utils.symbol()
                        .type(function (d) {
                            return getShape(d[0]);
                        })
                        .size(function (d) {
                            return z(getSize(d[0], d[1]))
                        })
                );
                points.exit().remove();
                groups.exit().selectAll('path.nv-point')
                    .watchTransition(renderWatch, 'scatter exit')
                    .attr('transform', function (d) {
                        return 'translate(' + x(getX(d[0], d[1])) + ',' + y(getY(d[0], d[1])) + ')'
                    })
                    .remove();
                points.each(function (d) {
                    d3.select(this)
                        .classed('nv-point', true)
                        .classed('nv-point-' + d[1], true)
                        .classed('nv-noninteractive', !interactive)
                        .classed('hover', false)
                    ;
                });
                points
                    .watchTransition(renderWatch, 'scatter points')
                    .attr('transform', function (d) {
                        //nv.log(d, getX(d[0],d[1]), x(getX(d[0],d[1])));
                        return 'translate(' + x(getX(d[0], d[1])) + ',' + y(getY(d[0], d[1])) + ')'
                    })
                    .attr('d',
                    nv.utils.symbol()
                        .type(function (d) {
                            return getShape(d[0]);
                        })
                        .size(function (d) {
                            return z(getSize(d[0], d[1]))
                        })
                );

                // Delay updating the invisible interactive layer for smoother animation
                clearTimeout(timeoutID); // stop repeat calls to updateInteractiveLayer
                timeoutID = setTimeout(updateInteractiveLayer, 300);
                //updateInteractiveLayer();

                //store old scales for use in transitions on update
                x0 = x.copy();
                y0 = y.copy();
                z0 = z.copy();

            });
            renderWatch.renderEnd('scatter immediate');
            return chart;
        }

        //============================================================
        // Expose Public Variables
        //------------------------------------------------------------

        chart.dispatch = dispatch;
        chart.options = nv.utils.optionsFunc.bind(chart);

        // utility function calls provided by this chart
        chart._calls = new function () {
            this.clearHighlights = function () {
                nv.dom.write(function () {
                    d3.selectAll(".nv-chart-" + id + " .nv-point.hover").classed("hover", false);
                });
                return null;
            };
            this.highlightPoint = function (seriesIndex, pointIndex, isHoverOver) {
                nv.dom.write(function () {
                    var node = document.querySelector(".nv-chart-" + id + " .nv-series-" + seriesIndex + " .nv-point-" + pointIndex);
                    d3.select(node).classed("hover", isHoverOver);
                });
            };
        };

        // trigger calls from events too
        dispatch.on('elementMouseover.point', function (d) {
            if (interactive) chart._calls.highlightPoint(d.seriesIndex, d.pointIndex, true);
        });

        dispatch.on('elementMouseout.point', function (d) {
            if (interactive) chart._calls.highlightPoint(d.seriesIndex, d.pointIndex, false);
        });

        chart._options = Object.create({}, {
            // simple options, just get/set the necessary values
            width: {
                get: function () {
                    return width;
                }, set: function (_) {
                    width = _;
                }
            },
            height: {
                get: function () {
                    return height;
                }, set: function (_) {
                    height = _;
                }
            },
            xScale: {
                get: function () {
                    return x;
                }, set: function (_) {
                    x = _;
                }
            },
            yScale: {
                get: function () {
                    return y;
                }, set: function (_) {
                    y = _;
                }
            },
            pointScale: {
                get: function () {
                    return z;
                }, set: function (_) {
                    z = _;
                }
            },
            xDomain: {
                get: function () {
                    return xDomain;
                }, set: function (_) {
                    xDomain = _;
                }
            },
            yDomain: {
                get: function () {
                    return yDomain;
                }, set: function (_) {
                    yDomain = _;
                }
            },
            pointDomain: {
                get: function () {
                    return sizeDomain;
                }, set: function (_) {
                    sizeDomain = _;
                }
            },
            xRange: {
                get: function () {
                    return xRange;
                }, set: function (_) {
                    xRange = _;
                }
            },
            yRange: {
                get: function () {
                    return yRange;
                }, set: function (_) {
                    yRange = _;
                }
            },
            pointRange: {
                get: function () {
                    return sizeRange;
                }, set: function (_) {
                    sizeRange = _;
                }
            },
            forceX: {
                get: function () {
                    return forceX;
                }, set: function (_) {
                    forceX = _;
                }
            },
            forceY: {
                get: function () {
                    return forceY;
                }, set: function (_) {
                    forceY = _;
                }
            },
            forcePoint: {
                get: function () {
                    return forceSize;
                }, set: function (_) {
                    forceSize = _;
                }
            },
            interactive: {
                get: function () {
                    return interactive;
                }, set: function (_) {
                    interactive = _;
                }
            },
            pointActive: {
                get: function () {
                    return pointActive;
                }, set: function (_) {
                    pointActive = _;
                }
            },
            padDataOuter: {
                get: function () {
                    return padDataOuter;
                }, set: function (_) {
                    padDataOuter = _;
                }
            },
            padData: {
                get: function () {
                    return padData;
                }, set: function (_) {
                    padData = _;
                }
            },
            clipEdge: {
                get: function () {
                    return clipEdge;
                }, set: function (_) {
                    clipEdge = _;
                }
            },
            clipVoronoi: {
                get: function () {
                    return clipVoronoi;
                }, set: function (_) {
                    clipVoronoi = _;
                }
            },
            clipRadius: {
                get: function () {
                    return clipRadius;
                }, set: function (_) {
                    clipRadius = _;
                }
            },
            showVoronoi: {
                get: function () {
                    return showVoronoi;
                }, set: function (_) {
                    showVoronoi = _;
                }
            },
            id: {
                get: function () {
                    return id;
                }, set: function (_) {
                    id = _;
                }
            },


            // simple functor options
            x: {
                get: function () {
                    return getX;
                }, set: function (_) {
                    getX = d3.functor(_);
                }
            },
            y: {
                get: function () {
                    return getY;
                }, set: function (_) {
                    getY = d3.functor(_);
                }
            },
            pointSize: {
                get: function () {
                    return getSize;
                }, set: function (_) {
                    getSize = d3.functor(_);
                }
            },
            pointShape: {
                get: function () {
                    return getShape;
                }, set: function (_) {
                    getShape = d3.functor(_);
                }
            },

            // options that require extra logic in the setter
            margin: {
                get: function () {
                    return margin;
                }, set: function (_) {
                    margin.top = _.top !== undefined ? _.top : margin.top;
                    margin.right = _.right !== undefined ? _.right : margin.right;
                    margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
                    margin.left = _.left !== undefined ? _.left : margin.left;
                }
            },
            duration: {
                get: function () {
                    return duration;
                }, set: function (_) {
                    duration = _;
                    renderWatch.reset(duration);
                }
            },
            color: {
                get: function () {
                    return color;
                }, set: function (_) {
                    color = nv.utils.getColor(_);
                }
            },
            useVoronoi: {
                get: function () {
                    return useVoronoi;
                }, set: function (_) {
                    useVoronoi = _;
                    if (useVoronoi === false) {
                        clipVoronoi = false;
                    }
                }
            }
        });

        nv.utils.initOptions(chart);
        return chart;
    };

    nv.version = "1.8.1";
})();