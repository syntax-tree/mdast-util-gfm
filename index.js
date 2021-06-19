import gfmAutolinkLiteralFromMarkdown from 'mdast-util-gfm-autolink-literal/from-markdown.js'
import gfmAutolinkLiteralToMarkdown from 'mdast-util-gfm-autolink-literal/to-markdown.js'
import gfmStrikethroughFromMarkdown from 'mdast-util-gfm-strikethrough/from-markdown.js'
import gfmStrikethroughToMarkdown from 'mdast-util-gfm-strikethrough/to-markdown.js'
import gfmTableFromMarkdown from 'mdast-util-gfm-table/from-markdown.js'
import gfmTableToMarkdown from 'mdast-util-gfm-table/to-markdown.js'
import gfmTaskListItemFromMarkdown from 'mdast-util-gfm-task-list-item/from-markdown.js'
import gfmTaskListItemToMarkdown from 'mdast-util-gfm-task-list-item/to-markdown.js'

var own = {}.hasOwnProperty

export const gfmFromMarkdown = configure([
  gfmAutolinkLiteralFromMarkdown,
  gfmStrikethroughFromMarkdown,
  gfmTableFromMarkdown,
  gfmTaskListItemFromMarkdown
])

export function gfmToMarkdown(options) {
  return {
    extensions: [
      gfmAutolinkLiteralToMarkdown,
      gfmStrikethroughToMarkdown,
      gfmTableToMarkdown(options),
      gfmTaskListItemToMarkdown
    ]
  }
}

function configure(extensions) {
  var config = {transforms: [], canContainEols: []}
  var length = extensions.length
  var index = -1

  while (++index < length) {
    extension(config, extensions[index])
  }

  return config
}

function extension(config, extension) {
  var key
  var left
  var right

  for (key in extension) {
    left = own.call(config, key) ? config[key] : (config[key] = {})
    right = extension[key]

    if (key === 'canContainEols' || key === 'transforms') {
      config[key] = [].concat(left, right)
    } else {
      Object.assign(left, right)
    }
  }
}
