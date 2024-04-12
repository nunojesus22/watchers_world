import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { ChatWithMessages } from '../models/chatWithMessages';
import { Message } from '../models/messages';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { ProfileChat } from '../models/profileChat';
import { Router } from '@angular/router';

/**
 * Serviço para gerir operações de chat, incluindo conexão, comunicação e gestão de estado dos chats.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection | undefined;
  private chatsSubject = new BehaviorSubject<ChatWithMessages[]>([]);
  public chats$ = this.chatsSubject.asObservable();


  /**
   * Construtor que injeta o AuthenticationService e Router para o serviço de chat.
   * @param authService Serviço para autenticação de utilizadores.
   * @param router Serviço de roteamento para navegação.
   */
  constructor(private authService: AuthenticationService, private router: Router) { }

  /**
   * Recupera o fuso horário do utilizador com base nas configurações do navegador.
   * @returns O fuso horário atual do utilizador.
   */
  private getTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Trata erros que ocorrem durante as operações de chat.
   * @param error O objeto de erro que foi capturado.
   */
  private handleError(error: any): void {
    console.error('An error occurred', error);
  }

  /**
   * Atualiza a lista de chats na BehaviorSubject.
   * @param chats Lista de chats a ser atualizada.
   */
  private updateChats(chats: ChatWithMessages[]): void {
    this.chatsSubject.next(chats);
  }

  /**
   * Limpa todos os chats atualmente armazenados na BehaviorSubject.
   */
  clearChats(): void {
    this.updateChats([]);
  }

  /**
   * Adiciona um novo chat à lista ou atualiza um existente com novas mensagens.
   * @param chat O chat a ser adicionado ou atualizado.
   */
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

  /**
   * Inicia a conexão com o servidor de chat usando SignalR.
   * @param username Nome de utilizador que está iniciando a conexão.
   */
  startConnection(username: string): void {
    let isDisconnected = this.hubConnection?.state === 'Disconnected';
    if (this.hubConnection && !isDisconnected) {
      return; // Previne múltiplas conexões.
    }

    const isDevelopment = window.location.hostname === 'localhost';
    const signalRHubUrl = isDevelopment ? 'https://localhost:7232/chathub' : 'https://watchers-world-backend.azurewebsites.net/chathub';
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${signalRHubUrl}?username=${username}&timeZone=${encodeURIComponent(this.getTimeZone())}`, {
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

  /**
   * Envia uma mensagem para outro utilizador através do servidor de chat.
   * @param usernameReceiver Nome do utilizador que receberá a mensagem.
   * @param message A mensagem a ser enviada.
   * @returns Uma promessa que é resolvida quando a mensagem é enviada com sucesso ou rejeitada em caso de erro.
   */
  sendMessage(usernameReceiver: string, message: Message): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('SendMessage', usernameReceiver, message, this.getTimeZone())
      .then(messageReturn => this.addMessageToChat(usernameReceiver, messageReturn))
      .catch(this.handleError);
  }

  /**
   * Seleciona um utilizador para chat e navega para a página de chat com esse utilizador.
   * @param userProfile O perfil do utilizador com o qual iniciar o chat.
   */
  selectUser(userProfile: ProfileChat): void {
    sessionStorage.setItem('selectedUserProfile', JSON.stringify(userProfile));
    this.router.navigateByUrl(`/chat/${userProfile.userName}`);
  }

  /**
 * Adiciona uma mensagem ao chat correspondente ou solicita os chats que faltam caso o chat não exista.
 * @param receiverUsername Nome do utilizador que recebe a mensagem.
 * @param message A mensagem a ser adicionada.
 */
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

  /**
 * Recupera chats que faltam do servidor através da conexão SignalR.
 */
  private async getMissingChats(): Promise<ChatWithMessages[]> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('GetMissingChats', this.chatsSubject.value, this.getTimeZone())
      .catch(this.handleError);
  }

  /**
 * Adiciona chats que faltam à lista de chats atual.
 * @param missingChats Chats que estão em falta na lista atual.
 */
  private addMissingChats(missingChats: ChatWithMessages[]): void {
    missingChats.forEach(chat => this.addOrUpdateChat(chat));
  }

  /**
 * Inicia a conexão SignalR e define os ouvintes para mensagens recebidas.
 */
  startConnectionAndListen(): void {
    const loggedInUser = this.authService.getLoggedInUserName();
    if (loggedInUser) {
      this.startConnection(loggedInUser);
    }
  }

  /**
 * Interrompe a conexão SignalR e limpa a lista de chats.
 */
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

  /**
 * Marca mensagens como lidas no servidor através da conexão SignalR.
 * @param messages Lista de mensagens a serem marcadas como lidas.
 */
  markMessagesAsRead(messages: Message[]): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('MarkMessagesAsRead', messages, this.getTimeZone())
      .then(chats => this.updateChats(chats))
      .catch(this.handleError);
  }

  /**
 * Configura o ouvinte para mensagens recebidas e adiciona novas mensagens ao chat correspondente.
 * @param listener Função a ser chamada quando uma nova mensagem é recebida.
 */
  onMessageReceived(listener: (message: Message) => void): void {
    this.hubConnection?.on('ReceiveMessage', (data: any) => {
      const dataMessage: Message = this.convertToMessage(data);
      this.addMessageToChat(dataMessage.sendUsername, dataMessage).then(() => listener(dataMessage));
    });
  }

  /**
 * Converte os dados recebidos em um objeto Message.
 * @param data Dados brutos recebidos do servidor.
 * @returns Objeto Message formatado.
 */
  private convertToMessage(data: any): Message {
    return {
      messageId: data.messageId,
      sendUsername: data.sendUsername,
      text: data.text,
      sentAt: new Date(data.sentAt),
      readAt: data.readAt ? new Date(data.readAt) : undefined
    };
  }

  /**
 * Retorna a última mensagem recebida em um conjunto de mensagens.
 * @param messages Lista de mensagens para considerar.
 * @param myUsername Nome de utilizador do destinatário para identificar mensagens recebidas.
 * @returns A última mensagem recebida ou undefined se nenhuma for encontrada.
 */
  getLastMessageReceived(messages: Message[], myUsername: string): Message | undefined {
    return messages.reduce((lastReceived, message) => {
      const isReceivedMessage = myUsername !== message.sendUsername && message.sentAt;
      const isNewerMessage = !lastReceived || new Date(message.sentAt!).getTime() > new Date(lastReceived.sentAt!).getTime();

      return isReceivedMessage && isNewerMessage ? message : lastReceived;
    }, undefined as Message | undefined);
  }

  /**
 * Filtra e retorna todas as mensagens não lidas de um conjunto de mensagens.
 * @param messages Lista completa de mensagens.
 * @param myUsername Nome de utilizador do receptor para identificar mensagens não lidas.
 * @returns Array de mensagens não lidas.
 */
  getMessagesUnread(messages: Message[], myUsername: string): Message[] {
    return messages.filter(message => message.sendUsername !== myUsername && !message.readAt);
  }

  /**
 * Retorna todas as mensagens não lidas de um chat específico.
 * @param username Nome de utilizador do chat para o qual as mensagens não lidas são solicitadas.
 * @returns Array de mensagens não lidas do chat especificado.
 */
  getMessagesUnreadFromChat(username: string): Message[] {
    const chat = this.chatsSubject.value.find(c => c.username === username);
    if (chat) {
      return chat.messages.filter(message => message.readAt == null);
    }
    return [];
  }

  /**
 * Obtém um chat específico por nome de utilizador.
 * @param username Nome de utilizador associado ao chat desejado.
 * @returns O chat correspondente ou undefined se nenhum for encontrado.
 */
  getChat(username: string): ChatWithMessages | undefined {
    const currentChats = this.chatsSubject.getValue();
    return currentChats.find(chat => chat.username === username);
  }

  /**
 * Solicita ao servidor a exclusão de um chat e atualiza o estado local.
 * @param usernameReceiver Nome de utilizador do receptor do chat a ser excluído.
 * @returns Uma promessa que é resolvida quando o chat é excluído com sucesso ou rejeitada em caso de erro.
 */
  deleteChat(usernameReceiver: string): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('DeleteChat', usernameReceiver, this.getTimeZone())
      .then(chats => this.updateChats(chats))
      .catch(this.handleError);
  }

  /**
 * Solicita ao servidor a exclusão de uma mensagem específica e atualiza o estado local.
 * @param message Mensagem a ser excluída.
 * @returns Uma promessa que é resolvida quando a mensagem é excluída com sucesso ou rejeitada em caso de erro.
 */
  deleteMessage(message: Message): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No hub connection');
    }

    return this.hubConnection.invoke('DeleteMessage', this.getTimeZone(), message)
      .then(chats => {
        this.updateChats(chats);
      })
      .catch(this.handleError);
  }
}
