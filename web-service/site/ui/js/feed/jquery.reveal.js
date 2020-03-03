(function ($) {

   
    $.fn.reveal = function () {


        var defaults = {
            animation: 'fadeAndPop',
            animationspeed: 300,
            closeonbackgroundclick: true,
            dismissmodalclass: 'close-reveal-modal' 
        };
        
        var options = $.extend({}, defaults, options);

        return this.each(function () {


            var modal = $(this),
                topMeasure = parseInt(modal.css('top')),
                topOffset = modal.height() + topMeasure,
                locked = false,
                modalBG = $('.reveal-modal-bg');


            if (modalBG.length == 0) {
                modalBG = $('<div class="reveal-modal-bg" />').insertAfter(modal);
            }



            modal.bind('reveal:open', function () {
                modalBG.unbind('click.modalEvent');
                $('.' + options.dismissmodalclass).unbind('click.modalEvent');
                if (!locked) {
                    lockModal();                    
                        modal.css({
                            'top': $(document).scrollTop() - topOffset,
                            'opacity': 0,
                            'visibility': 'visible'
                        });
                        modalBG.fadeIn(options.animationspeed / 2);
                        modal.delay(options.animationspeed / 2).animate({
                            "top": $(document).scrollTop() + topMeasure + 'px',
                                "opacity": 1
                        }, options.animationspeed, unlockModal());                                     
                }
                modal.unbind('reveal:open');
            });


            modal.bind('reveal:close', function () {

                if (!locked) {
                    lockModal();                   
                        modalBG.delay(options.animationspeed).fadeOut(options.animationspeed);
                        modal.animate({
                            "top": $(document).scrollTop() - topOffset + 'px',
                                "opacity": 0
                        }, options.animationspeed / 2, function () {
                            modal.css({
                                'top': topMeasure,
                                'opacity': 1,
                                'visibility': 'hidden'
                            });
                            unlockModal();
                        });  
                }
                modal.unbind('reveal:close');
            });


            modal.trigger('reveal:open')


            var closeButton = $('.' + options.dismissmodalclass).bind('click.modalEvent', function () {
                modal.trigger('reveal:close')
            });

            if (options.closeonbackgroundclick) {
                modalBG.bind('click.modalEvent', function () {
                    modal.trigger('reveal:close')
                });
            }
            $('body').keyup(function (e) {
                if (e.which === 27) {
                    modal.trigger('reveal:close');
                } 
            });

            function unlockModal() {
                locked = false;
            }

            function lockModal() {
                locked = true;
            }

        });
    }
})(jQuery);