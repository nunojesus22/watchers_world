import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';
import { Meta, Title } from '@angular/platform-browser';

interface MovieCategory {
  name: string;
  results: any[];
  activeIndex: number;
  media_type: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  categories: MovieCategory[] = [];

  constructor(public authService: AuthenticationService, private router: Router, private service: MovieApiServiceComponent, private title: Title, private meta: Meta) { }

  ngOnInit(): void {
    this.initCategories();
  }

  initCategories() {
    this.categories = [
      { name: 'Banner', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes em Destaque', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Séries Mais Votadas', results: [], activeIndex: 0, media_type: "tv" },
      { name: 'Filmes de Ação', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Aventura', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Comédia', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Animação', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes Documentários', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Ficção Científica', results: [], activeIndex: 0, media_type: "movie" },
      { name: 'Filmes de Thriller', results: [], activeIndex: 0, media_type: "movie" },
    ];

    this.fetchMovies();
  } 


  fetchMovies() {
    const fetchMethods = [
      this.service.bannerApiData(),
      this.service.trendingMovieApiData(),
      this.service.fetchTopRatedSeries(),
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

  logout() {
    this.authService.logout();
  }

  getCategoryResults(categoryName: string): any[] {
    const category = this.categories.find(cat => cat.name === categoryName);
    //console.log("category",category);
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



}
