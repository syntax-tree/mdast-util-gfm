var autolinkLiteral = require('mdast-util-gfm-autolink-literal/to-markdown')
var strikethrough = require('mdast-util-gfm-strikethrough/to-markdown')
var table = require('mdast-util-gfm-table/to-markdown')
var taskListItem = require('mdast-util-gfm-task-list-item/to-markdown')

module.exports = toMarkdown

function toMarkdown(options) {
  var extensions = [
    autolinkLiteral,
    strikethrough,
    table(options),
    taskListItem
  ]
  var length = extensions.length
  var index = -1
  var extension
  var unsafe = []
  var handlers = {}

  while (++index < length) {
    extension = extensions[index]
    // istanbul ignore next - unsafe always exists, for now.
    unsafe = unsafe.concat(extension.unsafe || [])
    handlers = Object.assign(handlers, extension.handlers || {})
  }

  return {unsafe: unsafe, handlers: handlers}
}
