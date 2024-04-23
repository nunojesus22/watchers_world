import { Component, OnDestroy } from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Profile } from '../profile/models/profile';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { AdminService } from '../admin/service/admin.service'
import { Router } from '@angular/router';


/**
 * Componente responsável pela gestão administrativa dos utilizadores na interface de administração.
 * Permite a realização de operações como banir utilizadores (temporariamente ou permanentemente),
 * deletar contas de utilizador, alterar papéis de utilizador (promover a moderador ou rebaixar a utilizador),
 * e desbanir utilizadores. Além disso, gere a visualização e filtragem dos perfis de utilizador.
 */
@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.css'
})


export class ModerationComponent implements OnDestroy {
  isBanPopupVisible = false;
  unsubscribed$: Subject<void> = new Subject<void>();
  usersProfiles: Profile[] = [];
  loggedUserName: string | null = null;
  selectedUserForBan: string | null = null;
  banDuration: number | undefined;
  isBanned?: boolean;
  isModerator?: boolean;

  filteredUsersProfiles: Profile[] = [];
  searchTerm: string = '';
  showNoResults: boolean = false;
  selectedUser: Profile | undefined;
  selectedUsername: string | null = null;

  page: number = 1;
  pageSize: number = 5;
  collectionSize!: number;


  constructor(private profileService: ProfileService, private authService: AuthenticationService, private adminService: AdminService, private router: Router) { }

  /**
   * Inicializa o componente, obtendo o nome do utilizador autenticado e carregando os perfis dos utilizadores.
   */
  ngOnInit(): void {
    this.loggedUserName = this.authService.getLoggedInUserName();
    if (this.loggedUserName) {
      this.authService.getUserRole(this.loggedUserName).subscribe({
        next: (roles) => {
          if (!roles.includes('Moderator')) {
            this.router.navigate(['/']);
            return;
          }
          this.getUserProfiles();

        },
        error: (error) => console.error("Error fetching user roles:", error)
      });
    } else {
      this.router.navigate(['/']);
    }


    this.collectionSize = this.filteredUsersProfiles.length;

    this.loggedUserName = this.authService.getLoggedInUserName();
    this.getUserProfiles();
    if (this.loggedUserName)
      this.profileService.getUserProfilesNotLoggedIn(this.loggedUserName).pipe(takeUntil(this.unsubscribed$)).subscribe(
        (profiles: Profile[]) => {
          this.usersProfiles = profiles;
          this.filteredUsersProfiles = profiles;
          this.collectionSize = profiles.length;
          this.updateSelectedUser();
          this.sortAlphabetically();
          this.filterUsers();
        },
        error => {
          console.error("Error while fetching users' profiles:", error);
        }
      );
  }

  /**
   * Limpa os recursos ao destruir o componente.
   */
  ngOnDestroy() {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  /**
   * Obtém e filtra os perfis dos utilizadores, excluindo o do utilizador autenticado e enriquecendo-os com informação de moderador.
   */
  getUserProfiles() {
    this.profileService.getUserProfiles().pipe(
      takeUntil(this.unsubscribed$),
      map(profiles => profiles.filter(profile => profile.userName !== this.loggedUserName)),
      mergeMap(profiles => {
        const filteredProfiles = profiles.filter(profile => profile.userName !== this.loggedUserName);
        const profilesWithRoles$ = filteredProfiles.map(profile => {
          return this.adminService.getUserRole(profile.userName).pipe(
            map(roles => ({
              ...profile,
              isBanned: this.checkIfUserIsBanned(profile),
              isModerator: roles.includes('Moderator'),
            })),
            catchError(error => {
              console.error('Error fetching roles:', profile.userName, error);
              return of({ ...profile, isModerator: false });
            })
          );
        });
        return forkJoin(profilesWithRoles$);
      })
    ).subscribe(
      (profiles) => {
        this.filteredUsersProfiles = profiles;
        this.collectionSize = profiles.length;
        this.sortAlphabetically();
        this.filterUsers();

      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }


  /**
   * Verifica se um utilizador está atualmente banido com base nas datas de início e fim do banimento.
   * 
   * @param profile O perfil do utilizador a verificar.
   * @returns Verdadeiro se o utilizador estiver banido, falso caso contrário.
   */
  checkIfUserIsBanned(profile: Profile): boolean {
    try {
      if (!profile.startBanDate || !profile.endBanDate) {
        return false;
      }

      const now = new Date();
      const startBan = new Date(profile.startBanDate);
      const endBan = new Date(profile.endBanDate);
      const isBanned = startBan <= now && now <= endBan;

      return isBanned;
    } catch (error) {
      console.error('Error in checkIfUserIsBanned:', error);
      return false;
    }
  }

  /**
   * Executa o banimento temporário de um utilizador.
   * 
   * @param username O nome do utilizador a ser banido temporariamente.
   */
  banTemp(username: string | null): void {
    if (confirm('Tem a certeza que pretende banir temporariamente este utilizador?')) {
      if (!username) {
        console.error('Username is undefined, cannot ban user temporarily.');
        return;
      }
      if (this.banDuration == null || this.banDuration <= 0) {
        console.error('Ban duration is not specified or is invalid.');
        return;
      }
      this.adminService.BanUserTemporarily(username, this.banDuration).subscribe({
        next: () => {
          const user = this.filteredUsersProfiles?.find(u => u.userName === username);
          this.banDuration = undefined;
          this.hideBanPopup();
          if (user) {
            user.isBanned = true;
            this.filteredUsersProfiles = [...this.filteredUsersProfiles!];
          }
        },
        error: error => {
          console.error("Error banning user temporarily:", error);
        }
      });
    }
  }

  /**
   * Executa o banimento permanente de um utilizador.
   * 
   * @param username O nome do utilizador a ser banido permanentemente.
   */
  banPerm(username: string | null): void {
    if (confirm('Tem a certeza que pretende banir permanentemente este utilizador?')) {
      if (!username) {
        console.error('Username is undefined, cannot ban user.');
        return;
      }
      console.log(`Attempting to ban user permanently: ${username}`);
      this.adminService.banUserPermanently(username).subscribe({
        next: () => {
          console.log('User banned permanently');
          const user = this.filteredUsersProfiles?.find(u => u.userName === username);
          this.hideBanPopup();
          if (user) {
            user.isBanned = true;
          }
          this.filteredUsersProfiles = [...this.filteredUsersProfiles!];
        },
        error: error => {
          console.error("Error banning user:", error);
        }
      });
    }
  }

  /**
   * Desbane um utilizador, permitindo-lhe aceder novamente ao sistema.
   * 
   * @param username O nome do utilizador a ser desbanido.
   */
  unban(username: string | undefined): void {
    if (confirm('Tem a certeza que pretende remover o ban do utilizador?')) {
      if (!username) {
        console.error('Username is undefined, cannot unban user.');
        return;
      }
      this.adminService.unbanUser(username).subscribe({
        next: (response) => {
          console.log(response.message);
          const user = this.filteredUsersProfiles?.find(u => u.userName === username);
          if (user) {
            user.isBanned = false;
          }
          this.filteredUsersProfiles = [...this.filteredUsersProfiles!];
        },
        error: (error) => {
          console.error("Error unbanning user:", error);
        }
      });
    }
  }

  /**
   * Atualiza o utilizador selecionado na interface de utilizador.
   */
  updateSelectedUser(): void {
    this.selectedUser = this.usersProfiles.find(u => u.userName === this.selectedUsername);
  }

  /**
   * Filtra a lista de utilizadores baseada no termo de pesquisa.
   */
  filterUsers(): void {
    let filtered = this.searchTerm ? this.usersProfiles.filter(user =>
      user.userName?.toLowerCase().includes(this.searchTerm.toLowerCase())) : this.usersProfiles;

    this.showNoResults = filtered.length === 0;
    this.collectionSize = filtered.length;

    filtered = filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    this.filteredUsersProfiles = filtered;
  }

  /**
   * Navega para a página anterior na lista paginada de utilizadores.
   * Este método decrementa o contador de página atual e filtra novamente os utilizadores
   * para refletir a mudança na paginação.
   */
  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.filterUsers();
    }
  }

  /**
   * Navega para a próxima página na lista paginada de utilizadores.
   * Este método incrementa o contador de página atual e filtra novamente os utilizadores
   * para refletir a mudança na paginação, incluindo a ordenação alfabética dos utilizadores
   * se necessário.
   */
  nextPage() {
    if (this.page * this.pageSize < this.collectionSize) {
      this.page++;
      this.filterUsers();
      this.sortAlphabetically();
    }
  }

  /**
  * Verifica se existe uma página anterior disponível para navegação.
  * 
  * @returns Verdadeiro se a página atual for maior que 1, indicando a existência de uma página anterior.
  */
  get hasPreviousPage(): boolean {
    return this.page > 1;
  }

  /**
   * Verifica se existe uma próxima página disponível para navegação.
   * 
   * @returns Verdadeiro se o produto da página atual pelo tamanho da página for menor que o tamanho total da coleção,
   * indicando a existência de uma próxima página.
   */
  get hasNextPage(): boolean {
    return this.page * this.pageSize < this.collectionSize;
  }

  /**
   * Implementa uma função de ordenação natural que compara dois perfis de utilizador.
   * 
   * @param a O primeiro perfil de utilizador para comparação.
   * @param b O segundo perfil de utilizador para comparação.
   * @returns Um número indicando a ordem dos perfis. Um valor negativo se a preceder b, positivo se b preceder a,
   * e zero se forem equivalentes na ordenação.
   */
  naturalSort(a: Profile, b: Profile): number {
    const ax: [number | typeof Infinity, string][] = [];
    const bx: [number | typeof Infinity, string][] = [];

    a.userName.replace(/(\d+)|(\D+)/g, function (_, $1, $2): string {
      ax.push([$1 ? Number($1) : Infinity, $2 || ""]);
      return "";
    });
    b.userName.replace(/(\d+)|(\D+)/g, function (_, $1, $2): string {
      bx.push([$1 ? Number($1) : Infinity, $2 || ""]);
      return "";
    });

    while (ax.length && bx.length) {
      const an = ax.shift()!;
      const bn = bx.shift()!;
      const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
      if (nn) return nn;
    }

    return ax.length - bx.length;
  }

  /**
   * Ordena alfabeticamente os perfis de utilizadores pela propriedade userName.
   * Este método utiliza uma ordenação natural para lidar com números dentro das strings,
   * garantindo uma ordenação intuitiva para os utilizadores.
   */
  sortAlphabetically(): void {
    this.usersProfiles.sort((a, b) => this.naturalSort(a, b));
    this.filterUsers();
  }

  /**
   * Exibe o popup de banimento para um utilizador selecionado.
   * 
   * @param username O nome do utilizador selecionado para banimento.
   */
  showBanPopup(username: string): void {
    this.selectedUserForBan = username;
    this.isBanPopupVisible = true;
  }

  /**
   * Esconde o popup de banimento e limpa a seleção de utilizador.
   */
  hideBanPopup(): void {
    this.isBanPopupVisible = false;
    this.selectedUserForBan = null;
  }

}
