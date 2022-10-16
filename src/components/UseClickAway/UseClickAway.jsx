import React, { useState, useRef } from 'react'
import { useClickAway } from 'react-use'

function UseClickAway() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const modal = useRef(null)

  useClickAway(modal, () => setIsModalVisible(false), ['mouseup'])

  return (
    <section className="section">
      <h2>useClickAway()</h2>
      <div className="useClickAway">
        {isModalVisible && (
          <div ref={modal} className="useClickAway__modal">
            MODAL
          </div>
        )}
        {!isModalVisible && (
          <button
            type="button"
            onClick={() => setIsModalVisible(true)}
            className="useClickAway__button"
          >
            open modal
          </button>
        )}
      </div>
    </section>
  )
}

export default UseClickAway
