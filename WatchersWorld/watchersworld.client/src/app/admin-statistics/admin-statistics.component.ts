import { Component } from '@angular/core';
import { AdminService } from '../admin/service/admin.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';


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
  totalComments: number | undefined;

  chartProfileTypes: any; 
  Highcharts: typeof Highcharts = Highcharts; // passar 'Highcharts' para o componente HTML
  chartBannedVsRegistered: any;
  chartStaticData: any;


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
          this.loadProfileTypes();
          this.loadBannedVsRegisteredData();
          this.setStaticDataPieChartOptions();


        },
        error: (error) => console.error("Error fetching user roles:", error)
      });
    } else {
      // Se não estiver logado ou se o nome do usuário não estiver disponível, redireciona
      this.router.navigate(['/']);
    }
  }


  loadProfileTypes(): void {
    this.fetchProfileCounts(() => {
      this.setProfileTypePieChartOptions();
    });
  }


  loadBannedVsRegisteredData(): void {
    // Executa em paralelo o carregamento dos usuários banidos e registrados
    this.fetchTotalBannedUsers();
    this.fetchTotalRegisteredUsers(() => {
      // Após carregar os dados, configuramos o gráfico
      this.setBannedVsRegisteredChartOptions();
    });
  }

  setBannedVsRegisteredChartOptions(): void {
    // Assegura-se de que os dados necessários estão carregados
    if (this.totalBannedUsers !== undefined && this.totalRegisteredUsers !== undefined) {
      this.chartBannedVsRegistered = {
        chart: {
          type: 'pie',
          options3d: {
            enabled: true,
            alpha: 45
          }
        },
        title: {
          text: 'Utilizadores Banidos vs Registrados'
        },
        plotOptions: {
          pie: {
            innerSize: 100,
            depth: 45
          }
        },
        series: [{
          name: 'Quantidade',
          data: [
            ['Utilizadores Banidos', this.totalBannedUsers],
            ['Utilizadores Registrados', this.totalRegisteredUsers]
          ]
        }]
      };
    }
  }
  setProfileTypePieChartOptions(): void {
    this.chartProfileTypes = {
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45
        }
      },
      title: {
        text: 'Distribuição de Perfis Privados e Públicos'
      },
      plotOptions: {
        pie: {
          innerSize: 100,
          depth: 45
        }
      },
      series: [{
        name: 'Quantidade',
        data: [
          ['Perfis Privados', this.totalPrivateProfiles],
          ['Perfis Públicos', this.totalPublicProfiles]
        ]
      }]
    };
  }

  setStaticDataPieChartOptions(): void {
    this.chartStaticData = {
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45
        }
      },
      title: {
        text: 'Distribuição de Conteúdo'
      },
      plotOptions: {
        pie: {
          innerSize: 100,
          depth: 45
        }
      },
      series: [{
        name: 'Quantidade',
        data: [
          ['Filmes', 1004099],
          ['Séries/TV Shows', 170368],
        ]
      }]
    };
  }
  private fetchTotalRegisteredUsers(callback?: () => void): void {
    this.adminService.getTotalRegisteredUsers().subscribe({
      next: (totalUsers) => {
        this.totalRegisteredUsers = totalUsers;
        if (callback) callback();
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
  private fetchProfileCounts(callback?: () => void): void {
    this.adminService.getTotalPrivateProfiles().subscribe({
      next: (total) => {
        this.totalPrivateProfiles = total;
        if (callback) callback();
      },
      error: (error) => console.error("Error fetching total private profiles:", error)
    });

    this.adminService.getTotalPublicProfiles().subscribe({
      next: (total) => {
        this.totalPublicProfiles = total;
        if (callback) callback();
      },
      error: (error) => console.error("Error fetching total public profiles:", error)
    });
  }
}
