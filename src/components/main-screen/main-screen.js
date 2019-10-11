import React, { Component } from 'react';
import './main-screen.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH, faSignOutAlt, faUserCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import Headers from '../../middlewares/headers';
import Avatar from './../../assets/avatar.png';
import Store from './../../middlewares/store';
import Links from './../../middlewares/links';




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
      },
      searchItems: []
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


    fetch(`${Links.api}/getUserData`, reqData)
    .then(response => response.json())
    .then(json => this.setState({userData: json}));

    fetch(`${Links.api}/getChats`, reqData)
    .then(response => response.json())
    .then(json => {
      if(json.length > 0) {

        for(let a = 0; a < json.length; a++) {
          Store.insert(json[a]);
        }

        let arr = Store.getSortedChatArray();
        console.log(Store.getChatsWithUsers());
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

      if(event.target.value.length > 2) {
        fetch(`${Links.api}/search`,
        {
          method: 'POST',
          mode: "cors",
          credentials: "same-origin",
          headers: Headers,
          body: `user=${this.props.user}&query=${event.target.value}`
        }).then(response => response.json())
        .then(json => {
          let usersAndChats = Store.getChatsWithUsers();
          json = json.map((item) => {
            for(let a = 0; a < usersAndChats.length; a++) {
              if(parseInt(item.userId) === parseInt(usersAndChats[a].user)) {
                item.chatId = parseInt(usersAndChats[a].chat);
              }
            }
            return item;
          });
          this.setState({
            searchItems: json
          });
        });
      }
    }
    else {
      this.setState({
        searchScreen: {
          enabled: false,
          classes: "search-items-container search-items-container-hide"
        },
        searchBar: "",
        searchItems: []
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
             <img src={(this.state.userData.photo) ? this.state.userData.photo : Avatar} className="user-photo" alt={this.state.userData.name} />
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
              searchitems={this.state.searchItems}
              user={this.props.user}
              open={this.openChat}
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
      <ul className="search-results">
        {
          props.searchitems.map((item, nr) => {
            return ( <SearchItem 
              data={item}
              user={props.user}
              key={nr}
              open={props.open}
            />
            )
          })
        }
      </ul>
    </aside>
  );
};

const ChatListItem = (props) => {
  let {content, img, chatid, activitystatus, name} = props;

  if(content.length > 22) {
    content = content.slice(0, 19);
    content += '...';
  }

  return (
    <li className="chat-list-item" onClick={()=> props.open(chatid)}>
      <img src={(img) ? img : Avatar} className={activitystatus} alt={name + " cover photo"} />
      <div>
        <p className="chat-list-name"><b>{name}</b></p>
        <p className="chat-list-content">{content}</p>
      </div>
    </li>
  );
};

const SearchItem = (props) => {
  let {data, open, user} = props;
  let textBtn = "Start chat";
  if(data.chatId > 0) {
    textBtn = "Continue chat";
  }

  return (
    <li className="search-item">
      <img src={(data.img)? data.img : Avatar} alt={data.name + " cover photo"} className="user-photo" />
        <h6 className="search-item-name">{data.name}</h6>
        <button className="start-chat-btn" 
          onClick={() => {
            if(data.chatId) {
              open(data.chatId);
            }
            else {
              fetch(`${Links.api}/startChat`, {
                method: 'POST',
                mode: "cors",
                credentials: "same-origin",
                headers: Headers,
                body: `first=${user}&second=${data.userId}`
              })
              .then(response => response.json())
              .then(json => {
                open(parseInt(json.chatId));
              });
            }
          }}>
          {textBtn}
        </button>
    </li>
  );
}

export default App;