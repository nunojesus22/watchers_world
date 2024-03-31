import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ProfileService } from '../profile/services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { ChatService } from './services/chat.service';
import { Message } from './models/messages';
import { ProfileChat } from './models/profileChat';
import { Profile } from '../profile/models/profile';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'] 
})
export class ChatComponent implements AfterViewChecked {
  loggedUserName: string | null = null;
  selectedUser: ProfileChat | undefined;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
    this.setupContactItems();

    this.chatService.chats$.pipe(
      switchMap(chats => this.route.params),
      takeUntil(this.unsubscribe$)
    ).subscribe(params => {
      const newUsername = params['username'];
      if (newUsername !== this.selectedUsername || this.selectedUser === undefined) {
        this.updateSelectedUser(newUsername);
      }
    });

    this.authService.user$.subscribe(user => {
      this.loggedUserName = user ? user.username : null;
    });
    
    if (this.selectedUsername) {
      this.setupMessages();
    }
  }

  @ViewChild('scrollMe') private myScrollContainer: ElementRef | undefined;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  setupContactItems(): void {
    this.chatService.chats$.subscribe(chats => {
      const sortedChats = chats.sort((a, b) => {
        const lastMessageA = a.messages[a.messages.length - 1];
        const lastMessageB = b.messages[b.messages.length - 1];

        const dateA = lastMessageA ? new Date(lastMessageA.sentAt!).getTime() : 0;
        const dateB = lastMessageB ? new Date(lastMessageB.sentAt!).getTime() : 0;

        return dateB - dateA;
      });

      const nonEmptyChats = sortedChats.filter(chat => chat.messages.length > 0 && chat.messages[chat.messages.length - 1].sentAt);

      this.usersProfiles = nonEmptyChats.map(chat => ({
        userName: chat.username,
        profilePhoto: chat.profilePhoto,
        lastMessage: chat.messages[chat.messages.length - 1]
      })) as ProfileChat[];

      this.filteredUsersProfiles = [...this.usersProfiles];
      this.setupMessages();
    });
  }

  setupMessages(): void {
    if (this.selectedUsername) {
      var chat = this.chatService.getChat(this.selectedUsername);
      if (chat != undefined) {
        var messagesOfChat = chat!.messages;
        this.messages = messagesOfChat;
      }
    }
  }

  scrollToBottom(): void {
    try {
      if(this.myScrollContainer)
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateSelectedUser(newUsername:string): void {
    this.selectedUsername = newUsername;
    this.selectedUser = this.usersProfiles.find(u => u.userName === this.selectedUsername);
    if (this.selectedUser === undefined) {
      const userProfileString = sessionStorage.getItem('selectedUserProfile');
      if (userProfileString) {
        this.selectedUser = JSON.parse(userProfileString) as ProfileChat;
        sessionStorage.removeItem('selectedUserProfile')
      }
    }
    this.setupMessages();
  }

  selectUser(userProfile: ProfileChat): void {
    this.router.navigate([`/chat/${userProfile.userName}`]);
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

  sendMessage(): void {
    if (!this.selectedUsername || !this.newMessage.trim()) {
      console.log('Nome do usuário destinatário e mensagem são necessários.');
      return;
    }

    var messageToSent: Message = {
      sendUsername: this.authService.getLoggedInUserName()!,
      text: this.newMessage.trim(),
      sentAt: undefined,
    }

    this.chatService.sendMessage(this.selectedUsername, messageToSent)
      .then(() => {
        this.newMessage = "";
        this.scrollToBottom();
      })
      .catch(error => console.error('Erro ao enviar mensagem:', error));
  }

  toggleMessageForm(): void {
    this.messageForm = this.messageForm ? false : true;
    this.messageTextToNewUser = "";
    this.usernameOfNewReceiver = "";
  }

  sendMessageToNewUser(): void {
    if (!this.usernameOfNewReceiver || !this.messageTextToNewUser.trim()) {
      console.log('Nome do usuário destinatário e mensagem são necessários.');
      return;
    }

    var messageToSend: Message = {
      sendUsername: this.authService.getLoggedInUserName()!,
      text: this.messageTextToNewUser.trim(),
      sentAt: undefined,
    }

    this.chatService.sendMessage(this.usernameOfNewReceiver, messageToSend)
      .then(() => {
        this.toggleMessageForm();
      })
      .catch(error => {
        if (error && error.includes("O ID do usuário receptor é nulo.")) {
          this.errorMessage = "Utilizador não encontrado!";
        } else {
          console.error("Erro ao enviar mensagem:", error);
        }
      });
  }

  clearErrorMessage(): void {
    this.errorMessage = "";
  }
}
