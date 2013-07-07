var PEE = PEE || {};

PEE.toolbar = (function ($, window, undefined) {
    var toolbarStack = [];

    // toolbar builder
    return function toolbar (emitter, opts, master) {
        ;

        var tb = $('<div>');

        if (master) {
            tb.data('master', true);
        }
        tb.data('emitter', emitter);

        tb.draggable({snap: '#header, #container, .toolbar'})
            .addClass('toolbar')
            .prependTo('#container')
            .css({
            position: 'absolute',
            right: '0px',
            top: $('header').height()
        });

        if (master) {
            tb.css('left', '0px');
        }
        // toolbar z-indexes are a first-in, last-out stack;
        tb.mousedown(function (event) {
            var self = this;

            toolbarStack.forEach(function (val, ind, arr) {
                if (toolbarStack[ind] === self) {
                    toolbarStack.splice(ind, 1);
                } else {
                    $(toolbarStack[ind]).css('z-index', $(toolbarStack[ind]).css('z-index') - 1);
                }
            });

            $(this).css('z-index', 100);
            toolbarStack.unshift(this);
            if (toolbarStack.length > $('.toolbar').length) {
                toolbarStack.pop();
            }
            // prevent world transforms when interacting with toolbar
            return false;
        });

        $('<div class="toolbar-header">' + ((master) ? "master" : emitter.name) +
            '<a href="" class="close"><img src="images/gui-close-grey.png"></a>' +
            '<a href="" class="up"><img src="images/gui-up-grey.png">' +
            '<a href="" style="display: none" class="down"><img src="images/gui-down-grey.png"></a>' +
            '</div>').appendTo(tb);

        $('.up').click(function (event) {
            var $this = $(this),
                tb = $this.closest('.toolbar');
            tb.mCustomScrollbar('disable');
            tb.resizable('disable');
            tb.find('.setting-tainer, .up').css('display', 'none');
            tb.attr('data-height', tb.height());
            tb.css('height', '0px');
            $this.siblings('.down').css('display', 'block');
            return false;
        });

        $('.down').click(function (event) {
            try {
                var $this = $(this),
                    tb = $this.closest('.toolbar');
                console.log(tb.attr('data-height'));
                tb.height(tb.attr('data-height'));
                tb.removeAttr('data-height');
                tb.find('.setting-tainer, .up').css('display', 'block');
                $this.css('display', 'none');
                tb.resizable('enable');
                tb.mCustomScrollbar('update');
            } catch (e) {
                console.log(e.message);
            }
            return false;
        });

        $('.close').click(function (event) {
            $(this).closest(".toolbar").css('display', 'none');
            return false;
        });

        for (var opt in opts) {
            var min = null,
                max = null,
                minKey = null,
                maxKey = null,
                val = null;
            for (var key in opts[opt]) {
                if (key.match(/min/i)) {
                    min = opts[opt][key];
                    minKey = key;
                } else if (key.match(/max/i)) {
                    max = opts[opt][key];
                    maxKey = key;
                } else {
                    val = opts[opt][key];
                    key = [key];
                    break;
                }

                if (min && max) {
                    key = [minKey, maxKey];
                    break;
                }
            }

            PEE.setting(tb, min, max, key, val, opt, master);
        }

        // pressing enter closes an open limit input 
        $(window).on('keypress', function detectKey (event) {
            if (event.keyCode === 13) { // Enter
                $(window).off('keypress', detectKey);
                $('body').click();
            }
        });

        // add custom scrollbar and resizable plugins
        tb.mCustomScrollbar({
            advanced: {
                updateOnContentResize: true
            }
        });

        tb.find('.setting-tainer').first().css('padding-top', '24px');
        tb.find('.setting-tainer').last().css('padding-bottom', '12px');

        tb.resizable({
            handles: 's, e, w',
            minWidth: 175,
            resize: function (event, ui) {
                ui.element.find('.toolbar-header').width(tb.width() - 6);
                ui.element.mCustomScrollbar('update');
            }});

        tb.find('.toolbar-header').width(tb.width() - 6);
        tb.find('.mCSB_draggerContainer').css('top', '35px');
    }

}(jQuery, window));
