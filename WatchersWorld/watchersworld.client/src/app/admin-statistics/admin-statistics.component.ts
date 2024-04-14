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


/**
 * AdminStatisticsComponent Classe
 */
export class AdminStatisticsComponent {

  totalRegisteredUsers: number | undefined;
  totalBannedUsers: number | undefined;
  totalPrivateProfiles: number | undefined;
  totalPublicProfiles: number | undefined;
  totalComments: number | undefined;

  chartProfileTypes: any; 
  Highcharts: typeof Highcharts = Highcharts; 
  chartBannedVsRegistered: any;
  chartStaticData: any;


/**
 * Construtor da classe AdminStatisticsComponent.
 * 
 * @param adminService O serviço responsável por operações administrativas.
 * @param authService O serviço de autenticação do utilizador.
 * @param router O serviço de roteamento para navegação entre páginas.
 */
  constructor(
    private adminService: AdminService,
    private authService: AuthenticationService,
    private router: Router 
) { }
  ngOnInit(): void {
    const currentUser = this.authService.getLoggedInUserName();
    if (currentUser) {
      // Obtem as roles do utilizador atual
      this.authService.getUserRole(currentUser).subscribe({
        next: (roles) => {
          // Verifica se o utilizador tem a role de admin
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
      // Se não estiver logado ou se o nome do utilizador não estiver disponível, redireciona
      this.router.navigate(['/']);
    }
  }

/**
 * Carrega os tipos de perfil (público/privado) e define as opções do gráfico de pizza correspondente.
 */
  loadProfileTypes(): void {
    this.fetchProfileCounts(() => {
      this.setProfileTypePieChartOptions();
    });
  }

/**
 * Carrega os dados de utilizadors banidos versus utilizadors registrados e define as opções do gráfico correspondente.
 */
  loadBannedVsRegisteredData(): void {
    // Executa em paralelo o carregamento dos utilizadors banidos e registrados
    this.fetchTotalBannedUsers();
    this.fetchTotalRegisteredUsers(() => {
      this.setBannedVsRegisteredChartOptions();
    });
  }

  /**
 * Define as opções do gráfico de pizza para exibir a comparação entre utilizadors banidos e registrados.
 * 
 * Certifica-se de que os dados necessários estão carregados antes de configurar o gráfico.
 * 
 * @remarks
 * Se os dados de utilizadors banidos e registrados estiverem disponíveis, configura as opções do gráfico.
 * 
 * @returns void
 */
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

  /**
 * Define as opções do gráfico de pizza para exibir a distribuição de perfis privados e públicos.
 * 
 * @returns void
 */
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

  /**
 * Define as opções do gráfico de pizza para exibir a distribuição de conteúdo estático, como filmes e séries.
 * 
 * @returns void
 */
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

  /**
 * Busca o total de utilizadors registrados e chama a função de retorno, se fornecida.
 * @param callback Uma função de retorno opcional para chamar após a conclusão da busca.
 */
  private fetchTotalRegisteredUsers(callback?: () => void): void {
    this.adminService.getTotalRegisteredUsers().subscribe({
      next: (totalUsers) => {
        this.totalRegisteredUsers = totalUsers;
        if (callback) callback();
      },
      error: (error) => console.error("Error fetching total registered users:", error)
    });
  }




/**
 * Busca o total de utilizadors banidos.
 */
  private fetchTotalBannedUsers(): void {
    this.adminService.getTotalBannedUsers().subscribe({
      next: (total) => {
        this.totalBannedUsers = total;
      },
      error: (error) => console.error("Error fetching total banned users:", error)
    });
  }

  /**
 * Busca o total de comentários.
 */
  private fetchTotalComments(): void {
    this.adminService.getTotalComments().subscribe({
      next: (total) => {
        this.totalComments = total;
      },
      error: (error) => console.error("Error fetching total comments :", error)
    });
  }

  /**
 * Busca o total de perfis privados e chama a função de retorno, se fornecida.
 * Em seguida, busca o total de perfis públicos e chama a função de retorno novamente.
 * @param callback Uma função de retorno opcional para chamar após a conclusão da busca de perfis privados e públicos.
 */
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
