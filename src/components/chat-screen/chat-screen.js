import React, { Component } from 'react';
import Headers from '../../middlewares/headers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import './chat-screen.css';
import Avatar from './../../assets/avatar.png';
import Store from './../../middlewares/store';
import Links from './../../middlewares/links';
import { parse } from 'url';




class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatId: parseInt(this.props.history.location.pathname.slice(6)),
            messageInput: "",
            chatData: {},
            messagesList: []
        }
        this.closeChat = this.closeChat.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.messageInputHandler = this.messageInputHandler.bind(this);
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
        console.log(this.state.messageInput);
        fetch(`${Links.api}/sendMessage`, {
            method: 'POST',
            mode: "cors",
            credentials: "same-origin",
            headers: Headers,
            body: `senderId=${this.props.user}&chatId=${this.state.chatId}&content=${this.state.messageInput}&messageType=0`
        })
        .then(response => response.json())
        .then(json => {
            Store.insert(json);
            this.setState({
                chatData: Store[this.state.chatId],
                messagesList: Store.getSortedMessagesArray(this.state.chatId)
            });
        });
        console.log(this.state.messageInput);
        this.setState({
            messageInput: ""
        });
    }

    messageInputHandler(event) {
        this.setState({
            messageInput: event.target.value
        });
    }

    render() {
        let {chatId} = this.state;
        return(
            <div className="chat-screen">
                <header className="chat-header">
                    <button className="btn-go-back" onClick={this.closeChat}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h5>{this.state.chatData.name}</h5>
                </header>
                <div className="messages-container">
                    <div className="messages">
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
                                />
                            )})
                        }
                    </div>
                    <div className="messages-controls">
                        <div className="message-input">
                            <MessageInput 
                                changehandler={this.messageInputHandler}
                                messageInput={this.state.messageInput}
                            />
                        </div>
                        <button className="btn-send" onClick={this.sendMessage}>Send</button>
                    </div>
                </div> 
            </div>
        );
    };

}

const MessageInput = (props) => {
    return (
        <textarea onChange={props.changehandler} >
            {
                props.message
            }
        </textarea>
    )
}

const Message = (props) => {
    let timestamp = new Date();
    timestamp = timestamp.setTime(parseInt(props.timestamp));
    let timeNow = new Date();
    let strTime = "";
    if(timestamp.toDateString() === timeNow.toDateString()) {
        strTime += timestamp.getHours() + ":" + timestamp.getMinutes();
    }
    else {
        strTime += timestamp.toDateString();
    }

    return (
        <div className={props.classes + " msg-box"}>
            <div className="messageContent">{props.content}</div>
            <div>{strTime}</div>
        </div>
    );
}



export default Chat;