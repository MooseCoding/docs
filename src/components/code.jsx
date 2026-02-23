//import { highlight, setConfig } from '@arborium/arborium'

import hljs from 'highlight.js'
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import eye from './fa-eye.svg?raw'

//setConfig({
//  hostUrl: "@arborium/arborium",
//})

hljs.configure({
  tabReplace: '  ', // 4 spaces
  languages: [], // Languages used for auto-detection
});

const Eye = () => <vhtml.Fragment dangerouslySetInnerHTML={{ __html: eye }} />

const RevealHiddenCode = () => <button
  class='reveal-hidden-code'
  title='Show hidden lines'
  aria-label='Show hidden lines'>
  <Eye />
</button>

export default ({ filename, url, ranges = [[0, Number.MAX_SAFE_INTEGER]] }) => {
  const language = extname(filename).slice(1)

  if (!language) throw new Error(`unable to determine language from file extension for ${file}`)

  const file = fileURLToPath(url)

  const src = readFileSync(file, 'utf-8');

  const highlighted = hljs.highlight(
    src.trim(),
    { language }
  ).value;

  const { lines, anyHidden } = highlighted
    .split('\n')
    .reduce(({ lines, anyHidden }, line, i) =>
      // i is in one of the specified ranges
      ranges.some(([x, y]) => x <= (i + 1) && (i + 1) < y)
      ? {
        lines: lines + line + '\n',
        anyHidden: anyHidden,
      }
      : {
        lines: lines + <span class='boring' dangerouslySetInnerHTML={{ __html: line + '\n' }} />,
        anyHidden: true,
      },
      {
        lines: '',
        anyHidden: false,
      });

  return <pre>
    <code
      class={`hljs language-${language} hide-boring`}
      dangerouslySetInnerHTML={{
        __html: anyHidden
          ? <button
            class='reveal-hidden-code'
            title='Show hidden lines'
            aria-label='Show hidden lines'>
              <Eye />
          </button> + lines
          : lines,
      }}
    />
  </pre>
}
