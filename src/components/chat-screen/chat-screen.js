import React, { Component, createRef } from 'react';
import Headers from '../../middlewares/headers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowLeft, faCamera, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import './chat-screen.css';
//import Avatar from './../../assets/avatar.png';
import store from './../../middlewares/store';
import Links from './../../middlewares/links';
import Background from './../../assets/grey_bg.png';
import Sharp from 'sharp';

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
            photoPreviewClasses: "photo-preview"
        }

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
    }

    componentWillMount() {
        const reqData = {
            method: 'POST',
            mode: "cors",
            credentials: "same-origin",
            headers: Headers,
            body: `user=${this.props.user}&chat=${this.state.chatId}`
        }

        fetch(`${Links.api}/getChats`, reqData)
        .then(response => response.json())
        .then(json => {
            if(json.length > 0) {

                for(let a = 0; a < json.length; a++) {
                  Store.insert(json[a]);
                }
            }
        })
        .then(()=>{
            fetch(`${Links.api}/getMessages`, reqData)
            .then(response => response.json())
            .then(json => {
                for(let a = 0; a < json.length; a++) {
                    Store.insert(json[a]);
                }
                this.setState({
                    chatData: Store[this.state.chatId],
                    messagesList: Store.getSortedMessagesArray(this.state.chatId)
                });

            })
        });
    }

    closeChat() {
        this.props.history.push('/');
    }

    sendMessage(event) {
        event.preventDefault();

        if(this.textareaRef.current.value === "" && !this.state.isSendingPhoto) {
            return;
        }

        let sendingPhoto = (this.state.isSendingPhoto) ? 1 : 0;

        fetch(`${Links.api}/sendMessage`, {
            method: 'POST',
            mode: "cors",
            credentials: "same-origin",
            headers: Headers,
            body: `senderId=${this.props.user}&chatId=${this.state.chatId}&content=${this.state.messageInput}&messageType=${sendingPhoto}`
        })
        .then(response => response.json())
        .then(json => {
            Store.insert(json);
            this.setState({
                chatData: Store[this.state.chatId],
                messagesList: Store.getSortedMessagesArray(this.state.chatId),
                messageInput: "",
                isSendingPhoto: false
            });
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
        let {current} = this.messagesContainerRef;
        let maxScroll = current.scrollHeight - current.offsetHeight;
        //console.log((current.scrollTop - 10)+ " / " + maxScroll);
        if((current.scrollTop) < maxScroll - 30) {
            if(this.state.scrollWithMount) {
                this.setState({
                    scrollWithMount: false
                })
            }
        }
        else {
            //console.log(current.scrollTop);
            if(this.state.scrollWithMount === false) {
                this.setState({
                    scrollWithMount: true
                })
            }
        }
    }

    scrollToEnd(sendingMessage=false) {
        let {current} = this.messagesContainerRef;
        
        if(!this.state.scrollWithMount && !sendingMessage) {
            return;
        }
        if(current.scrollHeight > current.offsetHeight) {
            this.messagesContainerRef.current.scrollTop = current.scrollHeight - current.offsetHeight;
        }
    }

    componentDidUpdate() {
        this.scrollToEnd();
    }

    photoBtn() {
        this.photoRef.current.click();
    }

    fileHandler(event) {
        event.preventDefault();
        if(event.target.files.length === 0) {
            return;
        }
        if(event.target.files[0].type !== "image/jpeg") {
            this.setState({
                fileAlertClasses: "alert-panel alert-panel-show"
            });
        }
        else {
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
        this.photoRef.current.value = '';
    }

    closePhotoPreview() {
        this.setState({
            isSendingPhoto: false,
            photoPreviewClasses: "photo-preview photo-preview-hide"
        });
        this.photoRef.current.value = "";
    }

    render() {
        let {chatId} = this.state;
        return(
            <div className="chat-screen">
                <header className="chat-header">
                    <button className="btn-go-back" onClick={this.closeChat}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <img src={`${Links.cdn}/photo/${this.state.chatData.userId}`} alt={this.state.chatData.name} className="chat-photo"/>
                    <h5>{this.state.chatData.name}</h5>
                </header>
                <div className="messages-container">
                    <div className="messages"
                        onScroll={this.switchScrollWithMount}
                        ref={this.messagesContainerRef}
                    >
                        {
                            this.state.messagesList.map((item, nr) => {
                                let msg = Store[chatId].messages[item];
                                let classes = "msg-box";
                                
                                if(parseInt(msg.senderId) === parseInt(this.props.user)) {
                                    classes += " msg-sender"
                                }
                                else {
                                    classes += " msg-receiver"
                                }

                                return (<Message 
                                    content={msg.messageContent}
                                    type={msg.messageType}
                                    timestamp={msg.timestamp}
                                    key={nr}
                                    classes={classes}
                                    messageid={item}
                                />
                            )})
                        }
                    </div>
                    
                    <div className="messages-controls">
                        <MessageInput 
                            changehandler={this.messageInputHandler}
                            messageInput={this.state.messageInput}
                            reference={this.textareaRef}
                            photobtnclick={this.photoBtn}
                        />
                        <input type="file" ref={this.photoRef} className="file-container" onChange={this.fileHandler}/>
                        <button className="btn-send" onClick={this.sendMessage}>Send</button>
                    </div>
                    <FileAlert 
                        message="Only JPEG photos"
                        close={this.closeFileAlert}
                        classes={this.state.fileAlertClasses}
                    />
                    <PhotoPreview 
                        img={(this.photoRef.current) ? this.photoRef.current.files : false}
                        classes={this.state.photoPreviewClasses}
                        close={this.closePhotoPreview}
                    />
                </div> 
            </div>
        );
    };

}

const MessageInput = (props) => {
    return (
        <div className="message-input">
            <textarea onChange={props.changehandler} ref={props.reference}>
                {
                    props.message
                }
            </textarea>
            <button className="btn-camera" onClick={props.photobtnclick}>
                <FontAwesomeIcon icon={faCamera} />
            </button>
        </div>
    )
}

const Message = (props) => {
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
    let img = "";
    if(props.type === 1) {
        img = <img src={`${Links.cdn}/message/${props.messageid}`} className="message-img" alt={`messageid: ${props.messageid}`}/>
    }

    return (
        <div className={props.classes + " msg-box"}>
            <div className="message-content">
                {props.content}
            </div>
            {img}
        </div>
    );
}

const FileAlert = (props) => {
    return (
        <aside className={props.classes}>
            <p className="message">{props.message}</p>
            <button onClick={props.close} className="btn-submit btn-confirm">Ok</button>
        </aside>
    )
}

const PhotoPreview = (props) => {
    let img = <img src={Background} className="bg-picture-preview" />
    if(props.img[0]) {
        img = <img src={URL.createObjectURL(props.img[0])} className="bg-picture-preview" />
    }
    return (
        <aside className={props.classes}>
            <FontAwesomeIcon icon={faTimesCircle} onClick={props.close} className="btn-preview-close" />
            { img }
        </aside>
    )
}



export default Chat;