import assert from 'node:assert/strict'
import fs from 'node:fs'
import fetch from 'node-fetch'

const response = await fetch(
  'https://api.github.com/repos/micromark/micromark-extension-gfm/contents/test/spec.js',
  {headers: {Accept: 'application/vnd.github.v3.raw'}}
)
assert(response.body, 'expected body')
response.body.pipe(
  fs.createWriteStream(new URL('../test/spec.js', import.meta.url))
)
