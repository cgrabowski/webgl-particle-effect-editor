var PEE = PEE || {};

PEE.setting = (function ($, window, undefined) {

    return function (tb, name, guiOpt, master) {

        var emitter = tb.data('emitter'),
            $settingTainer = $('<div>'),
            $sliderTainer = $('<div>'),
            $minSpan = $('<span class="min-span">'),
            $maxSpan = $('<span class="max-span">');

        $settingTainer.addClass('setting-tainer')
            .data('name', name)
            .data('guiOpt', guiOpt)
            .appendTo(tb);
        $('<h5>').text(name).appendTo($settingTainer);

        // create sliders for opts with a min and max;
        if (guiOpt.length === 4) {
            $sliderTainer.slider({
                min: guiOpt[0],
                values: [guiOpt[1], guiOpt[2]],
                max: guiOpt[3],
                range: true,
                step: (guiOpt[3] - guiOpt[0]) / 1000,
                slide: function (event, ui) {
                    var tainer = $(ui.handle).closest('.setting-tainer'),
                        key = tainer.data().name;

                    emitter = $(ui.handle).closest('.toolbar').first().data().emitter;

                    // X-Z chars at the end of the var 'name' are already capitalized
                    // so only the first letter of name needs to be capitaized
                    if (master) {
                        guiOpt[1] = emitter[0].effect.opts['min' + name.capitalize()] = ui.values[0];
                        guiOpt[2] = emitter[0].effect.opts['max' + name.capitalize()] = ui.values[1];
                    } else {
                        guiOpt[1] = emitter.opts['min' + name.capitalize()] = ui.values[0];
                        guiOpt[2] = emitter.opts['max' + name.capitalize()] = ui.values[1];
                    }

                    tainer.find('a:nth-child(2)').attr('title', ui.values[0]);
                    tainer.find('a:last-child').attr('title', ui.values[1]);
                }
            })
                .appendTo($settingTainer);

            $settingTainer.find('.ui-slider .ui-slider-handle:nth-child(2)').attr('title', guiOpt[1]);
            $settingTainer.find('.ui-slider .ui-slider-handle:last-child').attr('title', guiOpt[2]);
            $minSpan.text(guiOpt[0]);
            $maxSpan.text(guiOpt[3]);

            // create sliders for opts with only one value
        } else {
            $sliderTainer.slider({
                min: guiOpt[0],
                value: guiOpt[1],
                max: guiOpt[2],
                step: (guiOpt[2] - guiOpt[0]) / 1000,
                slide: function (event, ui) {
                    var emitter = $(ui.handle).closest('.toolbar').data().emitter;

                    if (master) {
                        guiOpt[1] = emitter[0].effect.opts[name] = ui.value;

                    } else {
                        guiOpt[1] = emitter.opts[name] = ui.value;
                    }

                    $(ui.handle).attr('title', ui.value);
                }
            })
                .appendTo($settingTainer);
            $settingTainer.find('.ui-slider .ui-slider-handle:last-child').attr('title', guiOpt[1]);
            $minSpan.text(guiOpt[0]);
            $maxSpan.text(guiOpt[2]);
        }

        $sliderTainer.closest('.setting-tainer').prepend($minSpan).prepend($maxSpan);

        // change slider limits on click
        $sliderTainer.siblings('span').click(function limitClick (event) {
            var $this = $(this),
                $input = $('<input class="limit-input" name="" value="' + $this.text() + '">'),
                emitter = $this.closest('.toolbar').data().emitter,
                key = $this.closest('.setting-tainer').data().name;

            // these classes identify an input as a min or max input;
            if ($this.hasClass('min-span')) {
                $input.addClass('limit-input-min');

            } else if ($this.hasClass('max-span-left')) {
                $input.addClass('limit-input-max-left');

            } else {
                $input.addClass('limit-input-max');
            }

            $this.replaceWith($input);

            // close input when anything is clicked
            $('body, span, a').on('click', function setLimit (event) {

                var emitter = $input.closest('.toolbar').first().data('emitter'),
                    sl = $input.siblings('.ui-slider'),
                    newLimit = parseFloat($input.val().replace(/^[^-][^0-9\.]/g, "")),
                    name = sl.closest('.setting-tainer').data('name'),
                    guiOpt = sl.closest('.setting-tainer').data('guiOpt');

                var whoseOpts = (emitter.length) ? emitter[0].effect : emitter;

                if (isNaN(newLimit)) {
                    newLimit = $this.text();
                }

                var minOrMax = parseInt($input.hasClass('limit-input-min'), 10),
                    minOrMaxStr = ($input.hasClass('limit-input-min')) ? 'min' : 'max';

                sl.slider('option', minOrMaxStr, newLimit);

                guiOpt[(minOrMax) ? 0 : guiOpt.length - 1] = newLimit;

                for (var i = 0; i < PEE.ParticleEffect.GRAPHABLES.length; i++) {
                    if (name === PEE.ParticleEffect.GRAPHABLES[i]) {
                        whoseOpts.opts['min' + name.capitalize() + 'Graph'].splice(2 + minOrMax, 1, newLimit);
                        whoseOpts.opts['max' + name.capitalize() + 'Graph'].splice(2 + minOrMax, 1, newLimit);
                        break;

                    } else if (name.match(/numParticles|life|delay/)) {
                        whoseOpts.opts[name + 'Limits'].splice(minOrMax, 1, newLimit);
                        break;
                    }
                }

                // set new emitter opt value(s)

                // for emitters with min and max (two slider handles)
                if (sl.slider('values').length === 2) {
                    var vals = sl.slider('values');
                    sl.find('.ui-slider-handle:nth-child(2)').attr('title', vals[0]);
                    sl.find('.ui-slider-handle:last-child').attr('title', vals[1]);

                    if (master) {
                        guiOpt[1] = emitter[0].effect.opts['min' + name.capitalize()] = vals[0];
                        guiOpt[2] = emitter[0].effect.opts['max' + name.capitalize()] = vals[1];

                    } else {
                        guiOpt[1] = emitter.opts['min' + name.capitalize()] = vals[0];
                        guiOpt[2] = emitter.opts['max' + name.capitalize()] = vals[1];
                    }

                    // for emitters with one val (one slider handle)
                } else {
                    var val = sl.slider('value');
                    sl.find('.ui-slider-handle:last-child').attr('title', val);

                    if (master) {
                        guiOpt[1] = emitter[0].opts[name] = val;

                    } else {
                        guiOpt[1] = emitter.opts[name] = val;
                    }
                }

                // update span and replace input with it
                $this.text(newLimit);
                $input.replaceWith($this);

                // this handler should only be in use when a limit input is open
                $('body, span, a').off('click', setLimit);

                // the span needs to have its click handler reassigned
                $this.click(limitClick);

                return false;
            });

            $input[0].focus();
            return false;
        });

        // the enter key closes an open limit input
        $(window).on('keydown', function (event) {
            if (event.keyCode === 13) {
                $('body').click();
            }
        });

        // emitter settings that are set to use the master channel are darkened        
        if (!master) {
            $settingTainer.css('color', '#303030')
                .find('.ui-slider, .ui-slider-handle').css('background-color', '#303030')
                .andSelf().find('.ui-slider-handle').css('background-color', '#303030');
        }

        if (!master && PEE.ParticleEffect.CHANNEL_FLAGS[$settingTainer.data('name').toUpperCase() + '_BIT'] & emitter.opts.channelConfig) {

            $settingTainer.css('color', 'rgb(224, 224, 224)')
                .find('.ui-slider').css('background-color', 'rgb(160, 160, 160)')
                .andSelf().find('.ui-slider-handle').css('background-color', 'rgb(224, 224, 224)');
        }

        for (var g = 0; g < PEE.ParticleEffect.GRAPHABLES.length; g++) {
            if (name === PEE.ParticleEffect.GRAPHABLES[g]) {
                PEE.settingGraph($settingTainer, name, master);
            }
        }
    }

}(jQuery, window));
