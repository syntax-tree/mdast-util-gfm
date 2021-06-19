import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

fetch(
  'https://api.github.com/repos/micromark/micromark-extension-gfm/contents/test/spec.json',
  {headers: {Accept: 'application/vnd.github.v3.raw'}}
).then((response) => {
  response.body.pipe(fs.createWriteStream(path.join('test', 'spec.json')))
})
