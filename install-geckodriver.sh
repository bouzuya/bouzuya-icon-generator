#!/bin/sh

url='https://github.com/mozilla/geckodriver/releases/download/v0.32.2/geckodriver-v0.32.2-macos.tar.gz'
curl --location --silent "${url}" | tar -xz
mv geckodriver ./node_modules/.bin/

