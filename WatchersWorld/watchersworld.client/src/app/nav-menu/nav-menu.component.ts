import { Component, ElementRef, HostListener } from '@angular/core';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { Router } from '@angular/router';
import { SearchServiceComponent } from '../media/search-service/search-service.component';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';
import { ProfileService } from '../profile/services/profile.service';
import { Subject, takeUntil } from 'rxjs';
import { FollowerProfile } from '../profile/models/follower-profile';
import { NotificationService } from '../notifications/services/notification.service';

/**
 * Este componente representa o menu de navegação da aplicação, oferecendo funcionalidades
 * como a gestão da autenticação do utilizador, navegação baseada em papel de utilizador, 
 * pesquisa de media e visualização de notificações e solicitações de seguimento pendentes.
 */
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {
  loggedUserName: string | null = null;
  isActive: boolean = false;
  searchQuery: any;
  unsubscribed$: Subject<void> = new Subject<void>();
  pendingFollowRequests: FollowerProfile[] = [];
  hasUnreadNotifications: boolean = false;
  showMenu = false;

  constructor(private profileService: ProfileService, private notificationService: NotificationService, public authService: AuthenticationService, private _eref: ElementRef, public router: Router) {}

  /**
   * Inicializa as propriedades e verifica o estado de autenticação do utilizador.
   * Carrega as solicitações de seguimento pendentes e verifica a existência de notificações não lidas.
   */
  ngOnInit(): void {
    this.loggedUserName = this.authService.getLoggedInUserName();
    this.getPendingFollowRequests();
    this.checkForUnreadNotifications();
  }

  /**
   * Carrega as solicitações de seguimento pendentes do utilizador autenticado.
   * Atualiza a lista de solicitações pendentes no menu de navegação.
   */
  getPendingFollowRequests() {
    if (this.loggedUserName) {
      this.profileService.getPendingFollowRequests(this.loggedUserName)
        .pipe(takeUntil(this.unsubscribed$))
        .subscribe({
          next: (profiles: FollowerProfile[]) => {
            this.pendingFollowRequests = profiles;
          },
          error: (error) => {
            console.error('Error fetching pending follow requests:', error);
          }
        });
    }
  }

  /**
   * Verifica se existem notificações não lidas para o utilizador autenticado.
   * Atualiza o indicador de notificações não lidas no menu de navegação.
   */
  checkForUnreadNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.hasUnreadNotifications(this.loggedUserName)
        .subscribe({
          next: (response) => {
            console.log(response);
           this.hasUnreadNotifications = response.hasUnread;
          },
          error: (err) => {
          }
        });
    }
  }

  
  /**
   * Gerencia a exibição do menu de navegação lateral baseando-se na interação do utilizador.
   * Fecha o menu lateral quando um clique é registrado fora do menu.
   * 
   * @param event O evento de clique documentado.
   */
  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.showMenu = false;
      let sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.style.width = "0";
      }
    }
  }

  /**
   * Alterna a visibilidade do menu de navegação lateral.
   * 
   * @param event O evento de clique que desencadeou a alteração.
   */
  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
    let sidebar = document.getElementById("sidebar");
    if (sidebar) {
      if (this.showMenu) {
        sidebar.style.width = "250px";
      } else {
        sidebar.style.width = "0";
      }
    }
  }

  /**
   * Fecha o menu de navegação lateral.
   */
  closeNav() {
    this.showMenu = false;
    let sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.style.width = "0";
    }
  }

  /**
   * Submete uma consulta de pesquisa e navega para a página de resultados da pesquisa.
   */
  onSubmit() {
    if (this.searchQuery) {
      // Isso garante que a pesquisa é comunicada através de parâmetros de consulta
      this.router.navigate(['/search'], { queryParams: { title: this.searchQuery } });
    }
  }

  /**
   * Lida com o evento de tecla levantada no campo de pesquisa.
   */
  onKeyup() {
    console.log('one key up',this.searchQuery);
  }

  /**
   * Navega para diferentes partes da aplicação com base no papel do utilizador autenticado.
   * 
   * @param username O nome de utilizador do utilizador autenticado.
   */
  navigateBasedOnRole(username: string) {
    this.authService.getUserRole(username).subscribe((roles: string[]) => {
      if (roles.includes('Admin')) {
        this.router.navigate(['/admin']);
        this.isActive = true;
      } else if (roles.includes('User') || roles.includes('Moderator')) {
        this.router.navigate(['/profile', username]);
        this.isActive = true;
      } else {
        // Handle case for users without Admin or User roles or redirect to a default route
        this.router.navigate(['/home']);
      }
    }, error => {
      console.error('Error fetching user role', error);
      this.router.navigate(['/home']); // Fallback in case of an error
    });
    this.closeNav();
  }

  /**
   * Realiza o logout do utilizador e redireciona para a página de login.
   */
  logout() {
    this.authService.logout();
  }
}


