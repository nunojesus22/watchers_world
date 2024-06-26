import { Component, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { UserMedia } from '../profile/models/user-media';
import { forkJoin, map } from 'rxjs';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';
import * as Highcharts from 'highcharts';



@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})

/**
 * StatisticsComponent class
 */
export class StatisticsComponent implements OnInit {
  followersCount: number | undefined;
  followingCount: number | undefined;
  watchedMoviesCount: number = 0;
  watchLaterMoviesCount: number = 0;
  watchedSeriesCount: number = 0;
  watchLaterSeriesCount: number = 0;
  currentUser: any;
  totalCommentsCount: number | undefined;
  totalLikesReceivedCount: number | undefined;
  totalQuizAttempts: number | undefined;
  totalFavoriteActors: number | undefined;
  totalRatigns: number | undefined;

  totalWatchedHours: number = 0;

  totalWatchedTimeFormatted: any;

  totalWatchedSeriesTimeFormatted: any;

  totalWatchedEpisodes: number = 0;

  totalMedals: number = 0;
  commentsCountByDate: any[] = [];
  mediaAddedByDate: any[] = [];
    mediaSerieByDate : any[] =[];

  Highcharts: typeof Highcharts = Highcharts; // passar 'Highcharts' para o componente HTML
  chartOptions: any; // as opções do gráfico
  chartMovieAdded: any;

  chartSerieAdded: any;
  chartQuizAndRatings: any; // opções para o gráfico circular

  chartFollowers: any;
  chartComparisonMedia: any; 

  constructor(
    private profileService: ProfileService,
    private authService: AuthenticationService,
    private apiService: MovieApiServiceComponent,

  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getLoggedInUserName();
    if (this.currentUser) {
      this.fetchStatistics(this.currentUser);
      this.fetchMediaCounts(this.currentUser);
      this.fetchTotalComments(this.currentUser);
      this.fetchTotalLikes(this.currentUser);
      this.fetchTotalQuizAttempts(this.currentUser);
      this.loadTotalFavoriteActors();
      this.loadTotalRatings();
      this.calculateTotalWatchedTime();
      this.calculateTotalWatchedSeriesTime();
      this.calculateTotalWatchedEpisodes();
      this.fetchTotalMedals(this.currentUser);
      this.loadCommentsCountByDate();
      this.loadMediaAddedByDate();
      this.loadSerieAddedByDate();
      this.loadPieChartData();
      this.loadFollowersData();
      this.loadMoviesVsSeriesData();
    }
  }

  loadMoviesVsSeriesData(): void {
    forkJoin({
      watchedMedia: this.profileService.getUserWatchedMedia(this.currentUser),
      watchLaterMedia: this.profileService.getUserWatchLaterMedia(this.currentUser)
    }).subscribe({
      next: (results) => {
        this.watchedMoviesCount = results.watchedMedia.filter(m => m.type === 'movie').length;
        this.watchedSeriesCount = results.watchedMedia.filter(m => m.type === 'serie').length;
        this.watchLaterMoviesCount = results.watchLaterMedia.filter(m => m.type === 'movie').length;
        this.watchLaterSeriesCount = results.watchLaterMedia.filter(m => m.type === 'serie').length;
        this.setWatchedComparisonChartOptions();
      },
      error: (error) => console.error("Error fetching media counts:", error)
    });
  }


  /**
 * Configura as opções do gráfico de comparação entre filmes e séries assistidas.
 */
  setWatchedComparisonChartOptions(): void {
    this.chartComparisonMedia = {
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45
        }
      },
      subtitle: {
        text: 'Numero de Filmes Vistos Vs Series Vistas  '
      },
      title: {
        text: 'Comparação de Filmes e Séries Assistidas'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          innerSize: 100,
          depth: 45
        }
      },
      series: [{
        name: 'Assistidos',
        colorByPoint: true,
        data: [{
          name: 'Filmes',
          y: this.watchedMoviesCount,
          sliced: true,
          selected: true
        }, {
          name: 'Séries',
          y: this.watchedSeriesCount
        }]
      }]
    };
  }


  /**
   * Carrega seguidores
   */
  loadFollowersData(): void {
    this.profileService.getUserData(this.currentUser).subscribe({
      next: (profileData) => {
        this.followersCount = profileData.followers;
        this.followingCount = profileData.following;
        this.setFollowersPieChartOptions();
      },
      error: (error) => console.error("Error fetching followers data:", error)
    });
  }

  /**
   * PieChart Followers
   */
  setFollowersPieChartOptions(): void {
    // Verificamos se já temos os dados antes de configurar o gráfico
    if (this.followersCount !== undefined && this.followingCount !== undefined) {
      this.chartFollowers = {
        chart: {
          type: 'pie',
          options3d: {
            enabled: true,
            alpha: 45
          }
        },
        title: {
          text: 'Seguidores e Seguindo'
        },
        subtitle: {
          text: 'Visão geral da parte social'
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
            ['Seguidores', this.followersCount],
            ['Seguindo', this.followingCount]
          ]
        }]
      };
    }
  }

  /**
   * Carrega o PieChart
   */
  loadPieChartData(): void {
    forkJoin({
      quizAttempts: this.profileService.getTotalQuizAttempts(this.currentUser),
      favoriteActors: this.profileService.getTotalFavoriteActors(),
      ratings: this.profileService.getTotalRatingsByUser(),
    }).subscribe({
      next: results => {
        this.totalQuizAttempts = results.quizAttempts;
        this.totalFavoriteActors = results.favoriteActors;
        this.totalRatigns = results.ratings;
        this.setPieChartOptions();
      },
      error: error => {
        // Trate os erros aqui
      }
    });
  }

  /**
   * Define o Pie Chart
   */
  setPieChartOptions(): void {
    this.chartQuizAndRatings = {
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45
        }
      },
      title: {
        text: 'Quizzes e Ratings'
      },
      subtitle: {
        text: 'Distribuição de quizzes e ratings'
      },
      plotOptions: {
        pie: {
          innerSize: 100,
          depth: 45
        }
      },
      series: [{
        name: 'Total',
        data: [
          ['Quizzes Realizados', this.totalQuizAttempts],
          ['Atores Favoritos', this.totalFavoriteActors],
          ['Ratings Feitos', this.totalRatigns]
        ]
      }]
    };
  }


  /**
   * Carrega os comentarios pela data
   */
  loadCommentsCountByDate(): void {
    this.apiService.commentsDate(this.currentUser).subscribe(data => {
      this.commentsCountByDate = data;
      this.setChartOptions();
    });
  }

  /**
   * Carrega os Media pela data
   */
  loadMediaAddedByDate(): void {
    this.apiService.getMovieAddedByDate(this.currentUser).subscribe(data => {
      this.mediaAddedByDate = data;
      this.setMediaAddedChartOptions();
    });
  }

   /**
   * Carrega os Series pela data
   */
  loadSerieAddedByDate(): void {
    this.apiService.getSeriesAddedByDate(this.currentUser).subscribe(data => {
      this.mediaSerieByDate = data;
      this.setSerieAddedChartOptions();
    });
  }

     /**
   * Carrega os Media Pie Chart
   */
  setMediaAddedChartOptions(): void {
    this.chartMovieAdded = {
      chart: {
        type: 'column' 
      },
      title: {
        text: 'Filmes Vistos por Data'
      },
      xAxis: {
        categories: this.mediaAddedByDate.map(item => item.date.split('T')[0]),
        title: {
          text: 'Data'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total de Filmes'
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        pointFormat: 'Filmes: <b>{point.y}</b>'
      },
      series: [{
        name: 'Total de Comentários',
        data: this.mediaAddedByDate.map(item => item.count),
        dataLabels: {
          enabled: true,
          inside: false,
          rotation: 0,
          color: '#000000',
          align: 'center',
          format: '{point.y}', // sem decimais
          y: 0, // alinhado com o topo da barra
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      }]
    };
  }


  /**
   * Carrega os Serie Pie Chart
   */
  setSerieAddedChartOptions(): void {
    this.chartSerieAdded = {
      chart: {
        type: 'column' // 'column' para gráfico de colunas verticais, 'bar' para barras horizontais
      },
      title: {
        text: 'Séries Vistas por Data'
      },
      xAxis: {
        categories: this.mediaSerieByDate.map(item => item.date.split('T')[0]),
        title: {
          text: 'Data'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total de Séries'
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        pointFormat: 'Filmes: <b>{point.y}</b>'
      },
      series: [{
        name: 'Total de Comentários',
        data: this.mediaSerieByDate.map(item => item.count),
        dataLabels: {
          enabled: true,
          inside: false,
          rotation: 0,
          color: '#000000',
          align: 'center',
          format: '{point.y}', // sem decimais
          y: 0, // alinhado com o topo da barra
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      }]
    };
  }

  
  /**
   * Carrega os Comentarios Pie Chart
   */
  setChartOptions(): void {
    this.chartOptions = {
      chart: {
        type: 'column' // 'column' para gráfico de colunas verticais, 'bar' para barras horizontais
      },
      title: {
        text: 'Comentários feito por Data'
      },
      xAxis: {
        categories: this.commentsCountByDate.map(item => item.date.split('T')[0]),
        title: {
          text: 'Data'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total de Comentários'
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        pointFormat: 'Comentários: <b>{point.y}</b>'
      },
      series: [{
        name: 'Total de Comentários',
        data: this.commentsCountByDate.map(item => item.count),
        dataLabels: {
          enabled: true,
          inside: false,
          rotation: 0,
          color: '#000000',
          align: 'center',
          format: '{point.y}', // sem decimais
          y: 0, // alinhado com o topo da barra
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      }]
    };
  }






/**
 * Calcula o tempo total assistido pelo utilizador e formata em meses, dias e horas.
 */
  calculateTotalWatchedTime(): void {
    this.profileService.getUserWatchedMedia(this.currentUser).subscribe(watchedMedia => {
      // Filter only movies from the watchedMedia list
      const watchedMovies = watchedMedia.filter(media => media.type === 'movie');

      // Extract the movie IDs from the filtered list
      const movieIds = watchedMovies.map(movie => movie.mediaId);

      const detailsObservables = movieIds.map(id => this.apiService.getMovieDetails(id));

      forkJoin(detailsObservables).pipe(
        map(detailsArray => detailsArray.reduce((total, current) => total + current.runtime, 0)), // Sum up runtimes of movies only
      ).subscribe(totalMinutes => {
        // Convert total minutes into days, hours, and months
        const hours = Math.floor(totalMinutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30); // Approximation assuming 30 days per month

        const remainingDays = days % 30;
        const remainingHours = hours % 24;

        this.totalWatchedTimeFormatted = `${months} meses, ${remainingDays} dias, ${remainingHours} horas`;
      });
    });
  }

  /**
 * Calcula o tempo total assistido de séries pelo utilizador e formata em meses, dias e horas.
 */
  calculateTotalWatchedSeriesTime(): void {
    this.profileService.getUserWatchedMedia(this.currentUser).subscribe(watchedMedia => {
      // Filter only series from the watchedMedia list
      const watchedSeries = watchedMedia.filter(media => media.type === 'serie');
      // Extract the series IDs from the filtered list
      const seriesIds = watchedSeries.map(serie => serie.mediaId);
      const detailsObservables = seriesIds.map(id => this.apiService.getSerieDetails(id));
      forkJoin(detailsObservables).pipe(
        map(detailsArray => detailsArray.reduce((total, current) => {
          // Check for undefined or null values and default to 0 if necessary
          const episodesWatched = current.number_of_episodes || 0;
          const episodeRunTime = (current.episode_run_time && current.episode_run_time[0]) || 0; // Use the first element or default to 0
          return total + (episodesWatched * episodeRunTime);
        }, 0)),
      ).subscribe(totalMinutes => {
        // Convert total minutes into hours, then days, and months
        const hours = Math.floor(totalMinutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30); // Approximation assuming 30 days per month
        const remainingDays = days % 30;
        const remainingHours = hours % 24;
        this.totalWatchedSeriesTimeFormatted = `${months} meses, ${remainingDays} dias, ${remainingHours} horas`;
      });
    });
  }

/**
 * Calcula o número total de episódios assistidos pelo utilizador.
 */
  calculateTotalWatchedEpisodes(): void {
    this.profileService.getUserWatchedMedia(this.currentUser).subscribe(watchedMedia => {
      // Filtra apenas as séries da lista de mídias assistidas
      const watchedSeries = watchedMedia.filter(media => media.type === 'serie');

      // Extrai os IDs das séries da lista filtrada
      const seriesIds = watchedSeries.map(serie => serie.mediaId);

      const detailsObservables = seriesIds.map(id => this.apiService.getSerieDetails(id));

      forkJoin(detailsObservables).pipe(
        map(detailsArray => detailsArray.reduce((total, current) => {
          // Adiciona o número total de episódios assistidos para cada série
          // Assumindo que current.number_of_episodes representa o número total de episódios para a série
          return total + current.number_of_episodes;
        }, 0)),
      ).subscribe(totalEpisodes => {
        console.log(`Número Total de Episódios Assistidos: ${totalEpisodes}`);
        // Aqui você pode definir uma propriedade para armazenar o total de episódios e exibir no template
        this.totalWatchedEpisodes = totalEpisodes;
      });
    });
  }

/**
 * Busca as estatísticas do utilizador, como número de seguidores e seguindo.
 * @param username O nome de utilizador do perfil para buscar estatísticas.
 */
  private fetchStatistics(username: string): void {
    this.profileService.getUserData(username).subscribe({
      next: (profileData) => {
        this.followersCount = profileData.followers;
        this.followingCount = profileData.following;
      },
      error: (error) => console.error("Error fetching user statistics:", error)
    });
  }

  /**
 * Busca o número total de filmes e séries assistidos e para assistir mais tarde pelo utilizador.
 * @param username O nome de utilizador do perfil para buscar mídias assistidas.
 */
  private fetchMediaCounts(username: string): void {
    // Fetch watched movies and series
    this.profileService.getUserWatchedMedia(username).subscribe({
      next: (media: UserMedia[]) => {
        this.watchedMoviesCount = media.filter(m => m.type === 'movie').length;
        this.watchedSeriesCount = media.filter(m => m.type === 'serie').length;
      },
      error: (error) => console.error("Error fetching watched media:", error)
    });

    // Fetch movies and series to watch later
    this.profileService.getUserWatchLaterMedia(username).subscribe({
      next: (media: UserMedia[]) => {
        this.watchLaterMoviesCount = media.filter(m => m.type === 'movie').length;
        this.watchLaterSeriesCount = media.filter(m => m.type === 'serie').length;
      },
      error: (error) => console.error("Error fetching watch later media:", error)
    });
  }

  /**
 * Busca o número total de comentários feitos pelo utilizador.
 * @param username O nome de utilizador do perfil para buscar o número total de comentários.
 */
  private fetchTotalComments(username: string): void {
    // Chamadas existentes para buscar followers, following, etc.
    this.profileService.getUserTotalComments(username).subscribe({
      next: (count) => {
        this.totalCommentsCount = count;
      },
      error: (error) => console.error("Error fetching total user comments:", error)
    });
  }

  /**
 * Busca o número total de medalhas conquistadas pelo utilizador.
 * @param username O nome de utilizador do perfil para buscar o número total de medalhas.
 */
  private fetchTotalMedals(username: string): void {
    // Chamadas existentes para buscar followers, following, etc.
    this.profileService.getUserTotalMedals(username).subscribe({
      next: (total) => {
        this.totalMedals = total;
      },
      error: (error) => console.error("Error fetching total user likes:", error)
    });
  }

  /**
 * Busca o número total de curtidas recebidas pelo utilizador.
 * @param username O nome de utilizador do perfil para buscar o número total de curtidas.
 */
  private fetchTotalLikes(username: string): void {
    // Chamadas existentes para buscar followers, following, etc.
    this.profileService.getUserTotalLikesReceived(username).subscribe({
      next: (totalLikes) => {
        this.totalLikesReceivedCount = totalLikes;
      },  
      error: (error) => console.error("Error fetching total user likes:", error)
    });
  }

  /**
 * Busca o número total de tentativas de quiz realizadas pelo utilizador.
 * @param userId O ID do utilizador para buscar o número total de tentativas de quiz.
 */
  private fetchTotalQuizAttempts(userId: string): void {
    this.profileService.getTotalQuizAttempts(userId).subscribe({
      next: (totalAttempts) => {
        this.totalQuizAttempts = totalAttempts;
      },
      error: (error) => console.error("Error fetching total quiz attempts:", error)
    });
  }

  /**
 * Carrega o número total de atores favoritos do utilizador.
 */
  private loadTotalFavoriteActors(): void {
    this.profileService.getTotalFavoriteActors().subscribe({
      next: (total) => {
        this.totalFavoriteActors = total;
      },
      error: (error) => {
        console.error("Error fetching total favorite actors:", error);
      }
    });
  }

  /**
 * Carrega o número total de avaliações feitas pelo utilizador.
 */
  private loadTotalRatings(): void {
    this.profileService.getTotalRatingsByUser().subscribe({
      next: (total) => {
        this.totalRatigns = total;
      },
      error: (error) => {
        console.error("Error fetching total favorite actors:", error);
      }
    });
  }

}
