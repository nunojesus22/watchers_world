import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { ProfileService } from '../../../profile/services/profile.service';
import { flatMap, forkJoin, map, switchMap } from 'rxjs';



interface MovieCategory {
  name: string;
  results: any[];
  activeIndex: number;
  showAll: boolean; 

}
@Component({
  selector: 'app-all-movies-page',
  templateUrl: './all-movies-page.component.html',
  styleUrl: './all-movies-page.component.css'
})
export class AllMoviesPageComponent {
  categories: MovieCategory[] = [];
  currentUser: any;

  constructor(private route: Router,
    private service: MovieApiServiceComponent,
    private authService: AuthenticationService,
    private profileService: ProfileService,

) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getLoggedInUserName();
    this.initCategories();
    this.fetchRecommendedMovies();
  }

  initCategories() {
    this.categories = [
      { name: 'Filmes em Destaque', results: [], activeIndex: 0, showAll: false },
      { name: 'Filmes de Ação', results: [], activeIndex: 0, showAll: false },
      { name: 'Filmes de Aventura', results: [], activeIndex: 0, showAll: false },
      { name: 'Filmes de Comédia', results: [], activeIndex: 0, showAll: false },
      { name: 'Filmes de Animação', results: [], activeIndex: 0, showAll: false },
      { name: 'Filmes Documentário', results: [], activeIndex: 0, showAll: false },
      { name: 'Filmes de Ficção Científica', results: [], activeIndex: 0, showAll: false },
      { name: 'Filmes de Thriller', results: [], activeIndex: 0, showAll: false },
    ];

    this.fetchMovies();
  }

  fetchMovies() {
    const fetchMethods = [
     
      this.service.trendingMovieApiData(),
      this.service.fetchActionMovies(),
      this.service.fetchAdventureMovies(),
      this.service.fetchComedyMovies(),
      this.service.fetchAnimationMovies(),
      this.service.fetchDocumentaryMovies(),
      this.service.fetchScienceFictionMovies(),
      this.service.fetchThrillerMovies(),
    ];

    fetchMethods.forEach((fetchMethod, index) => {
      fetchMethod.subscribe((result) => {
        this.categories[index].results = result.results;
      });
    });
  }

  fetchRecommendedMovies(): void {
    this.profileService.getUserWatchedMedia(this.currentUser).pipe(
      switchMap((watchedMedia: any[]) => {
        const movieIds = watchedMedia
          .filter(media => media.type === 'movie')
          .map(media => media.mediaId);
        return forkJoin(movieIds.map(id => this.service.getSimilarMovie(id)));
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
      const recommendedCategoryIndex = this.categories.findIndex(category => category.name === 'Filmes Sugeridos');
      if (recommendedCategoryIndex !== -1) {

        this.categories[recommendedCategoryIndex].results = [
          ...uniqueRecommendedMovies,
          ...this.categories[recommendedCategoryIndex].results,
        ];
      } else {

        this.categories.unshift({
          name: 'Filmes Sugeridos',
          results: uniqueRecommendedMovies,
          activeIndex: 0,
          showAll: false
        });
      }
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

}

