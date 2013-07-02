(function () {

  // #container is set to the size of the window
  // so draggables can snap to the edge of the screen
  $(window).on('resize load', function (event) {
    var tainer = $('#container')
    tainer.height($(window).height())
    tainer.width($(window).width())
  })

  // Save emitters opts to local storage on unload
  // Save any errors when unloading the window so they can be read onload
  $(window).unload(function (event) {
    localStorage.setItem('unloaderror', "no error")
    try {
      var emitters = $('.toolbar').first().data().emitter.effect.emitters
        , optsArray = []

      for (var i = 0; i < emitters.length; i++) {
        optsArray.push(emitters[i].opts)
      }

      localStorage.setItem('opts', JSON.stringify(optsArray))
    } catch (e) {
      localStorage.setItem('unloaderror', e.message)
    }
  })

  $(document).ready(function () {

    // If an error occured during last unload, log it
    if (localStorage.getItem('unloaderror'))
      console.log('unload error: ' + localStorage.getItem('unloaderror'))
    /*
     // Get opts saved in local storage
     var opts = localStorage.getItem('opts') || null
     if ((opts !== null) || (typeof(opts) !== 'undefined')) {
     opts = (opts.match(/{}/)) ? null : JSON.parse(opts)
     // Add an empty 'shared' opts object
     opts.unshift({name: 'shared'})
     }
     */

    // Set initial size of canvas
    $('#webgl-canvas').width(($(document).width() < 1000) ? $(document).width() : 1000)

    // call the effect engine, passing canvas, opts and callback
    engine($('#webgl-canvas')[0], null, function (effect) {
      // Get gui default settings
      var defaultReq = new XMLHttpRequest()

      defaultReq.onload = function () {
        handleRes(this.responseText)
      }
      defaultReq.open('get', 'http://localhost/WebGLParticleEffectEditor/gui-default.json')
      defaultReq.send()

      function handleRes (res) {
        // Parse gui opts
        var tbOpts = JSON.parse(res)

        // Build toolbars using default gui opts and emitter opts
        for (var i = 0; i < effect.emitters.length; i++) {
          var opts = {}

          for (var opt in tbOpts) {
            if (opt.match(/name|duration|continuous|wind|rotation vec/))
              continue

            opts[opt] = {}
            for (var val in tbOpts[opt]) {
              // Slider limits come from gui opts
              // Initial slider value comes from emitters opts
              opts[opt][val] = new Array(3)
              opts[opt][val][0] = tbOpts[opt][val][0]
              opts[opt][val][1] = effect.emitters[i].opts[val]
              opts[opt][val][2] = tbOpts[opt][val][1]
            }
          }

          // create individual toolbar emitters
          toolbar(effect.emitters[i], opts)
        }

        // create the master toolbar (it affects all emitters)
        toolbar(effect.emitters, opts, true)
      }

      // build the header and main menu
      $('<div>').attr('id', 'main-menu').prependTo('body')
      $('<header>').attr('id', 'header').text('WebGL PEE').prependTo('body')
      $('<a>').attr('id', 'main-menu-anchor').appendTo('#header')
        .click(function (event) {
        if ($('#main-menu').css('visibility') === 'hidden')
          $('#main-menu').css('visibility', 'visible')
        else
          $('#main-menu').css('visibility', 'hidden')
        return false;
      })
      $('<img>').attr({
        src: 'images/gui-gear-grey.png',
        height: 16,
        width: 16
      }).appendTo('#main-menu-anchor')

      $('#main-menu').append('<h4>Textures</h4>')
      for (var i = 0; i < effect.emitters.length; i++) {
        var tp = $('<p>')
          , inp = $('<input>')
          , img = $('<img>')
        tp.addClass('main-menu-text-p').text(effect.emitters[i].name).appendTo('#main-menu')
        // file input tag
        inp.attr('type', 'file').css('display', 'none').appendTo(tp)
        // replace menu image with selected image
        inp.on('change', function (event) {
          var file = this.files[0]
            , newImg = $('<img>')
            , $self = $(this)
          newImg.attr({
            height: 32,
            width: 32
          }).addClass('text-p-img')
            .click(function (event) {
            $self.click()
          })
          newImg.get(0).file = file
          $self.data('img').remove()
          $self.data('img', newImg)
          $self.data('p').append(newImg)

          // read the image into the img tag
          var reader = new FileReader()
          reader.onload = (function (aImg) {
            return function (e) {
              aImg.onload = function (event) {
                //replace the emitter texture with the new image                
                effect.textureManager('replace')(aImg, $self.data('index'))
              }
              aImg.src = e.target.result;
            };
          })(newImg.get(0));
          reader.readAsDataURL(file);
        })
        // since input is display:hidden, its coresponding menu image
        // is saved as jquery data
        inp.data('img', img)
        // as well as its corresponding p tag
        inp.data('p', tp)
        // and the coresponing emitter
        inp.data('emitter', effect.emitters[i])
        inp.data('index', i)
        // likewise, the menu images' coresponding input tag
        // is saved as jquery data
        img.data('input', inp)
        img.attr({
          src: effect.emitters[i].textSource,
          height: 32,
          width: 32
        })
          .addClass('text-p-img').appendTo(tp)
          // when the image is clicked, the input's
          // click event is triggered
          .click(function (event) {
          $(this).data('input').click()
        })

      }
    })
  })

  // toolbar builder
  function toolbar (emitter, opts, master) {
    var tb = $('<div>')

    tb.data('emitter', emitter)

    tb.draggable({snap: '#header, #container, .toolbar'})
      .addClass('toolbar')
      .appendTo('#container')
      .css({
      position: 'absolute',
      right: '0px',
      top: $('header').height()
    })

      // toolbar z-indexes are a first-in, last-out stack
      .mousedown(function (event) {
      var self = this
        , zStack = toolbar.zStack

      zStack.forEach(function (val, ind, arr) {
        if (zStack[ind] === self)
          zStack.splice(ind, 1)
        else
          $(zStack[ind]).css('z-index', $(zStack[ind]).css('z-index') - 1)
      })

      $(this).css('z-index', 100)
      zStack.unshift(this)
      if (zStack.length > $('.toolbar').length)
        zStack.pop()
    })

    $('<div class="toolbar-header">' + ((master) ? "master" : emitter.name) +
      '<a href="" class="close"><img src="images/gui-close-grey.png"></a>' +
      '<a href="" class="up"><img src="images/gui-up-grey.png">' +
      '<a href="" style="display: none" class="down"><img src="images/gui-down-grey.png"></a>' +
      '</div>').appendTo(tb)

    $('.up').click(function (event) {
      var $this = $(this)
        , tb = $this.closest('.toolbar')
      tb.mCustomScrollbar('disable')
      tb.resizable('disable')
      tb.find('.setting-tainer, .up').css('display', 'none')
      tb.attr('data-height', tb.height())
      tb.css('height', '0px')
      $this.siblings('.down').css('display', 'block')
      return false
    })

    $('.down').click(function (event) {
      try {
        var $this = $(this)
          , tb = $this.closest('.toolbar')
        console.log(tb.attr('data-height'))
        tb.height(tb.attr('data-height'))
        tb.removeAttr('data-height')
        tb.find('.setting-tainer, .up').css('display', 'block')
        $this.css('display', 'none')
        tb.resizable('enable')
        tb.mCustomScrollbar('update')
      } catch (e) {
        console.log(e.message)
      }
      return false
    })

    $('.close').click(function (event) {
      $(this).closest(".toolbar").css('display', 'none')
      return false
    })

    for (var opt in opts) {
      var min = null
        , max = null
        , minKey = null
        , maxKey = null
        , val = null
      for (var key in opts[opt]) {
        if (key.match(/min/i)) {
          min = opts[opt][key]
          minKey = key
        } else if (key.match(/max/i)) {
          max = opts[opt][key]
          maxKey = key
        } else {
          val = opts[opt][key]
          key = [key]
          break
        }

        if (min && max) {
          key = [minKey, maxKey]
          break
        }
      }

      var settingTainer = $('<div>')
        , sliderTainer = $('<div>')
        , minSpan = $('<span class="min-span">')
        , maxSpan = $('<span class="max-span">')

      settingTainer.addClass('setting-tainer').data('key', key)
        .appendTo(tb)
      $('<h5>').text(opt).appendTo(settingTainer)

      // create sliders for opts with a min and max
      if (min && max) {
        sliderTainer.slider({
          min: min[0],
          values: [min[1], max[1]],
          max: max[2],
          range: true,
          step: (max[2] - min[0]) / 1000,
          slide: function (event, ui) {
            var emitter = $(ui.handle).closest('.toolbar').data().emitter
              , tainer = $(ui.handle).closest('.setting-tainer')
              , key = tainer.data().key

            if (master) {
              for (var i = 0; i < emitter.length; i++) {
                emitter[i][key[0]] = ui.values[0]
                emitter[i].opts[key[0]] = emitter[i][key[0]]
                emitter[i][key[1]] = ui.values[1]
                emitter[i].opts[key[1]] = emitter[i][key[1]]
              }
            } else {
              emitter[key[0]] = ui.values[0]
              emitter.opts[key[0]] = emitter[key[0]]
              emitter[key[1]] = ui.values[1]
              emitter.opts[key[1]] = emitter[key[1]]
            }
            tainer.find('a:nth-child(2)').attr('title', ui.values[0])
            tainer.find('a:last-child').attr('title', ui.values[1])
          }
        })
          .appendTo(settingTainer)
        settingTainer.find('.ui-slider .ui-slider-handle:nth-child(2)').attr('title', min[1])
        settingTainer.find('.ui-slider .ui-slider-handle:last-child').attr('title', max[1])
        minSpan.text(min[0])
        maxSpan.text(max[2])

        // create sliders for opts with only one value
      } else {
        sliderTainer.slider({
          min: val[0],
          value: val[1],
          max: val[2],
          step: (val[2] - val[0]) / 1000,
          slide: function (event, ui) {
            var emitter = $(ui.handle).closest('.toolbar').data().emitter
              , key = $(ui.handle).closest('.setting-tainer').data().key
            if (master) {
              for (var i = 0; i < emitter.length; i++) {
                emitter[i][key[0]] = ui.value
                emitter[i].opts[key[0]] = emitter[i][key[0]]
              }
            } else {
              emitter[key] = ui.value
              emitter.opts[key] = emitter[key]
            }
            $(ui.handle).attr('title', ui.value)
          }
        })
          .appendTo(settingTainer)
        settingTainer.find('.ui-slider .ui-slider-handle:last-child').attr('title', val[1])
        minSpan.text(val[0])
        maxSpan.text(val[2])
      }

      sliderTainer.closest('.setting-tainer').prepend(minSpan).prepend(maxSpan)
    }

    tb.mCustomScrollbar({
      advanced: {
        updateOnContentResize: true
      }})

    tb.find('.setting-tainer').first().css('padding-top', '15px')
    tb.find('.setting-tainer').last().css('padding-bottom', '5px')
    tb.resizable({
      handles: 's, e, w',
      minWidth: 175,
      resize: function (event, ui) {
        ui.element.find('.toolbar-header').width(tb.width() - 6)
        ui.element.mCustomScrollbar('update')
      }})

    tb.find('.toolbar-header').width(tb.width() - 6)
    tb.find('.mCSB_draggerContainer').css('top', '35px')
  }

  // toolbar z-index stack
  toolbar.zStack = []
}())