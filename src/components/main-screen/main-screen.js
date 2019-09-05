import React, { Component } from 'react';
import './main-screen.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Headers from './../../addons/headers';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: {},
      chatList: []
    }
  }

  componentWillMount() {
    const reqData = {
      method: 'POST',
      mode: "cors",
      credentials: "same-origin",
      headers: Headers,
      body: `user=${this.props.user}`
    }


    fetch('http://localhost:3002/api/getUserData', reqData)
    .then(response => response.json())
    .then(json => this.setState({userData: json}));

    fetch('http://localhost:3002/api/getChats', reqData)
    .then(response => response.json())
    .then(json => {
      if(json.chatList.length > 0) {
        this.setState({
          chatList: json.chatList
        });
      }
    });
  }

  render() {
    return (
      <div className="main-screen">
        <header>
          <h1>{this.props.user}</h1>
          <button>
            <FontAwesomeIcon icon={faSlidersH} />
          </button>
        </header>
        <aside>
          <ul>
            <li onClick={this.props.logout}>
              Log Out <FontAwesomeIcon icon={faSignOutAlt} />
            </li>
          </ul>
        </aside>
      </div>
    );
  }
}

export default App;