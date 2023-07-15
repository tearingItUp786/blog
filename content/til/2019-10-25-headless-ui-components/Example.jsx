import React from 'react'
import clsx from 'clsx'

class Toggle extends React.Component {
  state = {
    on: false,
  }

  handleClick =
    (cb = () => {}) =>
    evt => {
      this.setState({on: !this.state.on}, () => cb(evt))
    }

  render() {
    const {state, handleClick} = this
    return this.props.children({state, handleClick})
  }
}

function CheckBox() {
  return (
    <Toggle>
      {({state, handleClick}) => {
        return (
          <input
            aria-label="a sample checkbox"
            type="checkbox"
            id="scales"
            name="scales"
            checked={state.on}
            onChange={handleClick()}
            style={{transform: `scale(1.5)`}}
          />
        )
      }}
    </Toggle>
  )
}

function PrettyToggle() {
  return (
    <Toggle>
      {({state, handleClick}) => {
        const appliedHandleClick = handleClick(console.log)
        let transClasses = state.on ? `translate-x-[160%]` : `translate-x-0`
        let divClasses = state.on ? `bg-pink` : `bg-gray-100`

        return (
          <div className="relative block h-[56px] w-[120px]">
            <div
              className={clsx(
                '4 flex h-10 w-[5.5rem] cursor-pointer items-center rounded-full p-2 transition-colors',
                divClasses,
              )}
              onClick={appliedHandleClick}
            >
              <input
                className={clsx(
                  'transition-color h-7 w-7 cursor-pointer appearance-none rounded-full drop-shadow-toggle transition-transform ease-in-out',
                  'translate-x-0 bg-white',
                  transClasses,
                )}
                type="checkbox"
                role="switch"
                aria-label="a pretty toggle input"
                id="flexSwitchCheckDefault"
              />
            </div>
          </div>
        )
      }}
    </Toggle>
  )
}

class App extends React.Component {
  render() {
    return (
      <div className="w-full">
        <div
          className={`flex h-[100px] w-[200px] flex-nowrap items-center justify-evenly`}
        >
          <CheckBox />
          <PrettyToggle />
        </div>
      </div>
    )
  }
}

export default App
