import React from 'react'
import styled from 'styled-components'

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
const Label = styled.label`
  position: relative;
  display: block;
  width: 120px;
  height: 56px;
`

const Input = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${(props) => props.theme.colors.accent || 'pink'};
  }

  &:focus + span {
    box-shadow: 0 0 1px #2196f3;
  }

  &:checked + span:before {
    transform: translateX(62px);
  }
`

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 56px;

  &:before {
    position: absolute;
    border-radius: 50%;
    content: '';
    height: 50px;
    width: 50px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }
`
function PrettyToggle() {
  return (
    <Toggle>
      {({ state, handleClick }) => {
        const appliedHandleClick = handleClick(console.log)
        return (
          <Label>
            <Input
              type='checkbox'
              checked={state.on}
              onChange={appliedHandleClick}
            />
            <Slider />
          </Label>
        )
      }}
    </Toggle>
  )
}

const OuterWrapper = styled.div`
  width: 100%;
`
const Container = styled.div`
  width: 200px;
  height: 100px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-evenly;
  align-items: center;
`

class App extends React.Component {
  render() {
    return (
      <OuterWrapper>
        <Container>
          <CheckBox />
          <PrettyToggle />
        </Container>
      </OuterWrapper>
    )
  }
}

export default App
