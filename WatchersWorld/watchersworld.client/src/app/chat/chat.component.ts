import { Component, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { ChatService } from './services/chat.service';
import { Message } from './models/messages';
import { ProfileChat } from './models/profileChat';
import { DialogService } from '../confirm-dialog/services/dialog.service';
import { ChatWithMessages } from './models/chatWithMessages';


/**
 * Componente Angular responsável pela interface de utilizador do chat.
 * Gere a exibição de mensagens, interações de utilizador e atualizações de estado relacionadas ao chat.
 */
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'] 
})
export class ChatComponent implements AfterViewChecked {
  loggedUserName: string | null = null;

  /**
   * Getter/Setter para o utilizador de chat selecionado.
   * Atualiza as mensagens e marca as mensagens como lidas quando o utilizador é alterado.
   */
  private _selectedUser: ProfileChat | undefined;
  get selectedUser(): ProfileChat | undefined {
    return this._selectedUser;
  }
  set selectedUser(value: ProfileChat | undefined) {
    if (value !== this._selectedUser) {
      this._selectedUser = value;
      this.setupMessages();
      this.markMessagesAsRead();
    }
  }

  selectedUsername: string | null = null;
  private unsubscribe$ = new Subject<void>();

  usersProfiles: ProfileChat[] = [];
  filteredUsersProfiles: ProfileChat[] = [];
  newMessage: string = '';
  messages: any[] = [];

  searchTerm: string = '';
  showNoResults: boolean = false;

  messageForm: boolean = false;
  usernameOfNewReceiver: string = "";
  messageTextToNewUser: string = "";
  errorMessage: string = '';

  currentLongPressedMessage: any = null;
  longPressTimer: any;
  shouldScrollToBottom: boolean = true;
  justUnselectedMessage: boolean = false;

  /**
   * Inicialização do componente.
   * Subscreve aos dados necessários e recupera o perfil do utilizador selecionado da sessão, se disponível.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private chatService: ChatService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  @ViewChild('scrollMe') private myScrollContainer: ElementRef | undefined;

  ngOnInit(): void {
    this.subscribeToUser();
    this.subscribeToChats();
    this.subscribeToRouteParams();
    this.subscribeToMessageReceived();
    const userProfileString = sessionStorage.getItem('selectedUserProfile');
    if (userProfileString) {
      this.selectedUser = JSON.parse(userProfileString) as ProfileChat;
    }
  }

  /**
   * Subscreve ao utilizador autenticado para obter o nome de utilizador logado.
   */
  private subscribeToUser(): void {
    this.authService.user$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        this.loggedUserName = user ? user.username : null;
      });
  }

  /**
   * Subscreve aos chats disponíveis e configura a lista de contatos.
   */
  private subscribeToChats(): void {
    this.chatService.chats$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(chats => this.setupContactItems(chats));
  }

  /**
   * Subscreve aos parâmetros da rota para atualizar o utilizador de chat selecionado conforme a navegação.
   */
  private subscribeToRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(params => {
        const newUsername = params['username'];
        if (newUsername && newUsername !== this.selectedUsername) {
          this.updateSelectedUser(newUsername);
        }
      });
  }

  /**
   * Subscreve às mensagens recebidas e atualiza o chat conforme as mensagens chegam.
   */
  private subscribeToMessageReceived(): void {
    this.chatService.onMessageReceived((message: Message) => {
      this.setupMessages();
      if (this.chatIsOpen(message.sendUsername)) {
        this.markMessagesAsRead();
      }
    });
  }

  /**
   * Verifica se o chat com um determinado utilizador está aberto.
   */
  private chatIsOpen(sendUsername: string): boolean {
    return this.selectedUsername == sendUsername && this._selectedUser?.userName == sendUsername;
  }
  
  /**
   * Inicia a detecção de pressão longa em uma mensagem específica para mostrar opções adicionais.
   * @param event O evento de mouse que iniciou a pressão longa.
   * @param message A mensagem alvo da pressão longa.
   */
  startLongPress(event: MouseEvent, message: any) {
    this.currentLongPressedMessage = null;
    this.shouldScrollToBottom = false;
    this.detectChanges();

    this.longPressTimer = setTimeout(() => {
      if (this.currentLongPressedMessage === message) {
        this.justUnselectedMessage = true;
      } else {
        this.currentLongPressedMessage = message;
      }
      this.detectChanges();
    }, 500);
  }

  /**
  * Encerra a detecção de pressão longa e limpa o estado relevante.
  */
  stopLongPress() {
    this.justUnselectedMessage = false;
    clearTimeout(this.longPressTimer);
    this.detectChanges();
  }

  /**
   * Força a atualização da detecção de mudanças no componente para garantir a atualização da UI.
   */
  detectChanges() {
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Seleciona um utilizador de chat e atualiza a interface de utilizador para mostrar o chat com esse utilizador.
   * @param newUser O perfil do novo utilizador selecionado.
   */
  selectUser(newUser: ProfileChat) {
    this.selectedUser = newUser;
  }

  /**
   * Método de ciclo de vida chamado após cada verificação de visualização do componente.
   * Garante que a visualização de mensagens esteja sempre rolando para a última mensagem se necessário.
   */
  ngAfterViewChecked(): void {
    if (!this.justUnselectedMessage && !this.currentLongPressedMessage) {
      this.scrollToBottom();
    }
    this.justUnselectedMessage = false;
  }

  /**
   * Método de ciclo de vida chamado durante a destruição do componente para desfazer subscrições e evitar vazamentos de memória.
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Rola o contêiner de mensagens para o fundo para garantir que a última mensagem seja visível.
   */
  private scrollToBottom(): void {
    if (this.myScrollContainer && this.shouldScrollToBottom) {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    }
  }

  /**
   * Configura os itens de contato para a lista de chats, filtrando e ordenando chats baseados na existência e no horário da última mensagem.
   * @param chats Lista de chats com mensagens para processar.
   */
  setupContactItems(chats: ChatWithMessages[]): void {
    if (chats.length === 0) {
      this.usersProfiles = [];
      this.filteredUsersProfiles = [];
      this.showNoResults = true; 
      return;
    }

    const nonEmptyChats = chats.filter(chat => chat.messages && chat.messages.length > 0);
    const sortedChats = [...nonEmptyChats].sort((a, b) => {
      const lastMessageA = a.messages[a.messages.length - 1];
      const lastMessageB = b.messages[b.messages.length - 1];
      return new Date(lastMessageB.sentAt!).getTime() - new Date(lastMessageA.sentAt!).getTime();
    });

    this.usersProfiles = sortedChats.map(chat => ({
      userName: chat.username,
      profilePhoto: chat.profilePhoto,
      lastMessage: chat.messages[chat.messages.length - 1],
      unreadMessages: this.getUnreadMessages(chat.messages) ?? undefined,
    }));

    this.filteredUsersProfiles = [...this.usersProfiles];
    this.showNoResults = false;
    this.setupMessages();
  }

  /**
   * Retorna uma lista de mensagens não lidas de um conjunto de mensagens.
   * Filtra as mensagens que não foram lidas pelo utilizador logado e que foram enviadas por outros utilizadors.
   * 
   * @param messages Array de mensagens a ser filtrado.
   * @returns Array de mensagens que não foram lidas pelo utilizador logado.
   */
  private getUnreadMessages(messages: Message[]): Message[] {
    return messages.filter(message => !message.readAt && message.sendUsername !== this.loggedUserName);
  }

  /**
   * Manipula a seleção de um novo utilizador de chat pelo utilizador logado.
   * Este método é chamado quando um utilizador seleciona outro utilizador da lista de contatos para iniciar ou continuar uma conversa.
   * Ao selecionar um utilizador, o método atualiza a visualização para mostrar o chat com o utilizador selecionado,
   * rola para a última mensagem e atualiza a URL de navegação para refletir a seleção.
   * 
   * @param newUserProfile O perfil do utilizador selecionado para o chat.
   */
  onUserSelected(newUserProfile: ProfileChat): void {
    this.currentLongPressedMessage = null;
    this.shouldScrollToBottom = true;
    this.scrollToBottom();


    sessionStorage.setItem('selectedUser', JSON.stringify(newUserProfile));
    this.router.navigate([`/chat/${newUserProfile.userName}`]);
  }

  /**
  * Filtra e configura as mensagens para o utilizador de chat selecionado.
  */
  setupMessages(): void {
    if (this._selectedUser) {
      const chat = this.chatService.getChat(this._selectedUser.userName!);
      if (chat) {
        this.messages = chat.messages;
      }
    }
  }

  /**
   * Envia uma nova mensagem para o utilizador selecionado.
   */
  sendMessage(): void {
    if (this._selectedUser && this.newMessage.trim()) {
      const messageToSend: Message = {
        messageId: undefined,
        sendUsername: this.loggedUserName!,
        text: this.newMessage,
        sentAt: undefined, 
        readAt: undefined, 
      };

      this.chatService.sendMessage(this._selectedUser?.userName!, messageToSend).then(() => {
        this.newMessage = "";
        this.scrollToBottom();
      }).catch(error => {
        this.errorMessage = "Erro ao enviar mensagem: " + error;
      });
    }
  }

  /**
   * Marca as mensagens não lidas como lidas quando um chat está aberto e visível para o utilizador.
   */
  private markMessagesAsRead(): void {
    var messages = this.chatService.getMessagesUnreadFromChat(this._selectedUser?.userName!);
    var messagesToRead = this.unreadMessagesReceive(messages);

    if (messagesToRead !== null && messagesToRead!.length !== 0) {
      this.chatService.markMessagesAsRead(messagesToRead!);
    }
  }

  /**
   * Filtra os utilizadors com base no termo de pesquisa inserido. Atualiza a lista de utilizadors filtrados
   * e controla a exibição de "nenhum resultado encontrado".
   */
  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsersProfiles = this.usersProfiles;
      this.showNoResults = false;
    } else {
      const filtered = this.usersProfiles.filter(user =>
        user.userName?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.showNoResults = filtered.length === 0 || filtered.every(u => u.userName === this.loggedUserName);
      this.filteredUsersProfiles = filtered;
    }
  }

  /**
   * Alterna a visibilidade do formulário de envio de mensagens para um novo utilizador.
   */
  toggleMessageForm(): void {
    this.messageForm = !this.messageForm;
    this.messageTextToNewUser = "";
    this.usernameOfNewReceiver = "";
  }

  /**
   * Envia uma mensagem para um novo utilizador. Verifica se o nome do utilizador e a mensagem estão presentes.
   * Em caso de erro, trata a resposta e apresenta uma mensagem adequada.
   */
  sendMessageToNewUser(): void {
    if (!this.usernameOfNewReceiver || !this.messageTextToNewUser.trim()) {
      console.log('Nome do utilizador destinatário e mensagem são necessários.');
      return;
    }

    var messageToSend: Message = {
      messageId: undefined,
      sendUsername: this.authService.getLoggedInUserName()!,
      text: this.messageTextToNewUser.trim(),
      sentAt: undefined,
      readAt: undefined,
    }

    this.chatService.sendMessage(this.usernameOfNewReceiver, messageToSend)
      .then(() => {
        this.toggleMessageForm();
      })
      .catch(error => {
        if (error && error.includes("ID do utilizador receptor não pode ser null.")) {
          this.errorMessage = "Utilizador não encontrado!";
        } else {
          console.error("Erro ao enviar mensagem:", error);
        }
      });
  }

  /**
   * Limpa as mensagens de erro exibidas no componente.
   */
  clearErrorMessage(): void {
    this.errorMessage = "";
  }

  /**
 * Ação para excluir um chat após confirmação do utilizador.
 */
  performDeleteChatAction(event: any): void {
    this.deleteChat();
  }

  /**
   * Ação para excluir uma mensagem específica após confirmação do utilizador.
   */
  performDeleteMessageAction(message: any) {
    this.deleteMessage(message);
  }

  /**
   * Exclui um chat e redefine o estado do utilizador selecionado.
   */
  private deleteChat(): void {
    if (this._selectedUser) {
      this.chatService.deleteChat(this._selectedUser?.userName!);
      this.resetUser();
    }
  }

  /**
 * Exclui uma mensagem específica e atualiza o componente para refletir a mudança.
 */
  private deleteMessage(message: any) {
    this.chatService.deleteMessage(message);
    this.currentLongPressedMessage = null;
    this.detectChanges();
  }

  /**
   * Redefine o estado do utilizador selecionado e limpa a sessão.
   */
  resetUser(): void {
    this.selectedUser = undefined;
    this.selectedUsername = null;
    sessionStorage.removeItem('selectedUser');
    this.router.navigate(['/chat']);
  }

  /**
   * Atualiza o utilizador selecionado com base no nome de utilizador fornecido.
   */
  updateSelectedUser(newUsername: string): void {
    this.selectedUsername = newUsername;
    const userProfile = this.usersProfiles.find(u => u.userName === newUsername);
    if (userProfile) {
      this.selectedUser = userProfile;
    } else {
      const userProfileString = sessionStorage.getItem('selectedUserProfile');
      if (userProfileString) {
        this.selectedUser = JSON.parse(userProfileString);
        sessionStorage.removeItem('selectedUserProfile');
      } else {
        this.resetUser();
      }
    }
  }

  /**
   * Retorna a última mensagem do conjunto de mensagens fornecido.
   */
  lastMessageReceive(messages: Message[]): Message | null {
    var lastMessageReceive = this.chatService.getLastMessageReceived(messages, this.loggedUserName!);

    if (lastMessageReceive !== undefined) {
      return lastMessageReceive;
    } else {
      return null;
    }
  }

  /**
   * Retorna mensagens não lidas de um conjunto de mensagens fornecido.
   */
  unreadMessagesReceive(messages: Message[]): Message[] | null {
    var unreadMessagesReceive = this.chatService.getMessagesUnread(messages, this.loggedUserName!);

    if (unreadMessagesReceive !== undefined) {
      return unreadMessagesReceive;
    } else {
      return null;
    }
  }

  /**
   * Verifica se há mensagens não lidas no conjunto de mensagens fornecido.
   */
  isUnread(messages: Message[] | null): Boolean {
    if (messages !== null) {
      if (messages?.length > 0) {
        return true;
      }
    }
    return false;
  }
}
