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

export class AllSeriesPageComponent {
  categories: MovieCategory[] = [];
  currentUser: any;

  constructor(private route: Router,
    private service: MovieApiServiceComponent,
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private profileService: ProfileService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getLoggedInUserName();
    this.initCategories();
    this.fetchRecommendedSeries();
    this.fetchAiringAndWatchedSeriesAndNotify();
  }


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


  getCategoryResults(categoryName: string): any[] {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.results : [];
  }

  getCategoryActiveIndex(categoryName: string): number {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.activeIndex : 0;
  }

  nextCategory(categoryName: string) {
    const category = this.categories.find(cat => cat.name === categoryName);
    if (category) {
      const batchSize = 4; // Defina o tamanho do lote aqui
      const newIndex = category.activeIndex + batchSize;
      category.activeIndex = newIndex >= category.results.length ? 0 : newIndex;
    }
  }

  prevCategory(categoryName: string) {
    const category = this.categories.find(cat => cat.name === categoryName);
    if (category) {
      const batchSize = 4; // Defina o tamanho do lote aqui
      const newIndex = category.activeIndex - batchSize;
      category.activeIndex = newIndex < 0 ? Math.max(0, category.results.length - batchSize) : newIndex;
    }
  }
  toggleShowAll(categoryName: string) { // Adicione este método
    const category = this.categories.find(cat => cat.name === categoryName);
    if (category) {
      category.showAll = !category.showAll;
    }
  }

  getRows(movies: any[]) {
    const rows = [];
    for (let i = 0; i < movies.length; i += 4) {
      rows.push(movies.slice(i, i + 4));
    }
    return rows;
  }

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
