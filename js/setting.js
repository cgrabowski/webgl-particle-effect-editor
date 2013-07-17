var PEE = PEE || {};

String.prototype.capitalize = function () {
    return this.replace(/^./, function (char) {
        return char.toUpperCase();
    });
};

PEE.setting = (function ($, window, undefined) {

    return function (tb, name, guiOpt, master) {

        var settingTainer = $('<div>'),
            sliderTainer = $('<div>'),
            minSpan = $('<span class="min-span">'),
            maxSpan = $('<span class="max-span">'),
            minGraph = $('<span class="min-graph>'),
            maxGraph = $('<span class="max-graph>');

        settingTainer.addClass('setting-tainer')
            .data('name', name)
            .data('guiOpt', guiOpt)
            .appendTo(tb);
        $('<h5>').text(name).appendTo(settingTainer);

        // create sliders for opts with a min and max;
        if (guiOpt.length === 4) {
            sliderTainer.slider({
                min: guiOpt[0],
                values: [guiOpt[1], guiOpt[2]],
                max: guiOpt[3],
                range: true,
                step: (guiOpt[3] - guiOpt[0]) / 1000,
                slide: function (event, ui) {
                    var emitter = $(ui.handle).closest('.toolbar').data().emitter,
                        tainer = $(ui.handle).closest('.setting-tainer'),
                        key = tainer.data().name;

                    if (master) {
                        for (var i = 0; (i < emitter.length) || (i < 1); i++) {
                            emitter[i].opts['min' + name.capitalize()] = ui.values[0];
                            emitter[i].opts['max' + name.capitalize()] = ui.values[1];
                        }

                        guiOpt[1] = ui.values[0];
                        guiOpt[2] = ui.values[1];

                    } else {
                        guiOpt[1] = emitter.opts['min' + name.capitalize()] = ui.values[0];
                        guiOpt[2] = emitter.opts['max' + name.capitalize()] = ui.values[1];
                    }

                    tainer.find('a:nth-child(2)').attr('title', ui.values[0]);
                    tainer.find('a:last-child').attr('title', ui.values[1]);
                }
            })
                .appendTo(settingTainer);
            settingTainer.find('.ui-slider .ui-slider-handle:nth-child(2)').attr('title', guiOpt[1]);
            settingTainer.find('.ui-slider .ui-slider-handle:last-child').attr('title', guiOpt[2]);
            minSpan.text(guiOpt[0]);
            maxSpan.text(guiOpt[3]);

            // create sliders for opts with only one value
        } else {
            sliderTainer.slider({
                min: guiOpt[0],
                value: guiOpt[1],
                max: guiOpt[2],
                step: (guiOpt[2] - guiOpt[0]) / 1000,
                slide: function (event, ui) {
                    var emitter = $(ui.handle).closest('.toolbar').data().emitter;

                    if (master) {
                        for (var i = 0; i < emitter.length; i++) {
                            emitter[i].opts[name] = ui.value;
                        }

                        guiOpt[1] = ui.value;

                    } else {
                        guiOpt[1] = emitter.opts[name] = ui.value;
                    }

                    $(ui.handle).attr('title', ui.value);
                }
            })
                .appendTo(settingTainer);
            settingTainer.find('.ui-slider .ui-slider-handle:last-child').attr('title', guiOpt[1]);
            minSpan.text(guiOpt[0]);
            maxSpan.text(guiOpt[2]);
        }

        sliderTainer.closest('.setting-tainer').prepend(minSpan).prepend(maxSpan);

        // change slider limits on click
        sliderTainer.siblings('span').click(function limitClick (event) {
            var $this = $(this),
                $input = $('<input class="limit-input" name="" value="' + $this.text() + '">'),
                emitter = $this.closest('.toolbar').data().emitter,
                key = $this.closest('.setting-tainer').data().name;

            // these classes identify an input as a min or max input;
            if ($this.hasClass('min-span')) {
                $input.addClass('limit-input-min');
            }
            else {
                $input.addClass('limit-input-max');
            }
            $this.replaceWith($input);

            // close input when anything is clicked
            $('body, span, a').one('click', function setLimit (event) {

                var sl = $input.siblings('.ui-slider'),
                    newLimit = parseFloat($input.val().replace(/^[^-][^0-9\.]/g, "")),
                    guiOpt = sl.closest('.setting-tainer').data('guiOpt');

                console.log(guiOpt);

                // check if val is NaN
                if (!(newLimit < Infinity)) {
                    newLimit = $this.text();
                }

                if ($input.hasClass('limit-input-min')) {
                    sl.slider('option', 'min', newLimit);
                    guiOpt[0] = newLimit;
                } else {
                    sl.slider('option', 'max', newLimit);
                    guiOpt[guiOpt.length - 1] = newLimit;
                }

                // set new emitter opt value(s)

                // for emitters with min and max (two slider handles)
                if (sl.slider('values').length === 2) {
                    var vals = sl.slider('values');
                    sl.find('.ui-slider-handle:nth-child(2)').attr('title', guiOpt[1]);
                    sl.find('.ui-slider-handle:last-child').attr('title', guiOpt[2]);

                    if (master) {
                        for (var i = 0; i < emitter.length; i++) {
                            emitter[i].opts['min' + name.capitalize()] = vals[0];
                            emitter[i].opts['max' + name.capitalize()] = vals[1];
                        }

                        guiOpt[1] = vals[0];
                        guiOpt[2] = vals[1];

                    } else {
                        guiOpt[1] = emitter.opts['min' + name.capitalize()] = vals[0];
                        guiOpt[2] = emitter.opts['max' + name.capitalize()] = vals[1];
                    }

                    // for emitters with one val (one slider handle)
                } else {
                    var val = sl.slider('value');
                    sl.find('.ui-slider-handle:last-child').attr('title', guiOpt[1]);

                    if (master) {
                        for (var i = 0; (i < emitter.length) || (i < 1); i++) {
                            emitter[i].opts[name] = val;
                        }

                        guiOpt[1] = val;

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

        for (var g = 0; g < ParticleEffect.GRAPHABLES.length; g++) {
            if (name === ParticleEffect.GRAPHABLES[g]) {
                PEE.settingGraph(settingTainer, name, master);
            }
        }
    }

}(jQuery, window));
