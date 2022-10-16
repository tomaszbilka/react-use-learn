import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './components/Layout'
import './application.sass'
import UseClickAway from './components/UseClickAway'
import UseBeforeUnload from './components/UseBeforeUnload'
import UseCopyToClipboard from './components/UseCopyToClipboard'
import ClickAway from './components/ClickAway'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Layout>
      <UseClickAway />
      <UseBeforeUnload />
      <UseCopyToClipboard />
      <hr></hr>
      <ClickAway />
    </Layout>
  </React.StrictMode>
)
