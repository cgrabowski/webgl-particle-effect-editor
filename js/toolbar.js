/* div.toolbar-tainer contains the div.toolbar-header and div.toolbar.
 * div.toolbar contains all of the div.setting-tainers.
 * div.toolbar contains the jQuery data.
 */

var PEE = PEE || {};

PEE.toolbar = (function ($, window, undefined) {
    var toolbarStack = [];

    // toolbar builder
    return function toolbar (emitter, tbOpts, master) {
        var tbTainer = $('<div>').addClass('toolbar-tainer'),
            tb = $('<div>').addClass('toolbar');

        tbTainer.prependTo('#container');

        tb.prependTo(tbTainer)
            .css({
            position: 'absolute',
            right: '0px',
            top: $('header').height()
        });

        if (master) {
            tb.data('master', true);
        }

        tb.data('emitter', emitter);
        tb.data('name', (tb.data('master')) ? 'master' : emitter.emitterName);
        tb.data('tbOpts', tbOpts);

        tbTainer.draggable({snap: '#header, #container, .toolbar-tainer'});

        // toolbar z-indexes are a first-in, last-out stack;
        tbTainer.mousedown(function (event) {
            var self = this;

            toolbarStack.forEach(function (val, index, array) {
                if (toolbarStack[index] === self) {
                    toolbarStack.splice(index, 1);
                } else {
                    $(toolbarStack[index]).css('z-index', $(toolbarStack[index]).css('z-index') - 1);
                }
            });

            $(this).css('z-index', 100);
            toolbarStack.unshift(this);
            if (toolbarStack.length > $('.toolbar-tainer').length) {
                toolbarStack.pop();
            }
            // prevent world transforms when interacting with toolbar
            return false;
        });

        tbTainer.resizable({
            handles: 's, e, w',
            minWidth: 175,
            start: function (event, ui) {
                window.dispatchEvent(new CustomEvent('pause'));
            },
            stop: function (event, ui) {
                window.dispatchEvent(new CustomEvent('resume'));
            },
            resize: function (event, ui) {
                var $element = $(ui.element),
                    $tbHeader = $element.find('.toolbar-header');

                $tbHeader.width(tbTainer.width() - 3);
                $element.find('.toolbar')
                    .height($element.height() - $tbHeader.height())
                    .mCustomScrollbar('update');
            }});

        var tbHeader = $('<div class="toolbar-header">')
            .text((master) ? "master" : emitter.emitterName)
            .prependTo(tbTainer);

        $('<a href="" class="close"><img src="images/gui-close-grey.png"></a>')
            .appendTo(tbHeader)

            .click(function (event) {
            var tbTainer = $(this).closest('.toolbar-tainer');

            tbTainer.css('visibility', 'hidden');
            tbTainer.find('.setting-tainer').css('visibility', 'hidden');

            $('.tb-select').each(function (index, element) {
                var paraNodes = $(element).closest('.options-menu-p')[0].childNodes,
                    paraText;

                for (var i = 0; i < paraNodes.length; i++) {
                    if (paraNodes[i].nodeName === '#text') {
                        paraText = paraNodes[i].nodeValue;
                        break;
                    }
                }

                if (paraText === tbTainer.find('.toolbar-header').text()) {
                    $(element).val('hide').click();
                }
            });

            return false;
        });

        $('<a href="" class="up"><img src="images/gui-up-grey.png">')
            .appendTo(tbHeader)

            .click(function (event) {
            var $this = $(this),
                $tbTainer = $this.closest('.toolbar-tainer'),
                $tb = $tbTainer.find('.toolbar');

            $tbTainer.resizable('disable');
            $tb.find('.setting-tainer').add($tb).add($tbTainer)
                .css('visibility', 'hidden');
            $tbTainer.find('.toolbar-header').css('visibility', 'visible');
            $this.siblings('.down').css('display', 'block');
            $this.css('display', 'none');
            return false;
        });

        $('<a href="" style="display: none" class="down"><img src="images/gui-down-grey.png"></a>')
            .appendTo(tbHeader)

            .click(function (event) {
            var $this = $(this),
                $tbTainer = $this.closest('.toolbar-tainer').first(),
                $tb = $tbTainer.find('.toolbar');

            $tb.find('.setting-tainer').add($tb).add($tbTainer)
                .css('visibility', 'visible');
            $this.siblings('.up').css('display', 'block');
            $this.css('display', 'none');
            $tbTainer.resizable('enable');
            $tb.mCustomScrollbar('update');
            return false;
        });

        for (var opt in tbOpts) {
            if (opt.match("emitterName")) {
                continue;
            }
            PEE.setting(tb, opt, tbOpts[opt], master);
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

        tbTainer.find('.toolbar-header').width(tbTainer.width() - 3);
        tbTainer.find('.mCSB_draggerContainer').css('top', '10px');
        tbTainer.css('top', tbHeader.height() + 4);

        tb.find('.setting-tainer').last().css('padding-bottom', '12px');
        tb.css('height', tbTainer.height() - tbHeader.height());

        if (!master) {
            tbTainer.css('visibility', 'hidden');
        }
    }

}(jQuery, window));
