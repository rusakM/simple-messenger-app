class Store {
    insert(body) {
        if(!this[body.chatId]) 
            this[body.chatId] = {
                name: body.name,
                userPhoto: body.userPhoto,
                userIsActive: body.userIsActive,
                userId: body.userId,
                messages: {}
            };
        this[body.chatId].lastMessageId = body.messageId;
        this[body.chatId].messages[body.messageId] = {
            messageContent: body.content,
            messageType: body.messageType,
            timestamp: body.timestamp,
            senderId: body.senderId,
            isRead: body.isRead
        };
        
    }

    getSortedChatArray() {
        let keys = Object.keys(this);
        let arr = [];

        for(let a = 0; a < keys.length; a++) {
            arr.push({
                id: keys[a],
                message: this[keys[a]].lastMessageId
            });
        }

        arr = arr.sort((a, b) => a.message < b.message).map(a => a.id);
        return arr;
    }

    deleteMessage(chat, message) {
        delete this[chat].messages[message];
        if(message === this[chat].lastMessageId) {
            this[chat].lastMessageId = Object.keys(this[chat].messages).sort((a, b) => parseInt(a) < parseInt(b))[0];
        }
    }

    deleteChat(chat) {
        delete this[chat];
    }

    getLastMessageContent(chat) {
        return this[chat].messages[this[chat].lastMessageId].messageContent;
    }

    getChatData(chat) {
        chat = parseInt(chat);
        console.log(chat);
        return {
            name: this[chat].name,
            userPhoto: this[chat].userPhoto,
            userId: this[chat].userId,
            userIsActive: this[chat].userIsActive
        }
    }

    getSortedMessagesArray(chat) {
        let keys = Object.keys(this[chat].messages);
        return keys.sort((a, b) => parseInt(a) > parseInt(b));
    }

    getChatsWithUsers() {
        let keys = Object.keys(this);
        return keys.map(a => {
            return {
                user: this[a].userId,
                chat: a
            };
        });
    }
}

    /* 
    body: {
        chatId: 1,
        name: "Mateusz Rusak",
        timestamp: "123824832",
        messageId: 1,
        content: "Hej",
        messageType: null,
        userPhoto: null,
        isRead: 1,
        userIsActive: 0,
        userId: 1,
        senderId: 4,
    }
    
    */

/*  
Store: {
    1: {
        name: "Mateusz Rusak",
        lastMessageId: 4,
        userPhoto: null,
        userIsActive: 0,
        userId: 1,
        messages: {
            4: {
                messageContent: "OK",
                messageType: 0,
                timestamp: "123434233",
                senderId: 1,
                isRead: 1
            }
        }
    }
}
*/

export default new Store();