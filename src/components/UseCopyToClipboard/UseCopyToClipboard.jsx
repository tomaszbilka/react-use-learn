import React, { useState } from 'react'
import { useCopyToClipboard } from 'react-use'

function UseCopyToClipboard() {
  const [text, setText] = useState('')
  const [state, copyToClipboard] = useCopyToClipboard()

  return (
    <section className="section">
      <h2>UseCopyToClipboard</h2>
      <div className="useCopyToClipboard">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="useCopyToClipboard__input"
        />
        <button
          type="button"
          onClick={() => copyToClipboard(text)}
          className="useCopyToClipboard__button"
        >
          copy text
        </button>
        {state.error ? (
          <p className="useCopyToClipboard__error">
            Error: {state.error.message}
          </p>
        ) : (
          state.value && (
            <p className="useCopyToClipboard__text">Copied: {state.value}</p>
          )
        )}
      </div>
    </section>
  )
}

export default UseCopyToClipboard
