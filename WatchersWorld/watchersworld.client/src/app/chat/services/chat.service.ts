import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { ChatWithMessages } from '../models/chatWithMessages';
import { Message } from '../models/messages';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { ProfileChat } from '../models/profileChat';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection | undefined;
  private chatsSubject = new BehaviorSubject<ChatWithMessages[]>([]);
  public chats$ = this.chatsSubject.asObservable();

  constructor(private authService: AuthenticationService, private router: Router) { }

  private getTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private handleError(error: any): void {
    // Handle your errors in a centralized way. You can also implement logging here.
    console.error('An error occurred', error);
  }

  private updateChats(chats: ChatWithMessages[]): void {
    this.chatsSubject.next(chats);
  }

  clearChats(): void {
    this.updateChats([]);
  }

  private addOrUpdateChat(chat: ChatWithMessages): void {
    let currentChats = this.chatsSubject.value;
    const existingChatIndex = currentChats.findIndex(c => c.username === chat.username);

    if (existingChatIndex !== -1) {
      const existingChat = currentChats[existingChatIndex];
      chat.messages.forEach(message => {
        if (!existingChat.messages.some(m => m.messageId === message.messageId)) {
          existingChat.messages.push(message);
        }
      });
    } else {
      currentChats.push(chat);
    }

    this.updateChats(currentChats);
  }

  startConnection(username: string): void {
    let isDisconnected = this.hubConnection?.state === 'Disconnected';
    if (this.hubConnection && !isDisconnected) {
      return; // Prevent multiple connections.
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`https://localhost:7232/chathub?username=${username}&timeZone=${encodeURIComponent(this.getTimeZone())}`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        this.hubConnection!.on('ReceiveChatList', this.updateChats.bind(this));
        this.onMessageReceived((message) => {
          console.log(message);
        });
      })
      .catch(this.handleError);
  }

  sendMessage(usernameReceiver: string, message: Message): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('SendMessage', usernameReceiver, message, this.getTimeZone())
      .then(messageReturn => this.addMessageToChat(usernameReceiver, messageReturn))
      .catch(this.handleError);
  }

  selectUser(userProfile: ProfileChat): void {
    sessionStorage.setItem('selectedUserProfile', JSON.stringify(userProfile));
    this.router.navigateByUrl(`/chat/${userProfile.userName}`);
  }


  private async addMessageToChat(receiverUsername: string, message: Message): Promise<void> {
    const currentChats = this.chatsSubject.value;
    const chatIndex = currentChats.findIndex(c => c.username === receiverUsername);

    if (chatIndex !== -1) {
      const chat = currentChats[chatIndex];
      if (!chat.messages.some(m => m.messageId === message.messageId)) {
        chat.messages.push(message);
        this.updateChats(currentChats);
      }
    } else {
      const missingChats = await this.getMissingChats();
      this.addMissingChats(missingChats);
    }
  }

  private async getMissingChats(): Promise<ChatWithMessages[]> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('GetMissingChats', this.chatsSubject.value, this.getTimeZone())
      .catch(this.handleError);
  }

  private addMissingChats(missingChats: ChatWithMessages[]): void {
    missingChats.forEach(chat => this.addOrUpdateChat(chat));
  }

  startConnectionAndListen(): void {
    const loggedInUser = this.authService.getLoggedInUserName();
    if (loggedInUser) {
      this.startConnection(loggedInUser);
    }
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          this.clearChats();
          console.log("Connection stopped");
        })
        .catch(err => console.log("Error while stopping connection: " + err));
    }
  }

  markMessagesAsRead(messages: Message[]): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('MarkMessagesAsRead', messages, this.getTimeZone())
      .then(chats => this.updateChats(chats))
      .catch(this.handleError);
  }

  onMessageReceived(listener: (message: Message) => void): void {
    this.hubConnection?.on('ReceiveMessage', (data: any) => {
      const dataMessage: Message = this.convertToMessage(data);
      this.addMessageToChat(dataMessage.sendUsername, dataMessage).then(() => listener(dataMessage));
    });
  }

  private convertToMessage(data: any): Message {
    return {
      messageId: data.messageId,
      sendUsername: data.sendUsername,
      text: data.text,
      sentAt: new Date(data.sentAt),
      readAt: data.readAt ? new Date(data.readAt) : undefined
    };
  }

  getLastMessageReceived(messages: Message[], myUsername: string): Message | undefined {
    return messages.reduce((lastReceived, message) => {
      const isReceivedMessage = myUsername !== message.sendUsername && message.sentAt;
      const isNewerMessage = !lastReceived || new Date(message.sentAt!).getTime() > new Date(lastReceived.sentAt!).getTime();

      return isReceivedMessage && isNewerMessage ? message : lastReceived;
    }, undefined as Message | undefined);
  }

  getMessagesUnread(messages: Message[], myUsername: string): Message[] {
    return messages.filter(message => message.sendUsername !== myUsername && !message.readAt);
  }

  getMessagesUnreadFromChat(username: string): Message[] {
    const chat = this.chatsSubject.value.find(c => c.username === username);
    if (chat) {
      return chat.messages.filter(message => message.readAt == null);
    }
    return [];
  }

  getChat(username: string): ChatWithMessages | undefined {
    const currentChats = this.chatsSubject.getValue();
    return currentChats.find(chat => chat.username === username);
  }

  deleteChat(usernameReceiver: string): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('DeleteChat', usernameReceiver, this.getTimeZone())
      .then(chats => this.updateChats(chats))
      .catch(this.handleError);
  }




  /*
  startConnection(username: string) {
    var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`https://localhost:7232/chathub?username=${username}&timeZone=${encodeURIComponent(timeZone)}`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();


    this.hubConnection.start()
      .then(() => {
        console.log('Connection started');
        this.hubConnection!.on('ReceiveChatList', (chatList) => {
          this.setChats(chatList);
          console.log(this.chats$); //TO REMOVEEEEEE
        });
      })
      .catch(err => console.log('Error while starting connection: ' + err));

    
  }

  startConnectionAndListen(): void {
    if (this.authService.getLoggedInUserName() != null) {
      this.startConnection(this.authService.getLoggedInUserName()!);
      /*this.onMessageReceived((message) => {
        console.log(`Mensagem recebida de ${message.sendUsername}: ${message.text} | ${message.sentAt}`);
      });
    }
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          this.clearChats();
          console.log("Connection stopped");
        })
        .catch(err => console.log("Error while stopping connection: " + err));
    }
  }

  sendMessage(usernameReceiver: string, message: Message): Promise<void> {
    var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return this.hubConnection!.invoke('SendMessage', usernameReceiver, message, timeZone)
      .then((messageReturn) => {
        message = messageReturn;

        const hasChat = this.alreadyHadTheChat(usernameReceiver);
        if (hasChat) {
          this.addMessageToChat(usernameReceiver, message);
        } else {
          this.getMissingChats().then(missingChats => {
            this.addMissingChats(missingChats);
          });
        }
      })
      .catch(error => {
        if (error.message.includes("ID do usuário receptor não pode ser null.")) {
          return Promise.reject("O ID do usuário receptor é nulo.");
        }
        return Promise.reject();
      });
  }

  deleteChat(usernameReceiver: string): Promise<void> {
    var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return this.hubConnection!.invoke('DeleteChat', usernameReceiver, timeZone)
      .then(async (chats) => {
        this.chatsSubject.next(chats);
      })
      .catch(error => { console.log(error);  return Promise.reject(); });
  }

  markMessagesAsRead(messages: Message[]): Promise<void> {
    var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return this.hubConnection!.invoke('MarkMessagesAsRead', messages, timeZone)
      .then((chats) => {
        this.chatsSubject.next(chats);
      })
      .catch(error => { console.log(error); return Promise.reject(); });
  }

  onMessageReceived(listener: (message : Message) => void): void {
    this.hubConnection!.on('ReceiveMessage', (data) => {
      var readAt: Date | undefined = (data.readAt !== null) ? data.readAt : undefined;

      const dataMessage: Message = {
        messageId: data.messageId,
        sendUsername: data.sendUsername,
        text: data.text,
        sentAt: new Date(data.sentAt),
        readAt: readAt
      };

      const hasChat = this.alreadyHadTheChat(dataMessage.sendUsername);
      if (hasChat) {
        this.addMessageToChat(dataMessage.sendUsername, dataMessage);
      } else {
        this.getMissingChats().then(missingChats => {
          this.addMissingChats(missingChats);
        });
      }

      
      listener(dataMessage);
    });
  }

  setChats(chats: ChatWithMessages[]): void {
    this.chatsSubject.next(chats);
  }

  clearChats(): void {
    this.chatsSubject.next([]);
  }

  addMessageToChat(receiverUsername: string, message: Message): void {
    const currentChats = this.chatsSubject.value;
    const chatIndex = currentChats.findIndex(c => c.username === receiverUsername);
    if (chatIndex !== -1) {
      const chatToUpdate = currentChats[chatIndex];
      var chatHadMessage = this.chatAlreadyHaveMessage(chatToUpdate, message)
      if (!chatHadMessage) {
        chatToUpdate.messages.push(message);
        this.chatsSubject.next(currentChats);
      }
    }
  }

  alreadyHadTheChat(receiverUsername: string): Boolean {
    const currentChats = this.chatsSubject.value;
    const chatIndex = currentChats.findIndex(c => c.username === receiverUsername);
    if (chatIndex !== -1) {
      return true;
    } else {
      return false;
    }
  }

  chatAlreadyHaveMessage(currentChat : ChatWithMessages, message: Message) : Boolean {
    return currentChat.messages.some(existingMessage => existingMessage.messageId === message.messageId);
  }

  getMissingChats(): Promise<ChatWithMessages[]> {
    var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return this.hubConnection!.invoke('GetMissingChats', this.chatsSubject.value, timeZone);
  }

  addMissingChats(missingChats: ChatWithMessages[]): void {
    const currentChats = this.chatsSubject.value;

    const newChats = missingChats.filter(
      missingChat => !currentChats.some(currentChat => currentChat.username === missingChat.username)
    );
    const updatedChats = [...currentChats, ...newChats];
    this.chatsSubject.next(updatedChats);
  }

  getChat(username: string): ChatWithMessages | undefined {
    const currentChats = this.chatsSubject.value;

    var chatWantedIndex = currentChats.findIndex(c => c.username === username);
    if (chatWantedIndex != -1) {
      return currentChats[chatWantedIndex];
    }
    return undefined;
  }

  selectUser(userProfile: ProfileChat): void {
    sessionStorage.setItem('selectedUserProfile', JSON.stringify(userProfile));
    this.router.navigate([`/chat/${userProfile.userName}`]);
  }

  getLastMessageReceive(messages: Message[], myUsername: string) : Message | undefined {
    let lastReceived: Message | undefined;

    messages.forEach(message => {
      if (myUsername !== null && message.sendUsername !== myUsername && message.sentAt) {
        const sentAtDate = new Date(message.sentAt);

        if (!lastReceived || sentAtDate.getTime() > new Date(lastReceived.sentAt!).getTime()) {
          lastReceived = message;
        }
      }
    });

    return lastReceived;
  }

  getMessagesUnread(messages: Message[], myUsername: string): Message[] {
    let messagesUnread: Message[] = [];

    messages.forEach(message => {
      if (myUsername !== null && message.sendUsername !== myUsername && message.sentAt && (message.readAt === null || message.readAt === undefined)) {
        messagesUnread.push(message)
      }
    });

    return messagesUnread;
  }*/
}
