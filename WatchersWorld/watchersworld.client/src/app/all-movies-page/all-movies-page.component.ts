import { Component } from '@angular/core';
import { MovieApiServiceComponent } from '../movie-api-service/movie-api-service.component';
import { Router } from '@angular/router';



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

  constructor(private route: Router, private service: MovieApiServiceComponent) { }

  ngOnInit(): void {
    this.initCategories();
  }

  initCategories() {
    this.categories = [
      { name: 'Trending Movies', results: [], activeIndex: 0, showAll:false },
      { name: 'Action Movies', results: [], activeIndex: 0 ,showAll: false },
      { name: 'Adventure Movies', results: [], activeIndex: 0, showAll: false },
      { name: 'Comedy Movies', results: [], activeIndex: 0, showAll: false },
      { name: 'Animation Movies', results: [], activeIndex: 0, showAll: false },
      { name: 'Documentary Movies', results: [], activeIndex: 0, showAll: false },
      { name: 'ScienceFiction Movies', results: [], activeIndex: 0, showAll: false },
      { name: 'Thriller Movies', results: [], activeIndex: 0, showAll: false },
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

