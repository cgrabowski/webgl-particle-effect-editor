var PEE = PEE || {};

PEE.optionsMenu = (function ($, window, undefined) {

    // options menu
    return function OptionsMenu (effect, emitters, guiOpts) {

        var optionsMenu = $('<div>').attr('id', 'options-menu');
        optionsMenu.prependTo('body');

        // Controls
        var graphables = ParticleEffect.GRAPHABLES,
            graphMenu = $('<div>'),
            emitterSel = $('<select>');

        graphMenu.addClass('menu-div-left')
            .attr('id', 'graph-menu')
            .appendTo(optionsMenu)
            .append(emitterSel)
            .append('<h4 class="menu-heading">Controls</h4>');

        emitterSel.attr('id', 'emitter-select')
            .addClass('menu-select')
            .append('<option value="master">master</option>');

        for (var i = 0; i < emitters.length; i++) {
            emitterSel.append('<option value="' + emitters[i].emitterName + '">' + emitters[i].emitterName + '</option>');
        }

        graphMenu.find('h4').height($('#emitter-select').height() * 2);

        emitterSel.click(function (event) {
            var emitter;
            if (emitterSel.val() === 'master') {
                graphMenu.find('.channel-select').css('visibility', 'hidden');
                emitter = effect;
            } else {
                graphMenu.find('.channel-select').css('visibility', 'visible');
                for (var i = 0; i < effect.emitters.length; i++) {
                    if (effect.emitters[i].emitterName === emitterSel.val()) {
                        emitter = effect.emitters[i];
                        break;
                    }
                }
            }

            var gConfig = emitter.opts.graphablesConfig,
                $settings = $(graphMenu.find('p select.graph-select:visible'));

            $settings.children('.slider-opt').each(function (index, element) {
                element.selected = true;
            });

            $settings.children('.graph-opt').each(function (index, element) {
                var flag = $(element).closest('p')[0].childNodes[0].nodeValue.toUpperCase() + '_BIT';
                if (gConfig & ParticleEffect.GRAPHABLE_FLAGS[flag]) {
                    element.selected = true;
                }
            });

        });

        for (var opt in guiOpts) {
            var grp = $('<p>'),
                grsel = $('<select>'),
                useMasterSel = $('<select>');

            grp.addClass('options-menu-p')
                .text(opt)
                .appendTo(graphMenu);

            grsel.addClass('menu-select graph-select')
                .css('clear', 'both')
                .appendTo(grp)
                .append('<option class="slider-opt" value="slider">Slider</option>')
                .append('<option class="graph-opt" value="graph">Graph</option>')
                .data('name', opt)

                .click(function (event) {
                var $this = $(this),
                    $tb,
                    emitter;

                $('.toolbar').each(function (index, element) {
                    if ($(element).data('name') === $('#emitter-select').val()) {
                        $tb = $(element),
                            emitter = ($tb.data('master')) ? effect : $tb.data('emitter');
                    }
                });

                $tb.find('svg').each(function (index, element) {
                    var $svg = $(element),
                        flag = ($this.data('name').toUpperCase() + '_BIT');

                    if ($svg.data('name') === $this.data('name')) {
                        if ($this.val() === 'graph') {
                            emitter.enableGraphed(ParticleEffect.GRAPHABLE_FLAGS[flag]);
                            $svg.data('slider').css('display', 'none').siblings('span').css('display', 'none');
                            $svg.css('display', 'block');
                        } else if ($this.val() === 'slider') {
                            emitter.disableGraphed(ParticleEffect.GRAPHABLE_FLAGS[flag]);
                            $svg.data('slider').css('display', 'block')
                                .siblings('span').css('display', 'inline');
                            $svg.css('display', 'none');
                        }
                    }
                });
            });

            if (opt.match(/numParticles|life|delay/)) {
                grsel.css('visibility', 'hidden')
                    .removeClass('graph-select')
                    .addClass('spacer-select');
            }

            useMasterSel.addClass('menu-select channel-select')
                .appendTo(grp)
                .append('<option class="use-master-opt" value="useMaster">Use Master</option>')
                .append('<option class="use-self-opt" value="useSelf">Use Self</option>')

                .data('name', opt)

                .click(function (event) {
                var $this = $(this),
                    $tb,
                    emitter,
                    flag = ($this.data('name').toUpperCase() + '_BIT').replace(' ', '_');

                $('.toolbar').each(function (index, element) {
                    if ($(element).data('name') === $('#emitter-select').val()) {
                        $tb = $(element);
                        emitter = ($tb.data('master')) ? effect : $tb.data('emitter');
                    }
                });
                if ($this.val() === 'useSelf') {
                    emitter.useOwnChannel(ParticleEffect.CHANNEL_FLAGS[flag]);
                } else if ($this.val() === 'useMaster') {
                    emitter.useMasterChannel(ParticleEffect.CHANNEL_FLAGS[flag]);
                }

            });

            grp.height(grsel.height() + useMasterSel.height() * 2.2);

        }

        // set inital state of graph-selects based on effect.opts.graphablesConfig
        $(graphMenu.find('p select.graph-select'))
            .each(function (index, element) {

            var flag = $(element).closest('p')[0].childNodes[0].nodeValue.toUpperCase() + '_BIT';
            if (effect.opts.graphablesConfig & ParticleEffect.GRAPHABLE_FLAGS[flag]) {
                $(element).children('.graph-opt')[0].selected = true;
            }
        });



        // textures
        var textDiv = $('<div>').addClass('menu-div-right')
            .attr('id', 'textures-div')
            .appendTo(optionsMenu)
            .append('<h4 class="menu-heading">Textures</h4>');

        for (var i = 0; i < emitters.length; i++) {
            var tp = $('<p>'),
                inp = $('<input>'),
                img = $('<img>')
            tp.addClass('options-menu-p')
                .text(emitters[i].emitterName)
                .append('<img src="images/transparency.png" class="transparency-img">')
                .appendTo(textDiv);
            // file input tag;
            inp.attr('type', 'file').css('display', 'none').appendTo(tp);

            // replace menu image with selected image;
            inp.on('change', function (event) {
                var file = this.files[0],
                    newImg = $('<img>'),
                    $self = $(this);

                newImg.attr({
                    height: 32,
                    width: 32
                }).addClass('text-p-img')
                    .click(function (event) {
                    $self.click();
                });

                newImg.get(0).file = file;
                $self.data('img').remove();
                $self.data('img', newImg);
                //$self.data('p').append(newImg);
                var timg = $self.data('p').find('.transparency-img');
                newImg.insertAfter(timg);
                // read the image into the img tag;
                var reader = new FileReader();
                reader.onload = (function (aImg) {
                    return function (e) {
                        aImg.onload = function (event) {
//replace the emitter texture with the new image                ;
                            effect.textureManager('replace')(aImg, $self.data('index'));
                        };
                        aImg.src = e.target.result;
                    };
                })(newImg.get(0));
                reader.readAsDataURL(file);
            });
            // since input is display:hidden, its coresponding menu image;
            // is saved as jquery data;
            inp.data('img', img);
            // as well as its corresponding p tag;
            inp.data('p', tp);
            // and the coresponing emitter;
            inp.data('emitter', emitters[i]);
            inp.data('index', i);
            // likewise, the menu images' coresponding input tag;
            // is saved as jquery data;
            img.data('input', inp);
            img.attr({
                src: emitters[i].opts.textSource,
                height: 32,
                width: 32
            })
                .addClass('text-p-img').appendTo(tp)
                // when the image is clicked, the input's;
                // click event is triggered;
                .click(function (event) {
                $(this).data('input').click();
            });
        }

        // toolbars
        var emittersMenu = $('<div>').addClass('menu-div-right')
            .attr('id', 'toolbars-div')
            .appendTo(optionsMenu),
            tbnames = [];

        emitters.forEach(function (element, index, array) {
            tbnames.push(element.emitterName);
        })
        tbnames.unshift('master');

        $('<h5>').addClass('menu-heading')
            .text('Toolbars')
            .appendTo(emittersMenu);
        for (var i = 0; i < tbnames.length; i++) {
            var tp = $('<p>').addClass('options-menu-p')
                , tbSel = $('<select>');

            tp.text(tbnames[i]).appendTo(emittersMenu);
            tbSel.addClass('menu-select tb-select')
                .appendTo(tp);
            if (tbnames[i] === 'master') {
                tbSel.append('<option value="show">Open</option>')
                    .append('<option value="hide">Hidden</option>');
            } else {
                tbSel.append('<option value="hide">Hidden</option>')
                    .append('<option value="show">Open</option>');
            }
            tbSel.data('toolbar-name', tbnames[i])
                .click(function (event) {
                var $this = $(this);

                if ($this.val() === 'show') {
                    $('.toolbar').each(function (index, element) {
                        if ($(element).data('master') && $this.data('toolbar-name') === 'master') {
                            $(element).css('visibility', 'visible');
                            $(element).trigger('mousedown');
                        } else if ($(element).data('emitter').emitterName === $this.data('toolbar-name')) {
                            $(element).css('visibility', 'visible');
                            $(element).trigger('mousedown');
                        }
                    });
                } else if ($this.val() === 'hide') {
                    $('.toolbar').each(function (index, element) {
                        if ($(element).data('master') && $this.data('toolbar-name') === 'master') {
                            $(element).css('visibility', 'hidden');
                        } else if ($(element).data('emitter').emitterName === $this.data('toolbar-name')) {
                            $(element).css('visibility', 'hidden');
                        }
                    });
                }
            });
        }

        var gmh = $('#graph-menu').height(),
            tmh = $('#textures-div').height(),
            emh = $('#toolbars-div').height();

        if (tmh + emh < gmh) {
            $('#toolbars-div').height(gmh - tmh)
        }

        // file actions
        var fileActions = $('<div id="file-actions">').addClass('menu-div-full');
        optionsMenu.append(fileActions);
        fileActions
            .append('<h4 class="menu-heading">File Actions</h4>')
            .append('<button id="save-btn">')
            .append('<button id="load-btn">')
            .append('<input id="load-input">');

        $('#save-btn').text('Save Effect').click(function (event) {
            try {
                var save = []
                    , json
                    , blob;

                for (var i = 0; i < emitters.length; i++) {
                    save.push(emitters[i].opts);
                }

                json = JSON.stringify(save, undefined, 2);

                blob = new Blob([json], {type: 'application/json'});
                saveAs(blob, "effect.json");
            } catch (e) {
                console.error('error saving effect.\n%o\n%o', emitters, save);
            }
        });
        $('#load-btn').text('Load Effect').click(function (event) {
            $('#load-input').click();
        });
        $('#load-input').css('display', 'none').attr('type', 'file').on('change', function (event) {
            var file = this.files[0],
                reader = new FileReader();

            reader.onload = function (event) {
                $('#load-btn').text(file.name);
                var effectData = JSON.parse(event.currentTarget.result);
                emitters.length = effectData.length;
                for (var i = 0; i < effectData.length; i++) {
                    for (var opt in effectData[i]) {
                        emitters[i][opt] = effectData[i][opt];
                    }
                }
            };

            reader.readAsText(file);
        });

        $(window).on('load resize', function (event) {
            if (!$('#options-menu').data('max-height-set')) {
                $('#options-menu').css('max-height', $('#options-menu').height())
                    .data('max-height-set', true);
            }
            $('#options-menu').height($(window).height() - 50);
            $('#options-menu').mCustomScrollbar('update');
        });

        $('#options-menu').mCustomScrollbar({
            advanced: {
                updateOnContentResize: true
            }
        });
    }



}(jQuery, window));
