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
                console.log(localStorage.getItem('unloaderror'));
            }

            var effectOpts = JSON.parse(localStorage.getItem('effectOpts') || null),
                emittersOpts = JSON.parse(localStorage.getItem('emittersOpts') || null);

            emittersOpts.unshift(null);

            guiOpts = JSON.parse(localStorage.getItem('guiOpts') || null);

            // create canvas and container
            $('<div>').attr('id', 'container').appendTo($('body'));
            $('<canvas style="border: none;" width="1920" height="1080">')
                .attr('id', 'webgl-canvas')
                .appendTo($('#container'));

            // call the effect engine, passing canvas, opts and callback;
            engine($('#webgl-canvas')[0], effectOpts, emittersOpts, function (eff, render) {
                effect = eff;
                effect.opts = effectOpts;
                emitters = eff.emitters;
                engineCallback = render;
                $(window).trigger('engine-loaded');
            });
        });

        $(window).on('engine-loaded', function (event) {

            if (guiOpts) {
                guiOpts.forEach(function (element, index, array) {
                    for (var i = 0; i < emitters.length; i++) {

                        if (element.emitterName === 'master') {
                            PEE.toolbar(emitters, element, true);

                        } else if (emitters[i].emitterName === element.emitterName) {
                            PEE.toolbar(emitters[i], element);
                        }
                    }
                });

            } else {

                var guiOpts = {
                    numParticles: [1, 300],
                    /**/
                    life: [1, 10000],
                    /**/
                    delay: [0, 10000],
                    /**/
                    offsetX: [-10, 10],
                    /**/
                    offsetY: [-10, 10],
                    /**/
                    offsetZ: [-20, 0],
                    /**/
                    speed: [1, 1000],
                    /**/
                    directionX: [-1, 1],
                    /**/
                    directionY: [-1, 1],
                    /**/
                    directionZ: [-1, 1],
                    /**/
                    rotation: [-7200, 7200]
                };

                // Build toolbars using default gui opts and emitter opts;
                for (var i = 0; i < emitters.length; i++) {

                    var tbOpts = {},
                        eo = emitters[i].opts;

                    for (var opt in guiOpts) {
                        tbOpts[opt] = guiOpts[opt].slice();
                    }

                    tbOpts.numParticles.splice(1, 0, eo.numParticles);
                    tbOpts.life.splice(1, 0, eo.minLife, eo.maxLife);
                    tbOpts.delay.splice(1, 0, eo.minDelay, eo.maxDelay);
                    tbOpts.offsetX.splice(1, 0, eo.minOffsetX, eo.maxOffsetX);
                    tbOpts.offsetY.splice(1, 0, eo.minOffsetY, eo.maxOffsetY);
                    tbOpts.offsetZ.splice(1, 0, eo.minOffsetZ, eo.maxOffsetZ);
                    tbOpts.speed.splice(1, 0, eo.minSpeed, eo.maxSpeed);
                    tbOpts.directionX.splice(1, 0, eo.minDirectionX, eo.maxDirectionX);
                    tbOpts.directionY.splice(1, 0, eo.minDirectionY, eo.maxDirectionY);
                    tbOpts.directionZ.splice(1, 0, eo.minDirectionZ, eo.maxDirectionZ);
                    tbOpts.rotation.splice(1, 0, eo.minRotation, eo.maxRotation);

                    // create emitter toolbars
                    PEE.toolbar(emitters[i], tbOpts);
                }

                // create the master toolbar (it affects all emitters)
                PEE.toolbar(emitters, tbOpts, true);

            }

            // create the page header
            header();

            // create the options menu
            PEE.optionsMenu(effect, emitters, guiOpts);

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

            var emittersOpts = [],
                guiOpts = [];

            for (var i = 0; i < emitters.length; i++) {
                emittersOpts.push(emitters[i].opts)
                emittersOpts[i].emitterName = emitters[i].emitterName;
            }

            $('.toolbar').each(function (index, element) {
                guiOpts.push($(element).data('tbOpts'));
            });

            localStorage.setItem('unloaderror', 'no unload error');

            try {
                localStorage.setItem('emittersOpts', JSON.stringify(emittersOpts));
                localStorage.setItem('guiOpts', JSON.stringify(guiOpts));
                localStorage.setItem('effectOpts', JSON.stringify(effect.opts));
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
                    if ($('#emitter-select').val() !== 'master') {
                        $('.channel-select').css('visibility', 'visible');
                    }
                } else {
                    $('#options-menu').css('visibility', 'hidden');
                    $('.channel-select').css('visibility', 'hidden');
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
