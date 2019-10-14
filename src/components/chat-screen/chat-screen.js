import React, { Component, createRef } from 'react';
import Headers from '../../middlewares/headers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import './chat-screen.css';
//import Avatar from './../../assets/avatar.png';
import store from './../../middlewares/store';
import Links from './../../middlewares/links';

let Store = new store();




class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatId: parseInt(this.props.history.location.pathname.slice(6)),
            messageInput: "",
            chatData: {},
            messagesList: [],
            scrollWithMount: true
        }

        this.textareaRef = createRef();
        this.messagesContainerRef = createRef();
        this.closeChat = this.closeChat.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.messageInputHandler = this.messageInputHandler.bind(this);
        this.scrollToEnd = this.scrollToEnd.bind(this);
        this.switchScrollWithMount = this.switchScrollWithMount.bind(this);
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

        if(this.textareaRef.current.value === "") {
            return;
        }

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
                messagesList: Store.getSortedMessagesArray(this.state.chatId),
                messageInput: ""
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
                                />
                            )})
                        }
                    </div>
                    
                    <div className="messages-controls">
                        <div className="message-input">
                            <MessageInput 
                                changehandler={this.messageInputHandler}
                                messageInput={this.state.messageInput}
                                reference={this.textareaRef}
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
        <textarea onChange={props.changehandler} ref={props.reference}>
            {
                props.message
            }
        </textarea>
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

    return (
        <div className={props.classes + " msg-box"}>
            <div className="messageContent">{props.content}</div>
            
        </div>
    );
}



export default Chat;