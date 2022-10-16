import React, { useState, useRef, useEffect } from 'react'

function ClickAway() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const modal = useRef(null)

  function on(obj, ...args) {
    if (obj && obj.addEventListener) {
      obj.addEventListener(...args)
    }
  }

  function off(obj, ...args) {
    if (obj && obj.removeEventListener) {
      obj.removeEventListener(...args)
    }
  }

  const defaultEvents = ['mousedown', 'touchstart']

  const useClickAway = (ref, onClickAway, events = defaultEvents) => {
    // console.log('start values: ', ref, onClickAway, events)

    const savedCallback = useRef(onClickAway)
    // console.log(savedCallback)

    useEffect(() => {
      savedCallback.current = onClickAway
    }, [onClickAway])

    useEffect(() => {
      const handler = (event) => {
        const { current: el } = ref
        // console.log(el)
        el && !el.contains(event.target) && savedCallback.current(event)
      }
      for (const eventName of events) {
        // console.log(eventName)
        on(document, eventName, handler)
      }
      return () => {
        // console.log('clean up')
        for (const eventName of events) {
          off(document, eventName, handler)
        }
      }
    }, [events, ref])
  }

  useClickAway(
    modal,
    () => {
      setIsModalVisible(false)
    },
    ['mouseup']
  )

  return (
    <section className="section">
      <h2>ClickAway()</h2>
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

export default ClickAway
