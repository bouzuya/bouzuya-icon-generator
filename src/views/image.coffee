template = require '../templates/image'

module.exports =
  props: ['logo']
  computed:
    alt: ->
      "#{@logo.width()}x#{@logo.height()}"
    height: ->
      @logo.height()
    src: ->
      @logo.dataUri()
    width: ->
      @logo.width()
  template: template
