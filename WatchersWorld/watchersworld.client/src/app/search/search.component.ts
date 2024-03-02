  import { Component, OnInit } from '@angular/core';
  import { MovieApiServiceComponent } from '../movie-api-service/movie-api-service.component';
  import { Meta, Title } from '@angular/platform-browser';
  import { FormControl, FormGroup } from '@angular/forms';

  @Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrl: './search.component.css'
  })
  export class SearchComponent implements OnInit {
    currentPage = 1;

    constructor(private service: MovieApiServiceComponent, private title: Title, private meta: Meta) {
      this.title.setTitle('Search movies - showtime');
      this.meta.updateTag({ name: 'description', content: 'search here movies like avatar,war etc' });
    }

    ngOnInit(): void {
    }

    searchResult: any;
    searchForm = new FormGroup({
      'movieName': new FormControl(null),
      'type': new FormControl('movie'),
      'total_pages': new FormControl()



    });

    submitForm(page: number) {
      console.log(this.searchForm.value, 'searchform#');
      this.currentPage = page;
      const searchValue = { ...this.searchForm.value, page }; // Adiciona o número da página ao valor do formulário
      if (searchValue.type === 'serie') {
        this.service.getSearchSerie(searchValue).subscribe((result) => {
          console.log(result, 'searchseries##');
          this.searchResult = result.results;
          this.searchForm.patchValue({ total_pages: result.total_pages });

        });
      } else {
        this.service.getSearchMovie(searchValue).subscribe((result) => {
          console.log(result, 'searchmovie##');
          this.searchResult = result.results;
          this.searchForm.patchValue({ total_pages: result.total_pages });

        });
      }
    }



    get totalPagesArray() {
      return Array.from({ length: this.searchForm.value.total_pages }, (_, i) => i + 1);
    }
    get displayPages() {
      let start = this.currentPage - 1;
      let end = this.currentPage + 2;

      if (start < 1) {
        start = 1;
        end = 4;
      }

      if (end > this.totalPagesArray.length) {
        end = this.totalPagesArray.length;
        start = end - 3 > 0 ? end - 3 : 1;
      }

      return this.totalPagesArray.slice(start - 1, end);
    }
    nextPage() {
      if (this.currentPage + 1 <= this.totalPagesArray.length) {
        this.submitForm(this.currentPage + 1);
      }
    }

    previousPage() {
      if (this.currentPage - 1 >= 1) {
        this.submitForm(this.currentPage - 1);
      }
    }

  }
