import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {slug} from 'github-slugger'
import {toHast} from 'mdast-util-to-hast'
import {toHtml} from 'hast-util-to-html'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {gfm} from 'micromark-extension-gfm'
import {gfmFromMarkdown, gfmToMarkdown} from '../index.js'
import * as mod from '../index.js'
import {spec} from './spec.js'

test('core', () => {
  assert.deepEqual(
    Object.keys(mod).sort(),
    ['gfmFromMarkdown', 'gfmToMarkdown'],
    'should expose the public api'
  )
})

test('markdown -> mdast', async () => {
  const files = spec.filter(
    (example) => !/disallowed raw html/i.test(example.category)
  )
  let index = -1

  while (++index < files.length) {
    const example = files[index]
    const name = index + '-' + slug(example.category)
    const mdast = fromMarkdown(example.input, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()]
    })

    if (
      name === '24-autolinks' ||
      name === '25-autolinks' ||
      name === '26-autolinks'
    ) {
      // To do: add support for xmpp, mailto.
      continue
    }

    const hast = toHast(mdast, {allowDangerousHtml: true})
    assert(hast, 'expected node')
    const actualHtml = toHtml(hast, {
      allowDangerousHtml: true,
      entities: {useNamedReferences: true},
      closeSelfClosing: true
    })

    /** @type {string} */
    let expectedHtml
    /** @type {string} */
    let expectedMarkdown
    const expectedUrl = new URL(name + '.html', import.meta.url)
    const inputUrl = new URL(name + '.md', import.meta.url)

    try {
      expectedHtml = String(await fs.readFile(expectedUrl))
    } catch {
      expectedHtml = example.output.slice(0, -1)
    }

    const actualMarkdown = toMarkdown(mdast, {extensions: [gfmToMarkdown()]})

    try {
      expectedMarkdown = String(await fs.readFile(inputUrl))
    } catch {
      expectedMarkdown = actualMarkdown
      await fs.writeFile(inputUrl, expectedMarkdown)
    }

    assert.equal(
      actualHtml,
      expectedHtml,
      example.category + ' (' + index + ') -> html'
    )
    assert.equal(
      actualMarkdown,
      expectedMarkdown,
      example.category + ' (' + index + ') -> md'
    )
  }
})
