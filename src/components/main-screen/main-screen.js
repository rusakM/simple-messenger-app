import React, { Component } from 'react';
import Styled from 'styled-components';
import LoginScreen from './../login-screen/login-screen'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loggedIn: false
    }
    this.loggerService = this.loggerService.bind(this);
  }

  loggerService(event) {
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <LoginScreen loggerService={this.loggerService}/>
      </div>
    );
  }
}

export default App;