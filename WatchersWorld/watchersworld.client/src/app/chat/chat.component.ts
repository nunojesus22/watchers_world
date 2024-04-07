import { Component, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { ChatService } from './services/chat.service';
import { Message } from './models/messages';
import { ProfileChat } from './models/profileChat';
import { DialogService } from '../confirm-dialog/services/dialog.service';
import { ChatWithMessages } from './models/chatWithMessages';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'] 
})
export class ChatComponent implements AfterViewChecked {
  loggedUserName: string | null = null;

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

  private subscribeToUser(): void {
    this.authService.user$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        this.loggedUserName = user ? user.username : null;
      });
  }

  private subscribeToChats(): void {
    this.chatService.chats$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(chats => this.setupContactItems(chats));
  }

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

  private subscribeToMessageReceived(): void {
    this.chatService.onMessageReceived((message: Message) => {
      this.setupMessages();
      if (this.chatIsOpen(message.sendUsername)) {
        this.markMessagesAsRead();
      }
    });
  }

  private chatIsOpen(sendUsername: string): boolean {
    if (this.selectedUsername == sendUsername && this._selectedUser?.userName == sendUsername) {
      return true;
    } else {
      return false;
    }
  }
  

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

  stopLongPress() {
    this.justUnselectedMessage = false;
    clearTimeout(this.longPressTimer);
    this.detectChanges();
  }

  detectChanges() {
    this.changeDetectorRef.detectChanges();
  }

  selectUser(newUser: ProfileChat) {
    this.selectedUser = newUser;
  }

  ngAfterViewChecked(): void {
    if (!this.justUnselectedMessage && !this.currentLongPressedMessage) {
      this.scrollToBottom();
    }
    this.justUnselectedMessage = false;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private scrollToBottom(): void {
    if (this.myScrollContainer && this.shouldScrollToBottom) {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    }
  }

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
    this.showNoResults = false; // Resetar estado de não ter resultados, se necessário
    this.setupMessages();
    console.log(this.messages);
  }

  private getUnreadMessages(messages: Message[]): Message[] {
    return messages.filter(message => !message.readAt && message.sendUsername !== this.loggedUserName);
  }

  onUserSelected(newUserProfile: ProfileChat): void {
    this.currentLongPressedMessage = null;
    this.shouldScrollToBottom = true;
    this.scrollToBottom();


    sessionStorage.setItem('selectedUser', JSON.stringify(newUserProfile));
    this.router.navigate([`/chat/${newUserProfile.userName}`]);
  }

  setupMessages(): void {
    if (this._selectedUser) {
      const chat = this.chatService.getChat(this._selectedUser.userName!);
      if (chat) {
        this.messages = chat.messages;
      }
    }
  }

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

  private markMessagesAsRead(): void {
    var messages = this.chatService.getMessagesUnreadFromChat(this._selectedUser?.userName!);
    var messagesToRead = this.unreadMessagesReceive(messages);

    if (messagesToRead !== null && messagesToRead!.length !== 0) {
      this.chatService.markMessagesAsRead(messagesToRead!);
    }
  }

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

  toggleMessageForm(): void {
    this.messageForm = !this.messageForm;
    this.messageTextToNewUser = "";
    this.usernameOfNewReceiver = "";
  }

  sendMessageToNewUser(): void {
    if (!this.usernameOfNewReceiver || !this.messageTextToNewUser.trim()) {
      console.log('Nome do usuário destinatário e mensagem são necessários.');
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

  clearErrorMessage(): void {
    this.errorMessage = "";
  }

  performDeleteChatAction(event: any): void {
    this.deleteChat();
  }

  performDeleteMessageAction(message: any) {
    this.deleteMessage(message);
  }

  private deleteChat(): void {
    if (this._selectedUser) {
      this.chatService.deleteChat(this._selectedUser?.userName!);
      this.resetUser();
    }
  }

  private deleteMessage(message: any) {
    this.chatService.deleteMessage(message);
    this.currentLongPressedMessage = null;
    this.detectChanges();
  }

  resetUser(): void {
    this.selectedUser = undefined;
    this.selectedUsername = null;
    sessionStorage.removeItem('selectedUser');
    this.router.navigate(['/chat']);
  }

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

  lastMessageReceive(messages: Message[]): Message | null {
    var lastMessageReceive = this.chatService.getLastMessageReceived(messages, this.loggedUserName!);

    if (lastMessageReceive !== undefined) {
      return lastMessageReceive;
    } else {
      return null;
    }
  }

  unreadMessagesReceive(messages: Message[]): Message[] | null {
    var unreadMessagesReceive = this.chatService.getMessagesUnread(messages, this.loggedUserName!);

    if (unreadMessagesReceive !== undefined) {
      return unreadMessagesReceive;
    } else {
      return null;
    }
  }

  isUnread(messages: Message[] | null): Boolean {
    if (messages !== null) {
      if (messages?.length > 0) {
        return true;
      }
    }
    return false;
  }

  /*
  setupContactItems(): void {
    console.log(this.chatService.chats$);

    this.chatService.chats$.subscribe(chats => {
      const sortedChats = chats.sort((a, b) => {
        const lastMessageA = a.messages[a.messages.length - 1];
        const lastMessageB = b.messages[b.messages.length - 1];

        const dateA = lastMessageA ? new Date(lastMessageA.sentAt!).getTime() : 0;
        const dateB = lastMessageB ? new Date(lastMessageB.sentAt!).getTime() : 0;

        return dateB - dateA;
      });

      const nonEmptyChats = sortedChats.filter(chat => chat.messages.length > 0 && chat.messages[chat.messages.length - 1].sentAt);

      this.usersProfiles = nonEmptyChats.map(chat => {
        var unreadMessages = this.unreadMessagesReceive(chat.messages);

        return {
          userName: chat.username,
          profilePhoto: chat.profilePhoto,
          lastMessage: chat.messages[chat.messages.length - 1],
          unreadMessages: unreadMessages ?? undefined, 
        } as ProfileChat;
      });

      this.filteredUsersProfiles = [...this.usersProfiles];
    });
  }
  
  setupMessages(): void {
    if (this.selectedUsername) {
      var chat = this.chatService.getChat(this.selectedUsername);
      if (chat !== undefined) {
        var messagesOfChat = chat!.messages;
        this.messages = messagesOfChat;
        this.markMessagesAsRead();
      }
    }
  }*/
}
