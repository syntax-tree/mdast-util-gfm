import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import Slugger from 'github-slugger'
import {toHast} from 'mdast-util-to-hast'
import {toHtml} from 'hast-util-to-html'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {gfm} from 'micromark-extension-gfm'
import {gfmFromMarkdown, gfmToMarkdown} from '../index.js'
import {spec} from './spec.js'

test('markdown -> mdast', (t) => {
  const files = spec.filter(
    (example) => !/disallowed raw html/i.test(example.category)
  )
  let index = -1

  while (++index < files.length) {
    const example = files[index]
    const category = Slugger.slug(example.category)
    const name = index + '-' + category
    const fixtureHtmlPath = path.join('test', name + '.html')
    const fixtureMarkdownPath = path.join('test', name + '.md')

    const mdast = fromMarkdown(example.input, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()]
    })

    const html = toHtml(
      toHast(mdast, {allowDangerousHtml: true, commonmark: true}),
      {
        allowDangerousHtml: true,
        entities: {useNamedReferences: true},
        closeSelfClosing: true
      }
    )

    let fixtureHtml
    let fixtureMarkdown

    try {
      fixtureHtml = String(fs.readFileSync(fixtureHtmlPath))
    } catch {
      fixtureHtml = example.output.slice(0, -1)
    }

    const md = toMarkdown(mdast, {extensions: [gfmToMarkdown()]})

    try {
      fixtureMarkdown = String(fs.readFileSync(fixtureMarkdownPath))
    } catch {
      fixtureMarkdown = md
      fs.writeFileSync(fixtureMarkdownPath, fixtureMarkdown)
    }

    t.deepEqual(html, fixtureHtml, category + ' (' + index + ') -> html')
    t.equal(md, fixtureMarkdown, category + ' (' + index + ') -> md')
  }

  t.end()
})
