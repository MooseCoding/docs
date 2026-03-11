# Dairy Docs 2.0

## Development
This project statically renders itself to html very efficiently via a [bespoke
vite plugin](./comptime.js).

`vhtml` is used to power jsx transforms at build time, which may cause memory
leaks for long time use during `npm run dev`.

`highlight.js` is used to power syntax highlighting at build time.

`simplecss` is used to provide good default syntax for very plain HTML documents.
Make sure to look at it's docs for how to use it, rather than introduce new
styles.

### Builtins

#### Page

```js
import Page from '/components/page.jsx';

export default props => <Page {...props} title={"Demo"}>
</Page>
```

Template HTML document with a title, footer and nav tree, and also brings in the
common runtime javascript and css, should be used for all pages.

#### Code

```js
import Page from '/components/page.jsx'
import Code from '/components/code.jsx'
import demo from 'code:/demo.java'

export default props => <Page {...props} title={"Demo"}>
  <Code {...demo} />
  <Code {...demo} ranges={[[4, 6]]} />
</Page>
```

Build time file import and highlighting.

`ranges` can be specified to select specific ranges of the file to show, if no
ranges are specified, all lines are shown.

See [TODO](#tagged-file-imports) for future improvements to this
system in order to switch away from numbered ranges.

### Commands

`npm run build`:

builds the project with vite, puts generated static site in `build/dist`

`npm run dev`:

starts the vite dev server

### TODO

#### Switch to Arborium

Arborium seems like a better syntax highlighting system, but is very young and
requires async, which won't work alongside vhtml, see below.

#### `vhtml` Fork

`vhtml` is unmaintained and has some small bugs:
1. no support for async components, which would be very nice.
2. has a cache memory leak.

Vendoring it into this project and fixing these issues would be nice.

#### Clipboard

Currently there is no copy button for the code blocks, clipboardjs would make
that easy, and is used by mdbook.

#### Search

I'd like to add a search bar to the site. elasticlunr js is used by mdbook to
achieve this.

#### Improved Nav Bar

At the moment the nav bar is [very minimally
rendered](./src/components/router.jsx), and it needs some javascript to more
appropriately enable opening and closing of the tree, and opening and closing
the whole panel.

#### Tagged File Imports

Rather than specify selected ranges of files to show, have the importer do some
more work and chop up the file more:

```java
package com.example;

public class Main {
  //<main>
  public static void main(String[] args) {
    //<config>

    //</config>
  }
  //</main>
}
```

this would create three sections:
1. `default` - the whole file with the tag comments stripped
2. `main` - the code between the `<main>` tag lines with the tag comments
   stripped
3. `config` - the code between the `<main>` tag lines with the tag comments
   stripped

Its pretty easy to imagine that this would be better when its possible to use.
