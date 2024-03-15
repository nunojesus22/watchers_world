import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';
import { AuthenticationService } from '../../../authentication/services/authentication.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css' 
})
export class MovieDetailsComponent {
  constructor(private service: MovieApiServiceComponent, private router: ActivatedRoute, private title: Title, private meta: Meta, private auth: AuthenticationService) { }
  getMovieDetailResult: any;
  getMovieVideoResult: any;
  getMovieCastResult: any;
  getMovieProviders: any;
  showAll: boolean = true;
  type: string = "movie";
  isWatched: boolean = false; // Adicione esta linha
  isToWatchLater: boolean = false; // Adicione esta linha
  currentUser: string = '';


  ngOnInit(): void {
    let getParamId = this.router.snapshot.paramMap.get('id');
    console.log(getParamId, 'getparamid#');
    this.showAll = false;
    this.getVideo(getParamId);
    this.getMovieCast(getParamId);
    this.getProviders(getParamId);
    this.checkIfWatched(getParamId); // Novo método para verificar se o filme foi assistido

    this.checkIfWatchedLater(getParamId);

    this.fetchComments(); // Carrega os comentários

    //this.currentUser = this.auth.getCurrentUserName();

  }


  checkIfWatched(mediaId: any) {
    // Supondo que você tenha uma propriedade `isWatched` neste componente
    this.service.checkIfWatched(mediaId,this.type).subscribe({
      next: (response: any) => {
        this.isWatched = response.isWatched;
        console.log("esta visto?",this.isWatched)
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


 

  getVideo(id: any) {
    this.service.getMovieVideo(id).subscribe((result) => {
      console.log(result, 'getMovieVideo#');
      result.results.forEach((element: any) => {
        if (element.type == "Trailer") {
          this.getMovieVideoResult = element.key;
        }
      });

    });
  }

  getMovieCast(id: any) {
    this.service.getMovieCast(id).subscribe((result) => {
      console.log(result, 'movieCast#');
      this.getMovieCastResult = result.cast;
    });
  }


  getProviders(id: any) {
    this.service.getStreamingProvider(id).subscribe((result) => {
      console.log(result, 'movieProviders#');
      this.getMovieProviders = result.results.PT;
      console.log(result.results.PT, 'portugalProviders');
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

  public formatCurrency(value?: number): string {
    if (value) { // Verifica se o valor não é null ou undefined
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else {
      return '-'; // Retorna um placeholder ou vazio se o valor for null ou undefined
    }
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


  comments: any[] = [];

  // Dentro do ngOnInit ou em uma função separada que você chamará no ngOnInit
  getComments(mediaId: any): void {
    this.service.getMediaComments(mediaId).subscribe({
      next: (response: any) => {
        this.comments = response;
        console.log('Comentários:', this.comments);
      },
      error: (error) => {
        console.error('Erro ao buscar comentários', error);
      }
    });
  }
  
  fetchComments(): void {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.service.getMediaComments(+mediaId).subscribe(comments => {
        this.comments = comments;
      });
    }
  }
  newCommentText: string = '';

  addComment(): void {
    if (!this.newCommentText.trim()) {
      return; // Verifica se o comentário não está vazio
    }

    const mediaId = this.getMovieDetailResult.id;
    const mediaType = this.type;

    this.service.addComment(mediaId, mediaType, this.newCommentText).subscribe({
      next: (newComment) => {
        this.comments.unshift(newComment); // Adiciona imediatamente o novo comentário à lista para atualização instantânea
        this.newCommentText = ''; // Limpar o campo de texto após adicionar o comentário
        this.fetchComments(); // Atualiza a lista de comentários para garantir que todos os comentários sejam recuperados
      },
      error: (error) => {
        console.error('Erro ao adicionar comentário', error);
      }
    });
  }

  deleteComment(commentId: number): void {
    this.service.deleteComment(commentId).subscribe({
      next: () => {
        console.log('Comentário deletado com sucesso');
        // Atualiza a lista de comentários removendo o comentário deletado
        this.comments = this.comments.filter(comment => comment.id !== commentId);
      },
      error: error => {
        console.error('Erro ao deletar o comentário', error);
      }
    });
  }
}

