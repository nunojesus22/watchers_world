import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ProfileService } from '../profile/services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { ChatService } from './services/chat.service';
import { Message } from './models/messages';
import { ProfileChat } from './models/profileChat';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'] // Corrigido de styleUrl para styleUrls
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

  constructor(
    private profileService: ProfileService,
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
      if (this.usersProfiles.length > 0 && newUsername !== this.selectedUsername) {
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

        const dateA = new Date(lastMessageA.sentAt!).getTime();
        const dateB = new Date(lastMessageB.sentAt!).getTime();

        return dateB - dateA;
      });

      this.usersProfiles = sortedChats.map(chat => {
        return {
          userName: chat.username,
          profilePhoto: chat.profilePhoto,
          lastMessage: chat.messages[chat.messages.length - 1]
        } as ProfileChat;
      });

      this.filteredUsersProfiles = [...this.usersProfiles];
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
}
