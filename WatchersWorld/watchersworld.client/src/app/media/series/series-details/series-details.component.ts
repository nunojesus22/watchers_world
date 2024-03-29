import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';
import { BehaviorSubject } from 'rxjs';
import { AdminService } from '../../../admin/service/admin.service';
import { UserRatingMedia } from '../../media-models/UserRatingMedia';
import { Actor } from '../../media-models/actor';

@Component({
  selector: 'app-series-details',
  templateUrl: './series-details.component.html',
  styleUrl: './series-details.component.css'
})
export class SeriesDetailsComponent {
  constructor(private service: MovieApiServiceComponent, private router: ActivatedRoute, private title: Title, private meta: Meta, private auth: AuthenticationService, private adminService: AdminService) {
    this.setUserRole();
  }
  getSerieDetailsResult: any;
  getSerieVideoResult: any;
  getMovieCastResult: any;
  getMovieProviders: any;
  showAll: boolean = true;
  type: string = "serie";
  isFavorite: boolean = false;
  isWatched: boolean = false; 
  isToWatchLater: boolean = false;
  actorIsFavorite: boolean = false;
  comments: any[] = [];
  showComments: boolean = false;
  currentUser: string | null = null;

  private isAdminOrModerator$ = new BehaviorSubject<boolean>(false);

  movieRating = 0;
  averageRating: number = 0;
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
  showLastScore: boolean = false;
  currentQuestionIndex: number = 0;
  commentId: string | null = null;

  ngOnInit(): void {
    let getParamId = this.router.snapshot.paramMap.get('id');
    console.log(getParamId, 'getparamid#');
    this.showAll = false;
    if (getParamId) {
      this.getMovie(getParamId);
      this.getVideo(getParamId);
      this.getSerieCast(getParamId);
      this.getSerieProviders(getParamId);
      this.checkIfFavorite(getParamId);
      this.checkIfWatched(getParamId);
      this.checkIfWatchedLater(getParamId);
      this.checkQuizCompleted(getParamId);
    }
    this.auth.user$.subscribe(user => { this.currentUser = user ? user.username.toLowerCase() : null });
    this.loadAverageRatingForMedia(getParamId);
    this.loadUserRatingForMedia(getParamId);
    this.getUserFavoriteActorChoice(getParamId);
    this.getFavoriteActorChoicesForMedia(getParamId);
    this.fetchComments();
    this.loadQuizQuestions();

    this.router.queryParams.subscribe(params => {
      const commentId = params['commentId'];
      if (commentId) {
        setTimeout(() => {
          this.scrollToComment(commentId);
        }, 100);
      }
    });
  }

  // Método para fazer scroll até o comentário
  scrollToComment(commentId: string): void {
    const commentElement = document.getElementById(`comment-${commentId}`);
    commentElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      // Imagine que você já tenha obtido os detalhes da mídia em getSerieDetailsResult
      const movieDetails = this.getSerieDetailsResult;
      if (movieDetails) {
        this.quizQuestions = [
          {
            id: 1,
            text: 'Qual é o título original da serie?',
            answers: [
              { id: 1, text: `${movieDetails.original_name}` }, // Resposta correta
              { id: 2, text: 'Arrakis: A New Hope' }, // Inventada
              { id: 3, text: 'The Spice Wars' } // Inventada
            ]
          },
          {
            id: 2,
            text: 'Qual é o numero total de episodios da serie?',
            answers: [
              { id: 1, text: `${movieDetails.number_of_episodes}` }, // Resposta correta
              { id: 2, text: '12' }, // Inventada
              { id: 3, text: '50' } // Inventada
            ]
          },
          {
            id: 3,
            text: 'Qualé o numero total de temporadas da serie?',
            answers: [
              {
                id: 1, text: `${movieDetails.number_of_seasons}`
              },
              { id: 2, text: '4' },
              { id: 3, text: '7' }
            ]
          },
          {
            id: 4,
            text: 'Qual é a data de lançamento da serie?',
            answers: [
              { id: 1, text: `${movieDetails.last_air_date}` },
              { id: 2, text: '2024-03-15' }, // Inventada
              { id: 3, text: '2024-11-22' } // Inventada
            ]
          },
          {
            id: 5,
            text: 'Qual é o gênero principal do filme?',
            answers: [
              { id: 1, text: movieDetails.genres[0].name }, // Resposta correta, supondo que o primeiro gênero é o principal
              { id: 2, text: 'Comédia' }, // Inventada
              { id: 3, text: 'Romance' } // Inventada
            ]
          },
          {
            id: 6,
            text: 'Qual é o idioma original do filme?',
            answers: [
              { id: 1, text: movieDetails.original_language === 'en' ? 'Inglês' : movieDetails.original_language }, // Resposta correta
              { id: 2, text: 'Francês' }, // Inventada
              { id: 3, text: 'Alemão' } // Inventada
            ]
          },


          {
            id: 7,
            text: 'A série continua em produção?',
            answers: [
              { id: 1, text: movieDetails.in_production ? 'Sim' : 'Não' }, // Resposta correta, com base no estado da produção
              { id: 2, text: movieDetails.in_production ? 'Não' : 'Sim' }  // Opção incorreta
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
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getSerieDetailsResult.original_name)?.id;
          break;
        case 2: // Receita
          correctAnswerId = question.answers.find((answer: any) => answer.text === `${this.getSerieDetailsResult.number_of_episodes}`)?.id;
          break;
        case 3: // Orçamento
          correctAnswerId = question.answers.find((answer: any) => answer.text === `${this.getSerieDetailsResult.number_of_seasons}`)?.id;
          break;
        case 4: // Data de lançamento
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getSerieDetailsResult.last_air_date)?.id;
          break;
        case 5: // Tagline
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getSerieDetailsResult.genres[0].name)?.id;
          break;
        case 6: // Idioma original
          correctAnswerId = question.answers.find((answer: any) => answer.text === (this.getSerieDetailsResult.original_language === 'en' ? 'Inglês' : this.getSerieDetailsResult.original_language))?.id;
          break;
        case 7:
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getSerieDetailsResult.in_production ? answer.text === 'Sim' : answer.text === 'Não')?.id;
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
      mediaId: this.getSerieDetailsResult.id,
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
  //}

  setUserRole(): void {
    const username = this.auth.getLoggedInUserName();
    if (username) {
      this.adminService.getUserRole(username).subscribe(roles => {
        this.isAdminOrModerator$.next(roles.includes('Admin') || roles.includes('Moderator'));
      });
    }
  }

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

  getMovie(id: any) {
    this.service.getSerieDetails(id).subscribe(async (result) => {
      console.log(result, 'getseriedetails#');
      this.getSerieDetailsResult = await result;


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

  checkIfFavorite(mediaId: any) {
    this.service.checkIfIsFavorite(mediaId, this.type).subscribe({
      next: (response: any) => {
        this.isFavorite = response.isFavorite;
      },
      error: (error) => {
        console.error('Erro ao verificar se a mídia é favorita', error);
      }
    });
  }

  toggleFavoriteMedia() {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (!mediaId) {
      console.error('ID de mídia não encontrado');
      return;
    }

    if (this.isFavorite) {
      this.unmarkAsFavorite();
    } else {
      this.markAsFavorite();
    }
  }


  markAsFavorite() {
    if (!this.isWatched) {
      alert('Você precisa marcar a mídia como assistida antes de adicioná-la aos favoritos.');
      return;
    }
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      // Chama o serviço para marcar como favorito
      this.service.markMediaAsFavorite(+mediaId, this.type).subscribe({
        next: (response) => {
          this.isFavorite = true;
          console.log('Mídia adicionada aos favoritos com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao marcar a mídia como favorita', error);
        }
      });
    }
  }

  unmarkAsFavorite() {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.service.unmarkMediaAsFavorite(+mediaId, this.type).subscribe({
        next: (response) => {
          this.isFavorite = false;
          console.log('Mídia removida dos favoritos com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao desmarcar a mídia como favorita', error);
        }
      });
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
            this.isWatched = true;
            this.showComments = true;
          },
          error: (error) => {
            console.error('Erro ao marcar filme como assistido', error);
          }
        });
      } else {
        this.service.unmarkMediaAsWatched(+mediaId, this.type).subscribe({
          next: (result) => {
            this.checkIfWatched(mediaId);
            this.checkIfWatchedLater(mediaId);
            this.unmarkAsFavorite();
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

  getMostLikedComments(mediaId: any): void {
    this.service.getMostLikedComments(mediaId).subscribe({
      next: (response: any) => {
        this.comments = response;
      },
      error: (error) => {
        console.error('Erro ao buscar comentários mais curtidos', error);
      }
    });
  }

  fetchMostLikedComments(): void {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.getMostLikedComments(+mediaId);
    }
  }

  getMostOldComments(mediaId: any): void {
    this.service.getCommentsSortedByDate(mediaId).subscribe({
      next: (response: any) => {
        this.comments = response;
      },
      error: (error) => {
      }
    });
  }

  fetchCommentsSortedByDate(): void {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.getMostOldComments(+mediaId);
    }
  }

  sortComments(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;

    if (!selectElement.value) {
      console.error('Valor de ordenação é nulo');
      return;
    }

    let mediaId = this.router.snapshot.paramMap.get('id');
    if (!mediaId) {
      console.error('ID de mídia não encontrado');
      return;
    }

    switch (selectElement.value) {
      case 'recentes':
        this.fetchComments();
        break;
      case 'likes':
        this.fetchMostLikedComments();
        break;
      case 'antigos':
        this.fetchCommentsSortedByDate();
        break;
      default:
        console.error('Opção de ordenação desconhecida:', selectElement.value);
    }
  }

  newCommentText: string = '';

  addComment(): void {
    if (!this.newCommentText.trim()) {
      return; // Verifica se o comentário não está vazio
    }

    const mediaId = this.getSerieDetailsResult.id;
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
        // The user already liked this comment, so we will remove the like
        this.service.removeLikeFromComment(commentId).subscribe(() => {
          comment.hasLiked = false;
          comment.likesCount--;
          this.fetchComments(); // Refresh comments to update UI
        });
      } else {
        // The user has not liked this comment yet, so we will add a like
        this.service.likeComment(commentId).subscribe(() => {
          comment.hasLiked = true;
          comment.likesCount++;
          if (comment.hasDisliked) {
            comment.hasDisliked = false;
            comment.dislikesCount--;
          }
          this.fetchComments(); // Refresh comments to update UI
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
  // Este é um exemplo, ajuste conforme sua lógica e nomes de propriedades
  showReplyForms: { [key: number]: boolean } = {};
  replyTexts: { [key: number]: string } = {};

  toggleReplyForm(commentId: number): void {
    // Isso alternará a exibição do formulário de resposta para um determinado comentário.
    this.showReplyForms[commentId] = !this.showReplyForms[commentId];
    // Garantir que um campo de texto esteja disponível para novas respostas.
    if (this.replyTexts[commentId] === undefined) {
      this.replyTexts[commentId] = '';
    }
  }


  addReply(parentCommentId: number): void {
    // Garanta que existe um texto de resposta para evitar erro de 'undefined'
    const replyText = this.replyTexts[parentCommentId] || '';
    if (!replyText.trim()) {
      return; // Verifica se a resposta não está vazia
    }

    const mediaId = this.getSerieDetailsResult.id;
    this.service.addCommentReply(parentCommentId, mediaId, replyText).subscribe({
      next: () => {
        this.fetchComments(); // Atualize os comentários para incluir a nova resposta
        this.replyTexts[parentCommentId] = ''; // Limpe o campo de texto da resposta
        // Se estiver usando um objeto para controlar os formulários de resposta:
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
        Media: { mediaId: this.getSerieDetailsResult.id, type: "serie" },
      };
      this.service.giveRatingToMedia(userRatingMedia).subscribe({
        next: (response) => {
          //console.log('Avaliação enviada com sucesso', response);
          this.userRating = response;
          this.loadAverageRatingForMedia(this.getSerieDetailsResult.id);
          this.loadUserRatingForMedia(this.getSerieDetailsResult.id);
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
    if (!this.actorIsFavorite) {
      this.chooseFavoriteActor(actor);
    } else {
      console.log('Ator já é favorito');
    }
  }

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
        MediaId: this.getSerieDetailsResult.id,
        Type: this.type
      },
      MediaCast: [mediaCast]
    };

    //console.log(favoriteActorChoice);

    this.service.chooseAnActor(favoriteActorChoice).subscribe({
      next: (response) => {
        this.userFavoriteActorId = favoriteActorChoice.ActorChoiceId;
        this.updateFavoriteActorStatus(favoriteActorChoice.ActorChoiceId);
        this.getFavoriteActorChoicesForMedia(this.getSerieDetailsResult.id);
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
      });
    }
  }

  isFavoriteActor(actorId: number): boolean {
    return actorId === this.userFavoriteActorId;
  }

}
