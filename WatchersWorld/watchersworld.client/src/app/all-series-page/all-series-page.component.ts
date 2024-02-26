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
  selector: 'app-all-series-page',
  templateUrl: './all-series-page.component.html',
  styleUrl: './all-series-page.component.css'
})

export class AllSeriesPageComponent {
  categories: MovieCategory[] = [];

  constructor(private route: Router, private service: MovieApiServiceComponent) { }

  ngOnInit(): void {
    this.initCategories();
  }

  initCategories() {
    this.categories = [
      { name: 'Trending Series', results: [], activeIndex: 0, showAll: false },
      { name: 'Action and Adventure', results: [], activeIndex: 0, showAll: false },
      { name: 'Drama', results: [], activeIndex: 0, showAll: false },
      { name: 'Mystery', results: [], activeIndex: 0, showAll: false },
      { name: 'Animation', results: [], activeIndex: 0, showAll: false },

    ];

    this.fetchMovies();
  }

  fetchMovies() {
    const fetchMethods = [
      this.service.fetchTopRatedSeries(),
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
}
