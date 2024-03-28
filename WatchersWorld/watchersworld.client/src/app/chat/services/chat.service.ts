import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { ChatWithMessages } from '../models/chatWithMessages';
import { Message } from '../models/messages';
import { AuthenticationService } from '../../authentication/services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection | undefined;
  private chatsSubject = new BehaviorSubject<ChatWithMessages[]>([]);
  public chats$ = this.chatsSubject.asObservable();

  constructor(private authService : AuthenticationService) { }

  startConnection(username : string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`https://localhost:7232/chathub?username=${username}`, {
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
      this.onMessageReceived((message) => {
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

  sendMessage(usernameReceiver: string, message: Message) : Promise<void> {
    return this.hubConnection!.invoke('SendMessage', usernameReceiver, message)
      .then(async (sentAtFromServer) => {
        message.sentAt = sentAtFromServer;

        const hasChat = await this.alreadyHadTheChat(usernameReceiver);
        if (hasChat) {
          this.addMessageToChat(usernameReceiver, message);
        } else {
          this.getMissingChats().then(missingChats => {
            this.addMissingChats(missingChats);
            this.addMessageToChat(usernameReceiver, message);
          });
        }
      })
      .catch(err =>
      {
        console.log(err);
      });
  }

  onMessageReceived(listener: (message : Message) => void): void {
    this.hubConnection!.on('ReceiveMessage', async (data) => {
      const dataMessage: Message = {
        sendUsername: data.sendUsername,
        text: data.text,
        sentAt: new Date(data.sentAt)
      };

      const hasChat = await this.alreadyHadTheChat(dataMessage.sendUsername);
      if (hasChat) {
        this.addMessageToChat(dataMessage.sendUsername, dataMessage);
      } else {
        this.getMissingChats().then(missingChats => {
          this.addMissingChats(missingChats);
          this.addMessageToChat(dataMessage.sendUsername, dataMessage);
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
      chatToUpdate.messages.push(message);
      this.chatsSubject.next(currentChats);
    }
  }

  alreadyHadTheChat(receiverUsername: string): Promise<boolean> {
    return firstValueFrom(
      this.chats$.pipe(
        map(chats => {
          let hasChat = false;

          for (let chat of chats) {
            if (chat.username === receiverUsername) {
              hasChat = true;
              break
            }
          }

          return hasChat;
        })
      )
    );
  }

  getMissingChats(): Promise<ChatWithMessages[]> {
    return this.hubConnection!.invoke('GetMissingChats', this.chatsSubject.value);
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
}
