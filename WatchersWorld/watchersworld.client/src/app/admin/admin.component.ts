import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Profile } from '../profile/models/profile';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { AdminService } from '../admin/service/admin.service'


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})


export class AdminComponent implements OnDestroy {
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
  pageSize: number = 5; // Quantidade de usuários por página
  collectionSize!: number; // O total de usuários disponíveis


  constructor(private profileService: ProfileService, private authService: AuthenticationService, private adminService: AdminService) { }


  ngOnInit(): void {
    this.loggedUserName = this.authService.getLoggedInUserName();
    // Fetch user profiles
    this.getUserProfiles();

    this.profileService.getUserProfiles().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (profiles: Profile[]) => {
        console.log("Perfis recebidos:", profiles);

        this.usersProfiles = profiles;
        this.filteredUsersProfiles = profiles;
        this.updateSelectedUser();
      },
      error => {
        console.error("Error while fetching users' profiles:", error);
      }
    );

    if (this.usersProfiles.length > 0) {
      this.updateSelectedUser();
    }

    this.collectionSize = this.filteredUsersProfiles.length;

  }

  ngOnDestroy() {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();

  }



  getUserProfiles() {
    this.profileService.getUserProfiles().pipe(
      takeUntil(this.unsubscribed$),
      mergeMap(profiles => {
        // Filtra fora o perfil do usuário logado
        const filteredProfiles = profiles.filter(profile => profile.userName !== this.loggedUserName);

        // Mapeia os perfis filtrados para chamadas de Observable do getUserRole
        return forkJoin(filteredProfiles.map(profile => {
          // Verifique se o nome de usuário está definido para evitar erros
          if (!profile.userName) {
            console.warn(`Perfil sem nome de usuário encontrado:`, profile);
            return of({ ...profile, isModerator: false });
          }

          // Chama getUserRole e mapeia os resultados para cada perfil
          return this.adminService.getUserRole(profile.userName).pipe(
            map(roles => {
              console.log(`Roles for ${profile.userName}:`, roles);
              // Retorna o perfil com a propriedade adicional isModerator
              return {
                ...profile,
                isBanned: this.checkIfUserIsBanned(profile),
                isModerator: roles.includes('Moderator')
              };
            }),
            catchError(error => {
              console.error('Error fetching roles for user:', profile.userName, error);
              return of({ ...profile, isModerator: false }); // Retorna isModerator como false em caso de erro
            })
          );
        }));
      })
    ).subscribe(
      (profiles) => {
        // Os perfis aqui são os perfis completos com as informações de isModerator
        console.log("Perfis com informação de moderador:", profiles);

        // Atualiza o estado do componente com os novos perfis
        this.filteredUsersProfiles = profiles;
        this.collectionSize = profiles.length;

        // Classifica e filtra os perfis atualizados
        this.sortAlphabetically();
        this.filterUsers();
      },
      (error) => {
        console.error("Erro ao buscar perfis de usuários:", error);
      }
    );
  }




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




  banTemp(username: string | null): void {
    if (!username) {
      console.error('Username is undefined, cannot ban user temporarily.');
      return;
    }
    if (this.banDuration == null || this.banDuration <= 0) {
      console.error('Ban duration is not specified or is invalid.');
      return;
    }
    console.log(`Attempting to ban user temporarily: ${username} for ${this.banDuration} days`);

    this.adminService.BanUserTemporarily(username, this.banDuration).subscribe({
      next: () => {
        console.log(`User banned temporarily for ${this.banDuration} days`);
        const user = this.filteredUsersProfiles?.find(u => u.userName === username);
        this.hideBanPopup();
        if (user) {
          user.isBanned = true;
          // This will trigger change detection and update the UI
          this.filteredUsersProfiles = [...this.filteredUsersProfiles!];
        }
      },
      error: error => {
        console.error("Error banning user temporarily:", error);
      }
    });
  }




  banPerm(username: string | null): void {
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
        // This will trigger change detection and update the UI
        this.filteredUsersProfiles = [...this.filteredUsersProfiles!];
      },
      error: error => {
        console.error("Error banning user:", error);
      }
    });
  }





  deleteAccount(username: string | undefined): void {
    if (!username) {
      console.error('Username is undefined, cannot delete account.');
      return;
    }
    console.log(`Attempting to delete user: ${username}`);
    this.adminService.deleteUserByUsername(username).subscribe({
      next: () => {
        this.filteredUsersProfiles = this.filteredUsersProfiles?.filter(user => user.userName !== username);
        console.log('User deleted successfully');
      },
      error: error => {
        console.error("Error deleting user:", error);
      }
    });
  }


  makeModerator(userName: string): void {
    if (!userName) {
      console.error('Username is undefined, cannot change role.');
      return;
    }
    console.log(`Changing role of user: ${userName} to Moderator`);
    this.adminService.changeRoleToModerator(userName).subscribe({
      next: response => {
        console.log('User role updated to Moderator successfully:', response);
        // Verify the role change
        this.verifyUserRole(userName);
        const user = this.filteredUsersProfiles?.find(u => u.userName === userName);
        if (user) {
          user.isModerator = true;
        }
      },
      error: error => {
        console.error("Error changing user role:", error);
      }
    });
  }

  private verifyUserRole(userName: string): void {
    this.adminService.getUserRole(userName).subscribe({
      next: roles => {
        const isModerator = roles.includes('Moderator');
        console.log(`Is user a moderator: ${isModerator}`);
      },
      error: error => {
        console.error('Error fetching roles:', error);
      }
    });
  }

  demoteToUser(userName: string): void {
    if (!userName) {
      console.error('Username is undefined, cannot change role.');
      return;
    }
    console.log(`Changing role of user: ${userName} to User`);
    this.adminService.changeRoleToUser(userName).subscribe({
      next: response => {
        console.log('Moderator role updated to User successfully:', response);
        // Verify the role change
        this.verifyUserRole(userName);
        const user = this.filteredUsersProfiles?.find(u => u.userName === userName);
        if (user) {
          user.isModerator = false;
        }
      },
      error: error => {
        console.error("Error changing user role:", error);
      }
    });
  }


  unban(username: string | undefined): void {
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
        // This will trigger change detection and update the UI
        this.filteredUsersProfiles = [...this.filteredUsersProfiles!];
      },
      error: (error) => {
        console.error("Error unbanning user:", error);
      }
    });
  }

  updateSelectedUser(): void {
    this.selectedUser = this.usersProfiles.find(u => u.userName === this.selectedUsername);
  }

  filterUsers(): void {
    let filtered = this.searchTerm ? this.usersProfiles.filter(user =>
      user.userName?.toLowerCase().includes(this.searchTerm.toLowerCase())) : this.usersProfiles;

    this.showNoResults = filtered.length === 0;
    this.collectionSize = filtered.length;

    // Aplica a paginação
    filtered = filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    this.filteredUsersProfiles = filtered;
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.filterUsers();
    }
  }

  nextPage() {
    if (this.page * this.pageSize < this.collectionSize) {
      this.page++;
      this.filterUsers();
      this.sortAlphabetically();
    }
  }

  get hasPreviousPage(): boolean {
    return this.page > 1;
  }

  get hasNextPage(): boolean {
    return this.page * this.pageSize < this.collectionSize;
  }

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

  sortAlphabetically(): void {
    this.usersProfiles.sort((a, b) => this.naturalSort(a, b));
    this.filterUsers(); // Reaplica a filtragem e paginação após a ordenação
  }

  showBanPopup(username: string): void {
    this.selectedUserForBan = username;
    this.isBanPopupVisible = true; // This should show the popup
  }

  hideBanPopup(): void {
    this.isBanPopupVisible = false;
    this.selectedUserForBan = null; // Clear the selected user
  }

}
