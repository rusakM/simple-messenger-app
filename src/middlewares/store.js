import converter from "./converter";

class Store {
  insert(body) {
    if (!this[body.chatId])
      this[body.chatId] = {
        name: body.name,
        userPhoto: body.userPhoto,
        userIsActive: body.userIsActive,
        userId: body.userId,
        messages: {},
        timestamp: body.chatTimestamp
      };
    this[body.chatId].lastMessageId = body.messageId;
    this[body.chatId].messages[body.messageId] = {
      messageContent: converter.decodeMessage(body.content),
      messageType: body.messageType,
      timestamp: body.msgTimestamp,
      senderId: body.senderId,
      isRead: body.isRead
    };
  }

  getSortedChatArray() {
    let keys = Object.keys(this);
    let arr = [];

    for (let a = 0; a < keys.length; a++) {
      arr.push({
        id: keys[a],
        message: this[keys[a]].lastMessageId
      });
    }

    arr = arr.sort((a, b) => b.message - a.message).map(a => a.id);
    return arr;
  }

  deleteMessage(chat, message) {
    delete this[chat].messages[message];
    if (message === this[chat].lastMessageId) {
      this[chat].lastMessageId = Object.keys(this[chat].messages).sort(
        (a, b) => parseInt(a) - parseInt(b)
      )[0];
    }
  }

  deleteChat(chat) {
    delete this[chat];
  }

  getLastMessageContent(chat) {
    return this[chat].messages[this[chat].lastMessageId].messageContent;
  }

  getLastMessageType(chat) {
    return this[chat].messages[this[chat].lastMessageId].messageType;
  }

  getLastMessageSenderId(chat) {
    return this[chat].messages[this[chat].lastMessageId].senderId;
  }

  getReadStatus(chat) {
    return this[chat].messages[this[chat].lastMessageId].isRead;
  }

  getChatData(chat) {
    chat = parseInt(chat);
    console.log(chat);
    return {
      name: this[chat].name,
      userPhoto: this[chat].userPhoto,
      userId: this[chat].userId,
      userIsActive: this[chat].userIsActive
    };
  }

  getSortedMessagesArray(chat) {
    let keys = Object.keys(this[chat].messages);
    return keys.sort((a, b) => parseInt(a) - parseInt(b));
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

  clearStore() {
    let keys = Object.keys(this);
    for (let a = 0; a < keys.length; a++) {
      delete this[a];
    }
  }

  getLastReadMessage(chatId) {
    let keys = this.getSortedMessagesArray(chatId);
    let lastRead = 0;
    for (let a = 0; a < keys.length; a++) {
      if (this[chatId].messages[keys[a]].isRead === 1) {
        lastRead = keys[a];
      } else {
        break;
      }
    }
    return parseInt(lastRead);
  }

  changeReadMessagesStatus(chatId, lastMessage = 0) {
    let keys = this.getSortedMessagesArray(chatId);
    let lastIndex = keys.indexOf(lastMessage);
    if (lastIndex === -1) {
      lastIndex = keys.length - 1;
    }
    for (let a = 0; a <= lastIndex; a++) {
      this[chatId].messages[keys[a]].isRead = 1;
    }
  }

  getArrayPhotos(chatId) {
    let keys = this.getSortedMessagesArray(chatId);
    let photos = [];
    keys.map(item => {
      if (this[chatId].messages[item].messageType === 1) {
        photos.push(parseInt(item));
      }
      return item;
    });
    return photos;
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

export default Store;
