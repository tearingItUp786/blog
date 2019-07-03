---
title: Hello World
date: "2015-05-01T22:12:03.284Z"
description: Function currying, what it is and why you should care.
tag: Functional Programming
---

This is my first post on my new fake blog! How exciting!

```jsx{3,6}
class Button extends React.Component {
  state = {
    color: this.props.color
  };
  render() {
    const { color } = this.state; // 🔴 `color` is stale!
    return (
      <button className={'Button-' + color}>
        {this.props.children}
      </button>
    );
  }
}
```
