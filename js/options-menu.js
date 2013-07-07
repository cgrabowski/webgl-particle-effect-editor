var PEE = PEE || {};

PEE.optionsMenu = (function ($, window, undefined) {

    // options menu
    return function OptionsMenu (effect, emitters, callback) {
        var optionsMenu = $('<div>').attr('id', 'options-menu');
        optionsMenu.prependTo('body');
        var textDiv = $('<div>').addClass('menu-div').attr('id', 'text-div')
            .appendTo(optionsMenu)
            .append('<h4 class="menu-heading">Textures</h4>');

        for (var i = 0; i < emitters.length; i++) {
            var tp = $('<p>'),
                inp = $('<input>'),
                img = $('<img>')
            tp.addClass('options-menu-text-p').text(emitters[i].name).appendTo(textDiv);
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
                $self.data('p').append(newImg);
                ;
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

        // file actions
        var fileActions = $('<div id="file-actions">').addClass('menu-div');
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
}(jQuery, window));
