gui = {
  zStack: []
}

$(document).ready(function () {
  engine(function (effect) {

    for (var i = 0; i < effect.emitters.length; i++) {
      var eo = effect.emitters[i].opts
      toolbar(eo.name, {
        'min particles': eo.minParticles,
        'max particles': eo.maxParticles,
        'min life': eo.minLife,
        'max life': eo.maxLife,
        'duration': eo.duration,
        'min delay': eo.minDelay,
        'max delay': eo.maxDelay
      })
    }
  })
})

$(window).on('resize load', function (event) {
  var tainer = $('#container')
  tainer.height($(window).height())
  tainer.width($(window).width())
})

function toolbar (name, settings) {
  var toolbar = $('<div>')
  toolbar.settings = settings

  toolbar.draggable({snap: '#header, #container, .toolbar'})
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
      , zStack = gui.zStack

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

  $('<div class="toolbar-header">' + name +
    '<a href="" class="close"><img src="images/gui-close-grey.png"></a>' +
    '<a href="" class="up"><img src="images/gui-up-grey.png">' +
    '<a href="" style="display: none" class="down"><img src="images/gui-down-grey.png"></a>' +
    '</div>').appendTo(toolbar)

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


  i = 0
  for (var setting in settings) {
    var settingTainer = $('<div>').addClass('setting-tainer')
      .appendTo(toolbar)
    $('<h5>').text(setting + ": " + settings[setting]).appendTo(settingTainer)
    $('<div>').attr('id', 'slider' + i++).slider({
      change: function (event, ui) {
        console.log(ui.value)
      }})
      .appendTo(settingTainer)
  }

  toolbar.on('activeEmitterChange', function (event, newEmitter) {
    var i = 0;
    for (var setting in toolbar.settigs) {
      toolbar.settings[setting] = newEmitter[setting]
      $(toolbar).find('<h5>')[i++].text(setting + ": " + settings[setting])
    }
  })
}