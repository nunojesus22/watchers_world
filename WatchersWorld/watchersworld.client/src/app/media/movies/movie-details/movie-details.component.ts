import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { AdminService } from '../../../admin/service/admin.service';
import { BehaviorSubject } from 'rxjs';
import { UserRatingMedia } from '../../media-models/UserRatingMedia';
import { FavoriteActor } from '../../media-models/fav-actor';
import { Actor } from '../../media-models/actor';
import { GamificationService } from '../../../gamification/Service/gamification.service';
import { UserMedia } from '../../../profile/models/user-media';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})

/**
 * MovieDetailsComponent Classe
 */
export class MovieDetailsComponent {
  constructor(private service: MovieApiServiceComponent,private route:Router,private router: ActivatedRoute, private title: Title, private meta: Meta, public auth: AuthenticationService, private adminService: AdminService, private gamificationService: GamificationService) {
    this.setUserRole();
  }

  getMovieDetailResult: any;
  getMovieVideoResult: any;
  getMovieCastResult: any;
  getMovieProviders: any;
  showAll: boolean = true;
  type: string = "movie";
  isFavorite: boolean = false;
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

  /** Método executado quando o componente é inicializado. */
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
      this.checkIfFavorite(getParamId);
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

    this.router.queryParams.subscribe(params => {
      const commentId = params['commentId'];
      if (commentId) {
        setTimeout(() => {
          this.scrollToComment(commentId);
        }, 100);
      }
    });
  }
  /** Método Redirecionar para a página de login e normal do botão. */
  handleMarkAsWatched() {
    this.auth.user$.subscribe(user => {
      if (user) {
        // Lógica normal do botão
        this.markAsWatched();
      } else {
        // Redirecionar para a página de login
        this.route.navigate(['/account/login']);
      }
    });
  }

  /** Método Redirecionar para a página de login e normal do botão. */
  handleMarkToWatchLater() {
    this.auth.user$.subscribe(user => {
      if (user) {
        // Lógica normal do botão
        this.markToWatchLater();
      } else {
        // Redirecionar para a página de login
        this.route.navigate(['/account/login']);
      }
    });
  }

/**
 * Método para rolar a página até um comentário específico.
 * @param commentId O ID do comentário para o qual rolar a página.
 */
  scrollToComment(commentId: string): void {
    const commentElement = document.getElementById(`comment-${commentId}`);
    commentElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


/**
 * Mostra o pop-up do quiz na interface do utilizador.
 * Isso também redefine as respostas do utilizador e o resultado do quiz, se necessário,
 * e carrega as perguntas do quiz.
 */
  showQuizPopup(): void {
    this.isQuizPopupVisible = true;
    // Resetar respostas e resultado do quiz se necessário
    this.userAnswers = {};
    this.quizResult = null;
    this.loadQuizQuestions();
  }


/**
 * Esconde o pop-up do quiz na interface do utilizador.
 */
  hideQuizPopup(): void {
    this.isQuizPopupVisible = false;
  }


/**
 * Avança para a próxima pergunta no quiz, se disponível.
 */
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

/**
 * Retorna para a pergunta anterior no quiz, se disponível.
 */
  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  /**
 * Verifica se o quiz associado a um determinado ID de mídia foi concluído.
 * @param mediaId O ID da mídia para a qual verificar se o quiz foi concluído.
 * @remarks Este método atualiza as propriedades 'quizCompleted', 'lastQuizScore' e 'showLastScore' do componente.
 */
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

  /**
 * Carrega as perguntas do quiz com base nos detalhes do filme associado ao ID da mídia.
 * Este método define a propriedade 'quizQuestions' do componente com as perguntas do quiz.
 * @remarks Este método depende de 'getMovieDetailResult' para obter os detalhes do filme.
 */
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


/**
 * Simula a submissão do quiz, calculando o número de respostas corretas e enviando os resultados para o backend.
 * Este método define a propriedade 'quizCompleted' como verdadeira e atualiza 'quizResult' e 'lastQuizScore' com os resultados do quiz.
 * @remarks Este método depende de 'getMovieDetailResult' para obter os detalhes do filme e 'userAnswers' para as respostas do utilizador.
 * @remarks Este método chama o serviço 'submitQuizAttempt' para enviar os dados da tentativa do quiz ao backend.
 */
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


    const quizAttempt = {
      mediaId: this.getMovieDetailResult.id,
      score: correctAnswers
    };
    this.lastQuizScore = quizAttempt.score;
    this.hideQuizPopup();

    this.service.submitQuizAttempt(quizAttempt).subscribe({
      next: (result) => console.log(result),
      error: (error) => console.error('Erro ao enviar tentativa do quiz', error)
    });
  }

/**
 * Registra a resposta do utilizador para uma pergunta específica do quiz.
 * @param questionId O ID da pergunta à qual o utilizador está respondendo.
 * @param answerId O ID da resposta selecionada pelo utilizador.
 */
  selectAnswer(questionId: number, answerId: number): void {
    this.userAnswers[questionId] = answerId;
  }

/**
 * Define o papel do utilizador, verificando se é administrador ou moderador e atualizando a propriedade 'isAdminOrModerator$' em conformidade.
 */
  setUserRole(): void {
    const username = this.auth.getLoggedInUserName();
    if (username) {
      this.adminService.getUserRole(username).subscribe(roles => {
        this.isAdminOrModerator$.next(roles.includes('Admin') || roles.includes('Moderator'));
      });
    }
  }

  /**
 * Alterna o estado de favorito de uma mídia, marcando-a ou desmarcando-a como favorita.
 */
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


  /**
 * Verifica se uma determinada mídia é favorita para o utilizador atual.
 * @param mediaId O ID da mídia a ser verificada quanto ao status de favorito.
 */
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

  /**
 * Marca a mídia atual como favorita.
 * Exibe um alerta se a mídia não estiver marcada como assistida e retorna imediatamente.
 * Chama o serviço para marcar a mídia como favorita e atualiza o estado de 'isFavorite' em caso de sucesso.
 */
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

  /**
 * Remove a marcação de favorito da mídia atual.
 * Chama o serviço para desmarcar a mídia como favorita e atualiza o estado de 'isFavorite' em caso de sucesso.
 */
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

/**
 * Verifica se a mídia foi assistida no momento da inicialização do componente.
 * Atualiza o estado de 'isWatched' com base na resposta do serviço.
 */
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

  /**
 * Verifica se a mídia foi assistida.
 * Atualiza o estado de 'isWatched' com base na resposta do serviço.
 */
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

  /**
 * Marca a mídia atual como assistida ou não assistida, dependendo do estado atual.
 * Chama o serviço correspondente para marcar ou desmarcar a mídia como assistida.
 */
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

/**
 * Verifica se a mídia foi marcada como 'Assistir depois'.
 * Atualiza o estado de 'isToWatchLater' com base na resposta do serviço.
 */
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

  /**
 * Marca a mídia atual para assistir mais tarde ou remove a marcação, dependendo do estado atual.
 * Chama o serviço correspondente para marcar ou desmarcar a mídia para assistir mais tarde.
 * Atualiza os estados de 'isWatched' e 'isToWatchLater' após a conclusão da operação.
 */
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

  /**
 * Obtém os detalhes do filme com o ID fornecido.
 * Atualiza o estado de 'getMovieDetailResult' com os detalhes do filme.
 */
  getMovie(id: any) {
    this.service.getMovieDetails(id).subscribe(async (result) => {
      console.log(result, 'getmoviedetails#');
      this.getMovieDetailResult = await result;


    });
  }

  /**
 * Obtém o vídeo associado ao filme com o ID fornecido.
 * Atualiza o estado de 'getMovieVideoResult' com o vídeo do trailer, se disponível.
 */
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

/**
 * Obtém o elenco do filme com o ID fornecido.
 * Atualiza o estado de 'getMovieCastResult' com o elenco do filme.
 */
  getMovieCast(id: any) {
    this.service.getMovieCast(id).subscribe((result) => {
      console.log(result, 'movieCast#');
      this.getMovieCastResult = result.cast;
    });
  }

/**
 * Obtém os provedores de streaming para o filme com o ID fornecido.
 * Atualiza o estado de 'getMovieProviders' com os provedores de streaming disponíveis para o filme.
 */
  getProviders(id: any) {
    this.service.getStreamingProvider(id).subscribe((result) => {
      console.log(result, 'movieProviders#');
      this.getMovieProviders = result.results.PT;
      console.log(result.results.PT, 'portugalProviders');
    });
  }

  /**
 * Converte um tempo dado em minutos para o formato de horas e minutos.
 * @param time O tempo em minutos a ser convertido.
 * @returns Uma string no formato 'horas h minutos min'.
 */
  public convertMinutesToHours(time: number): string {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}h ${minutes}min`;
  }

  /**
 * Converte uma pontuação para uma porcentagem (multiplica por 10).
 * @param points A pontuação a ser convertida.
 * @returns Uma string representando a porcentagem.
 */
  public convertToPercentage(points: number): string {
    const pointsPercentage = Math.round(points * 10);
    return `${pointsPercentage}%`;
  }

  /**
 * Formata um valor numérico como uma string no formato de moeda dos EUA (USD).
 * @param value O valor numérico a ser formatado.
 * @returns Uma string formatada como moeda dos EUA (USD), ou '-' se nenhum valor for fornecido.
 */
  public formatCurrency(value?: number): string {
    if (value) {
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else {
      return '-';
    }
  }

  /**
 * Alterna a visibilidade dos comentários.
 */
  toggleComents() {
    this.showComments = !this.showComments;
  }

  /**
 * Obtém os comentários associados à mídia com o ID fornecido.
 * Atualiza o estado de 'comments' com os comentários recuperados.
 * @param mediaId O ID da mídia para a qual os comentários serão recuperados.
 */
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

  /**
 * Recupera os comentários associados à mídia atualmente exibida.
 * Atualiza o estado de 'comments' com os comentários recuperados, invertendo a ordem para exibir os mais recentes primeiro.
 */
  fetchComments(): void {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.service.getMediaComments(+mediaId).subscribe(comments => {
        this.comments = comments.reverse();
      });
    }
  }


  /**
 * Obtém os comentários mais curtidos associados à mídia com o ID fornecido.
 * Atualiza o estado de 'comments' com os comentários recuperados.
 * @param mediaId O ID da mídia para a qual os comentários mais curtidos serão recuperados.
 */
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


  /**
 * Recupera os comentários mais curtidos associados à mídia atualmente exibida.
 * Atualiza o estado de 'comments' com os comentários recuperados.
 */
  fetchMostLikedComments(): void {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.getMostLikedComments(+mediaId);
    }
  }


  /**
 * Obtém os comentários associados à mídia com o ID fornecido, classificados por data.
 * Atualiza o estado de 'comments' com os comentários recuperados.
 * @param mediaId O ID da mídia para a qual os comentários serão recuperados e classificados por data.
 */
  getMostOldComments(mediaId: any): void {
    this.service.getCommentsSortedByDate(mediaId).subscribe({
      next: (response: any) => {
        this.comments = response;
      },
      error: (error) => {
      }
    });
  }

  /**
 * Recupera os comentários associados à mídia atualmente exibida, classificados por data.
 * Atualiza o estado de 'comments' com os comentários recuperados.
 */
  fetchCommentsSortedByDate(): void {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.getMostOldComments(+mediaId);
    }
  }

  /**
 * Ordena os comentários com base na opção selecionada em um elemento de seleção HTML.
 * Atualiza o estado de 'comments' de acordo com a opção selecionada.
 * @param event O evento de alteração acionado quando o valor do elemento de seleção HTML é alterado.
 */
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


  /**
 * Adiciona um novo comentário à mídia atualmente exibida.
 * O novo comentário é adicionado ao início da lista de comentários e o texto do novo comentário é redefinido.
 */
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

  /**
 * Verifica se o utilizador atual pode excluir o comentário com base no nome de utilizador do autor do comentário.
 * Retorna true se o utilizador atual for o autor do comentário ou se for um administrador ou moderador.
 * @param commentUserName O nome de utilizador do autor do comentário.
 * @returns true se o utilizador atual pode excluir o comentário, caso contrário, false.
 */
  canDeleteComment(commentUserName: string): boolean {
    if (!this.currentUser) return false;
    const isCurrentUser = this.currentUser.toLowerCase() === commentUserName.toLowerCase();
    const isAdminOrModerator = this.isAdminOrModerator$.getValue();
    return isCurrentUser || isAdminOrModerator;
  }

/**
 * Exclui o comentário com o ID fornecido. Se o comentário for uma resposta, ele será removido do array de respostas do comentário pai.
 * Se o comentário não for uma resposta, ele será removido do array de comentários principais.
 * @param commentId O ID do comentário a ser excluído.
 * @param parentCommentId Opcional. O ID do comentário pai, se o comentário a ser excluído for uma resposta.
 */
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


/**
 * Registra um "curtir" no comentário com o ID fornecido.
 * Atualiza a lista de comentários após a operação bem-sucedida.
 * @param commentId O ID do comentário a ser curtido.
 */
  likeComment(commentId: number): void {
    this.service.likeComment(commentId).subscribe({
      next: () => {
        this.fetchComments();
      },
      error: (error) => console.error('Erro ao curtir o comentário', error)
    });
  }


/**
 * Remove o "curtir" do comentário com o ID fornecido.
 * Atualiza a interface do utilizador removendo o "curtir" do comentário correspondente na lista de comentários.
 * @param commentId O ID do comentário do qual o "curtir" será removido.
 */
  removeLike(commentId: number): void {
    this.service.removeLikeFromComment(commentId).subscribe(() => {
      // Atualize a interface do utilizador aqui
      const comment = this.comments.find(c => c.id === commentId);
      if (comment) {
        comment.likesCount--;
        comment.hasLiked = false;
      }
    });
  }

/**
 * Alterna o estado de "curtir" do comentário com o ID fornecido.
 * Atualiza a contagem de curtidas e o estado do comentário após a operação bem-sucedida.
 * @param commentId O ID do comentário cujo estado de "curtir" será alternado.
 * @param parentCommentId (Opcional) O ID do comentário pai, se aplicável (para respostas a comentários).
 */

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




/**
 * Alterna o estado de exibição do formulário de resposta para o comentário com o ID fornecido.
 * @param commentId O ID do comentário para o qual o formulário de resposta será alternado.
 */
  toggleReplyForm(commentId: number): void {
    this.showReplyForms[commentId] = !this.showReplyForms[commentId];
    if (this.replyTexts[commentId] === undefined) {
      this.replyTexts[commentId] = '';
    }
  }

/**
 * Adiciona uma resposta ao comentário pai com o ID fornecido.
 * Atualiza a lista de comentários após a adição bem-sucedida da resposta.
 * @param parentCommentId O ID do comentário pai ao qual a resposta será adicionada.
 */
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

  /**
 * Define a classificação do utilizador para a mídia atual.
 * @param rating A classificação atribuída pelo utilizador para a mídia.
 */
  setUserRatingForMedia(rating: number): void {
    if (this.auth.getLoggedInUserName() !== null) {
      const userRatingMedia: UserRatingMedia = {
        Rating: rating,
        Username: this.auth.getLoggedInUserName()!,
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
      console.error('utilizador não está logado.');
    }
  }

  /**
 * Define a classificação do filme e atualiza a classificação do utilizador.
 * @param rating A classificação atribuída pelo utilizador para o filme.
 */
  rateMovie(rating: number): void {
    this.movieRating = rating;
    this.setUserRatingForMedia(rating);
  }


  /**
 * Carrega a classificação do utilizador para a mídia atual.
 * @param mediaId O ID da mídia para a qual a classificação do utilizador será carregada.
 */
  loadUserRatingForMedia(mediaId: any): void {
    let media: UserMedia = {
      mediaId: mediaId,
      type: "movie"
    };
    if (this.auth.getLoggedInUserName() !== null) {
      this.service.getUserRatingForMedia(this.auth.getLoggedInUserName()!, media).subscribe({
        next: (rating) => {
          if (rating) {
            this.userRating = rating;
            //console.log('Classificação recebida', rating);
          } else {
            //console.log('Não existem classificações feitas pelo utilizador para esta mídia.');
          }
        },
        error: (error) => {
          console.error('Erro ao obter a classificação', error);
        }
      });
    }

  }

  /**
 * Carrega a classificação média para a mídia atual.
 * @param mediaId O ID da mídia para a qual a classificação média será carregada.
 */
  loadAverageRatingForMedia(mediaId: any): void {
    let media: UserMedia = {
      mediaId: mediaId,
      type: "movie"
    };
    this.service.getAverageRatingForMedia(media).subscribe({
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


  /**
 * Alterna o estado de favorito para o ator fornecido.
 * @param actor O ator para o qual o estado de favorito será alternado.
 */
  toggleFavorite(actor: Actor): void {
    if (!this.actorIsFavorite) { // Supondo que você tem uma propriedade isFavorite em seus atores
      this.chooseFavoriteActor(actor);
    } else {
      // Se o ator já for favorito, decide o que fazer aqui
      console.log('Ator já é favorito');
    }
  }




/**
 * Obtém as escolhas de atores favoritos para a mídia atual.
 * @param mediaId O ID da mídia para a qual as escolhas de atores favoritos serão obtidas.
 */
  getFavoriteActorChoicesForMedia(mediaId: any): void {
    let media: UserMedia = {
      mediaId: mediaId,
      type: "movie"
    };
    this.service.getActorChoicesForMedia(media).subscribe({
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

/**
 * Obtém a escolha de ator favorito do utilizador para a mídia atual.
 * @param mediaId O ID da mídia para a qual a escolha de ator favorito do utilizador será obtida.
 */
  getUserFavoriteActorChoice(mediaId: any): void {
    if (this.auth.getLoggedInUserName() !== null /*&& this.isWatched*/) {
      let media: UserMedia = {
        mediaId: mediaId,
        type: "movie"
      };
      this.service.getUserActorChoice(this.auth.getLoggedInUserName()!, media).subscribe({
        next: (response) => {
          //console.log(response);
          if (response) {
            //console.log('Escolha de ator favorito do utilizador recebida:', response);
            this.updateFavoriteActorStatus(response);
            this.userFavoriteActorId = response;
          } else {
            //console.log('utilizador ainda não escolheu um ator favorito para esta mídia.');
          }
        },
        error: (error) => {
          console.error('Erro ao obter a escolha do ator favorito do utilizador:', error);
        }
      });
    }
  }
/**
 * Escolhe um ator como favorito para a mídia atual e atualiza o estado de favorito do utilizador.
 * @param selectedActor O ator selecionado para ser marcado como favorito.
 */
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

/**
 * Atualiza o status de favorito do ator na interface do utilizador.
 * @param selectedActorId O ID do ator selecionado para ser atualizado como favorito ou não.
 */
  updateFavoriteActorStatus(selectedActorId: number): void {
    if (this.getMovieCastResult) {
      this.getMovieCastResult.forEach((actor: any) => {
        this.actorIsFavorite = actor.id === selectedActorId;
        //console.log(this.actorIsFavorite);
      });
    }
  }


  /**
 * Verifica se o ator com o ID fornecido é o ator favorito atual do utilizador.
 * @param actorId O ID do ator a ser verificado.
 * @returns Um valor booleano indicando se o ator é o favorito do utilizador ou não.
 */
  isFavoriteActor(actorId: number): boolean {
    return actorId === this.userFavoriteActorId;
  }


}

