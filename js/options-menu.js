var PEE = PEE || {};

PEE.optionsMenu = (function ($, window, undefined) {

    // options menu
    return function OptionsMenu (effect, emitters, callback) {
        var optionsMenu = $('<div>').attr('id', 'options-menu');
        optionsMenu.prependTo('body');

        // graph or slider
        var graphables = ParticleEffect.GRAPHABLES,
            graphMenu = $('<div>'),
            emitterSel = $('<select>');

        graphMenu.addClass('menu-div-left')
            .attr('id', 'graph-menu')
            .appendTo(optionsMenu)
            .append(emitterSel)
            .append('<h4 class="menu-heading">Graph or Slider</h4>');

        emitterSel.attr('id', 'graph-emitter-select')
            .addClass('menu-select')
            .append('<option value="master">master</option>');

        for (var i = 0; i < emitters.length; i++) {
            emitterSel.append('<option value="' + emitters[i].emitterName + '">' + emitters[i].emitterName + '</option>');
        }

        emitterSel.click(function (event) {
            var emitter;
            if (emitterSel.val() === 'master') {
                emitter = effect;
            } else {
                for (var i = 0; i < effect.emitters.length; i++) {
                    if (effect.emitters[i].emitterName === emitterSel.val()) {
                        emitter = effect.emitters[i];
                        break;
                    }
                }
            }
            var eg = emitter.graphablesConfig,
                settings = $(graphMenu.find('p select')),
                i = -1;

            settings.find('.slider-opt').each(function (index, element) {
                element.selected = true;
            });

            while (eg) {
                if (++i === settings.length) {
                    console.error('infinite loop');
                    break;
                } else if (eg % 2) {
                    $(settings[i]).children('.graph-opt')[0].selected = true;
                }
                eg >>>= 1;
            }

        });

        for (var g = 0; g < graphables.length; g++) {
            var sdp = $('<p>'),
                sdsel = $('<select>');

            sdp.addClass('options-menu-p')
                .text(graphables[g])
                .appendTo(graphMenu);

            sdsel.addClass('menu-select')
                .appendTo(sdp)
                .append('<option class="slider-opt" value="slider">Slider</option>')
                .append('<option class="graph-opt" value="graph">Graph</option>')
                .data('name', graphables[g])

                .click(function (event) {
                var $this = $(this),
                    $tb,
                    emitter;

                $('.toolbar').each(function (index, element) {
                    if ($(element).data('name') === $('#graph-emitter-select').val()) {
                        $tb = $(element),
                            emitter = ($tb.data('master')) ? effect : $tb.data('emitter');
                    }
                });

                $tb.find('svg').each(function (index, element) {
                    var $svg = $(element),
                        flag = ($this.data('name').toUpperCase() + '_BIT').replace(' ', '_');

                    if ($svg.data('name') === $this.data('name')) {
                        if ($this.val() === 'graph') {
                            emitter.enableGraphed(ParticleEffect.GRAPHABLE_FLAGS[flag]);
                            console.log(emitter.graphablesConfig);
                            $svg.data('slider').css('display', 'none').siblings('span').css('display', 'none');
                            $svg.css('display', 'block');
                        } else if ($this.val() === 'slider') {
                            emitter.disableGraphed(ParticleEffect.GRAPHABLE_FLAGS[flag]);
                            console.log(emitter.graphablesConfig);
                            $svg.data('slider').css('display', 'block')
                                .siblings('span').css('display', 'inline');
                            $svg.css('display', 'none');
                        }
                    }
                });




                /*
                 ParticleEffect.GRAPHABLES = ['offset x', 'offset y', 'offset z', 'speed', 'direction x', 'direction y', 'direction z', 'rotation'];
                 
                 ParticleEffect.BASE_GRAPH_ARRAY = [0, -1, null, null, 1, 1, 2, -1];
                 
                 
                 ParticleEffect.FLAGS = {
                 OFFSET_X_BIT: 1,
                 OFFSET_Y_BIT: 2,
                 OFFSET_Z_BIT: 4,
                 SPEED_BIT: 8,
                 DIRECTION_X_BIT: 16,
                 DIRECTION_Y_BIT: 32,
                 DIRECTION_Z_BIT: 64,
                 ROTATION_BIT: 128
                 };
                 */

                //console.log($this);
                // var flag;
                // for (var gr in ParticleEffect.GRAPHABLES) {

                // }
                // $tb.data('emitter').effect.enableGraphed();




            });
        }

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
                src: emitters[i].textSource,
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

        // emitters
        var emittersMenu = $('<div>').addClass('menu-div-right')
            .attr('id', 'emitters-div')
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
                        } else if ($(element).data('emitter').emitterName === $this.data('toolbar-name')) {
                            $(element).css('visibility', 'visible');
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
                console.log(emitters);
                emitters.length = effectData.length;
                for (var i = 0; i < effectData.length; i++) {
                    for (var opt in effectData[i]) {
                        emitters[i][opt] = effectData[i][opt];
                    }
                }
            };

            reader.readAsText(file);
        });
    }
}(jQuery, window)
    );
