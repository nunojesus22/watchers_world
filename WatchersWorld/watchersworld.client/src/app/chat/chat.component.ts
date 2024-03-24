import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Profile } from '../profile/models/profile';
import { ProfileService } from '../profile/services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  loggedUserName: string | null = null;
  selectedUser: Profile | undefined;
  selectedUsername: string | null = null;
  private unsubscribed$ = new Subject<void>();

  usersProfiles: Profile[] = [];
  newMessage: string = '';
  messages: any[] = [];


  constructor(private profileService: ProfileService, private route: ActivatedRoute,
    private router: Router, public authService: AuthenticationService) { }

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

    this.profileService.getUserProfiles().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (profiles: Profile[]) => {
        this.usersProfiles = profiles;
        // Atualize o usuário selecionado se a rota já tiver um nome de usuário
        this.updateSelectedUser();
      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }

  sendMessage(): void {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Obtém a hora atual
    const message = {
      content: this.newMessage,
      timestamp: currentTime,
      outgoing: true // Assumindo que é uma mensagem enviada e não recebida
    };
    this.messages.push(message); // Adiciona a nova mensagem à lista
    this.newMessage = ''; // Limpa o campo de nova mensagem
  }

  updateSelectedUser(): void {
    if (this.selectedUsername) {
      this.selectedUser = this.usersProfiles.find(u => u.userName === this.selectedUsername);
    } else {
      this.selectedUser = undefined;
    }
  }

  selectUser(userProfile: Profile): void {
    this.selectedUser = userProfile;
    this.router.navigate([`/chat/${userProfile.userName}`]);
  }

}

