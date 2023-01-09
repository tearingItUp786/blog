import React from 'react'

class Toggle extends React.Component {
  state = {
    on: false,
  }

  handleClick =
    (cb = () => {}) =>
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
        return (
          <div className='relative block w-[120px] h-[56px]'>
            <input
              className={`opacity-0 w-0 h-0 checked:bg-[#ff00ff] focus:ring-1 focus:ring-[#2196f3] checked:translate-x-[62px]`}
              type='checkbox'
              checked={state.on}
              onChange={appliedHandleClick}
            />
            <div
              className={`
          absolute
          top-0 left-0 right-0 bottom-0 bg-gray-400 rounded-full transition duration-300'

          before:absolute
          before:rounded-full
          before:content['']
          before:h-[50px]
          before:w-[50px]
          before:left-[4px]
          before:bottom-[4px]
          before:bg-white
          before:transition duration-300
          `}
            ></div>
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
          className={`w-[200px h-[100px] flex flex-nowrap justify-evenly items-center`}
        >
          <CheckBox />
          <PrettyToggle />
        </div>
      </div>
    )
  }
}

export default App
