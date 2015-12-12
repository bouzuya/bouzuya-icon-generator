class Logo
  constructor: ({ width, height, svg }) ->
    @_width = width
    @_height = height
    @_svg = svg

  dataUri: ->
    encoded = new Buffer(@_svg).toString('base64')
    'data:image/svg+xml;base64,' + encoded

  height: ->
    @_height

  svg: ->
    @_svg

  width: ->
    @_width

module.exports.Logo = Logo
