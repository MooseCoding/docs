import Router from './router.jsx'

export default ({ router, title, children }) => <>
  <vhtml.Fragment dangerouslySetInnerHTML={{ __html: '<!DOCTYPE html>' }} />
  <html lang='en'>
    <head>
      <script type='module' src='/main.js' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta charset='utf-8' />
      <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta http-equiv="Pragma" content="no-cache" />
      <meta http-equiv="Expires" content="0" />
    </head>
    <body>
      <header>
        <title>{title}</title>
        <h1>{title}</h1>
      </header>
      <nav><Router tree={router} /></nav>
      <main>{children}</main>
      <footer>
        © Dairy Foundation 2026-2026<br />
        <a href='https://github.com/Dairy-Foundation/docs/'>GitHub</a> | <a href='https://repo.dairy.foundation/'>Maven Repository</a>
      </footer>
    </body>
  </html>
</>
