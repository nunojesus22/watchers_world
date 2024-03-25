import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Profile } from '../profile/models/profile';
import { ProfileService } from '../profile/services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'] // Corrigido de styleUrl para styleUrls
})
export class ChatComponent implements AfterViewChecked {
  loggedUserName: string | null = null;
  selectedUser: Profile | undefined;
  selectedUsername: string | null = null;
  private unsubscribe$ = new Subject<void>();

  usersProfiles: Profile[] = [];
  filteredUsersProfiles: Profile[] = [];
  newMessage: string = '';
  messages: any[] = [];

  searchTerm: string = '';
  showNoResults: boolean = false;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.selectedUsername = params['username'];
      if (this.usersProfiles.length > 0) {
        this.updateSelectedUser();
      }
    });

    this.authService.user$.subscribe(user => {
      this.loggedUserName = user ? user.username : null;
    });

    this.profileService.getUserProfiles().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (profiles: Profile[]) => {
        this.usersProfiles = profiles;
        this.filteredUsersProfiles = profiles;
        this.updateSelectedUser();
      },
      error => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }

  @ViewChild('scrollMe') private myScrollContainer: ElementRef | undefined;

  // Resto do seu código...

  ngAfterViewChecked(): void {
    this.scrollToBottom();
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

  updateSelectedUser(): void {
    this.selectedUser = this.usersProfiles.find(u => u.userName === this.selectedUsername);
  }

  selectUser(userProfile: Profile): void {
    this.selectedUser = userProfile;
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
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const message = {
      content: this.newMessage,
      timestamp: currentTime,
      outgoing: true
    };
    this.messages.push(message);
    this.newMessage = '';
    this.scrollToBottom();
  }
}
