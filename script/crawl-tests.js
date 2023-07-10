import fs from 'node:fs/promises'
import {fetch} from 'undici'

const response = await fetch(
  'https://api.github.com/repos/micromark/micromark-extension-gfm/contents/test/spec.js',
  {headers: {Accept: 'application/vnd.github.v3.raw'}}
)
const text = await response.text()

await fs.writeFile(new URL('../test/spec.js', import.meta.url), text)
