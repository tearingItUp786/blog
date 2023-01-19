import React from 'react'
import clsx from 'clsx'

class Toggle extends React.Component {
  state = {
    on: false,
  }

  handleClick =
    (cb = () => { }) =>
      (evt) => {
        this.setState({ on: !this.state.on }, () => cb(evt))
      }

  render() {
    const { state, handleClick } = this
    return this.props.children({ state, handleClick })
  }
}

function CheckBox() {
  return (
    <Toggle>
      {({ state, handleClick }) => {
        return (
          <input
            type='checkbox'
            id='scales'
            name='scales'
            checked={state.on}
            onChange={handleClick()}
            style={{ transform: `scale(1.5)` }}
          />
        )
      }}
    </Toggle>
  )
}

function PrettyToggle() {
  return (
    <Toggle>
      {({ state, handleClick }) => {
        const appliedHandleClick = handleClick(console.log)
        let transClasses = state.on ? `translate-x-[160%]` : `translate-x-0`
        let divClasses = state.on ? `bg-pink` : `bg-gray-100`

        return (
          <div className='relative block w-[120px] h-[56px]'>
            <div
              className={clsx(
                '4 h-10 w-[5.5rem] flex items-center rounded-full p-2 cursor-pointer transition-colors',
                divClasses
              )}
              onClick={appliedHandleClick}
            >
              <input
                className={clsx(
                  'drop-shadow-toggle transition-transform transition-color ease-in-out appearance-none cursor-pointer h-7 w-7 rounded-full',
                  'bg-white translate-x-0',
                  transClasses
                )}
                type='checkbox'
                role='switch'
                id='flexSwitchCheckDefault'
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
      <div className='w-full'>
        <div
          className={`w-[200px] h-[100px] flex flex-nowrap justify-evenly items-center`}
        >
          <CheckBox />
          <PrettyToggle />
        </div>
      </div>
    )
  }
}

export default App