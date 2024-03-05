import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-search-service',
  templateUrl: './search-service.component.html',
  styleUrl: './search-service.component.css'
})
export class SearchServiceComponent {
  private searchQuerySource = new BehaviorSubject<string>('');
  currentSearchQuery = this.searchQuerySource.asObservable();

  constructor() { }

  changeSearchQuery(searchQuery: string) {
    console.log('changeSearchQuery called with:', searchQuery);  // Adicione esta linha
    this.searchQuerySource.next(searchQuery);
  }
}
