import React, { Component, createRef, useEffect } from "react";
import Headers from "../../middlewares/headers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCamera,
  faTimesCircle,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";
//import axios from "axios";
import "./chat-screen.css";
//import Avatar from './../../assets/avatar.png';
import store from "./../../middlewares/store";
import Links from "./../../middlewares/links";
import Background from "./../../assets/grey_bg.png";
import headers from "../../middlewares/headers";

let Store = new store();

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatId: parseInt(this.props.history.location.pathname.slice(6)),
      messageInput: "",
      isSendingPhoto: false,
      chatData: {},
      messagesList: [],
      scrollWithMount: true,
      fileAlertClasses: "alert-panel",
      photoPreviewClasses: "photo-preview",
      scrollDownClasses: "scroll-down-btn btn-hidden",
      uploadingProgress: 0,
      componentReadyToMount: true,
    };

    this.textareaRef = createRef();
    this.messagesContainerRef = createRef();
    this.photoRef = createRef();
    this.lastMsgRef = createRef();
    this.closeChat = this.closeChat.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.messageInputHandler = this.messageInputHandler.bind(this);
    this.scrollToEnd = this.scrollToEnd.bind(this);
    this.switchScrollWithMount = this.switchScrollWithMount.bind(this);
    this.photoBtn = this.photoBtn.bind(this);
    this.fileHandler = this.fileHandler.bind(this);
    this.closeFileAlert = this.closeFileAlert.bind(this);
    this.closePhotoPreview = this.closePhotoPreview.bind(this);
    this.setComponentMount = this.setComponentMount.bind(this);
  }

  componentWillMount() {
    const reqData = {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers: Headers,
      body: `user=${this.props.user}&chat=${this.state.chatId}`
    };

    fetch(`${Links.api}/getChats`, reqData)
      .then(response => response.json())
      .then(json => {
        if (json.length > 0) {
          for (let a = 0; a < json.length; a++) {
            Store.insert(json[a]);
          }
        }
      })
      .then(() => {
        fetch(`${Links.api}/getMessages`, reqData)
          .then(response => response.json())
          .then(json => {
            for (let a = 0; a < json.length; a++) {
              Store.insert(json[a]);
            }
            this.setState({
              chatData: Store[this.state.chatId],
              messagesList: Store.getSortedMessagesArray(this.state.chatId)
            });
          });
      });
  }

  closeChat() {
    this.props.history.push("/");
  }

  sendMessage(event) {
    event.preventDefault();
    let formData = new FormData();
    if (this.textareaRef.current.value === "" && !this.state.isSendingPhoto) {
      return;
    }

    let messageType = this.state.isSendingPhoto ? 1 : 0;

    formData.append("senderId", this.props.user);
    formData.append("chatId", this.state.chatId);
    formData.append("content", this.state.messageInput);
    formData.append("messageType", messageType);

    if (messageType) {
      formData.append("photo", this.photoRef.current.files[0]);
    } else {
      formData.append("photo", "");
    }

    fetch(`${Links.api}/sendMessage`, {
      method: "post",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        Origin: Links.origin,
        Accept: headers.Accept
      },
      body: formData
    })
      .then(response => response.json())
      .then(json => {
        Store.insert(json);
        this.setState({
          chatData: Store[this.state.chatId],
          messagesList: Store.getSortedMessagesArray(this.state.chatId),
          messageInput: "",
          isSendingPhoto: false,
          uploadingProgress: 0
        });
        this.closePhotoPreview();
        console.log(json);
      });

    this.textareaRef.current.value = "";
    this.scrollToEnd(true);
  }

  messageInputHandler(event) {
    this.setState({
      messageInput: event.target.value
    });
    console.log(this.lastMsgRef.current);
  }

  switchScrollWithMount() {
    let { current } = this.messagesContainerRef;
    let maxScroll = current.scrollHeight - current.offsetHeight;
    if (current.scrollTop < maxScroll - 50) {
      if (this.state.scrollWithMount) {
        this.setState({
          scrollWithMount: false,
          scrollDownClasses: "scroll-down-btn btn-visible"
        });
      }
    } else {
      if (this.state.scrollWithMount === false) {
        this.setState({
          scrollWithMount: true,
          scrollDownClasses: "scroll-down-btn btn-hidden"
        });
      }
    }
  }

  scrollToEnd(forceScroll = false) {
    if (!this.state.scrollWithMount && !forceScroll) {
      return;
    }
    if(this.lastMsgRef.current !== null) {
      this.lastMsgRef.current.scrollIntoView();
    }
  }

componentDidUpdate() {
  this.scrollToEnd();
  if(this.state.componentReadyToMount) {
    this.scrollToEnd(true);
    this.setComponentMount();
  }
  else {
    this.scrollToEnd();
  }
}

componentDidMount() {
  setTimeout(() => {
    this.scrollToEnd(true);
  }, 2000);
}

  photoBtn() {
    this.photoRef.current.click();
  }

  fileHandler(event) {
    event.preventDefault();
    if (event.target.files.length === 0) {
      return;
    }
    if (event.target.files[0].type !== "image/jpeg") {
      this.setState({
        fileAlertClasses: "alert-panel alert-panel-show"
      });
    } else {
      this.setState({
        isSendingPhoto: true,
        photoPreviewClasses: "photo-preview photo-preview-show"
      });
    }
  }

  closeFileAlert() {
    this.setState({
      fileAlertClasses: "alert-panel alert-panel-hide"
    });
    this.photoRef.current.value = "";
  }

  closePhotoPreview() {
    this.setState({
      isSendingPhoto: false,
      photoPreviewClasses: "photo-preview photo-preview-hide"
    });
    this.photoRef.current.value = "";
  }

  setComponentMount() {
    if(this.state.componentReadyToMount) {
      this.setState({
        componentReadyToMount: false
      })
    }
  }

  render() {
    let { chatId } = this.state;
    return (
      <div className="chat-screen">
        <header className="chat-header">
          <button className="btn-go-back" onClick={this.closeChat}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <img
            src={`${Links.cdn}/photo/${this.state.chatData.userId}`}
            alt={this.state.chatData.name}
            className="chat-photo"
          />
          <h5>{this.state.chatData.name}</h5>
        </header>
        <div className="messages-container">
          <div
            className="messages"
            onScroll={this.switchScrollWithMount}
            ref={this.messagesContainerRef}
            
          >
            {this.state.messagesList.map((item, nr) => {
              let msg = Store[chatId].messages[item];
              let classes = "msg-box";

              if (parseInt(msg.senderId) === parseInt(this.props.user)) {
                classes += " msg-sender";
              } else {
                classes += " msg-receiver";
              }
              if(nr + 1 !== this.state.messagesList.length) {
                return (
                  <Message
                    content={msg.messageContent}
                    type={msg.messageType}
                    timestamp={msg.timestamp}
                    key={nr}
                    classes={classes}
                    messageid={item}
                  />
                );
              }
              else {
                
                return (
                  <Message
                    content={msg.messageContent}
                    type={msg.messageType}
                    timestamp={msg.timestamp}
                    key={nr}
                    classes={classes}
                    messageid={item}
                    reference={this.lastMsgRef}
                    scroll={this.scrollToEnd}
                    iscomponentmount={this.state.componentReadyToMount}
                    setcomponentmount={this.setComponentMount}
                  />
                );
              }
            })}
            <ScrollDownBtn 
              scroll={this.scrollToEnd} 
              classes={this.state.scrollDownClasses}
            />
          </div>
          <div className="messages-controls">
            <MessageInput
              changehandler={this.messageInputHandler}
              messageInput={this.state.messageInput}
              reference={this.textareaRef}
              photobtnclick={this.photoBtn}
            />
            <input
              type="file"
              ref={this.photoRef}
              className="file-container"
              onChange={this.fileHandler}
            />
            <button className="btn-send" onClick={this.sendMessage}>
              Send
            </button>
          </div>
          <FileAlert
            message="Only JPEG photos"
            close={this.closeFileAlert}
            classes={this.state.fileAlertClasses}
          />
          <PhotoPreview
            img={this.photoRef.current ? this.photoRef.current.files : false}
            classes={this.state.photoPreviewClasses}
            close={this.closePhotoPreview}
          />
        </div>
      </div>
    );
  }
}

const MessageInput = props => {
  return (
    <div className="message-input">
      <textarea onChange={props.changehandler} ref={props.reference}>
        {props.message}
      </textarea>
      <button className="btn-camera" onClick={props.photobtnclick}>
        <FontAwesomeIcon icon={faCamera} />
      </button>
    </div>
  );
};

const Message = props => {
  // let timestamp = new Date();
  // timestamp = timestamp.setTime(parseInt(props.timestamp));
  // let timeNow = new Date();
  // let strTime = "";
  // if(timestamp.toDateString() === timeNow.toDateString()) {
  //     strTime += timestamp.getHours() + ":" + timestamp.getMinutes();
  // }
  // else {
  //     strTime += timestamp.toDateString();
  // }
  useEffect(() => {
    if(props.iscomponentmount === true) {
      props.scroll(true);
    }
  })

  let img = "";
  if (props.type === 1) {
    img = (
      <img
        src={`${Links.cdn}/message/${props.messageid}`}
        className="message-img"
        alt={`messageid: ${props.messageid}`}
      />
    );
  }

  return (
    <div className={props.classes + " msg-box"} ref={props.reference}>
      <div className="message-content">{props.content}</div>
      {img}
    </div>
  );
};

const ScrollDownBtn = props => {
  return (
    <p className={props.classes} onClick={props.scroll}>
      <FontAwesomeIcon icon={faChevronDown} />
    </p>
  );
};

const FileAlert = props => {
  return (
    <aside className={props.classes}>
      <p className="message">{props.message}</p>
      <button onClick={props.close} className="btn-submit btn-confirm">
        Ok
      </button>
    </aside>
  );
};

const PhotoPreview = props => {
  let img = (
    <img src={Background} className="bg-picture-preview" alt="preveiew" />
  );
  if (props.img[0]) {
    img = (
      <img
        src={URL.createObjectURL(props.img[0])}
        className="bg-picture-preview"
        alt="preview"
      />
    );
  }
  return (
    <aside className={props.classes}>
      <FontAwesomeIcon
        icon={faTimesCircle}
        onClick={props.close}
        className="btn-preview-close"
      />
      {img}
    </aside>
  );
};

export default Chat;
