import React, { Component } from 'react';
import './main-screen.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH, faSignOutAlt, faUserCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import Headers from '../../middlewares/headers';
import Avatar from './../../assets/avatar.png';
import Store from './../../middlewares/store';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: {
        photo: '',
        email: '',
        name: ''
      },
      chatList: [],
      chats: [],
      settingsScreen: {
        enabled: false,
        classes: "right-settings-screen"
      },
      searchBar: "",
      searchScreen: {
        enabled: false,
        classes: "search-items-container"
      }
    };


    this.goToSettings = this.goToSettings.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.closeSearchScreen = this.closeSearchScreen.bind(this);
    this.openChat = this.openChat.bind(this);
  }


  componentWillMount() {
    const reqData = {
      method: 'POST',
      mode: "cors",
      credentials: "same-origin",
      headers: Headers,
      body: `user=${this.props.user}`
    }


    fetch('http://localhost:3001/api/getUserData', reqData)
    .then(response => response.json())
    .then(json => this.setState({userData: json}));

    fetch('http://localhost:3001/api/getChats', reqData)
    .then(response => response.json())
    .then(json => {
      if(json.length > 0) {

        for(let a = 0; a < json.length; a++) {
          Store.insert(json[a]);
        }

        let arr = Store.getSortedChatArray();
        this.setState({
          chats: arr,
          chatList: arr.map((item, nr) => 
            <ChatListItem 
              open={this.openChat}
              chatid={item}
              img={Store[item].userPhoto}
              name={Store[item].name}
              activitystatus={(Store[item].userIsActive === 1) ? 'chat-img chat-img-active' : 'chat-img'}
              key={nr}
              content={Store.getLastMessageContent(item)}
              userid={Store[item].userId}
            />
          )
        });
      }
    });
  }

  goToSettings() {
    this.props.history.push(`/settings`);
  }

  searchHandler(event) {
    if(event.target.value !== "") {
      this.setState({
        searchScreen: {
          enabled: true,
          classes: "search-items-container search-items-container-show"
        },
        searchBar: event.target.value
      });
    }
    else {
      this.setState({
        searchScreen: {
          enabled: false,
          classes: "search-items-container search-items-container-hide"
        },
        searchBar: ""
      });
    }
  }

  closeSearchScreen() {
    this.setState({
      searchScreen: {
        enabled: false,
        classes: "search-items-container search-items-container-hide"
      },
      searchBar: ""
    });
  }

  toggleSettings() {
    if(!this.state.settingsScreen.enabled) {
      this.setState({
        settingsScreen: {
          enabled: true,
          classes: "right-settings-screen right-settings-screen-show"
        }
      });
    }
    else {
      this.setState({
        settingsScreen: {
          enabled: false,
          classes: "right-settings-screen right-settings-screen-hide"
        }
      });
    }
  }

  openChat(idChat) {
    this.props.history.push(`/chat/${idChat}`);
  }

  render() {
    return (
      <div className="main-screen">
        <header className="main-header">
          <div>
             <img src={(this.state.userData.photo) ? this.state.userData.photo : Avatar} className="user-photo"/>
             <h2>My chats:</h2>
          </div>
         
          <button className="btn-menu" onClick={this.toggleSettings}> 
            <FontAwesomeIcon icon={faSlidersH} />
          </button>
        </header>
        <div className="search-bar-container">
            <input type="text" value={this.state.searchBar} className="search-bar" onChange={this.searchHandler} placeholder="Search"/>
            <SearchScreen 
              screen={this.state.searchScreen}
              close={this.closeSearchScreen}
            />
        </div>
        
        <SettingsScreen 
          screen={this.state.settingsScreen}
          settings={this.goToSettings}
          logout={this.props.logout}
        />
        
        <ul className="chats-container">
          {this.state.chatList}
        </ul>
        
      </div>
    );
  }
}

const SettingsScreen = (props) => {
  return (
    <aside className={props.screen.classes}>
      <ul className="list-settings">
        <li onClick={props.settings} className="settings-list-item">
          User settings <FontAwesomeIcon icon={faUserCog} />
        </li>
        <li onClick={props.logout} className="settings-list-item">
          Log Out <FontAwesomeIcon icon={faSignOutAlt} />
        </li>
      </ul>
      <p>Designed by Mateusz Rusak</p>
    </aside>
  );
};

const SearchScreen = (props) => {
  return (
    <aside className={props.screen.classes} >
      <div className="search-panel-header">
        <p>Search results:</p>
        <button onClick={props.close} className="close-search-panel">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </aside>
  );
};

const ChatListItem = (props) => {
  let content = props.content;

  if(content.length > 22) {
    content = content.slice(0, 19);
    content += '...';
  }

  return (
    <li className="chat-list-item" onClick={()=> props.open(props.chatid)}>
      <img src={(props.img) ? props.img : Avatar} className={props.activitystatus} />
      <div>
        <p className="chat-list-name"><b>{props.name}</b></p>
        <p className="chat-list-content">{content}</p>
      </div>
    </li>
  );
};

export default App;