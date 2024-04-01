import { Component } from '@angular/core';
import { AdminService } from '../admin/service/admin.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-statistics',
  templateUrl: './admin-statistics.component.html',
  styleUrl: './admin-statistics.component.css'
})
export class AdminStatisticsComponent {

  totalRegisteredUsers: number | undefined;
  totalBannedUsers: number | undefined;
  totalPrivateProfiles: number | undefined;
  totalPublicProfiles: number | undefined;
  totalComments:number | undefined;
  constructor(
    private adminService: AdminService,
    private authService: AuthenticationService,
    private router: Router 
) { }
  ngOnInit(): void {
    const currentUser = this.authService.getLoggedInUserName();
    if (currentUser) {
      // Obtem as roles do usuário atual
      this.authService.getUserRole(currentUser).subscribe({
        next: (roles) => {
          // Verifica se o usuário tem a role de admin
          if (!roles.includes('Admin')) {
            this.router.navigate(['/']); // Redireciona para a página inicial se não for admin
            return;
          }
          // Se for admin, executa as funções de busca
          this.fetchTotalRegisteredUsers();
          this.fetchTotalBannedUsers();
          this.fetchProfileCounts();
          this.fetchTotalComments();
        },
        error: (error) => console.error("Error fetching user roles:", error)
      });
    } else {
      // Se não estiver logado ou se o nome do usuário não estiver disponível, redireciona
      this.router.navigate(['/']);
    }
  }


  private fetchTotalRegisteredUsers(): void {
    this.adminService.getTotalRegisteredUsers().subscribe({
      next: (totalUsers) => {
        this.totalRegisteredUsers = totalUsers;
      },
      error: (error) => console.error("Error fetching total registered users:", error)
    });
  }

  private fetchTotalBannedUsers(): void {
    this.adminService.getTotalBannedUsers().subscribe({
      next: (total) => {
        this.totalBannedUsers = total;
      },
      error: (error) => console.error("Error fetching total banned users:", error)
    });
  }
  private fetchTotalComments(): void {
    this.adminService.getTotalComments().subscribe({
      next: (total) => {
        this.totalComments = total;
      },
      error: (error) => console.error("Error fetching total comments :", error)
    });
  }
  private fetchProfileCounts(): void {
    this.adminService.getTotalPrivateProfiles().subscribe({
      next: (total) => {
        this.totalPrivateProfiles = total;
      },
      error: (error) => console.error("Error fetching total private profiles:", error)
    });

    this.adminService.getTotalPublicProfiles().subscribe({
      next: (total) => {
        this.totalPublicProfiles = total;
      },
      error: (error) => console.error("Error fetching total public profiles:", error)
    });
  }
}
