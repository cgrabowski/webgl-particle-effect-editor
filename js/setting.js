var PEE = PEE || {};

PEE.setting = (function ($, window, undefined) {

    return function (tb, min, max, key, val, name, master) {

        var settingTainer = $('<div>'),
            sliderTainer = $('<div>'),
            minSpan = $('<span class="min-span">'),
            maxSpan = $('<span class="max-span">');

        settingTainer.addClass('setting-tainer').data('key', key)
            .appendTo(tb);
        $('<h5>').text(name).appendTo(settingTainer);

        // create sliders for opts with a min and max;
        if (min && max) {
            sliderTainer.slider({
                min: min[0],
                values: [min[1], max[1]],
                max: max[2],
                range: true,
                step: (max[2] - min[0]) / 1000,
                slide: function (event, ui) {
                    var emitter = $(ui.handle).closest('.toolbar').data().emitter,
                        tainer = $(ui.handle).closest('.setting-tainer'),
                        key = tainer.data().key;

                    if (master) {
                        for (var i = 0; i < emitter.length; i++) {
                            emitter[i][key[0]] = ui.values[0];
                            emitter[i].opts[key[0]] = emitter[i][key[0]];
                            emitter[i][key[1]] = ui.values[1];
                            emitter[i].opts[key[1]] = emitter[i][key[1]];
                        }
                    } else {
                        emitter[key[0]] = ui.values[0];
                        emitter.opts[key[0]] = emitter[key[0]];
                        emitter[key[1]] = ui.values[1];
                        emitter.opts[key[1]] = emitter[key[1]];
                    }
                    tainer.find('a:nth-child(2)').attr('title', ui.values[0]);
                    tainer.find('a:last-child').attr('title', ui.values[1]);
                }
            })
                .appendTo(settingTainer);
            settingTainer.find('.ui-slider .ui-slider-handle:nth-child(2)').attr('title', min[1]);
            settingTainer.find('.ui-slider .ui-slider-handle:last-child').attr('title', max[1]);
            minSpan.text(min[0]);
            maxSpan.text(max[2]);

            // create sliders for opts with only one value
        } else {
            sliderTainer.slider({
                min: val[0],
                value: val[1],
                max: val[2],
                step: (val[2] - val[0]) / 1000,
                slide: function (event, ui) {
                    var emitter = $(ui.handle).closest('.toolbar').data().emitter,
                        key = $(ui.handle).closest('.setting-tainer').data().key;
                    if (master) {

                        for (var i = 0; i < emitter.length; i++) {
                            emitter[i][key[0]] = ui.value;
                            emitter[i].opts[key[0]] = emitter[i][key[0]];
                        }
                    } else {
                        emitter[key] = ui.value;
                        emitter.opts[key] = emitter[key];
                    }
                    $(ui.handle).attr('title', ui.value);
                }
            })
                .appendTo(settingTainer);
            settingTainer.find('.ui-slider .ui-slider-handle:last-child').attr('title', val[1]);
            minSpan.text(val[0]);
            maxSpan.text(val[2]);
        }

        sliderTainer.closest('.setting-tainer').prepend(minSpan).prepend(maxSpan);


        // change slider limits on click
        sliderTainer.siblings('span').click(function limitClick (event) {
            // console.log(this)
            var $this = $(this),
                $input = $('<input class="limit-input" name="" value="' + $this.text() + '">'),
                emitter = $this.closest('.toolbar').data().emitter,
                key = $this.closest('.setting-tainer').data().key;

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
                    newLimit = parseFloat($input.val().replace(/^[^-][^0-9\.]/g, ""));

                // check if val is NaN
                if (!(newLimit < Infinity)) {
                    newLimit = $this.text();
                }

                if ($input.hasClass('limit-input-min')) {
                    console.log('min, ' + newLimit);
                    sl.slider('option', 'min', newLimit);
                } else {
                    console.log('max, ' + newLimit);
                    sl.slider('option', 'max', newLimit);
                }

                // set new emitter opt value(s)

                // for emitters with min and max (two slider handles)
                if (sl.slider('values').length === 2) {
                    var vals = sl.slider('values');
                    sl.find('.ui-slider-handle:nth-child(2)').attr('title', vals[0]);
                    sl.find('.ui-slider-handle:last-child').attr('title', vals[1]);
                    if (master) {
                        for (var i = 0; i < emitter.length; i++) {

                            emitter[i][key[0]] = vals[0];
                            emitter[i][key[1]] = vals[1];
                        }
                    } else {
                        emitter[key[0]] = vals[0];
                        emitter[key[1]] = vals[1];
                    }

                    // for emitters with one val (one slider handle)
                } else {
                    var val = sl.slider('value');
                    sl.find('.ui-slider-handle:last-child').attr('title', val);
                    if (master) {
                        for (var i = 0; i < emitter.length; i++) {
                            emitter[i][key] = val;
                        }
                    } else {
                        emitter[key] = val;
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

        if (name.match(/direction x|direction y|direction z/)) {
            PEE.settingGraph(settingTainer, min, max, key, val, name, master)
        }
    }

}(jQuery, window));
