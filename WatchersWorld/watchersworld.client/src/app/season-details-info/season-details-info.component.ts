import { Component } from '@angular/core';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-season-details-info',
  templateUrl: './season-details-info.component.html',
  styleUrl: './season-details-info.component.css'
})
export class SeasonDetailsInfoComponent {
  constructor(private service: MovieApiServiceComponent, private router: ActivatedRoute) { }

  getSerieDetailsResult: any;
  getSerieSeasonDetailsResult: any;

  ngOnInit(): void {
    const getParamId = this.router.snapshot.paramMap.get('id');
    const seasonNumber = this.router.snapshot.paramMap.get('seasonNumber');
    console.log(getParamId, 'getparamid#');

    this.getSeasonDetails(getParamId, seasonNumber);
    this.getSerieDetails(getParamId);
  }
  getSeasonDetails(id: any, seasonNumber: any) {
    this.service.getSerieSeasonInfo(id, seasonNumber).subscribe({
      next: (data) => {
        console.log(data);
        this.getSerieSeasonDetailsResult = data;
      },
      error: (error) => console.error('Erro ao buscar informações da temporada:', error)
    });
  }
  getSerieDetails(id: any) {
    this.service.getSerieDetails(id).subscribe(async (result) => {
      console.log(result, 'serie#');
      this.getSerieDetailsResult = result;
    });
  }
}
