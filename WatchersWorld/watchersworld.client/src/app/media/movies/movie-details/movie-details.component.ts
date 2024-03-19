import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { UserRatingMedia } from '../../media-models/UserRatingMedia';
import { FavoriteActor } from '../../media-models/fav-actor';
import { Actor } from '../../media-models/actor';

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
  actorIsFavorite: boolean = false;

  movieRating = 0;
  averageRating: number = 0;

  currentUser: string | null = null;
  comments: any[] = [];
  showComments: boolean = false;

  showReplyForms: { [key: number]: boolean } = {};
  replyTexts: { [key: number]: string } = {};

  userRating: number = 0;
  userFavoriteActorId: number | null = null;
  userFavoriteActor: string | null = null;

  actorVotePercentages: { [actorId: number]: number } = {};


  ngOnInit(): void {
    let getParamId = this.router.snapshot.paramMap.get('id');
    this.showAll = false;
    this.getMovie(getParamId);
    this.getVideo(getParamId);
    this.getMovieCast(getParamId);
    this.getProviders(getParamId);
    this.getMovie(getParamId);
    this.checkIfWatched(getParamId);
    if (getParamId) {
      this.checkIfWatchedOnInit(getParamId);
    }
    this.checkIfWatchedLater(getParamId);

    this.auth.user$.subscribe(user => {
      this.currentUser = user ? user.username.toLowerCase() : null;
      this.fetchComments();
    });

    this.loadAverageRatingForMedia(getParamId);
    this.loadUserRatingForMedia(getParamId);

    this.getFavoriteActorChoicesForMedia(getParamId);
    this.getUserFavoriteActorChoice(getParamId);

  }

  /* VISUALIZADO */

  checkIfWatchedOnInit(mediaId: string) {
    this.service.checkIfWatched(+mediaId, this.type).subscribe({
      next: (response) => {
        this.isWatched = response.isWatched;
        this.showComments = this.isWatched;
      },
      error: (error) => {
        console.error('Erro ao verificar se a mídia foi assistida', error);
      }
    });
  }

  checkIfWatched(mediaId: any) {
    this.service.checkIfWatched(mediaId, this.type).subscribe({
      next: (response: any) => {
        this.isWatched = response.isWatched;
      },
      error: (error) => {
        console.error('Erro ao verificar se a mídia foi assistida', error);
      }
    });
  }

  markAsWatched() {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      if (!this.isWatched) {
        this.service.markMediaAsWatched(+mediaId, this.type).subscribe({
          next: () => {
            this.checkIfWatched(mediaId);
            this.checkIfWatchedLater(mediaId);
            this.isWatched = true;
            this.showComments = true;
          },
          error: (error) => {
            console.error('Erro ao marcar filme como assistido', error);
          }
        });
      } else {
        this.service.unmarkMediaAsWatched(+mediaId, this.type).subscribe({
          next: () => {
            this.checkIfWatched(mediaId);
            this.checkIfWatchedLater(mediaId);
            this.isWatched = false;
            this.showComments = false;
          },
          error: (error) => {
            console.error('Erro ao desmarcar filme como assistido', error);
          }
        });
      }
    }
  }

  /* VER MAIS TARDE */

  checkIfWatchedLater(mediaId: any) {
    this.service.checkIfWatchedLater(mediaId, this.type).subscribe({
      next: (response: any) => {
        this.isToWatchLater = response.isToWatchLater;
      },
      error: (error) => {
        console.error('Erro ao verificar se a mídia foi assistida', error);
      }
    });
  }

  markToWatchLater() {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      if (!this.isToWatchLater) {
        this.service.markMediaToWatchLater(+mediaId, this.type).subscribe({
          next: (result) => {
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

  getMovie(id: any) {
    this.service.getMovieDetails(id).subscribe(async (result) => {
      console.log(result, 'getmoviedetails#');
      this.getMovieDetailResult = await result;

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


  public convertMinutesToHours(time: number): string {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}h ${minutes}min`;
  }

  public convertToPercentage(points: number): string {
    const pointsPercentage = Math.round(points * 10);
    return `${pointsPercentage}%`;
  }

  public formatCurrency(value?: number): string {
    if (value) {
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else {
      return '-';
    }
  }

  toggleComents() {
    this.showComments = !this.showComments;
  }

  getComments(mediaId: any): void {
    this.service.getMediaComments(mediaId).subscribe({
      next: (response: any) => {
        this.comments = response;
        //console.log('Comentários:', this.comments);
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
        this.comments = comments.reverse();
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
        this.comments.unshift(newComment);
        this.newCommentText = '';
        this.fetchComments();
      },
      error: (error) => {
        console.error('Erro ao adicionar comentário', error);
      }
    });
  }

  canDeleteComment(commentUserName: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.toLowerCase() === commentUserName.toLowerCase();
  }


  deleteComment(commentId: number, parentCommentId?: number): void {
    this.service.deleteComment(commentId).subscribe({
      next: () => {
//console.log('Comentário deletado com sucesso');
        if (parentCommentId) {
          const parentComment = this.comments.find((c: any) => c.id === parentCommentId);
          if (parentComment && parentComment.replies) {
            parentComment.replies = parentComment.replies.filter((reply: any) => reply.id !== commentId);
          }
        } else {
          this.comments = this.comments.filter((comment: any) => comment.id !== commentId);
        }
      },
      error: error => {
        console.error('Erro ao deletar o comentário', error);
      }
    });
  }



  likeComment(commentId: number): void {
    this.service.likeComment(commentId).subscribe({
      next: () => {
        this.fetchComments();
      },
      error: (error) => console.error('Erro ao curtir o comentário', error)
    });
  }


  //dislikeComment(commentId: number): void {
  //  this.service.dislikeComment(commentId).subscribe({
  //    next: () => {
  //      // Atualize a lista de comentários ou o estado do comentário específico conforme necessário
  //      this.fetchComments();
  //    },
  //    error: (error) => console.error('Erro ao curtir o comentário', error)
  //  });
  //}

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

  //removeDislike(commentId: number): void {
  //  this.service.removeDislikeFromComment(commentId).subscribe(() => {
  //    // Atualize a interface do usuário aqui
  //    const comment = this.comments.find(c => c.id === commentId);
  //    if (comment) {
  //      comment.dislikesCount--;
  //      comment.hasDisliked = false;
  //    }
  //  });
  //}

  toggleLikeComment(commentId: number, parentCommentId?: number): void {
    let commentList = this.comments;
    if (parentCommentId) {
      const parentComment = this.comments.find(c => c.id === parentCommentId);
      if (parentComment) {
        commentList = parentComment.replies;
      }
    }

    const comment = commentList.find(c => c.id === commentId);
    if (comment) {
      if (comment.hasLiked) {
        this.service.removeLikeFromComment(commentId).subscribe(() => {
          comment.hasLiked = false;
          comment.likesCount--;
          this.fetchComments();
        });
      } else {
        this.service.likeComment(commentId).subscribe(() => {
          comment.hasLiked = true;
          comment.likesCount++;
          if (comment.hasDisliked) {
            comment.hasDisliked = false;
            comment.dislikesCount--;
          }
          this.fetchComments();
        });
      }
    }
  }

  //toggleDislikeComment(commentId: number, parentCommentId?: number): void {
  //  let commentList = this.comments;
  //  if (parentCommentId) {
  //    const parentComment = this.comments.find(c => c.id === parentCommentId);
  //    if (parentComment) {
  //      commentList = parentComment.replies;
  //    }
  //  }

  //  const comment = commentList.find(c => c.id === commentId);
  //  if (comment) {
  //    if (comment.hasDisliked) {
  //      // The user already disliked this comment, so we will remove the dislike
  //      this.service.removeDislikeFromComment(commentId).subscribe(() => {
  //        comment.hasDisliked = false;
  //        comment.dislikesCount--;
  //        this.fetchComments(); // Refresh comments to update UI
  //      });
  //    } else {
  //      // The user has not disliked this comment yet, so we will add a dislike
  //      this.service.dislikeComment(commentId).subscribe(() => {
  //        comment.hasDisliked = true;
  //        comment.dislikesCount++;
  //        if (comment.hasLiked) {
  //          comment.hasLiked = false;
  //          comment.likesCount--;
  //        }
  //        this.fetchComments(); // Refresh comments to update UI
  //      });
  //    }
  //  }
  //}



  toggleReplyForm(commentId: number): void {
    this.showReplyForms[commentId] = !this.showReplyForms[commentId];
    if (this.replyTexts[commentId] === undefined) {
      this.replyTexts[commentId] = '';
    }
  }


  addReply(parentCommentId: number): void {
    const replyText = this.replyTexts[parentCommentId] || '';
    if (!replyText.trim()) {
    }

    const mediaId = this.getMovieDetailResult.id;
    this.service.addCommentReply(parentCommentId, mediaId, replyText).subscribe({
      next: () => {
        this.fetchComments();
        this.replyTexts[parentCommentId] = '';
        if (this.showReplyForms) this.showReplyForms[parentCommentId] = false;
      },
      error: (error) => console.error('Erro ao adicionar resposta ao comentário', error)
    });
  }

  // RATINGS

  setUserRatingForMedia(rating: number): void {
    if (this.currentUser) {
      const userRatingMedia: UserRatingMedia = {
        Rating: rating,
        Username: this.currentUser,
        Media: { mediaId: this.getMovieDetailResult.id, type: "movie" },
      };
      this.service.giveRatingToMedia(userRatingMedia).subscribe({
        next: (response) => {
          //console.log('Avaliação enviada com sucesso', response);
          this.userRating = response;
          this.loadAverageRatingForMedia(this.getMovieDetailResult.id);
          this.loadUserRatingForMedia(this.getMovieDetailResult.id);
        },
        error: (error) => {
          console.error('Erro ao enviar a avaliação', error);
        }
      });
    } else {
      console.error('Usuário não está logado.');
    }
  }

  rateMovie(rating: number): void {
    this.movieRating = rating;
    this.setUserRatingForMedia(rating);
  }

  loadUserRatingForMedia(mediaId: any): void {
    if (this.currentUser) {
      this.service.getUserRatingForMedia(this.currentUser, mediaId).subscribe({
        next: (rating) => {
          if (rating) {
            this.userRating = rating;
            //console.log('Classificação recebida', rating);
          } else {
            //console.log('Não existem classificações feitas pelo usuário para esta mídia.');
          }
        },
        error: (error) => {
          console.error('Erro ao obter a classificação', error);
        }
      });
    }

  }

  loadAverageRatingForMedia(mediaId: any): void {
    this.service.getAverageRatingForMedia(mediaId).subscribe({
      next: (averageRating) => {
        if (averageRating) {
          this.averageRating = averageRating.toFixed(2);
          //console.log('Classificação média recebida', averageRating);
        } else {
          //console.log('Não existem classificações médias para esta mídia.');
        }
      },
      error: (error) => {
        console.error('Erro ao obter a classificação média', error);
      }
    });
  }

  // ATORES

  toggleFavorite(actor: Actor): void {
    if (!this.actorIsFavorite) { // Supondo que você tem uma propriedade isFavorite em seus atores
      this.chooseFavoriteActor(actor);
    } else {
      // Se o ator já for favorito, decide o que fazer aqui
      console.log('Ator já é favorito');
    }
  }




  // Método para obter as escolhas de atores favoritos para a mídia atual
  getFavoriteActorChoicesForMedia(mediaId: any): void {
    this.service.getActorChoicesForMedia(mediaId).subscribe({
      next: (choices) => {
        this.actorVotePercentages = {}; 
        choices.forEach((choice: { actorId: number; percentage: number }) => {
          this.actorVotePercentages[choice.actorId] = choice.percentage;
        });
        //console.log('Escolhas de atores favoritos para a mídia recebidas:', choices);
      },
      error: (error) => {
        console.error('Erro ao obter escolhas de atores favoritos para a mídia:', error);
      }
    });
  }


  getUserFavoriteActorChoice(mediaId: any): void {
    if (this.currentUser /*&& this.isWatched*/) {
      this.service.getUserActorChoice(this.currentUser, mediaId).subscribe({
        next: (response) => {
          //console.log(response);
          if (response) { 
            //console.log('Escolha de ator favorito do usuário recebida:', response);
            this.updateFavoriteActorStatus(response);
            this.userFavoriteActorId = response;
          } else {
            //console.log('Usuário ainda não escolheu um ator favorito para esta mídia.');
          }
        },
        error: (error) => {
          console.error('Erro ao obter a escolha do ator favorito do usuário:', error);
        }
      });
    }
  }

  chooseFavoriteActor(selectedActor: Actor): void {
    if (!this.currentUser) {
      return;
    }

    const mediaCast = {
      ActorId: selectedActor.id,
      ActorName: selectedActor.name
    };

    const favoriteActorChoice = {
      Username: this.currentUser,
      ActorChoiceId: selectedActor.id,
      Media: {
        MediaId: this.getMovieDetailResult.id,
        Type: this.type
      },
      MediaCast: [mediaCast]
    };

    //console.log(favoriteActorChoice);

    this.service.chooseAnActor(favoriteActorChoice).subscribe({
      next: (response) => {
        this.userFavoriteActorId = favoriteActorChoice.ActorChoiceId;
        this.updateFavoriteActorStatus(favoriteActorChoice.ActorChoiceId);
      },
      error: (error) => {
        console.error('Erro ao escolher ator favorito:', error);
      }
    });
  }

  // Função para atualizar o status de favorito do ator na UI
  updateFavoriteActorStatus(selectedActorId: number): void {
    if (this.getMovieCastResult) {
      this.getMovieCastResult.forEach((actor: any) => {
        this.actorIsFavorite = actor.id === selectedActorId;
        //console.log(this.actorIsFavorite);
      });
    }
  }

  isFavoriteActor(actorId: number): boolean {
    return actorId === this.userFavoriteActorId;
  }


}

