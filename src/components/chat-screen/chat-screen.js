import React, { Component } from 'react';
import Headers from '../../middlewares/headers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import './chat-screen.css';

class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatId: parseInt(this.props.history.location.pathname.slice(6)),
            messages: [],
            chatData: {},
            messageInput: ""
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
      
      
          fetch('http://localhost:3001/api/getChatData', reqData)
          .then(response => response.json())
          .then(json => this.setState({chatData: json}));
    }

    closeChat() {
        this.props.history.push('/');
    }

    sendMessage(event) {
        event.preventDefault();
        console.log(this.state.messageInput);
        
    }

    messageInputHandler(event) {
        this.setState({
            messageInput: event.target.value
        });
    }

    render() {
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
            {props.message}
        </textarea>
    )
}

const Message = (props) => {
    return (
        <div className={props.classes}>
            <p>{props.content}</p>
        </div>
    );
}



export default Chat;