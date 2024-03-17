import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';

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
  isWatched: boolean = false; // Adicione esta linha
  isToWatchLater: boolean = false;
  actorIsFavorite: boolean = false;
  movieRating = 0; 
  comments: any[] = [];
  showComments: boolean = false;
  currentUser: string | null = null;

  ngOnInit(): void {
    let getParamId = this.router.snapshot.paramMap.get('id');
    console.log(getParamId, 'getparamid#');
    this.showAll = false;
    this.getMovie(getParamId);
    this.getVideo(getParamId);
    this.getSerieCast(getParamId);
    this.getSerieProviders(getParamId);
    this.checkIfWatched(getParamId); // Novo método para verificar se o filme foi assistido
    this.checkIfWatchedLater(getParamId);

  }

  toggleFavorite(selectedActor: any): void {
    if (selectedActor.isFavorite) {
      selectedActor.isFavorite = false;
      return;
    }

    this.getMovieCastResult.forEach((actor: { isFavorite: boolean; }) => {
      actor.isFavorite = false;
    });

    selectedActor.isFavorite = true;
  }

  rateMovie(rating: number): void {
    this.movieRating = rating;
  }

  checkIfWatched(mediaId: any) {
    // Supondo que você tenha uma propriedade `isWatched` neste componente
    this.service.checkIfWatched(mediaId, this.type).subscribe({
      next: (response: any) => {
        this.isWatched = response.isWatched;
        console.log("esta visto?", this.isWatched)
      },
      error: (error) => {
        console.error('Erro ao verificar se a mídia foi assistida', error);
      }
    });
  }
  checkIfWatchedLater(mediaId: any) {
    // Supondo que você tenha uma propriedade `isWatched` neste componente
    this.service.checkIfWatchedLater(mediaId, this.type).subscribe({
      next: (response: any) => {
        this.isToWatchLater = response.isToWatchLater;
        console.log("nao esta visto?", this.isToWatchLater)
        // Aqui você atualiza com base na resposta
      },
      error: (error) => {
        console.error('Erro ao verificar se a mídia foi assistida', error);
      }
    });
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

  markToWatchLater() {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      if (!this.isToWatchLater) {
        this.service.markMediaToWatchLater(+mediaId, this.type).subscribe({
          next: (result) => {
            // Após a ação, atualize os estados e verifique novamente
            this.checkIfWatched(mediaId);
            this.checkIfWatchedLater(mediaId);
          },
          error: (error) => {
            console.error('Erro ao marcar media para assistir mais tarde', error);
          }
        });
      } else {
        this.service.unmarkMediaToWatchLater(+mediaId, this.type).subscribe({
          next: (result) => {
            // Após a ação, atualize os estados e verifique novamente
            this.checkIfWatched(mediaId);
            this.checkIfWatchedLater(mediaId);
          },
          error: (error) => {
            console.error('Erro ao desmarcar media de assistir mais tarde', error);
          }
        });
      }
    }
  }

  markAsWatched() {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      if (!this.isWatched) {
        this.service.markMediaAsWatched(+mediaId, this.type).subscribe({
          next: (result) => {
            // Após a ação, atualize os estados e verifique novamente
            this.checkIfWatched(mediaId);
            this.checkIfWatchedLater(mediaId);
          },
          error: (error) => {
            console.error('Erro ao marcar filme como assistido', error);
          }
        });
      } else {
        this.service.unmarkMediaAsWatched(+mediaId, this.type).subscribe({
          next: (result) => {
            // Após a ação, atualize os estados e verifique novamente
            this.checkIfWatched(mediaId);
            this.checkIfWatchedLater(mediaId);
          },
          error: (error) => {
            console.error('Erro ao desmarcar filme como assistido', error);
          }
        });
      }
    }
  }
}
