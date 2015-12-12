template = require '../templates/canvas'

module.exports =
  props: ['logo']
  created: ->
    img = new Image()
    img.onload = =>
      canvas = @.$$.canvas
      canvas.height = @logo.height()
      canvas.width = @logo.width()
      context = canvas.getContext '2d'
      context.drawImage img, 0, 0, canvas.width, canvas.height
    img.src = @logo.dataUri()
  template: template
