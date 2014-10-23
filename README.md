# NuclearMail
NuclearMail is an experiment of writing a webmail client using React and the Flux architecture. It runs completely in the browser and uses the Gmail REST API.

Try it out at: http://ianobermiller.github.io/nuclearmail/

## Getting started

1. Run `gulp` in the root directory
2. Any changes will automatically refresh the browser

## Known Issues

If you get Uncaught SyntaxError: Unexpected token ILLEGAL pointing to the end of App.js, just change something and let it rebuild. This sometimes happens on the first build.

## TODO

- Routing
- Simple compose
- Compose with Markdown
- WYSIWYG composer?
- PGP encryption?
- Keyboard shortcuts
- Navigation between inbox, priority, labels, etc
- Use lodash modules
- Contribute RCSS changes upstream if applicable
- https://github.com/naman34/react-stylePrefixr (needs value support)
- https://github.com/greypants/gulp-starter/tree/master/gulp/tasks
