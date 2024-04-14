import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-search-service',
  templateUrl: './search-service.component.html',
  styleUrl: './search-service.component.css'
})

/**
 * Um serviço que fornece funcionalidade para gerenciar consultas de pesquisa.
 */
export class SearchServiceComponent {
  private searchQuerySource = new BehaviorSubject<string>('');
  currentSearchQuery = this.searchQuerySource.asObservable();

  constructor() { }

    /**
   * Atualiza a consulta de pesquisa atual com uma nova consulta.
   * @param searchQuery A nova consulta de pesquisa a ser definida.
   */
  changeSearchQuery(searchQuery: string) {
    console.log('changeSearchQuery called with:', searchQuery);  // Adicione esta linha
    this.searchQuerySource.next(searchQuery);
  }
}
