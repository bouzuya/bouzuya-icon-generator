Vue = require 'vue'
{Logo} = require './models/logo'
canvasView = require './views/canvas'
imageView = require './views/image'
appTemplate = require './templates/app'
logoSquare = require './templates/logo-square'

new Vue(
  el: '#app'
  data:
    logoSquare100x100: new Logo(width: 100, height: 100, svg: logoSquare)
    logoSquare200x200: new Logo(width: 200, height: 200, svg: logoSquare)
    logoSquare400x400: new Logo(width: 400, height: 400, svg: logoSquare)
    logoSquare600x600: new Logo(width: 600, height: 600, svg: logoSquare)
    logoSquare1200x1200: new Logo(width: 1200, height: 1200, svg: logoSquare)
  template: appTemplate
  components:
    'l-canvas': canvasView
    'l-image': imageView
)
