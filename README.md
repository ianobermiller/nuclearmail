# NuclearMail
NuclearMail is an experiment of writing a webmail client using React and the Flux architecture. It runs completely in the browser and uses the Gmail REST API.

Try it out at: http://ianobermiller.github.io/nuclearmail/

## Getting started

1. `npm start` will start webpack-dev-server and the watchers.
2. Open http://localhost:8000 in your browser. Changing any file will build and refresh the window.
3. `flow` to run the typechecker

## Technologies used
- React Intl
- react-router
- webpack
- react-hot-loader
- Google Caja
- Inline Styles :o

## Keyboard shortcuts
- `y` - archive

## TODO

- Show search sign on hover over contact name, click to search by that
- Scroll to top when navigating
- Fetch more when archiving all of inbox
- Simple compose
- Compose with Markdown
- WYSIWYG composer? http://neilj.github.io/Squire/
- PGP encryption?
- More keyboard shortcuts
- Navigation for labels
- Contribute RCSS changes upstream if applicable
- https://github.com/gaearon/react-hot-loader
