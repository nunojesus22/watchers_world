import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { ProfileService } from '../../../profile/services/profile.service';
import { forkJoin, map, switchMap } from 'rxjs';
import { NotificationService } from '../../../notifications/services/notification.service';
import { MediaNotificationModel } from '../../../notifications/models/media-notification-model';


interface MovieCategory {
  name: string;
  results: any[];
  activeIndex: number;
  showAll: boolean;

}

@Component({
  selector: 'app-all-series-page',
  templateUrl: './all-series-page.component.html',
  styleUrl: './all-series-page.component.css'
})

/**
 * A classe `AllSeriesPageComponent` representa o componente da página que exibe todas as séries.
 */
export class AllSeriesPageComponent {
  categories: MovieCategory[] = [];
  currentUser: any;

  /**
   * Construtor da classe `AllSeriesPageComponent`.
   * 
   * @param route O serviço de roteamento.
   * @param service O serviço da API de filmes.
   * @param authService O serviço de autenticação.
   * @param notificationService O serviço de notificações.
   * @param profileService O serviço de perfil do usuário.
   */
  constructor(private route: Router,
    private service: MovieApiServiceComponent,
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private profileService: ProfileService) { }

     /**
   * Método executado ao inicializar o componente.
   */
  ngOnInit(): void {
    this.currentUser = this.authService.getLoggedInUserName();
    this.initCategories();
    this.fetchRecommendedSeries();
    this.fetchAiringAndWatchedSeriesAndNotify();
  }

/**
   * Recupera as séries recomendadas para o usuário e as adiciona à categoria "Séries Sugeridas".
   */
  fetchRecommendedSeries(): void {
    this.profileService.getUserWatchedMedia(this.currentUser).pipe(
      switchMap((watchedMedia: any[]) => {
        const movieIds = watchedMedia
          .filter(media => media.type === 'serie')
          .map(media => media.mediaId);
        return forkJoin(movieIds.map(id => this.service.getSimilarSerie(id)));
      }),
      map(movieArrays => movieArrays.flatMap(movies => movies.results)),
      map(recommendedMovies => {
        const uniqueMovieIds = new Set();
        const uniqueMovies = [];
        console.log(recommendedMovies);
        for (const movie of recommendedMovies) {
          if (movie.poster_path && !uniqueMovieIds.has(movie.id)) {
            uniqueMovieIds.add(movie.id);
            uniqueMovies.unshift(movie);
          }
        }

        return uniqueMovies.slice(0, 100);
      })
    ).subscribe((uniqueRecommendedMovies: any[]) => {
      const recommendedCategoryIndex = this.categories.findIndex(category => category.name === 'Series Sugeridas');
      if (recommendedCategoryIndex !== -1) {

        this.categories[recommendedCategoryIndex].results = [
          ...uniqueRecommendedMovies,
          ...this.categories[recommendedCategoryIndex].results,
        ];
      } else {

        this.categories.unshift({
          name: 'Series Sugeridas',
          results: uniqueRecommendedMovies,
          activeIndex: 0,
          showAll: false
        });
      }
    });
  }
   /**
   * Inicializa as categorias de séries com os nomes e resultados iniciais.
   */
  initCategories() {
    this.categories = [
      { name: 'Séries em Destaque', results: [], activeIndex: 0, showAll: false },
      { name: 'Séries em Produção', results: [], activeIndex: 0, showAll: false },
      { name: 'Séries de Ação e Aventura', results: [], activeIndex: 0, showAll: false },
      { name: 'Séries de Drama', results: [], activeIndex: 0, showAll: false },
      { name: 'Séries de Mistério', results: [], activeIndex: 0, showAll: false },
      { name: 'Séries de Animação', results: [], activeIndex: 0, showAll: false },

    ];

    this.fetchMovies();
  } 

 /**
   * Recupera as séries para cada categoria e as atualiza na respectiva categoria.
   */
  fetchMovies() {
    const fetchMethods = [
      this.service.fetchTopRatedSeries(),
      this.service.getAiringSeries(),
      this.service.fetchActionAndAdvetureSeries(),
      this.service.fetchDramaSeries(),
      this.service.fetchMysterySeries(),
      this.service.fetchAnimationSeries(),
  ];

    fetchMethods.forEach((fetchMethod, index) => {
      fetchMethod.subscribe((result) => {
        this.categories[index].results = result.results;
      });
    });
  }

/**
 * Retorna os resultados da categoria especificada.
 * 
 * @param categoryName O nome da categoria.
 * @returns Um array contendo os resultados da categoria.
 */
  getCategoryResults(categoryName: string): any[] {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.results : [];
  }
/**
 * Retorna o índice ativo da categoria especificada.
 * 
 * @param categoryName O nome da categoria.
 * @returns O índice ativo da categoria.
 */
  getCategoryActiveIndex(categoryName: string): number {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.activeIndex : 0;
  }

/**
 * Avança para o próximo lote de resultados da categoria especificada.
 * 
 * @param categoryName O nome da categoria.
 */
  nextCategory(categoryName: string) {
    const category = this.categories.find(cat => cat.name === categoryName);
    if (category) {
      const batchSize = 4; // Defina o tamanho do lote aqui
      const newIndex = category.activeIndex + batchSize;
      category.activeIndex = newIndex >= category.results.length ? 0 : newIndex;
    }
  }

/**
 * Retrocede para o lote anterior de resultados da categoria especificada.
 * 
 * @param categoryName O nome da categoria.
 */
  prevCategory(categoryName: string) {
    const category = this.categories.find(cat => cat.name === categoryName);
    if (category) {
      const batchSize = 4; // Defina o tamanho do lote aqui
      const newIndex = category.activeIndex - batchSize;
      category.activeIndex = newIndex < 0 ? Math.max(0, category.results.length - batchSize) : newIndex;
    }
  }

/**
 * Alterna a exibição de todos os resultados da categoria especificada.
 * 
 * @param categoryName O nome da categoria.
 */
  toggleShowAll(categoryName: string) { // Adicione este método
    const category = this.categories.find(cat => cat.name === categoryName);
    if (category) {
      category.showAll = !category.showAll;
    }
  }

/**
 * Divide os filmes em linhas de 4 filmes cada.
 * 
 * @param movies Um array de filmes.
 * @returns Um array de linhas de filmes, cada uma contendo até 4 filmes.
 */
  getRows(movies: any[]) {
    const rows = [];
    for (let i = 0; i < movies.length; i += 4) {
      rows.push(movies.slice(i, i + 4));
    }
    return rows;
  }

  /**
 * Busca as séries que estão sendo transmitidas hoje e notifica o usuário sobre novos episódios disponíveis.
 */
  fetchAiringAndWatchedSeriesAndNotify(): void {
    forkJoin({
      airingToday: this.service.getAiringSeries(),
      watchedMedia: this.profileService.getUserWatchedMedia(this.currentUser)
    }).pipe(
      switchMap(results => {
        const watchedSeriesIds = new Set(results.watchedMedia.map(media => media.mediaId));
        const airingSeriesToNotify = results.airingToday.results.filter(
          (series: any) => watchedSeriesIds.has(series.id)
        );

        return forkJoin(
          airingSeriesToNotify.map((series: any) => 
            this.notificationService.notifyNewEpisode(
              new MediaNotificationModel(
                this.currentUser,
                `Novo episódio disponível para ${series.name}!`,
                new Date(),
                false,
                'NewMedia',
                series.mediaId,
                series.name,
                series.poster_path,
                series.id, 
              )
            )
          )
        );
      })
    ).subscribe({
      next: () => console.log('Notificações para novos episódios enviadas com sucesso.'),
      error: (error) => console.error('Erro ao enviar notificações para novos episódios', error)
    });
  }






}
