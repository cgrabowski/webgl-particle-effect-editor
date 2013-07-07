var PEE = PEE || {};

$(window).on('PEE-loaded', function (event) {
    PEE.gui();
});

PEE.gui = (function ($, window, undefined) {
    var effect,
        emitters,
        guiOpts,
        engineCallback;

    return function () {

        $(document).ready(function () {
// If an error occured during last unload, log it;
            if (localStorage.getItem('unloaderror')) {
                console.log('unload error: ' + localStorage.getItem('unloaderror'));
            }
            /*
             // Get opts saved in local storage
             var opts = localStorage.getItem('opts') || null
             if ((opts !== null) || (typeof(opts) !== 'undefined')) {
             opts = (opts.match(/{}/)) ? null : JSON.parse(opts)
             // Add an empty 'shared' opts object
             opts.unshift({name: 'shared'})
             }
             */

            // create canvas and container
            $('<div>').attr('id', 'container').appendTo($('body'));
            $('<canvas style="border: none;" width="1920" height="1080">')
                .attr('id', 'webgl-canvas')
                .appendTo($('#container'));

            // call the effect engine, passing canvas, opts and callback;
            engine($('#webgl-canvas')[0], null, function (eff, render) {
                effect = eff;
                emitters = effect.emitters;
                engineCallback = render;
                $(window).trigger('engine-loaded');
            });

            // Get gui default settings
            var guiOptsRequest = new XMLHttpRequest();

            guiOptsRequest.onload = function () {
                guiOpts = JSON.parse(this.responseText);
                $(window).trigger('gui-opts-loaded');
            };

            guiOptsRequest.open('get', 'http://localhost/WebGLParticleEffectEditor/gui-default.json');
            guiOptsRequest.send();
        });

        $(window).on('gui-opts-loaded engine-loaded', function (event) {

            // Proceed only if both the engine and gui opts are loaded;
            if (!effect || !guiOpts) {
                return;
            }

            // Build toolbars using default gui opts and emitter opts;
            for (var i = 0; i < emitters.length; i++) {
                var opts = {};

                for (var opt in guiOpts) {
                    if (opt.match(/name|duration|continuous|wind|rotation vec/)) {
                        continue;
                    }

                    opts[opt] = {};
                    for (var val in guiOpts[opt]) {
                        // Slider limits come from gui opts
                        // Initial slider value comes from emitters opts
                        opts[opt][val] = new Array(3);
                        opts[opt][val][0] = guiOpts[opt][val][0];
                        opts[opt][val][1] = emitters[i].opts[val];
                        opts[opt][val][2] = guiOpts[opt][val][1];
                    }
                }

                // create emitter toolbars
                PEE.toolbar(emitters[i], opts);
            }

            // create the master toolbar (it affects all emitters)
            PEE.toolbar(emitters, opts, true);

            // create the page header
            header();

            // create the options menu
            PEE.optionsMenu(effect, emitters);

            // gui is complete, so begin rendering
            engineCallback();
        });

        // #container is set to the size of the window;
// so draggables can snap to the edge of the screen;
        $(window).on('resize load', function (event) {
            var tainer = $('#container')
                , $win = $(window);
            tainer.height($win.height());
            tainer.width($win.width());
        });

        // Save emitters opts to local storage on unload;
        // Save any errors when unloading the window so they can be read onload;
        $(window).unload(function (event) {
            localStorage.setItem('unloaderror', "no error");
            var optsArray = [];
            for (var i = 0; i < emitters.length; i++) {
                optsArray.push(emitters[i].opts);
            }
            try {
                localStorage.setItem('opts', JSON.stringify(optsArray));
            } catch (e) {
                localStorage.setItem('unloaderror', e.message);
            }
        });

        function header () {
            $('<header>').attr('id', 'header').text('WebGL PEE').prependTo('body');

            // options menu button;
            $('<a>').attr('id', 'options-menu-anchor').appendTo('#header')
                .click(function (event) {
                if ($('#options-menu').css('visibility') === 'hidden') {
                    $('#options-menu').css('visibility', 'visible');
                } else {
                    $('#options-menu').css('visibility', 'hidden');
                    return false;
                }
            });
            $('<img>').attr({
                src: 'images/gui-gear-grey.png',
                height: 16,
                width: 16
            }).appendTo('#options-menu-anchor');
        }
    };

}(jQuery, window));

$(window).trigger('PEE-loaded');
