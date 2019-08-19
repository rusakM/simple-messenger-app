import React, { Component } from 'react';
import Styled from 'styled-components';
import LoginScreen from './../login-screen/login-screen'

class App extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div className="App">
        <LoginScreen />
      </div>
    );
  }
}

export default App;