String.prototype.capitalize = function () {
    return this.replace(/^./, function (char) {
        return char.toUpperCase();
    });
};

var PEE = PEE || {};

$(window).on('PEE-loaded', function (event) {
    PEE.gui();
});

PEE.gui = (function ($, window, undefined) {
    var gl,
        effect,
        emitters,
        engineCallback;

    return function () {
        $(document).ready(function () {
            // If an error occured during last unload, log it;
            if (localStorage.getItem('unloaderror')) {
                console.log('Unload error: ' + localStorage.getItem('unloaderror'));
            }

            var effectOpts = JSON.parse(localStorage.getItem('effectOpts')),
                emittersOpts = JSON.parse(localStorage.getItem('emittersOpts'));

            // create canvas and container
            $('<div>').attr('id', 'container').appendTo($('body'));
            $('<canvas style="border: none;" width="1920" height="1080">')
                .attr('id', 'webgl-canvas')
                .appendTo($('#container'));


            // call the effect engine, passing canvas, opts and callback;
            engine($('#webgl-canvas')[0], effectOpts, emittersOpts, function (GL, eff, render) {
                gl = GL
                effect = eff;
                emitters = eff.emitters;
                engineCallback = render;
                // trigger an event to get this and previous callbacks off the stack
                $(window).trigger('engine-loaded');
            });
        });

        $(window).on('engine-loaded', function (event) {

            // WebGL debugging
            WebGLDebugUtils.makeDebugContext(gl);

            // Build toolbars using default gui opts and emitter opts;
            for (var i = 0; i < emitters.length + 1; i++) {

                var tbOpts = {},
                    eo = (emitters[i]) ? emitters[i].opts : effect.opts;

                // Watch out for an easy reference bug here
                tbOpts.numParticles = eo.numParticlesLimits.slice();
                tbOpts.life = eo.lifeLimits.slice();
                tbOpts.delay = eo.delayLimits.slice();

                tbOpts.offsetX = eo.minOffsetXGraph.slice(2, 4);
                tbOpts.offsetY = eo.minOffsetXGraph.slice(2, 4);
                tbOpts.offsetZ = eo.minOffsetXGraph.slice(2, 4);

                tbOpts.speed = eo.minSpeedGraph.slice(2, 4);
                tbOpts.directionX = eo.minDirectionXGraph.slice(2, 4);
                tbOpts.directionY = eo.minDirectionYGraph.slice(2, 4);
                tbOpts.directionZ = eo.minDirectionZGraph.slice(2, 4);
                tbOpts.rotation = eo.minRotationGraph.slice(2, 4);

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

                if (i < emitters.length) {
                    // create emitter toolbars
                    PEE.toolbar(emitters[i], tbOpts);
                } else {
                    // create the master toolbar (it affects all emitters)
                    PEE.toolbar(emitters, tbOpts, true);
                }
            }

            //}

            $('#container').append('<div id="create-tb">');

            $('#create-tb').css({visibility: 'hidden'}).on('emitter-added', function (event) {
                PEE.toolbar(emitters[emitters.length - 1], tbOpts);
            });

            // create the page header
            header();            

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
            try {
                var emittersOpts = [];

                for (var i = 0; i < effect.emitters.length; i++) {
                    emittersOpts.push(effect.emitters[i].opts)
                    emittersOpts[i].emitterName = effect.emitters[i].emitterName;
                }

                localStorage.setItem('unloaderror', 'no unload error');

                localStorage.setItem('emittersOpts', JSON.stringify(emittersOpts));
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
