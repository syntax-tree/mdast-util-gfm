import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {slug} from 'github-slugger'
import {toHtml} from 'hast-util-to-html'
import {gfm} from 'micromark-extension-gfm'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {gfmFromMarkdown, gfmToMarkdown} from 'mdast-util-gfm'
import {toHast} from 'mdast-util-to-hast'
import {toMarkdown} from 'mdast-util-to-markdown'
import {spec} from './spec.js'

test('core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('mdast-util-gfm')).sort(), [
      'gfmFromMarkdown',
      'gfmToMarkdown'
    ])
  })
})

test('markdown -> mdast', async function (t) {
  const files = spec.filter(function (example) {
    return !/disallowed raw html/i.test(example.category)
  })
  let index = -1

  while (++index < files.length) {
    const example = files[index]
    const name = index + '-' + slug(example.category)

    if (
      name === '24-autolinks' ||
      name === '25-autolinks' ||
      name === '26-autolinks'
    ) {
      // To do: add support for xmpp, mailto.
      continue
    }

    const mdast = fromMarkdown(example.input, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()]
    })

    const actualHtml = toHtml(toHast(mdast, {allowDangerousHtml: true}), {
      allowDangerousHtml: true,
      characterReferences: {useNamedReferences: true},
      closeSelfClosing: true
    })

    /** @type {string} */
    let expectedMarkdown

    const actualMarkdown = toMarkdown(mdast, {
      extensions: [gfmToMarkdown()]
    })

    await t.test(
      example.category + ' (' + index + ') -> html',
      async function () {
        const expectedUrl = new URL(
          'fixture/' + name + '.html',
          import.meta.url
        )

        /** @type {string} */
        let expectedHtml
        try {
          expectedHtml = String(await fs.readFile(expectedUrl))
        } catch {
          expectedHtml = example.output.slice(0, -1)
        }

        assert.equal(actualHtml, expectedHtml)
      }
    )

    await t.test(
      example.category + ' (' + index + ') -> md',
      async function () {
        const inputUrl = new URL('fixture/' + name + '.md', import.meta.url)

        try {
          expectedMarkdown = String(await fs.readFile(inputUrl))
        } catch {
          expectedMarkdown = actualMarkdown
          await fs.writeFile(inputUrl, expectedMarkdown)
        }

        assert.equal(actualMarkdown, expectedMarkdown)
      }
    )
  }
})
