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
            chatData: [],
        }
        this.closeChat = this.closeChat.bind(this);
    }

    closeChat() {
        this.props.history.push('/');
    }

    render() {
        return(
            <div className="chat-screen">
                <header className="chat-header">
                    <button className="btn-go-back" onClick={this.closeChat}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                </header>
                
            </div>
        );
    };

}



export default Chat;