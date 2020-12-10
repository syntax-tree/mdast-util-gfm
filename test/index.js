var fs = require('fs')
var path = require('path')
var test = require('tape')
var slug = require('github-slugger').slug
var toHast = require('mdast-util-to-hast')
var toHtml = require('hast-util-to-html')
var fromMarkdown = require('mdast-util-from-markdown')
var toMarkdown = require('mdast-util-to-markdown')
var syntax = require('micromark-extension-gfm')()
var gfm = require('..')
var spec = require('./spec')

test('markdown -> mdast', function (t) {
  spec
    .filter((example) => {
      return !/disallowed raw html/i.test(example.category)
    })
    .forEach((example, index) => {
      var category = slug(example.category)
      var name = index + '-' + category
      var fixtureHtmlPath = path.join(__dirname, name + '.html')
      var fixtureMarkdownPath = path.join(__dirname, name + '.md')
      var fixtureHtml
      var fixtureMarkdown
      var mdast
      var html
      var md

      mdast = fromMarkdown(example.input, {
        extensions: [syntax],
        mdastExtensions: [gfm.fromMarkdown]
      })

      html = toHtml(
        toHast(mdast, {allowDangerousHtml: true, commonmark: true}),
        {
          allowDangerousHtml: true,
          entities: {useNamedReferences: true},
          closeSelfClosing: true
        }
      )

      try {
        fixtureHtml = String(fs.readFileSync(fixtureHtmlPath))
      } catch (_) {
        fixtureHtml = example.output.slice(0, -1)
      }

      md = toMarkdown(mdast, {extensions: [gfm.toMarkdown()]})

      try {
        fixtureMarkdown = String(fs.readFileSync(fixtureMarkdownPath))
      } catch (_) {
        fixtureMarkdown = md
        fs.writeFileSync(fixtureMarkdownPath, fixtureMarkdown)
      }

      t.deepEqual(html, fixtureHtml, category + ' (' + index + ') -> html')
      t.equal(md, fixtureMarkdown, category + ' (' + index + ') -> md')
    })

  t.end()
})
