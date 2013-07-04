(function () {
  var effect
    , emitters
    , toolbarStack = []

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

    // create canvas and container
    $('<div>').attr('id', 'container').appendTo($('body'))
    $('<canvas style="border: none;" width="1920" height="1080">')
      .attr('id', 'webgl-canvas')
      .appendTo($('#container'))

    // call the effect engine, passing canvas, opts and callback
    engine($('#webgl-canvas')[0], null, function (eff, render) {
      effect = eff
      emitters = effect.emitters
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
        for (var i = 0; i < emitters.length; i++) {
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
              opts[opt][val][1] = emitters[i].opts[val]
              opts[opt][val][2] = tbOpts[opt][val][1]
            }
          }

          // create individual toolbar emitters
          toolbar(emitters[i], opts)
        }

        // create the master toolbar (it affects all emitters)
        toolbar(emitters, opts, true)

        // build the main menu and begin rendering when it is complete
        mainMenu(render)
      }
    })
  })

  // #container is set to the size of the window
// so draggables can snap to the edge of the screen
  $(window).on('resize load', function (event) {
    var tainer = $('#container')
      , $win = $(window)
    tainer.height($win.height())
    tainer.width($win.width())
  })

  // Save emitters opts to local storage on unload
  // Save any errors when unloading the window so they can be read onload
  $(window).unload(function (event) {
    localStorage.setItem('unloaderror', "no error")
    var optsArray = []
    for (var i = 0; i < emitters.length; i++) {
      optsArray.push(emitters[i].opts)
    }
    try {
      localStorage.setItem('opts', JSON.stringify(optsArray))
    } catch (e) {
      localStorage.setItem('unloaderror', e.message)
    }
  })

// build the header and main menu            
  function mainMenu (callback) {
// page header
    $('<header>').attr('id', 'header').text('WebGL PEE').prependTo('body')

    // main menu button
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

    // main menu
    var mainMenu = $('<div>').attr('id', 'main-menu')
    mainMenu.prependTo('body')
    var textDiv = $('<div>').addClass('menu-div').attr('id', 'text-div')
      .appendTo(mainMenu)
      .append('<h4 class="menu-heading">Textures</h4>')
    for (var i = 0; i < emitters.length; i++) {
      var tp = $('<p>')
        , inp = $('<input>')
        , img = $('<img>')
      tp.addClass('main-menu-text-p').text(emitters[i].name).appendTo(textDiv)
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
      inp.data('emitter', emitters[i])
      inp.data('index', i)
      // likewise, the menu images' coresponding input tag
      // is saved as jquery data
      img.data('input', inp)
      img.attr({
        src: emitters[i].textSource,
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
// file actions
    fileActions = $('<div id="file-actions">').addClass('menu-div')
    mainMenu.append(fileActions)
    fileActions
      .append('<h4 class="menu-heading">File Actions</h4>')
      .append('<button id="save-btn">')
      .append('<button id="load-btn">')
      .append('<input id="load-input">')

    $('#save-btn').text('Save Effect').click(function (event) {
      try {
        var save = []
          , json
          , blob

        for (var i = 0; i < emitters.length; i++) {
          save.push(emitters[i].opts)
        }

        json = JSON.stringify(save, undefined, 2)

        blob = new Blob([json], {type: 'application/json'})
        saveAs(blob, "effect.json")
      } catch (e) {
        console.error('error saving effect.\n%o\n%o', emitters, save)
      }
    })
    $('#load-btn').text('Load Effect').click(function (event) {
      $('#load-input').click()
    })
    $('#load-input').css('display', 'none').attr('type', 'file').on('change', function (event) {
      var file = this.files[0]
        // = JSON.parse(file)
        , reader = new FileReader()
      reader.onload = function (event) {
        $('#load-btn').text(file.name)
        var effectData = JSON.parse(event.currentTarget.result)
        console.log(emitters)
        emitters.length = effectData.length
        for (var i = 0; i < effectData.length; i++) {
          for (var opt in effectData[i]) {
            emitters[i][opt] = effectData[i][opt]
          }
        }
      }
      reader.readAsText(file)
    })

    callback()
  }



  // toolbar builder
  function toolbar (emitter, opts, master) {

    var tb = $('<div>')

    if (master)
      tb.data('master', true)

    tb.data('emitter', emitter)

    tb.draggable({snap: '#header, #container, .toolbar'})
      .addClass('toolbar')
      .prependTo('#container')
      .css({
      position: 'absolute',
      right: '0px',
      top: $('header').height()
    })

    if (master) {
      tb.css('left', '0px')
    }
    // toolbar z-indexes are a first-in, last-out stack
    tb.mousedown(function (event) {
      var self = this

      toolbarStack.forEach(function (val, ind, arr) {
        if (toolbarStack[ind] === self)
          toolbarStack.splice(ind, 1)
        else
          $(toolbarStack[ind]).css('z-index', $(toolbarStack[ind]).css('z-index') - 1)
      })

      $(this).css('z-index', 100)
      toolbarStack.unshift(this)
      if (toolbarStack.length > $('.toolbar').length)
        toolbarStack.pop()

      // prevent world transforms when interacting with toolbar
      return false;
    }
    )

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


      // change slider limits on click
      sliderTainer.siblings('span').click(function limitClick (event) {
        console.log(this)
        var $this = $(this)
          , $input = $('<input class="limit-input" name="" value="' + $this.text() + '">')
          , emitter = $this.closest('.toolbar').data().emitter
          , key = $this.closest('.setting-tainer').data().key

        // these classes identify an input as a min or max input
        if ($this.hasClass('min-span'))
          $input.addClass('limit-input-left')
        else
          $input.addClass('limit-input-right')

        $this.replaceWith($input)

        // close input when anything is clicked
        $('body, span, a').one('click', function setLimit (event) {
          var sl = $input.siblings('.ui-slider')
            , newLimit = parseFloat($input.val().replace(/^[^-][^0-9\.]/g, ""))

          // check if val is NaN
          if (!(newLimit < Infinity))
            newLimit = $this.text()

          if ($input.hasClass('limit-input-left')) {
            console.log('min, ' + newLimit)
            sl.slider('option', 'min', newLimit)
          } else {
            console.log('max, ' + newLimit)
            sl.slider('option', 'max', newLimit)
          }

          // set new emitter opt value(s)

          // for emitters with min and max (two slider handles)  
          if (sl.slider('values').length === 2) {
            var vals = sl.slider('values')
            sl.find('.ui-slider-handle:nth-child(2)').attr('title', vals[0])
            sl.find('.ui-slider-handle:last-child').attr('title', vals[1])
            if (master) {
              for (var i = 0; i < emitter.length; i++) {
                emitter[i][key[0]] = vals[0]
                emitter[i][key[1]] = vals[1]
              }
            } else {
              emitter[key[0]] = vals[0]
              emitter[key[1]] = vals[1]
            }

            // for emitters with one val (one slider handle)
          } else {
            var val = sl.slider('value')
            sl.find('.ui-slider-handle:last-child').attr('title', val)
            if (master) {
              for (var i = 0; i < emitter.length; i++) {
                emitter[i][key] = val
              }
            } else {
              emitter[key] = val
            }
          }

          // update span and replace input with it
          $this.text(newLimit)
          $input.replaceWith($this)

          // this handler should only be in use when a limit input is open
          $('body, span, a').off('click', setLimit)

          // the span needs to have its click handler reassigned
          $this.click(limitClick)

          return false
        })

        $input[0].focus()
        return false
      })
    }

    // pressing enter closes an open limit input 
    $(window).on('keypress', function detectKey (event) {
      if (event.keyCode === 13) { // Enter            
        $(window).off('keypress', detectKey)
        $('body').click()
      }
    })

    // add custom scrollbar and resizable plugins
    tb.mCustomScrollbar({
      advanced: {
        updateOnContentResize: true
      }})

    tb.find('.setting-tainer').first().css('padding-top', '24px')
    tb.find('.setting-tainer').last().css('padding-bottom', '12px')

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

}())