import Page from '/components/page.jsx'
import Code from '/components/code.jsx'
import mercurial_java from 'code:./Mercurial.java'

export default props => <Page {...props} title={"Mercurial"}>
  <Code {...mercurial_java} ranges={[[4, 6]]} />
</Page>
