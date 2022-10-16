import React, { useState } from 'react'
import { useBeforeUnload } from 'react-use'

function UseBeforeUnload() {
  const [isChecked, setIsChecked] = useState(false)
  //custom message are not supported by most browsers
  //https://github.com/streamich/react-use/issues/1332
  useBeforeUnload(isChecked, 'My message!')

  const checkedHandler = () => setIsChecked((prev) => !prev)

  return (
    <section className="section">
      <h2>UseBeforeUnload</h2>
      <div className="useBeforeUnload">
        <p>try refresh page after some change</p>
      </div>
      <div className="useBeforeUnload__wrapp">
        <p>OFF</p>
        <label className="useBeforeUnload__switch">
          <input
            type="checkbox"
            className="useBeforeUnload__input"
            name="checkbox"
            checked={isChecked}
            onChange={checkedHandler}
          ></input>
          <span className="useBeforeUnload__slider"></span>
        </label>
        <p>ON</p>
      </div>
    </section>
  )
}

export default UseBeforeUnload
