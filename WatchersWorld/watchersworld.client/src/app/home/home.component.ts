import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { MovieApiServiceComponent } from '../movie-api-service/movie-api-service.component';
import { Meta, Title } from '@angular/platform-browser';

interface MovieCategory {
  name: string;
  results: any[];
  activeIndex: number;
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
      { name: 'Banner', results: [], activeIndex: 0 },
      { name: 'Trending Movies', results: [], activeIndex: 0 },
      { name: 'Top Rated Series', results: [], activeIndex: 0 },
      { name: 'Action Movies', results: [], activeIndex: 0 },
      { name: 'Adventure Movies', results: [], activeIndex: 0 },
      { name: 'Comedy Movies', results: [], activeIndex: 0 },
      { name: 'Animation Movies', results: [], activeIndex: 0 },
      { name: 'Documentary Movies', results: [], activeIndex: 0 },
      { name: 'ScienceFiction Movies', results: [], activeIndex: 0 },
      { name: 'Thriller Movies', results: [], activeIndex: 0 },
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
