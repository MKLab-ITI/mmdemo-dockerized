var current_position = 0;
(function ($) {
    var aux = {
            // navigates left / right
            navigate: function (dir, $el, $wrapper, opts, cache) {

                var scroll = opts.scroll,
                    factor = 1,
                    idxClicked = 0;

                if (cache.expanded) {
                    scroll = 1; // scroll is always 1 in full mode
                    factor = 3; // the width of the expanded item will be 3 times bigger than 1 collapsed item
                    idxClicked = cache.idxClicked; // the index of the clicked item
                }

                // clone the elements on the right / left and append / prepend them according to dir and scroll
                if (dir === 1) {
                    $wrapper.find('div.ca-item:lt(' + scroll + ')').each(function (i) {
                        $(this).clone(true).css('left', ( cache.totalItems - idxClicked + i ) * cache.itemW * factor + 'px').appendTo($wrapper);
                    });
                }
                else {
                    var $first = $wrapper.children().eq(0);

                    $wrapper.find('div.ca-item:gt(' + ( cache.totalItems - 1 - scroll ) + ')').each(function (i) {
                        // insert before $first so they stay in the right order
                        $(this).clone(true).css('left', -( scroll - i + idxClicked ) * cache.itemW * factor + 'px').insertBefore($first);
                    });
                }

                // animate the left of each item
                // the calculations are dependent on dir and on the cache.expanded value
                $wrapper.find('div.ca-item').each(function (i) {
                    var $item = $(this);
                    $item.stop().animate({
                        left: ( dir === 1 ) ? '-=' + ( cache.itemW * factor * scroll ) + 'px' : '+=' + ( cache.itemW * factor * scroll ) + 'px'
                    }, opts.sliderSpeed, opts.sliderEasing, function () {
                        if (( dir === 1 && $item.position().left < -idxClicked * cache.itemW * factor ) || ( dir === -1 && $item.position().left > ( ( cache.totalItems - 1 - idxClicked ) * cache.itemW * factor ) )) {
                            // remove the item that was cloned
                            $item.remove();
                        }
                        cache.isAnimating = false;
                    });
                });

            },


            // gets the item's position (1, 2, or 3) on the viewport (the visible items)
            // val is the left of the item
            getWinPos: function (val, cache) {
                switch (val) {
                    case 0                    :
                        return 1;
                        break;
                    case cache.itemW        :
                        return 2;
                        break;
                    case cache.itemW * 2    :
                        return 3;
                        break;
                }
            }
        },
        methods = {
            init: function (options) {

                if (this.length) {

                    var settings = {
                        sliderSpeed: 500,			// speed for the sliding animation
                        sliderEasing: 'easeOutExpo',// easing for the sliding animation
                        itemSpeed: 500,			// speed for the item animation (open / close)
                        itemEasing: 'easeOutExpo',// easing for the item animation (open / close)
                        scroll: 1				// number of items to scroll at a time
                    };

                    return this.each(function () {

                        // if options exist, lets merge them with our default settings
                        if (options) {
                            $.extend(settings, options);
                        }

                        var $el = $(this),
                            $wrapper = $el.find('div.ca-wrapper'),
                            $items = $wrapper.children('div.ca-item'),
                            cache = {};

                        // save the with of one item
                        cache.itemW = $items.width();
                        // save the number of total items
                        cache.totalItems = $items.length;

                        // add navigation buttons
                        if (cache.totalItems > 1)
                            $el.prepend('<div class="ca-nav"><span class="ca-nav-prev">Previous</span><span class="ca-nav-next">Next</span></div>')

                        // control the scroll value
                        if (settings.scroll < 1)
                            settings.scroll = 1;
                        else if (settings.scroll > 3)
                            settings.scroll = 3;

                        var $navPrev = $el.find('span.ca-nav-prev'),
                            $navNext = $el.find('span.ca-nav-next');

                        // hide the items except the first 3
                        $wrapper.css('overflow', 'hidden');

                        // the items will have position absolute
                        // calculate the left of each item
                        $items.each(function (i) {
                            $(this).css({
                                position: 'absolute',
                                left: i * cache.itemW + 'px'
                            });
                        });
                        var $navigation_li = $('.ca-navigation ul li');
                        // navigate left
                        $navPrev.bind('click.contentcarousel', function (event) {
                            if (cache.isAnimating) return false;
                            $('.ca-active').removeClass('ca-active');
                            current_position--;
                            switch ($('.ca-container').width()) {
                                case 710:
                                    $navigation_li.eq(current_position % $navigation_li.length).addClass('ca-active');
                                    $navigation_li.eq((current_position + 1) % $navigation_li.length).addClass('ca-active');
                                    $navigation_li.eq((current_position + 2) % $navigation_li.length).addClass('ca-active');
                                    break;
                                case 470:
                                    $navigation_li.eq(current_position % $navigation_li.length).addClass('ca-active');
                                    $navigation_li.eq((current_position + 1) % $navigation_li.length).addClass('ca-active');
                                    break;
                                case 235:
                                    $navigation_li.eq(current_position % $navigation_li.length).addClass('ca-active');
                                    break;
                            }
                            current_position = current_position % $navigation_li.length;
                            cache.isAnimating = true;
                            aux.navigate(-1, $el, $wrapper, settings, cache);
                        });

                        // navigate right
                        $navNext.bind('click.contentcarousel', function (event) {
                            if (cache.isAnimating) return false;
                            $('.ca-active').removeClass('ca-active');
                            current_position++;
                            switch ($('.ca-container').width()) {
                                case 710:
                                    $navigation_li.eq(current_position % $navigation_li.length).addClass('ca-active');
                                    $navigation_li.eq((current_position + 1) % $navigation_li.length).addClass('ca-active');
                                    $navigation_li.eq((current_position + 2) % $navigation_li.length).addClass('ca-active');
                                    break;
                                case 470:
                                    $navigation_li.eq(current_position % $navigation_li.length).addClass('ca-active');
                                    $navigation_li.eq((current_position + 1) % $navigation_li.length).addClass('ca-active');
                                    break;
                                case 235:
                                    $navigation_li.eq(current_position % $navigation_li.length).addClass('ca-active');
                                    break;
                            }
                            current_position = current_position % $navigation_li.length;
                            cache.isAnimating = true;
                            aux.navigate(1, $el, $wrapper, settings, cache);
                        });
                    });
                }
            }
        };

    $.fn.contentcarousel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.contentcarousel');
        }
    };

})(jQuery);