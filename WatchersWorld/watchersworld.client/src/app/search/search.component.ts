  import { Component, OnInit } from '@angular/core';
  import { MovieApiServiceComponent } from '../movie-api-service/movie-api-service.component';
  import { Meta, Title } from '@angular/platform-browser';
  import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SearchServiceComponent } from '../search-service/search-service.component';
import { ActivatedRoute, Router } from '@angular/router';

  @Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrl: './search.component.css'
  })


  export class SearchComponent implements OnInit {

    currentPage: any;
    searchResult: any;
    searchForm = new FormGroup({
      'movieName': new FormControl(''),
      'type': new FormControl('movie'),
      'total_pages': new FormControl()
    });

    selectedGenreId: any;
    isGenreSelected = false;
    originalSearchResult: any;
    currentFilter: any = null;


    genresSeries = [
      { "id": 10759, "name": "Action & Adventure" },
      { "id": 16, "name": "Animation" },
      { "id": 35, "name": "Comedy" },
      { "id": 80, "name": "Crime" },
      { "id": 99, "name": "Documentary" },
      { "id": 18, "name": "Drama" },
      { "id": 10751, "name": "Family" },
      { "id": 10762, "name": "Kids" },
      { "id": 9648, "name": "Mystery" },
      { "id": 10763, "name": "News" },
      { "id": 10764, "name": "Reality" },
      { "id": 10765, "name": "Sci-Fi & Fantasy" },
      { "id": 10766, "name": "Soap" },
      { "id": 10767, "name": "Talk" },
      { "id": 10768, "name": "War & Politics" },
      { "id": 37, "name": "Western" }
      // ...
    ];

    genresMovies = [
      { "id": 28, "name": "Action" },
      { "id": 12, "name": "Adventure" },
      { "id": 16, "name": "Animation" },
      { "id": 35, "name": "Comedy" },
      { "id": 80, "name": "Crime" },
      { "id": 99, "name": "Documentary" },
      { "id": 18, "name": "Drama" },
      { "id": 10751, "name": "Family" },
      { "id": 14, "name": "Fantasy" },
      { "id": 36, "name": "History" },
      { "id": 27, "name": "Horror" },
      { "id": 10402, "name": "Music" },
      { "id": 9648, "name": "Mystery" },
      { "id": 10749, "name": "Romance" },
      { "id": 878, "name": "Science Fiction" },
      { "id": 10770, "name": "TV Movie" },
      { "id": 53, "name": "Thriller" },
      { "id": 10752, "name": "War" },
      { "id": 37, "name": "Western" }
    ];


    constructor(private service: MovieApiServiceComponent, private route: ActivatedRoute,
      private router: Router, private title: Title, private meta: Meta, private formBuilder: FormBuilder, private searchService: SearchServiceComponent) {


      this.searchForm = new FormGroup({
        'movieName': new FormControl(''),
        'type': new FormControl(''), // Remova o valor padrão aqui
        'total_pages': new FormControl()
      });

    }
    onSearch(): void {
      // Atualiza a pesquisa e a URL quando o formulário é submetido.
      this.updateSearch(1);
      this.submitForm(1);// Isso atualizará a URL e submeterá a forma com a primeira página.
    }
    changeType(newType: string): void {
      // Se o novo tipo for diferente do atual, então atualize o formulário e faça uma nova busca.
      if (this.searchForm.value.type !== newType) {
        this.searchForm.controls['type'].setValue(newType);

        // Resetar estados relacionados se necessário
        this.isGenreSelected = false;
        this.selectedGenreId = null;
        this.currentFilter = null; // Reseta o filtro de gênero

        // Atualiza a URL com o novo tipo sem alterar os outros parâmetros da URL.
        // Já que estamos mudando de tipo, faz sentido resetar o gênero no URL também.
        this.updateSearch(1); // Passa '1' para resetar para a primeira página após mudança de tipo.
        this.submitForm(1); // Passa '1' para resetar para a primeira página após mudança de tipo.

      }
    }

  
    ngOnInit() {
      this.route.queryParams.subscribe(params => {
        const genreId = params['genre'];
        const title = params['title'];
        const type = params['type'] || this.searchForm.value.type || 'movie'; // Usa o valor da URL ou o valor anterior ou 'movie' como último recurso
        const page = parseInt(params['page'], 10) || 1;

        let shouldUpdateSearch = false;

        if (page !== this.currentPage || genreId !== this.selectedGenreId?.toString() || title !== this.searchForm.value.movieName || type !== this.searchForm.value.type) {
          shouldUpdateSearch = true;
          this.currentPage = page;
          this.selectedGenreId = genreId ? parseInt(genreId, 10) : null;
          this.isGenreSelected = !!genreId;
          this.searchForm.setValue({
            movieName: title || '',
            type: type,
            total_pages: this.searchForm.get('total_pages')?.value || 0
          });
        }

        if (shouldUpdateSearch) {
          this.submitForm(this.currentPage);
        }
      });
    }


    filterByGenre(genreId: number) {
      if (this.selectedGenreId === genreId) {
        // Se o gênero selecionado é o mesmo que o gênero atualmente filtrado,
        // remova o filtro e retorne todos os resultados da pesquisa original.
        this.isGenreSelected = false;
        this.selectedGenreId = null;
        this.currentFilter = null;
      } else {
        // Caso contrário, aplique o filtro como antes.
        this.isGenreSelected = true;
        this.selectedGenreId = genreId;
        this.currentFilter = genreId;
      }
      this.applyCurrentFilter();
      this.updateSearch(1);

    }

    applyCurrentFilter() {
      this.searchResult = this.currentFilter ? this.originalSearchResult.filter((result: any) => result.genre_ids.includes(this.currentFilter)) : [...this.originalSearchResult];
    }

    updateSearch(page: number = this.currentPage): void {
      const title = this.searchForm.get('movieName')?.value;
      const type = this.searchForm.get('type')?.value; // Isso agora incluirá 'movie' ou 'serie'

      // Navega para a mesma rota mas com os parâmetros de consulta atualizados.
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          title: title || null,
          type: type, // Garanta que o tipo atualizado seja refletido na URL.
          page: page || null,
          genre: this.selectedGenreId || null
        },
        queryParamsHandling: 'merge', // Mescla com outros queryParams existentes.
      });
    }



    submitForm(page: number): void {
      this.currentPage = page;
      const searchValue = { ...this.searchForm.value, page };

      // Chamada de serviço baseada no tipo; ajuste conforme seu caso de uso
      if (searchValue.type === 'serie') {
        this.service.getSearchSerie(searchValue).subscribe((result) => {
          this.processSearchResults(result);
        });
      } else {
        this.service.getSearchMovie(searchValue).subscribe((result) => {
          this.processSearchResults(result);
        });
      }
    }

    processSearchResults(result: any): void { // Ajuste o tipo 'any' conforme necessário
      this.originalSearchResult = [...result.results];
      this.applyCurrentFilter(); // Aplica filtro atual aos novos resultados
      this.searchForm.patchValue({ total_pages: result.total_pages });
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
nextPage(): void {
  const newPage = this.currentPage + 1;
  // Certifique-se de que newPage não exceda totalPages
  this.updateSearch(newPage);
}

previousPage(): void {
  const newPage = this.currentPage - 1;
  // Certifique-se de que newPage seja pelo menos 1
  this.updateSearch(newPage);
}
  }
