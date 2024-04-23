import { Component } from '@angular/core';
import { Profile } from '../profile/models/profile';
import { Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { ProfileService } from '../profile/services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrl: './search-users.component.scss'
})
export class SearchUsersComponent {
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
  constructor(private profileService: ProfileService, private authService: AuthenticationService, private router: Router) { }
  ngOnInit(): void {
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

  updateSelectedUser(): void {
    this.selectedUser = this.usersProfiles.find(u => u.userName === this.selectedUsername);
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

}
