import Page from '/components/page.jsx'
import Code from '/components/code.jsx'
import demo from 'code:/demo.java'

export default props => <Page {...props} title={"Home"}>
  <Code {...demo} />
  Hellow!
</Page>
