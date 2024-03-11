import { Component } from '@angular/core';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-season-details',
  templateUrl: './season-details.component.html',
  styleUrl: './season-details.component.css'
})
export class SeasonDetailsComponent {

  constructor(private service: MovieApiServiceComponent, private router: ActivatedRoute) { }

  getSerieDetailsResult: any;


  ngOnInit(): void {
    const getParamId = this.router.snapshot.paramMap.get('id');
    const seasonNumber = this.router.snapshot.paramMap.get('season');
    console.log(getParamId, 'getparamid#');
    this.getSerieDetails(getParamId);

    //if (getParamId && seasonNumber) {
      //this.getSeasonDetails(getParamId, seasonNumber);
    //}
  }
  getSerieDetails(id: any) {
    this.service.getSerieDetails(id).subscribe(async (result) => {
      console.log(result, 'serie#');
      this.getSerieDetailsResult = result; // Aqui deve ser apenas 'result', não 'result.cast'
    });
  }
}
