import { Component } from '@angular/core';
import { MovieApiServiceComponent } from '../movie-api-service/movie-api-service.component';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-series-details',
  templateUrl: './series-details.component.html',
  styleUrl: './series-details.component.css'
})
export class SeriesDetailsComponent {
  constructor(private service: MovieApiServiceComponent, private router: ActivatedRoute, private title: Title, private meta: Meta) { }
  getSerieDetailsResult: any;
  getSerieVideoResult: any;
  getMovieCastResult: any;
  getMovieProviders: any;
  showAll: boolean = true;
  type: string = "serie";


  ngOnInit(): void {
    let getParamId = this.router.snapshot.paramMap.get('id');
    console.log(getParamId, 'getparamid#');
    this.showAll = false;
    this.getMovie(getParamId);
    this.getVideo(getParamId);
    this.getSerieCast(getParamId);
    this.getSerieProviders(getParamId);
  }


  getMovie(id: any) {
    this.service.getSerieDetails(id).subscribe(async (result) => {
      console.log(result, 'getseriedetails#');
      this.getSerieDetailsResult = await result;

      // updatetags
      this.title.setTitle(`${this.getSerieDetailsResult.original_title} | ${this.getSerieDetailsResult.tagline}`);
      this.meta.updateTag({ name: 'title', content: this.getSerieDetailsResult.original_title });
      this.meta.updateTag({ name: 'description', content: this.getSerieDetailsResult.overview });

      // facebook
      this.meta.updateTag({ property: 'og:type', content: "website" });
      this.meta.updateTag({ property: 'og:url', content: `` });
      this.meta.updateTag({ property: 'og:title', content: this.getSerieDetailsResult.original_title });
      this.meta.updateTag({ property: 'og:description', content: this.getSerieDetailsResult.overview });
      this.meta.updateTag({ property: 'og:image', content: `https://image.tmdb.org/t/p/original/${this.getSerieDetailsResult.backdrop_path}` });

    });
  }

  getVideo(id: any) {
    this.service.getSerieVideo(id).subscribe((result) => {
      console.log(result, 'getSerieVideo#');
      result.results.forEach((element: any) => {
        if (element.type == "Trailer") {
          this.getSerieVideoResult = element.key;
        }
      });

    });
  }

  getSerieCast(id: any) {
    this.service.getSerieCast(id).subscribe((result) => {
      console.log(result, 'movieCast#');
      this.getMovieCastResult = result.cast;
    });
  }


  getSerieProviders(id: any) {
    this.service.getSerieStreamingProvider(id).subscribe((result) => {
      console.log(result, 'serieProviders#');
      this.getMovieProviders = result.results.PT;
    });
  }


  public convertMinutesToHours(time: number): string {//Converte para horas o tempo do filme
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}h ${minutes}min`;
  }

  public convertToPercentage(points: number): string { //Converte para percentagem o valor dos pontos dos users da API
    const pointsPercentage = Math.round(points * 10); // Multiplicar por 10 para obter um número inteiro
    return `${pointsPercentage}%`;
  }

  public formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  markAsWatched() {
    let getParamId = this.router.snapshot.paramMap.get('id'); // Obter o ID do filme atual
    const type = "serie"; // Ou dinamicamente determinado com base no contexto
    console.log("paramId", getParamId)
    if (getParamId) {
      this.service.markMediaAsWatched(+getParamId, type).subscribe({
        next: (result) => {
          console.log('Serie marcada como assistida', result);
        },
        error: (error) => {
          console.error('Erro ao marcar Serie como assistido', error);
        }
      });
    }
  }
}
