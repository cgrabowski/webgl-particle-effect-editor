var PEE = PEE || {};

PEE.optionsMenu = (function ($, window, undefined) {

    // options menu
    return function (effect, emitters, guiOpts) {

        var optionsMenu = $('<div>').attr('id', 'options-menu');

        optionsMenu.prependTo('body');

        // Actions
        var actions = $('<div id="actions">').addClass('menu-div-full');

        optionsMenu.prepend(actions);
        actions
            .append('<button id="reset-btn">')
            .append('<h4 class="menu-heading">Actions</h4>')
            .append('<button id="save-btn">')
            .append('<button id="load-btn">')
            .append('<input id="load-input">')
            .append('<button id="add-emitter">');
        $('<button id="delete-emitter">').insertBefore($('#add-emitter'));

        $('#reset-btn').text('Reset GUI and Effect Data')
            .css('float', 'right')
            .prependTo(actions)
            .click(confirmReset);

        function confirmReset (event) {
            $('<div>').attr('id', 'reset-confirm-div')
                .css({width: $('#reset-btn').width(), right: 0, top: 0})
                .html('Are you sure you want<br />to reset everything? <button id="reset-confirm-btn">OK</button><button id="reset-cancel-btn">Cancel</button>')
                .appendTo('#actions');

            $('#reset-confirm-btn').click(resetEverything);

            $(window).on('keyup.cancelReset', function (event) {
                if (event.keyCode === 27) {
                    cancelReset(event);
                }
            });

            $('*').not('#reset-confirm-div').one('click.cancelReset', cancelReset);

            return false;
        }

        function cancelReset (event) {
            $('#reset-confirm-div').remove();
            $('*').off('click.cancelReset');
            $(window).off('keyup.cancelReset');
        }

        function resetEverything (event) {
            $(window).off('unload');
            try {
                localStorage.setItem('unloaderror', 'no unload error');

                localStorage.setItem('emittersOpts', null);
                localStorage.setItem('effectOpts', null);
            } catch (e) {
                localStorage.setItem('unloaderror', e.message);
            }
            location.reload();
        }

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

        $('#add-emitter').text('Add Emitter')
            .addClass('btn-right')
            .click(function (event) {
            event.stopImmediatePropagation();

            $(window).on('keyup.createEmitter', function (event) {
                if (event.keyCode === 13) {
                    createEmitter($('#add-emitter-input').val());
                    $('#add-emitter-div').remove();
                } else if (event.keyCode === 27) {
                    $('#add-emitter-div').remove();
                }

                if (event.keyCode === 13 || event.keyCode === 27) {
                    $('div').off('click.createEmitter');
                    $(window).off('keyup.createEmitter');
                }
            });

            $('div').on('click.createEmitter', function (event) {
                event.stopImmediatePropagation();
                if ($(event.target).is('#add-emitter-input')) {
                    return false;
                }
                createEmitter($('#add-emitter-input').val());
                $('div').off('click.createEmitter');
                $(window).off('keyup.createEmitter');
                $('#add-emitter-div').remove();
                return false;
            });

            $('<div>').attr('id', 'add-emitter-div')
                .appendTo('#actions')
                .append('<input type="text" id="add-emitter-input" />');

            $('#add-emitter-input').focus();
        });

        function createEmitter (name) {
            $('div').off('click.createEmitter');
            $(window).off('keyup.createEmitter');
            name = name || null;

            var image = new Image();

            effect.textureSources.push('images/particle.png');
            image.onload = function () {
                effect.textureManager('add')(image);
                effect.emitters.push(new ParticleEmitter(effect, {textSource: 'images/particle.png', emitterName: name}, effect.emitters.length));
                effect.emitters[effect.emitters.length - 1].bindTexture = effect.textureManager('bind')(effect.emitters.length - 1);
                $('div').trigger('emitter-added');
            };
            image.src = 'images/particle.png';

        }

        $('#delete-emitter').text('Delete Emitter')
            .addClass('btn-right')
            .click(function (event) {

            event.stopImmediatePropagation();

            $(window).on('keyup.deleteEmitter', function (event) {
                if (event.keyCode === 27) {
                    $('#delete-emitter-div').remove();
                    $(window).off('keyup.deleteEmitter');
                }
            });

            if ($('#delete-emitter-div').length > 0) {
                $('#delete-emitter-div').remove();
                return false;
            }

            var deleteList = $('<div>')
                .attr('id', 'delete-emitter-div')
                .appendTo('#actions');

            effect.emitters.forEach(function (element, index, array) {
                var ep = $('<p>').text(element.opts.emitterName)
                    .click(function (event) {
                    effect.emitters[index] = null
                    effect.emitters.splice(index, 1);
                    $('div').trigger('emitter-removed');
                });

                deleteList.append(ep);
            });

            $('*').one('click', function (event) {
                $('#delete-emitter-div').remove();
            });

        });


        // Controls
        var graphables = ParticleEffect.GRAPHABLES,
            controlsMenu = $('<div>');

        controlsMenu.addClass('menu-div-left')
            .attr('id', 'graph-menu')
            .appendTo(optionsMenu)
            .append('<h4 class="menu-heading">Controls</h4>');

        createEmitterSelect();

        controlsMenu.on('emitter-added emitter-removed', function (event) {
            $('#emitter-select').remove();
            createEmitterSelect();
        });

        function createEmitterSelect () {
            var emitterSel = $('<select>');
            controlsMenu.prepend(emitterSel);
            emitterSel.attr('id', 'emitter-select')
                .addClass('menu-select')
                .append('<option value="master">master</option>');

            for (var i = 0; i < emitters.length; i++) {
                emitterSel.append('<option value="' + emitters[i].emitterName + '">' + emitters[i].emitterName + '</option>');
            }


            controlsMenu.find('h4').height($('#emitter-select').height() * 2);

            emitterSel.click(function (event) {
                var emitter;
                if (emitterSel.val() === 'master') {
                    controlsMenu.find('.channel-select').css('visibility', 'hidden');
                    emitter = effect;
                } else {
                    controlsMenu.find('.channel-select').css('visibility', 'visible');
                    for (var i = 0; i < effect.emitters.length; i++) {
                        if (effect.emitters[i].emitterName === emitterSel.val()) {
                            emitter = effect.emitters[i];
                            break;
                        }
                    }
                }

                var gConfig = emitter.opts.graphablesConfig,
                    cConfig = emitter.opts.channelConfig,
                    $graphSelects = $(controlsMenu.find('p select.graph-select:visible')),
                    $channelSelects = $(controlsMenu.find('p select.channel-select'));

                $graphSelects.children('.slider-opt').each(function (index, element) {
                    element.selected = true;
                });

                $graphSelects.children('.graph-opt').each(function (index, element) {
                    var flag = $(element).closest('p')[0].childNodes[0].nodeValue.toUpperCase() + '_BIT';
                    if (gConfig & ParticleEffect.GRAPHABLE_FLAGS[flag]) {
                        element.selected = true;
                    }
                });

                $channelSelects.children('.use-master-opt').each(function (index, element) {
                    element.selected = true;
                });

                $channelSelects.children('.use-self-opt').each(function (index, element) {
                    var flag = $(element).closest('p')[0].childNodes[0].nodeValue.toUpperCase() + '_BIT';
                    if (cConfig & ParticleEffect.CHANNEL_FLAGS[flag]) {
                        element.selected = true;
                    }
                });

            });
        }

        for (var opt in ParticleEffect.DEFAULT_OPTS) {

            if (opt.match(/min|emitterName|textSource/)) {
                continue;
            } else if (opt.match('max')) {
                opt = opt[3].toLowerCase() + opt.substr(4);
            }

            var grp = $('<p>'),
                grsel = $('<select>'),
                useMasterSel = $('<select>');

            grp.addClass('options-menu-p')
                .text(opt)
                .appendTo(controlsMenu);

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
                        $tb = $(element);
                        emitter = ($tb.data('master')) ? effect : $tb.data('emitter');
                    }
                });

                $tb.find('svg').each(function (index, element) {
                    var $svg = $(element),
                        flag = ($this.data('name').toUpperCase() + '_BIT');

                    if ($svg.data('name') === $this.data('name')) {
                        if ($this.val() === 'graph') {
                            emitter.enableGraphed(ParticleEffect.GRAPHABLE_FLAGS[flag]);
                            $svg.data('slider').css('display', 'none');
                            $svg.css('display', 'block');
                            $svg.siblings('.max-span').detach()
                                .removeClass('max-span')
                                .addClass('max-span-left')
                                .insertBefore($svg.siblings('h5'));
                            $svg.siblings('.min-span').detach()
                                .insertAfter($svg);
                            $svg.parent().css('padding-bottom', '6px');
                        } else if ($this.val() === 'slider') {
                            emitter.disableGraphed(ParticleEffect.GRAPHABLE_FLAGS[flag]);
                            $svg.data('slider').css('display', 'block');
                            $svg.siblings('.max-span-left').detach()
                                .removeClass('max-span-left')
                                .addClass('max-span')
                                .insertBefore($svg.siblings('h5'));
                            $svg.siblings('.min-span').detach()
                                .insertBefore($svg.siblings('h5'));
                            $svg.parent().css('padding-bottom', '0px');
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

                    $tb.find('.setting-tainer').each(function (index, element) {
                        var $element = $(element);

                        if ($element.find('h5').text() === $this.data('name')) {
                            $element.css('color', 'rgb(224, 224, 224)')
                                .find('.ui-slider').css('background-color', 'rgb(160, 160, 160)')
                                .andSelf().find('.ui-slider-handle').css('background-color', 'rgb(224, 224, 224)');

                            $element.find('.gridline-horiz, .gridline-vert').attr('stroke', '#FFF');
                            $element.find('text').attr('fill', '#A0A0A0');
                            $element.find('rect, .minline, .maxline').attr('stroke-width', '2');
                            $element.find('circle').attr({'stroke-width': 1, r: 4});
                        }

                    });

                } else if ($this.val() === 'useMaster') {
                    emitter.useMasterChannel(ParticleEffect.CHANNEL_FLAGS[flag]);

                    $tb.find('.setting-tainer').each(function (index, element) {
                        var $element = $(element);

                        if ($element.find('h5').text() === $this.data('name')) {
                            $element.css('color', '#303030')
                                .find('.ui-slider, .ui-slider-handle').css('background-color', '#303030')
                            $element.find('.ui-slider-handle').css('background-color', '#303030');

                            $element.find('.gridline-horiz, .gridline-vert').attr('stroke', '#303030');
                            $element.find('text').attr('fill', '#303030');
                            $element.find('rect, .minline, .maxline').attr('stroke-width', 0);
                            $element.find('circle').attr({'stroke-width': 0, r: 0});
                        }
                    });
                }

            });

            grp.height(grsel.height() + useMasterSel.height() * 2.2);

        }

        // set inital state of graph-selects based on effect.opts.graphablesConfig
        $(controlsMenu.find('p select.graph-select'))
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

        createTextureList();

        textDiv.on('emitter-added emitter-removed', function (event) {
            $('#textures-div p').remove();
            createTextureList();
        });

        function createTextureList () {
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

                    var timg = $self.data('p').find('.transparency-img');
                    newImg.insertAfter(timg);

                    // read the image into the img tag;
                    var reader = new FileReader();
                    reader.onload = (function (aImg) {
                        return function (e) {
                            aImg.onload = function (event) {
                                var safety = 0,
                                    ht = aImg.height,
                                    wt = aImg.width;

                                while ((ht % 2) === 0 && ht > 1) {
                                    if (safety++ > 1000) {
                                        console.error('Infinite Loop');
                                        break;
                                    }
                                    ht /= 2;
                                }
                                while ((wt % 2) === 0 && wt > 1) {
                                    if (safety++ > 1000) {
                                        console.error('Infinite Loop');
                                        break;
                                    }
                                    wt /= 2;
                                }
                                console.log(ht, wt);
                                if (ht !== 1 || wt !== 1) {
                                    alert('Texture dimensions must be a <a href="http://en.wikipedia.org/wiki/Power_of_two">power of two</a>.');
                                } else {
                                    //replace the emitter texture with the new image                ;
                                    try {
                                        effect.textureManager('replace')(aImg, $self.data('index'));
                                        effect.emitters[$self.data('index')].opts.textSource = e.target.result;
                                    } catch (e) {
                                        console.error(e.message);
                                    }
                                }
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
        }

        // toolbars
        var emittersMenu = $('<div>').addClass('menu-div-right')
            .attr('id', 'toolbars-div')
            .appendTo(optionsMenu);

        $('<h5>').addClass('menu-heading')
            .text('Toolbars')
            .appendTo(emittersMenu);

        createToolbarList();

        emittersMenu.on('emitter-added emitter-removed', function (event) {
            $('#toolbars-div .options-menu-p').remove();
            createToolbarList();
        });

        function createToolbarList () {
            var tbnames = [];

            emitters.forEach(function (element, index, array) {
                tbnames.push(element.emitterName);
            })
            tbnames.unshift('master');

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
                                $('#emitter-select').val('master').click();
                                $(element).css('visibility', 'visible');
                                $(element).trigger('mousedown');
                            } else if ($(element).data('emitter').emitterName === $this.data('toolbar-name')) {
                                $('#emitter-select').val($(element).data('emitter').emitterName).click();
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
        }


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
