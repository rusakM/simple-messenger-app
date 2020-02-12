import React, { Component } from "react";
import "./main-screen.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSlidersH,
  faSignOutAlt,
  faUserCog,
  faTimes,
  faArrowRight,
  faPlus,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle as farCheckCircle } from "@fortawesome/free-regular-svg-icons";
import Avatar from "./../../assets/avatar.png";
import store from "./../../middlewares/store";
import { links, headers } from "./../../middlewares/config";
import converter from "./../../middlewares/converter";

let Store = new store();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: {
        photo: "",
        email: "",
        name: ""
      },
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
    this.checkingUpdates = this.checkingUpdates.bind(this);
    this.fetchUpdates = this.fetchUpdates.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentWillMount() {
    if (!this.props.user) {
      this.props.history.push("/login");
    }

    const reqData = {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers,
      body: `user=${this.props.user}`
    };

    fetch(`${links.api}/getUserData`, reqData)
      .then(response => response.json())
      .then(json => this.setState({ userData: json }))
      .catch(err => this.props.history.push("/login"));

    fetch(`${links.api}/getChats`, reqData)
      .then(response => response.json())
      .then(json => {
        if (json.length > 0) {
          for (let a = 0; a < json.length; a++) {
            Store.insert(json[a]);
          }
          const timeNow = new Date();
          this.setState({
            chats: Store.getSortedChatArray(),
            appData: Store,
            appTimestamp: `${timeNow.getTime()}`
          });
        }
      });
  }

  componentDidMount() {
    this.checkingUpdatesInterval = setInterval(this.checkingUpdates, 5000);
  }

  checkingUpdates() {
    fetch(
      `${links.api}/checkUpdates/?userId=${this.props.user}&timestamp=${this.state.appTimestamp}`,
      {
        headers: Headers,
        mode: "cors",
        credentials: "same-origin",
        method: "get"
      }
    )
      .then(response => response.json())
      .then(json => {
        if (json.updates > 0) {
          this.fetchUpdates();
        }
      });
  }

  fetchUpdates() {
    fetch(`${links.api}/getChats`, {
      method: "post",
      mode: "cors",
      credentials: "same-origin",
      headers,
      body: `user=${this.props.user}`
    })
      .then(response => response.json())
      .then(json => {
        if (json.length > 0) {
          for (let a = 0; a < json.length; a++) {
            Store.insert(json[a]);
          }
          const timeNow = new Date();
          this.setState({
            chats: Store.getSortedChatArray(),
            appData: Store,
            appTimestamp: `${timeNow.getTime()}`
          });
        }
      });
  }

  logout() {
    clearInterval(this.checkingUpdatesInterval);
    this.props.logout();
  }

  componentWillUnmount() {
    clearInterval(this.checkingUpdatesInterval);
  }

  goToSettings() {
    this.props.history.push(`/settings`);
  }

  searchHandler(event) {
    let val = converter.trimInputs(event.target.value);
    if (val !== "") {
      this.setState({
        searchScreen: {
          enabled: true,
          classes: "search-items-container search-items-container-show"
        },
        searchBar: val
      });

      if (val.length > 2) {
        fetch(`${links.api}/search`, {
          method: "POST",
          mode: "cors",
          credentials: "same-origin",
          headers,
          body: `user=${this.props.user}&query=${val}`
        })
          .then(response => response.json())
          .then(json => {
            let usersAndChats = Store.getChatsWithUsers();
            json = json.map(item => {
              for (let a = 0; a < usersAndChats.length; a++) {
                if (parseInt(item.userId) === parseInt(usersAndChats[a].user)) {
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
    } else {
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
    if (!this.state.settingsScreen.enabled) {
      this.setState({
        settingsScreen: {
          enabled: true,
          classes: "right-settings-screen right-settings-screen-show"
        }
      });
    } else {
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
            <img
              src={
                this.state.userData.photo
                  ? `${links.cdn}/photo/${this.props.user}`
                  : Avatar
              }
              className="user-photo"
              alt={this.state.userData.name}
            />
            <h2>My chats:</h2>
          </div>

          <button className="btn-menu" onClick={this.toggleSettings}>
            <FontAwesomeIcon icon={faSlidersH} />
          </button>
        </header>
        <div className="search-bar-container">
          <input
            type="text"
            value={this.state.searchBar}
            className="search-bar"
            onChange={this.searchHandler}
            placeholder="Search"
          />
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
          logout={this.logout}
        />

        <ul className="chats-container">
          {this.state.chats.map((i, nr) => {
            let item = this.state.appData[i];
            const { appData } = this.state;
            return (
              <ChatListItem
                open={this.openChat}
                chatid={i}
                img={item.userPhoto}
                name={item.name}
                content={appData.getLastMessageContent(i)}
                lastmessagesender={appData.getLastMessageSenderId(i)}
                readstatus={appData.getReadStatus(i)}
                messagetype={appData.getLastMessageType(i)}
                key={nr}
                userid={item.userId}
                activitystatus={
                  item.userIsActive === 1
                    ? "chat-img chat-img-active"
                    : "chat-img"
                }
              />
            );
          })}
        </ul>
      </div>
    );
  }
}

const SettingsScreen = props => {
  return (
    <aside className={props.screen.classes}>
      <ul className="list-settings">
        <li onClick={props.settings} className="settings-list-item">
          User settings <FontAwesomeIcon icon={faUserCog} />
        </li>
        <li
          onClick={() => {
            Store = new store();
            props.logout();
          }}
          className="settings-list-item"
        >
          Log Out <FontAwesomeIcon icon={faSignOutAlt} />
        </li>
      </ul>
      <p>Designed by Mateusz Rusak</p>
    </aside>
  );
};

const SearchScreen = props => {
  return (
    <aside className={props.screen.classes}>
      <div className="search-panel-header">
        <p>Search results:</p>
        <button onClick={props.close} className="close-search-panel">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <ul className="search-results">
        {props.searchitems.map((item, nr) => {
          return (
            <SearchItem
              data={item}
              user={props.user}
              key={nr}
              open={props.open}
            />
          );
        })}
      </ul>
    </aside>
  );
};

const ChatListItem = props => {
  let {
    content,
    img,
    chatid,
    activitystatus,
    name,
    userid,
    messagetype,
    lastmessagesender
  } = props;
  let link;
  if (img) {
    link = `${links.cdn}/photo/${userid}`;
  } else {
    link = Avatar;
  }

  if (content.length > 22) {
    content = content.slice(0, 19);
    content += "...";
  }

  if (messagetype && content === "") {
    if (userid === lastmessagesender) {
      content = `${name.split(" ")[0]} sent a photo...`;
    } else {
      content = "You sent a photo...";
    }
  }

  return (
    <li className="chat-list-item" onClick={() => props.open(chatid)}>
      <img src={link} className={activitystatus} alt={name + " cover photo"} />
      <div>
        <p className="chat-list-name">
          <b>{name}</b>
        </p>
        <p className="chat-list-content">{content}</p>
      </div>
      <ReadStatusIcon status={props.readstatus} />
    </li>
  );
};

const ReadStatusIcon = props => {
  let icon = farCheckCircle;
  if (props.status) {
    icon = faCheckCircle;
  }
  return (
    <div className="read-indicator">
      <FontAwesomeIcon icon={icon} className="read-status-icon" />
    </div>
  );
};

const SearchItem = props => {
  let { data, open, user } = props;
  let textBtn = <FontAwesomeIcon icon={faPlus} />;
  if (data.chatId > 0) {
    textBtn = <FontAwesomeIcon icon={faArrowRight} />;
  }

  return (
    <li className="search-item">
      <img
        src={data.photo ? `${links.cdn}/photo/${data.userId}` : Avatar}
        alt={data.name + " cover photo"}
        className="user-photo"
      />
      <h6 className="search-item-name">{data.name}</h6>
      <button
        className="start-chat-btn"
        onClick={() => {
          if (data.chatId) {
            open(data.chatId);
          } else {
            fetch(`${links.api}/startChat`, {
              method: "POST",
              mode: "cors",
              credentials: "same-origin",
              headers,
              body: `first=${user}&second=${data.userId}`
            })
              .then(response => response.json())
              .then(json => {
                open(parseInt(json.chatId));
              });
          }
        }}
      >
        {textBtn}
      </button>
    </li>
  );
};

export default App;
