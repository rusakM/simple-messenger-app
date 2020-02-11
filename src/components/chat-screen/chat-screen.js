import React, { Component, createRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCamera,
  faTimesCircle,
  faChevronDown,
  faCheckCircle,
  faTimes,
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle as farCheckCircle } from "@fortawesome/free-regular-svg-icons";
import "./chat-screen.css";
import store from "./../../middlewares/store";
import converter from "./../../middlewares/converter";
import { links, headers } from "./../../middlewares/config";
import Background from "./../../assets/grey_bg.png";

let Store = new store();

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatId: parseInt(this.props.history.location.pathname.slice(6)),
      messageInput: "",
      isSendingPhoto: false,
      firstMessageId: 0,
      chatData: {},
      messagesList: [],
      scrollWithMount: true,
      fileAlertClasses: "alert-panel",
      photoPreviewClasses: "photo-preview",
      scrollDownClasses: "scroll-down-btn btn-hidden",
      uploadingProgress: 0,
      timeNow: new Date().getTime(),
      bubbleClasses: "chat-bubble hidden",
      btnGetNewMessagesClasses: "btn-get-previous-messages",
      galleryClasses: "hidden",
      photos: [],
      activePhoto: 0,
      notification: {
        chatId: parseInt(this.props.history.location.pathname.slice(6)),
        userId: this.props.user,
        content: "",
        name: ""
      }
    };

    this.textareaRef = createRef();
    this.messagesContainerRef = createRef();
    this.photoRef = createRef();
    this.closeChat = this.closeChat.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.messageInputHandler = this.messageInputHandler.bind(this);
    this.scrollToEnd = this.scrollToEnd.bind(this);
    this.switchScrollWithMount = this.switchScrollWithMount.bind(this);
    this.photoBtn = this.photoBtn.bind(this);
    this.fileHandler = this.fileHandler.bind(this);
    this.closeFileAlert = this.closeFileAlert.bind(this);
    this.closePhotoPreview = this.closePhotoPreview.bind(this);
    this.checkingUpdates = this.checkingUpdates.bind(this);
    this.checkingUpdatesInterval = setInterval(this.checkingUpdates, 3500);
    this.closeNotification = this.closeNotification.bind(this);
    this.checkingNotifications = this.checkingNotifications.bind(this);
    this.checkingNotificationsInterval = setInterval(
      this.checkingNotifications,
      7000
    );
    this.getNotifications = this.getNotifications.bind(this);
    this.getPreviousMessages = this.getPreviousMessages.bind(this);
  }

  componentWillMount() {
    const reqData = {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers,
      body: `user=${this.props.user}&chat=${this.state.chatId}`
    };

    fetch(`${links.api}/getChats`, reqData)
      .then(response => response.json())
      .then(json => {
        if (json.length > 0) {
          for (let a = 0; a < json.length; a++) {
            Store.insert(json[a]);
          }
        }
      })
      .then(() => {
        fetch(`${links.api}/getFirstMessageId/?chatId=${this.state.chatId}`, {
          method: "get",
          mode: "cors",
          credentials: "same-origin",
          headers
        })
          .then(response => response.json())
          .then(json => {
            let classes = "btn-get-previous-messages";
            try {
              if (
                parseInt(Store.getSortedMessagesArray(this.state.chatId)[0]) ===
                json.id
              ) {
                classes = "hidden";
              } else {
                throw classes;
              }
            } catch (e) {
              classes = e;
            }
            this.setState({
              firstMessageId: json.id,
              btnGetNewMessagesClasses: classes
            });
          });
      })
      .then(() => {
        fetch(`${links.api}/getMessages`, reqData)
          .then(response => response.json())
          .then(json => {
            for (let a = 0; a < json.length; a++) {
              Store.insert(json[a]);
            }
            this.setState({
              chatData: Store[this.state.chatId],
              messagesList: Store.getSortedMessagesArray(this.state.chatId),
              photos: Store.getArrayPhotos(this.state.chatId)
            });
          });
      });

    fetch(
      `${links.api}/setViewed/?userId=${this.props.user}&chatId=${this.state.chatId}`,
      {
        method: "get",
        mode: "cors",
        credentials: "same-origin",
        headers
      }
    );
  }

  componentWillUnmount() {
    clearInterval(this.checkingUpdatesInterval);
    clearInterval(this.checkingNotificationsInterval);
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
    formData.append("content", converter.codeMessage(this.state.messageInput));
    formData.append("messageType", messageType);

    if (messageType) {
      formData.append("photo", this.photoRef.current.files[0]);
    } else {
      formData.append("photo", "");
    }

    fetch(`${links.api}/sendMessage`, {
      method: "post",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        Origin: links.origin,
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
          uploadingProgress: 0,
          photos: Store.getArrayPhotos(this.state.chatId)
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
    let { current } = this.messagesContainerRef;
    if (current) {
      if (current.scrollHeight > current.offsetHeight) {
        this.messagesContainerRef.current.scrollTop =
          current.scrollHeight - current.offsetHeight;
      }
    }
  }

  componentDidUpdate() {
    this.scrollToEnd();
    if (this.state.componentReadyToMount) {
      this.scrollToEnd(true);
      this.setComponentMount();
    } else {
      this.scrollToEnd();
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.scrollToEnd(true);
    }, 1500);
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

  checkingUpdates() {
    const lastMessageId = this.state.messagesList[
      this.state.messagesList.length - 1
    ];
    fetch(
      `${links.api}/checkNewMessages/?chatId=${this.state.chatId}&messageId=${lastMessageId}`,
      {
        method: "get",
        mode: "cors",
        credentials: "same-origin",
        headers
      }
    )
      .then(response => response.json())
      .then(json => {
        let lastReadMessage = Store.getLastReadMessage(this.state.chatId);
        if (json.lastRead !== 0 && json.lastRead > lastReadMessage) {
          Store.changeReadMessagesStatus(this.state.chatId, json.lastRead);
          if (json.count === 0) {
            this.setState({
              chatData: Store[this.state.chatId],
              messagesList: Store.getSortedMessagesArray(this.state.chatId)
            });
            return;
          }
        }
        if (json.count > 0) {
          this.getNewMessages();
        }
      });
  }

  checkingNotifications() {
    fetch(
      `${links.api}/checkNotifications/?userId=${this.props.user}&timestamp=${this.state.timeNow}`,
      {
        method: "get",
        mode: "cors",
        credentials: "same-origin",
        headers
      }
    )
      .then(response => response.json())
      .then(json => {
        if (json.count !== 0) {
          this.getNotifications();
        }
      });
  }

  getNotifications() {
    fetch(
      `${links.api}/getNotification/?userId=${this.props.user}&timestamp=${this.state.timeNow}`,
      {
        method: "get",
        mode: "cors",
        credentials: "same-origin",
        headers
      }
    )
      .then(response => response.json())
      .then(json => {
        if (json.chatId) {
          this.setState({
            notification: json,
            timeNow: new Date().getTime(),
            bubbleClasses: "chat-bubble"
          });
        }
      });
  }

  getNewMessages() {
    const lastMessageId = this.state.messagesList[
      this.state.messagesList.length - 1
    ];
    const { chatId } = this.state;
    fetch(
      `${links.api}/getNewMessages/?messageId=${lastMessageId}&chatId=${chatId}`,
      {
        method: "get",
        mode: "cors",
        credentials: "same-origin",
        headers
      }
    )
      .then(response => response.json())
      .then(json => {
        let isNeedToSetViewed = false;
        if (json.length > 0) {
          for (let a = 0; a < json.length; a++) {
            Store.insert(json[a]);
            if (json[a].senderId !== parseInt(this.props.user)) {
              isNeedToSetViewed = true;
            }
          }
          this.setState({
            chatData: Store[this.state.chatId],
            messagesList: Store.getSortedMessagesArray(this.state.chatId),
            photos: Store.getArrayPhotos(this.state.chatId)
          });
          if (isNeedToSetViewed) {
            fetch(
              `${links.api}/setViewed/?userId=${this.props.user}&chatId=${chatId}`,
              {
                method: "get",
                mode: "cors",
                credentials: "same-origin",
                headers
              }
            );
          }
        }
      });
  }

  closeNotification(event) {
    event.stopPropagation();
    this.setState({
      bubbleClasses: "hidden chat-bubble"
    });
  }

  getPreviousMessages() {
    const last = this.state.messagesList[0];
    fetch(`${links.api}/getMessages`, {
      method: "post",
      mode: "cors",
      credentials: "same-origin",
      headers,
      body: `limit=${last}&chat=${this.state.chatId}&user=${this.props.user}`
    })
      .then(response => response.json())
      .then(json => {
        for (let a = 0; a < json.length; a++) {
          Store.insert(json[a]);
        }
        let classes = "hidden";
        if (
          Store.getSortedMessagesArray(this.state.chatId)[0] >
          this.state.firstMessageId
        ) {
          classes = "btn-get-previous-messages";
        }
        this.setState({
          chatData: Store[this.state.chatId],
          messagesList: Store.getSortedMessagesArray(this.state.chatId),
          btnGetNewMessagesClasses: classes
        });
      });
  }

  openGallery = photoId => {
    const { photos } = this.state;
    const index = photos.indexOf(photoId);
    if (index >= 0) {
      this.setState({
        galleryClasses: "gallery",
        activePhoto: index
      });
    }
  };

  galleryClose = () => {
    this.setState({
      galleryClasses: "hidden"
    });
  };

  galleryPrev = () => {
    if (this.state.photos.length > 1) {
      if (this.state.activePhoto < 1) {
        this.setState({
          activePhoto: this.state.photos.length - 1
        });
      } else {
        this.setState({
          activePhoto: this.state.activePhoto - 1
        });
      }
    }
  };

  galleryNext = () => {
    if (this.state.photos.length > 1) {
      if (this.state.activePhoto === this.state.photos.length - 1) {
        this.setState({
          activePhoto: 0
        });
      } else {
        this.setState({
          activePhoto: this.state.activePhoto + 1
        });
      }
    }
  };

  render() {
    let { chatId } = this.state;
    return (
      <div className="chat-screen">
        <header className="chat-header">
          <button className="btn-go-back" onClick={this.closeChat}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <img
            src={`${links.cdn}/photo/${this.state.chatData.userId}`}
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
            <GetNewMessagesBtn
              classes={this.state.btnGetNewMessagesClasses}
              get={this.getPreviousMessages}
            />
            {this.state.messagesList.map((item, nr) => {
              let msg = Store[chatId].messages[item];
              let classesBox = "msg-box";
              let classesContainer = "msg-container";

              if (parseInt(msg.senderId) === parseInt(this.props.user)) {
                classesBox += " msg-sender";
                classesContainer += " left";
              } else {
                classesBox += " msg-receiver";
                classesContainer += " right";
              }

              return (
                <Message
                  content={msg.messageContent}
                  type={msg.messageType}
                  timestamp={msg.timestamp}
                  key={nr}
                  classesbox={classesBox}
                  classescontainer={classesContainer}
                  messageid={item}
                  isread={msg.isRead}
                  gallery={this.openGallery}
                />
              );
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
        <ChatBubble
          classes={this.state.bubbleClasses}
          content={this.state.notification.content}
          chatid={this.state.notification.chatId}
          name={this.state.notification.name}
          userid={this.state.notification.userId}
          close={this.closeNotification}
        />
        <Gallery
          classes={this.state.galleryClasses}
          close={this.galleryClose}
          next={this.galleryNext}
          prev={this.galleryPrev}
          nr={this.state.photos[this.state.activePhoto]}
        />
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
  const [isDateVisible, changeIsDateVisible] = useState(0);
  const [dateClasses, changeDateClasses] = useState("date-string hidden");
  let img = "";
  let date = new Date();
  let timeNow = new Date();
  date.setTime(props.timestamp);
  let dateString = date.toLocaleTimeString();
  if (timeNow.toLocaleDateString() !== date.toLocaleDateString()) {
    dateString = date.toLocaleDateString();
  }
  if (props.type === 1) {
    img = (
      <img
        src={`${links.cdn}/message/${props.messageid}`}
        className="message-img"
        alt={`messageid: ${props.messageid}`}
        onClick={event => {
          event.stopPropagation();
          props.gallery(parseInt(props.messageid));
        }}
      />
    );
  }
  let readIndicator;
  if (props.isread === 1) {
    readIndicator = <FontAwesomeIcon icon={faCheckCircle} />;
  } else {
    readIndicator = <FontAwesomeIcon icon={farCheckCircle} />;
  }

  function changeDateVisible() {
    if (isDateVisible) {
      changeIsDateVisible(0);
      changeDateClasses("date-string hidden");
    } else {
      changeIsDateVisible(1);
      changeDateClasses("date-string");
      setTimeout(() => {
        changeDateVisible(0);
        changeDateClasses("date-string hidden");
      }, 5000);
    }
  }

  return (
    <div className={props.classescontainer} onClick={changeDateVisible}>
      <div className={props.classesbox + " msg-box"} ref={props.reference}>
        <div className="message-content">{props.content}</div>
        {img}
        <small className={dateClasses}>{dateString}</small>
      </div>
      <div className="msg-read-indicator">{readIndicator}</div>
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

const GetNewMessagesBtn = props => {
  return (
    <p className={props.classes} onClick={props.get}>
      Get previous messages..
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

const ChatBubble = props => {
  const { classes, content, chatid, name, userid, close } = props;
  const imgLocation = `${links.cdn}/photo/${userid}`;
  const chatLocation = `${links.origin}/chat/${chatid}`;
  const linkRef = createRef();

  function open() {
    linkRef.current.click();
  }

  return (
    <aside className={classes} onClick={open}>
      <a href={chatLocation} ref={linkRef} hidden></a>
      <div className="notify-content">
        <p>
          <b>{name}</b>
        </p>
        <p>{content}</p>
      </div>
      <div className="notify-image">
        <p className="notify-close-btn" onClick={event => close(event)}>
          <FontAwesomeIcon icon={faTimes} />
        </p>
        <img src={imgLocation} alt="Notification" className="notify-img" />
      </div>
    </aside>
  );
};

const Gallery = props => {
  const { nr, classes, close, prev, next } = props;

  return (
    <aside className={classes}>
      <p className="gallery-btn gallery-close-btn" onClick={close}>
        <FontAwesomeIcon icon={faTimes} />
      </p>
      <p className="gallery-btn gallery-prev-btn" onClick={prev}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </p>
      <p className="gallery-btn gallery-next-btn" onClick={next}>
        <FontAwesomeIcon icon={faChevronRight} />
      </p>
      <div className="gallery-container">
        <img
          src={`${links.cdn}/message/${nr}`}
          alt={nr}
          className="gallery-photo"
        />
      </div>
    </aside>
  );
};

export default Chat;
