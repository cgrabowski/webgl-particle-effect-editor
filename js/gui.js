$(document).ready(function () {
  $('canvas').width(($(document).width() < 1000) ? $(document).width() : 1000)
  engine(function (effect) {

    var defaultReq = new XMLHttpRequest()

    defaultReq.onload = function () {
      handleRes(this.responseText)
    }
    defaultReq.open('get', 'http://localhost/WebGLParticleEffectEditor/gui-default.json')
    defaultReq.send()


    function handleRes (res) {
      var tbOpts = JSON.parse(res)
      for (var i = 0; i < effect.emitters.length; i++) {
        var opts = {}
        for (var opt in tbOpts) {
          if (opt.match(/name|continuous|wind|rotation vec/))
            continue
          opts[opt] = {}
          for (var val in tbOpts[opt]) {
            opts[opt][val] = new Array(3)
            opts[opt][val][0] = tbOpts[opt][val][0]
            opts[opt][val][1] = effect.emitters[i].opts[val]
            opts[opt][val][2] = tbOpts[opt][val][1]
          }
        }
        toolbar(effect.emitters[i], opts)
      }
      toolbar(effect.emitters, opts, true)
    }
  })
})

$(window).on('resize load', function (event) {
  var tainer = $('#container')
  tainer.height($(window).height())
  tainer.width($(window).width())
})

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

    .resizable({handles: "e, w"})

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
    $this.closest(".toolbar").find('.setting-tainer').css('display', 'none')
    $this.css('display', 'none').siblings('.down').css('display', 'inline')
    return false
  })

  $('.down').click(function (event) {
    var $this = $(this)
    $this.closest(".toolbar").find('.setting-tainer').css('display', 'block')
    $this.css('display', 'none').siblings('.up').css('display', 'inline')
    return false
  })

  $('.close').click(function (event) {
    $(this).closest(".toolbar").remove()
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
              emitter[i][key[1]] = ui.values[1]
            }
          } else {
            emitter[key[0]] = ui.values[0]
            emitter[key[1]] = ui.values[1]
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
            }
          } else {
            emitter[key] = ui.value
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
}

toolbar.zStack = []
