import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { AdminService } from '../../../admin/service/admin.service';
import { BehaviorSubject } from 'rxjs';
import { UserRatingMedia } from '../../media-models/UserRatingMedia';
import { FavoriteActor } from '../../media-models/fav-actor';
import { Actor } from '../../media-models/actor';
import { GamificationService } from '../../../gamification/Service/gamification.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent {
  constructor(private service: MovieApiServiceComponent, private router: ActivatedRoute, private title: Title, private meta: Meta, private auth: AuthenticationService, private adminService: AdminService, private gamificationService: GamificationService) {
    this.setUserRole();
  }

  getMovieDetailResult: any;
  getMovieVideoResult: any;
  getMovieCastResult: any;
  getMovieProviders: any;
  showAll: boolean = true;
  type: string = "movie";
  isWatched: boolean = false;
  isToWatchLater: boolean = false;
  actorIsFavorite: boolean = false;

  movieRating = 0;
  averageRating: number = 0;

  currentUser: string | null = null;
  comments: any[] = [];
  showComments: boolean = false;

  private isAdminOrModerator$ = new BehaviorSubject<boolean>(false);
  showReplyForms: { [key: number]: boolean } = {};
  replyTexts: { [key: number]: string } = {};

  userRating: number = 0;
  userFavoriteActorId: number | null = null;
  userFavoriteActor: string | null = null;

  actorVotePercentages: { [actorId: number]: number } = {};

  quizQuestions: any[] = [];
  userAnswers: { [questionId: number]: number } = {};
  quizResult: any;

  quizCompleted: boolean = false;
  isQuizPopupVisible: boolean = false;


  lastQuizScore: any;
  isQuizActive: boolean = false;
  showLastScore: boolean = false


  currentQuestionIndex: number = 0;

  ngOnInit(): void {
    let getParamId = this.router.snapshot.paramMap.get('id');
    this.showAll = false;
    if (getParamId) {
      this.getMovie(getParamId);
      this.getVideo(getParamId);
      this.getMovieCast(getParamId);
      this.getProviders(getParamId);
      this.getMovie(getParamId);
      this.checkIfWatched(getParamId);
      this.checkIfWatchedOnInit(getParamId);
      this.checkIfWatched(getParamId);
      this.checkIfWatchedLater(getParamId);
      this.checkQuizCompleted(getParamId);
    }
    this.auth.user$.subscribe(user => { this.currentUser = user ? user.username.toLowerCase() : null });
    this.loadAverageRatingForMedia(getParamId);
    this.loadUserRatingForMedia(getParamId);
    this.getUserFavoriteActorChoice(getParamId);
    this.getFavoriteActorChoicesForMedia(getParamId);
    this.loadQuizQuestions();
    this.fetchComments();
  }

  // Mostra o pop-up do quiz
  showQuizPopup(): void {
    this.isQuizPopupVisible = true;
    // Resetar respostas e resultado do quiz se necessário
    this.userAnswers = {};
    this.quizResult = null;
    this.loadQuizQuestions();
  }

  // Esconde o pop-up do quiz
  hideQuizPopup(): void {
    this.isQuizPopupVisible = false;
  }


  // Função para ir para a próxima pergunta
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  // Função para voltar para a pergunta anterior
  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
  checkQuizCompleted(mediaId: any): void {
    this.service.checkQuizCompleted(mediaId).subscribe({
      next: (response: any) => { // Agora tratando response como 'any'
        this.quizCompleted = response.hasCompleted;
        this.lastQuizScore = response.score; // Certifique-se de adicionar lastQuizScore na definição de classe do componente
        this.showLastScore = true;
      },
      error: (error) => {
        console.error('Error checking if quiz was completed:', error);
        this.quizCompleted = false;
        this.lastQuizScore = null;
        this.showLastScore = false;
      }
    });
  }

  loadQuizQuestions(): void {
    this.isQuizActive = true;
    this.showLastScore = false;


    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      // Imagine que você já tenha obtido os detalhes da mídia em getMovieDetailResult
      const movieDetails = this.getMovieDetailResult;
      if (movieDetails) {
        // Exemplo de geração de perguntas
        this.quizQuestions = [
          {
            id: 1,
            text: 'Qual é o título original do filme?',
            answers: [
              { id: 1, text: `${movieDetails.original_title}` }, // Resposta correta
              { id: 2, text: 'Arrakis: A New Hope' }, // Inventada
              { id: 3, text: 'The Spice Wars' } // Inventada
            ]
          },
          {
            id: 2,
            text: 'Qual é a receita do filme?',
            answers: [
              { id: 1, text: `${movieDetails.revenue}` }, // Resposta correta
              { id: 2, text: '750000000' }, // Inventada
              { id: 3, text: '900000000' } // Inventada
            ]
          },
          {
            id: 3,
            text: 'Qual foi o orçamento do filme?',
            answers: [
              { id: 1, text: `${movieDetails.budget}` }, // Resposta correta
              { id: 2, text: '120000000' }, // Inventada
              { id: 3, text: '180000000' } // Inventada
            ]
          },
          {
            id: 4,
            text: 'Qual é a data de lançamento do filme?',
            answers: [
              { id: 1, text: `${movieDetails.release_date}` }, // Resposta correta
              { id: 2, text: '2024-03-15' }, // Inventada
              { id: 3, text: '2024-11-22' } // Inventada
            ]
          },
          {
            id: 6,
            text: 'Qual é a tagline do filme?',
            answers: [
              { id: 1, text: movieDetails.tagline }, // Resposta correta
              { id: 2, text: 'A saga continua além das estrelas' }, // Inventada
              { id: 3, text: 'O destino de um mundo em suas mãos' } // Inventada
            ]
          },
          {
            id: 7,
            text: 'Qual é o idioma original do filme?',
            answers: [
              { id: 1, text: movieDetails.original_language === 'en' ? 'Inglês' : movieDetails.original_language }, // Resposta correta
              { id: 2, text: 'Francês' }, // Inventada
              { id: 3, text: 'Alemão' } // Inventada
            ]
          },

          {
            id: 8,
            text: 'Qual é o gênero principal do filme?',
            answers: [
              { id: 1, text: movieDetails.genres[0].name }, // Resposta correta, supondo que o primeiro gênero é o principal
              { id: 2, text: 'Comédia' }, // Inventada
              { id: 3, text: 'Romance' } // Inventada
            ]
          },
          {
            id: 9,
            text: 'Qual é a duração do filme (em minutos)?',
            answers: [
              { id: 1, text: `${movieDetails.runtime}` }, // Resposta correta
              { id: 2, text: '142' }, // Inventada
              { id: 3, text: '156' } // Inventada
            ]
          }
          // Adicione mais perguntas conforme necessário
        ];
      }
    }
  }


  // Simula a geração de perguntas e respostas do quiz
  submitQuiz(): void {
    this.isQuizActive = false; // O quiz foi concluído
    this.quizCompleted = true; // Indica que o quiz foi completado
    let correctAnswers = 0;

    this.quizQuestions.forEach(question => {
      const userAnswer = this.userAnswers[question.id];
      let correctAnswerId;

      switch (question.id) {
        case 1: // Título original
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getMovieDetailResult.original_title)?.id;
          break;
        case 2: // Receita
          correctAnswerId = question.answers.find((answer: any) => answer.text === `${this.getMovieDetailResult.revenue}`)?.id;
          break;
        case 3: // Orçamento
          correctAnswerId = question.answers.find((answer: any) => answer.text === `${this.getMovieDetailResult.budget}`)?.id;
          break;
        case 4: // Data de lançamento
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getMovieDetailResult.release_date)?.id;
          break;
        case 6: // Tagline
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getMovieDetailResult.tagline)?.id;
          break;
        case 7: // Idioma original
          correctAnswerId = question.answers.find((answer: any) => answer.text === (this.getMovieDetailResult.original_language === 'en' ? 'Inglês' : this.getMovieDetailResult.original_language))?.id;
          break;
        case 8: // Gênero principal
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getMovieDetailResult.genres[0].name)?.id;
          break;
        case 9: // Duração
          correctAnswerId = question.answers.find((answer: any) => answer.text === `${this.getMovieDetailResult.runtime}`)?.id;
          break;
        // Adicione mais casos conforme necessário
      }
      if (userAnswer === correctAnswerId) {
        correctAnswers++;
      }
    });

    this.quizResult = { correctAnswers, totalQuestions: this.quizQuestions.length };


    // Preparando os dados para enviar ao back-end
    const quizAttempt = {
      mediaId: this.getMovieDetailResult.id,
      score: correctAnswers
      // Você pode incluir mais dados aqui, como as respostas do usuário
    };
    this.lastQuizScore = quizAttempt.score;
    this.hideQuizPopup();

    // Chamando o serviço para enviar os dados ao back-end
    this.service.submitQuizAttempt(quizAttempt).subscribe({
      next: (result) => console.log(result),
      error: (error) => console.error('Erro ao enviar tentativa do quiz', error)
    });
  }


  selectAnswer(questionId: number, answerId: number): void {
    this.userAnswers[questionId] = answerId;
  }


  //toggleFavorite(selectedActor: any): void {
  //  if (selectedActor.isFavorite) {
  //    selectedActor.isFavorite = false;
  //    return;
  //  }
  //  this.checkIfWatchedLater(getParamId);

  //  this.auth.user$.subscribe(user => {
  //    this.currentUser = user ? user.username.toLowerCase() : null;
  //    this.fetchComments(); 
  //  });

  //  this.loadAverageRatingForMedia(getParamId);
  //  this.loadUserRatingForMedia(getParamId);

  //  this.getFavoriteActorChoicesForMedia(getParamId);
  //  this.getUserFavoriteActorChoice(getParamId);
  //}

  setUserRole(): void {
    const username = this.auth.getLoggedInUserName();
    if (username) {
      this.adminService.getUserRole(username).subscribe(roles => {
        this.isAdminOrModerator$.next(roles.includes('Admin') || roles.includes('Moderator'));
      });
    }
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
            if (this.currentUser) {
              this.gamificationService.awardMedal(this.currentUser, 'Primeiro Filme').subscribe({
                next: (response) => {
                  // Handle the response, maybe show a success message
                  console.log('Medal awarded successfully:', response);
                },
                error: (error) => {
                  // Handle errors, maybe show an error message
                  console.error('Failed to award medal:', error);
                }
              });
            } else {
              console.error('Current user is null, cannot award medal.');
            }
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
    const isCurrentUser = this.currentUser.toLowerCase() === commentUserName.toLowerCase();
    const isAdminOrModerator = this.isAdminOrModerator$.getValue();
    return isCurrentUser || isAdminOrModerator;
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
        this.getFavoriteActorChoicesForMedia(this.getMovieDetailResult.id);
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

