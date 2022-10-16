# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm install`

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## What is this repo about?

This project is start of open-source investigation jurney. I took three react-use hooks:

- useBeforeUnload
- useClickAway
- useCopyToClipboard

and looked to each source code file to figure how it works.

## My conclusion (in polish)

# useClickAway()

1. składnia

```tsx
useClickAway(ref, onMouseEvent)
useClickAway(ref, onMouseEvent, ['click'])
useClickAway(ref, onMouseEvent, ['mousedown', 'touchstart'])
```

trzy argumenty:

- element HTML złapany jak `useRef()`

- funkcja, wywoływana po wykryciu `mous eeffect` określonego jako trzeci argument

- nasłuchiwany `mouse effect` (tablica z jednym lub dwoma argumentami, dotyczącymi efektu na klik i na dotyk, domyślnie: `mousedown`, `touchstart` )

2. przykład użycia

```tsx
import React, { useState, useRef } from 'react'
import { useClickAway } from 'react-use'

function UseClickAway() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const modal = useRef(null)

  useClickAway(modal, () => {
    //function start after click outside ref element
    setIsModalVisible(false)
  })

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
```

3. kod źródłowy

```tsx
import { RefObject, useEffect, useRef } from 'react'
import { off, on } from './misc/util'

//określenie domyślnych zdarzeń do nasłuchiwania
const defaultEvents = ['mousedown', 'touchstart']

//określenie typów TS
const useClickAway = <E extends Event = Event>(
  ref: RefObject<HTMLElement | null>, //null wywołuje error przy ref.current
  onClickAway: (event: E) => void,
  events: string[] = defaultEvents
) => {
  //przypisanie wykonywanej funkcji jako ref
  const savedCallback = useRef(onClickAway)

  //wykonuje się za kożdym razem i robi to samo co linijka wyżej, po co?
  //jak to zakomentuje, działa poprawnie
  useEffect(() => {
    savedCallback.current = onClickAway
  }, [onClickAway])

  useEffect(() => {
    //przypisanie do zmiennej handler funkcji, jeśli istnieje nasze element ref
    //w dokumencie HTML i zdarzenie nie zawiera naszego elementu (czyli klik
    //nie jest w naszym refie)
    const handler = (event) => {
      const { current: el } = ref
      el && !el.contains(event.target) && savedCallback.current(event)
    }

    //dodanie eventListnerów z tablicy domyślnej lub podanej przez nas na
    //cały dokument
    for (const eventName of events) {
      on(document, eventName, handler)
    }

    //clean-up function wykonywana przed pierwszym useEffect i przed
    //odmontowniem elementu
    return () => {
      for (const eventName of events) {
        off(document, eventName, handler)
      }
    }
  }, [events, ref])
}

export default useClickAway
```

funkcje `on` i `off`(bez TS dla większej czytelność):

```tsx
//on(document, eventName, handler);
//on(document, ['mouseup'], (event) => {
//const { current: el } = ref;
//el && !el.contains(event.target) && savedCallback.current(event);
//})

//dodanie listnera dla zdarzenia
function on(obj, ...args) {
  if (obj && obj.addEventListener) {
    obj.addEventListener(...args)
  }
}

//usunięcie listnera
function off(obj, ...args) {
  if (obj && obj.removeEventListener) {
    obj.removeEventListener(...args)
  }
}
```

4. brak testów
5. issues

[https://github.com/streamich/react-use/issues/1036](https://github.com/streamich/react-use/issues/1036)

kliknięcie na przycisk ponownie, wywołuje natychmiastowe zamknięcie i otwarcie elementu, jest PR poprawiający ten błąd.

# useBeforeUnload

1. składnia

```tsx
useBeforeUnload(boolean, 'message')
```

pierwszy argument decyduje, czy alert będzie wywoływany przed odświeżeniem strony (wartość `boolean` lub funkcja zwracająca taką wartość, domyślnie `true`), drugi to wiadomość alertu.

2. przykład użycia

```tsx
import React, { useState } from 'react'
import { useBeforeUnload } from 'react-use'

function UseBeforeUnload() {
  const [isChecked, setIsChecked] = useState(false)
  //custom message are not supported by most browsers
  //https://github.com/streamich/react-use/issues/1332
  useBeforeUnload(isChecked, 'Why does not custom message work!?')

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
```

3. kod źródłowy

```tsx
import { useCallback, useEffect } from 'react'
import { off, on } from './misc/util'

const useBeforeUnload = (
  enabled: boolean | (() => boolean) = true,
  message?: string
) => {
  //ustawienie funkcji przekazywanej potem do event listnera, która jest
  //zapamiętywana i zwraca wiadomość
  const handler = useCallback(
    (event: BeforeUnloadEvent) => {
      const finalEnabled = typeof enabled === 'function' ? enabled() : true

      //przerwanie jeśli pierwszy argument jako funkcja zwraca false
      if (!finalEnabled) {
        return
      }

      //wymagany do prawidłowego działania 'beforeunload' wg dokumentacji
      //https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
      event.preventDefault()

      if (message) {
        //event.returnValue w teori powinno zawierać treść informacji alertu,
        //w rzeczywistości jest tam customowa wiadomość przeglądarki
        event.returnValue = message
      }

      return message
    },
    [enabled, message]
  )

  //przerwya jeśli pierwszy argument jest falsy
  useEffect(() => {
    if (!enabled) {
      return
    }

    //dodanie listenerów na beforeunload na okno przeglądarki z funkcją
    on(window, 'beforeunload', handler)

    //cleanup -> usunięcie listenerów beforeunload z okna przeglądarki
    return () => off(window, 'beforeunload', handler)
  }, [enabled, handler])
}

export default useBeforeUnload
```

4. brak testów
5. issues

[https://github.com/streamich/react-use/issues/1673](https://github.com/streamich/react-use/issues/1673)

sprzed 2 lat, już nie aktualne…

# UseCopyToClipboard

1. składnia

```tsx
const [{ value, error, noUserInteraction }, copyToClipboard] =
  useCopyToClipboard()
```

- `value` — wartość skopiowana do schowka (jeśli brak to `undefined`)
- `error` — wyłapuje błędy podczas kopiowania
- `noUserInteraction` — wartość `booloean` wskazująca, czy skopiowano wartość poprzez użycie biblioteki `[copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard)`.
- `copyToClipboard` — funkcja, która jako argument przyjmuje kopiowany tekst

2. przykład użycia

```tsx
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
```

3. kod źródłowy

```tsx
import writeText from 'copy-to-clipboard'
import { useCallback } from 'react'
import useMountedState from './useMountedState'
import useSetState from './useSetState'

//TS
export interface CopyToClipboardState {
  value?: string
  noUserInteraction: boolean
  error?: Error
}

const useCopyToClipboard = (): [
  CopyToClipboardState,
  (value: string) => void
] => {
  //useMountedState()-> z tej biblioteki, nie jest to prawdziwy 'state', jego
  //zmiana nie powoduje rerenderu komponentu i zwraca true, jeśli komponent
  //został zamonotowany i false jeśli jeszcze nie
  const isMounted = useMountedState()

  //useSetState() -> z tej biblioteki, tworzy stan zachowujący się tak samo
  //jak stan w komponencie klasowym z this.setState -> łączy zmiany w obiekcie
  //do aktualnego stanu
  const [state, setState] = useSetState<CopyToClipboardState>({
    value: undefined, //te wartości dostępne przy destrukturyzacji przy użyciu
    error: undefined, //w obiekcie state
    noUserInteraction: true,
  })

  const copyToClipboard = useCallback((value) => {
    //jeśli komponent nie jest zamontowany, to kończy funkcję
    if (!isMounted()) {
      return
    }
    let noUserInteraction
    let normalizedValue
    try {
      // błąd jeśli próbujemy kopiować coś poza liczbą lub tekstem, zapisywany
      // do stanu
      // only strings and numbers casted to strings can be copied to clipboard
      if (typeof value !== 'string' && typeof value !== 'number') {
        const error = new Error(
          `Cannot copy typeof ${typeof value} to clipboard, must be a string`
        )
        //jeśli tryb deweloperski to consol.log błędu
        if (process.env.NODE_ENV === 'development') console.error(error)
        setState({
          value,
          error,
          noUserInteraction: true,
        })
        return
      }
      // pusty string działa podobnie
      // empty strings are also considered invalid
      else if (value === '') {
        const error = new Error(`Cannot copy empty string to clipboard.`)
        if (process.env.NODE_ENV === 'development') console.error(error)
        setState({
          value,
          error,
          noUserInteraction: true,
        })
        return
      }
      //zamiana ewentualnego number na string
      normalizedValue = value.toString()
      //użycie zewnętrznej biblioteki copy-to-clipboard
      noUserInteraction = writeText(normalizedValue)
      //aktualizacja stanu
      setState({
        value: normalizedValue,
        error: undefined,
        noUserInteraction,
      })
      //łapanie błędów
    } catch (error) {
      setState({
        value: normalizedValue,
        error,
        noUserInteraction,
      })
    }
  }, [])

  return [state, copyToClipboard]
}

export default useCopyToClipboard
```

4. test

```tsx
import writeText from 'copy-to-clipboard'
import { act, renderHook } from '@testing-library/react-hooks'
import { useCopyToClipboard } from '../src'

const valueToRaiseMockException =
  'fake input causing exception in copy to clipboard'
jest.mock('copy-to-clipboard', () =>
  jest.fn().mockImplementation((input) => {
    if (input === valueToRaiseMockException) {
      throw new Error(input)
    }
    return true
  })
)

describe('useCopyToClipboard', () => {
  let hook
  let consoleErrorSpy = jest
    .spyOn(global.console, 'error')
    .mockImplementation(() => {})

  //stworzenie testowanego hooka
  beforeEach(() => {
    hook = renderHook(() => useCopyToClipboard())
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
    jest.unmock('copy-to-clipboard')
  })

  it('should be defined ', () => {
    expect(useCopyToClipboard).toBeDefined()
  })

  it('should pass a given value to copy to clipboard and set state', () => {
    const testValue = 'test'
    let [state, copyToClipboard] = hook.result.current
    act(() => copyToClipboard(testValue))
    ;[state, copyToClipboard] = hook.result.current

    expect(writeText).toBeCalled() //wywołano zewnętrzną bibliotekę
    expect(state.value).toBe(testValue)
    expect(state.noUserInteraction).toBe(true)
    expect(state.error).not.toBeDefined()
  })

  it('should not call writeText if passed an invalid input and set state', () => {
    let testValue = {} // invalid value
    let [state, copyToClipboard] = hook.result.current
    act(() => copyToClipboard(testValue))
    ;[state, copyToClipboard] = hook.result.current

    expect(writeText).not.toBeCalled()
    expect(state.value).toBe(testValue)
    expect(state.noUserInteraction).toBe(true)
    expect(state.error).toBeDefined()

    testValue = '' // empty string is also invalid
    act(() => copyToClipboard(testValue))
    ;[state, copyToClipboard] = hook.result.current

    expect(writeText).not.toBeCalled()
    expect(state.value).toBe(testValue)
    expect(state.noUserInteraction).toBe(true)
    expect(state.error).toBeDefined()
  })

  it('should catch exception thrown by copy-to-clipboard and set state', () => {
    let [state, copyToClipboard] = hook.result.current
    act(() => copyToClipboard(valueToRaiseMockException))
    ;[state, copyToClipboard] = hook.result.current

    expect(writeText).toBeCalledWith(valueToRaiseMockException)
    expect(state.value).toBe(valueToRaiseMockException)
    expect(state.noUserInteraction).not.toBeDefined()
    expect(state.error).toStrictEqual(new Error(valueToRaiseMockException))
  })

  it('should return initial state while unmounted', () => {
    hook.unmount()
    const [state, copyToClipboard] = hook.result.current

    act(() => copyToClipboard('value'))
    expect(state.value).not.toBeDefined()
    expect(state.error).not.toBeDefined()
    expect(state.noUserInteraction).toBe(true)
  })

  it('should console error if in dev environment', () => {
    const ORIGINAL_NODE_ENV = process.env.NODE_ENV
    const testValue = {} // invalid value

    process.env.NODE_ENV = 'development'
    let [state, copyToClipboard] = hook.result.current
    act(() => copyToClipboard(testValue))
    process.env.NODE_ENV = ORIGINAL_NODE_ENV
    ;[state, copyToClipboard] = hook.result.current

    expect(writeText).not.toBeCalled()
    expect(consoleErrorSpy).toBeCalled()
    expect(state.value).toBe(testValue)
    expect(state.noUserInteraction).toBe(true)
    expect(state.error).toBeDefined()
  })
})
```

5. issues

[https://github.com/streamich/react-use/issues/1265](https://github.com/streamich/react-use/issues/1265)

tekst w schowku jest przechowywany na zawsze, społeczność sugeruje aby dodać kolejny argument do funkcji, który czyściłby schowek.
