import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';

@Component({
  selector: 'app-season-details',
  templateUrl: './season-details.component.html',
  styleUrls: ['./season-details.component.css']
})
export class SeasonDetailsComponent implements AfterViewInit {

  getSerieDetailsResult: any;
  @ViewChild('lastSeason') lastSeason?: ElementRef;

  constructor(
    private service: MovieApiServiceComponent,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const getParamId = this.route.snapshot.paramMap.get('id');
    if (getParamId) {
      this.getSerieDetails(getParamId);
    }
  }

  ngAfterViewInit(): void {
    // Já que a chamada de rolar a tela depende dos dados carregados, movemos isso para getSerieDetails
  }

  /**
   * Get the details of a series.
   * @param id The ID of the series.
   */
  getSerieDetails(id: any) {
    this.service.getSerieDetails(id).subscribe(result => {
      this.getSerieDetailsResult = result;
      // Após carregar os detalhes da série, verifique se precisamos rolar para a última temporada
      if (this.route.snapshot.queryParamMap.get('scrollToLastSeason') === 'true') {
        setTimeout(() => this.scrollToLastSeason(), 0); // Timeout para garantir que a view esteja atualizada
      }
    });
  }

   /**
   * Scroll to the last season of the series.
   */
  scrollToLastSeason(): void {
    if (this.lastSeason) {
      const element = this.lastSeason.nativeElement;
      const offset = element.offsetTop;
      const offsetWithMargin = offset - (window.innerHeight - element.offsetHeight);
      window.scrollTo({ top: offsetWithMargin, behavior: 'smooth' });
    }
  }
}
