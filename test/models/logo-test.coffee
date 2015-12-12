assert = require 'power-assert'
{Logo} = require '../../src/models/logo'

describe 'Logo', ->
  it 'works', ->
    logo = new Logo
      width: 200
      height: 100
      svg: '<svg></svg>'

    assert logo.width() is 200
    assert logo.height() is 100
    assert logo.svg() is '<svg></svg>'
    assert logo.dataUri() is 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='
