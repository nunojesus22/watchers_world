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
  currentUser: string | null = null;

  ngOnInit(): void {
    let getParamId = this.router.snapshot.paramMap.get('id');
    console.log(getParamId, 'getparamid#');
    this.showAll = false;
    this.getMovie(getParamId);
    this.getVideo(getParamId);
    this.getMovieCast(getParamId);
    this.getProviders(getParamId);
    this.checkIfWatched(getParamId); // Novo método para verificar se o filme foi assistido

    this.checkIfWatchedLater(getParamId);


    this.auth.user$.subscribe(user => {
      this.currentUser = user ? user.username.toLowerCase() : null;
      this.fetchComments(); // Carrega os comentários
    });
    console.log("user", this.currentUser);

  }
  canDeleteComment(commentUserName: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.toLowerCase() === commentUserName.toLowerCase();
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

  getMovie(id: any) {
    this.service.getMovieDetails(id).subscribe(async (result) => {
      console.log(result, 'getmoviedetails#');
      this.getMovieDetailResult = await result;

      // updatetags
      this.title.setTitle(`${this.getMovieDetailResult.original_title} | ${this.getMovieDetailResult.tagline}`);
      this.meta.updateTag({ name: 'title', content: this.getMovieDetailResult.original_title });
      this.meta.updateTag({ name: 'description', content: this.getMovieDetailResult.overview });

      // facebook
      this.meta.updateTag({ property: 'og:type', content: "website" });
      this.meta.updateTag({ property: 'og:url', content: `` });
      this.meta.updateTag({ property: 'og:title', content: this.getMovieDetailResult.original_title });
      this.meta.updateTag({ property: 'og:description', content: this.getMovieDetailResult.overview });
      this.meta.updateTag({ property: 'og:image', content: `https://image.tmdb.org/t/p/original/${this.getMovieDetailResult.backdrop_path}` });

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


  likeComment(commentId: number): void {
    this.service.likeComment(commentId).subscribe({
      next: () => {
        // Atualize a lista de comentários ou o estado do comentário específico conforme necessário
        this.fetchComments();
      },
      error: (error) => console.error('Erro ao curtir o comentário', error)
    });
  }


  dislikeComment(commentId: number): void {
    this.service.dislikeComment(commentId).subscribe({
      next: () => {
        // Atualize a lista de comentários ou o estado do comentário específico conforme necessário
        this.fetchComments();
      },
      error: (error) => console.error('Erro ao curtir o comentário', error)
    });
  }

  removeLike(commentId: number): void {
    this.service.removeLikeFromComment(commentId).subscribe(() => {
      // Atualize a interface do usuário aqui
      const comment = this.comments.find(c => c.id === commentId);
      if (comment) {
        comment.likesCount--;
        comment.hasLiked = false;
      }
    });
  }

  removeDislike(commentId: number): void {
    this.service.removeDislikeFromComment(commentId).subscribe(() => {
      // Atualize a interface do usuário aqui
      const comment = this.comments.find(c => c.id === commentId);
      if (comment) {
        comment.dislikesCount--;
        comment.hasDisliked = false;
      }
    });
  }

  toggleLikeComment(commentId: number): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      if (comment.hasLiked) {
        // O usuário já curtiu este comentário, então vamos remover o like
        this.service.removeLikeFromComment(commentId).subscribe(() => {
          comment.hasLiked = false;
          comment.likesCount--;
        });
      } else {
        // O usuário ainda não curtiu este comentário, então vamos adicionar o like
        this.service.likeComment(commentId).subscribe(() => {
          comment.hasLiked = true;
          comment.likesCount++;
          // Se já deu dislike antes, remover essa ação
          if (comment.hasDisliked) {
            comment.hasDisliked = false;
            comment.dislikesCount--;
          }
        });
      }
    }
  }

  toggleDislikeComment(commentId: number): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      if (comment.hasDisliked) {
        // O usuário já descurtiu este comentário, então vamos remover o dislike
        this.service.removeDislikeFromComment(commentId).subscribe(() => {
          comment.hasDisliked = false;
          comment.dislikesCount--;
        });
      } else {
        // O usuário ainda não descurtiu este comentário, então vamos adicionar o dislike
        this.service.dislikeComment(commentId).subscribe(() => {
          comment.hasDisliked = true;
          comment.dislikesCount++;
          // Se já deu like antes, remover essa ação
          if (comment.hasLiked) {
            comment.hasLiked = false;
            comment.likesCount--;
          }
        });
      }
    }
  }



}

