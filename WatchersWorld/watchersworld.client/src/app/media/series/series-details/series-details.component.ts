import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';
import { BehaviorSubject } from 'rxjs';
import { AdminService } from '../../../admin/service/admin.service';
import { UserRatingMedia } from '../../media-models/UserRatingMedia';
import { Actor } from '../../media-models/actor';
import { GamificationService } from '../../../gamification/Service/gamification.service';

@Component({
  selector: 'app-series-details',
  templateUrl: './series-details.component.html',
  styleUrl: './series-details.component.css'
})

/**
 * Componente para exibir os detalhes de uma série.
 * Inclui informações sobre a série, elenco, provedores de mídia, comentários, quiz e funcionalidades relacionadas.
 */
export class SeriesDetailsComponent {
  /**
   * Construtor da classe SeriesDetailsComponent.
   * @param service Serviço para comunicação com a API de filmes.
   * @param router Serviço para acesso aos parâmetros da rota.
   * @param title Serviço para manipulação do título da página.
   * @param meta Serviço para manipulação de metadados da página.
   * @param auth Serviço de autenticação para operações relacionadas à conta do utilizador.
   * @param adminService Serviço para operações administrativas.
   * @param gamificationService Serviço para operações relacionadas à gamificação.
   */
  constructor(private service: MovieApiServiceComponent, private router: ActivatedRoute, private title: Title, private meta: Meta, private auth: AuthenticationService, private adminService: AdminService, private gamificationService: GamificationService) {
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

  /**
   * Rola a página até o elemento HTML do comentário com o ID correspondente.
   * @param commentId O ID do comentário ao qual a página deve ser rolada.
   */
  scrollToComment(commentId: string): void {
    const commentElement = document.getElementById(`comment-${commentId}`);
    commentElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Mostra o pop-up do quiz.
   * Define o sinalizador `isQuizPopupVisible` como verdadeiro e reinicia as respostas e o resultado do quiz, se necessário.
   */
  showQuizPopup(): void {
    this.isQuizPopupVisible = true;
    // Resetar respostas e resultado do quiz se necessário
    this.userAnswers = {};
    this.quizResult = null;
    this.loadQuizQuestions();
  }

  /**
   * Esconde o pop-up do quiz.
   * Define o sinalizador `isQuizPopupVisible` como falso.
   */  
  hideQuizPopup(): void {
    this.isQuizPopupVisible = false;
  }



  /**
   * Avança para a próxima pergunta no quiz.
   * Incrementa o índice da pergunta atual (`currentQuestionIndex`) se houver perguntas restantes.
   */  
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  /**
   * Retrocede para a pergunta anterior no quiz.
   * Decrementa o índice da pergunta atual (`currentQuestionIndex`) se não for a primeira pergunta.
   */
  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  /**
   * Verifica se o quiz foi concluído para uma determinada mídia.
   * Atualiza as variáveis ​​de estado com base na resposta da solicitação.
   * @param mediaId O ID da mídia para a qual verificar se o quiz foi concluído.
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
   * Carrega as perguntas do quiz para uma determinada mídia.
   * Atualiza a lista de perguntas do quiz com base nos detalhes da mídia.
   */
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


  /** 
   * Simula a geração de perguntas e respostas do quiz
   **/

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
      // Você pode incluir mais dados aqui, como as respostas do utilizador
    };
    this.lastQuizScore = quizAttempt.score;
    this.hideQuizPopup();

    // Chamando o serviço para enviar os dados ao back-end
    this.service.submitQuizAttempt(quizAttempt).subscribe({
      next: (result) => console.log(result),
      error: (error) => console.error('Erro ao enviar tentativa do quiz', error)
    });
  }


  /**
   * Seleciona a resposta escolhida pelo utilizador para uma determinada pergunta.
   * 
   * @param idPergunta O ID da pergunta à qual a resposta está associada.
   * @param idResposta O ID da resposta escolhida pelo utilizador.
   * @returns void
   */
  selectAnswer(questionId: number, answerId: number): void {
    this.userAnswers[questionId] = answerId;
  }



  /**
   * Define o papel do utilizador com base no seu nome de utilizador.
   * 
   * @returns void
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
   * Verifica se a mídia foi assistida ao inicializar o componente.
   * 
   * @param mediaId O ID da mídia a ser verificada.
   * @returns void
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
   * 
   * @param mediaId O ID da mídia a ser verificada.
   * @returns void
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
   * Verifica se a mídia foi marcada para assistir mais tarde.
   * 
   * @param mediaId O ID da mídia a ser verificada.
   * @returns void
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
   * Obtém os detalhes da série com base no ID.
   * 
   * @param id O ID da série.
   * @returns void
   */
  getMovie(id: any) {
    this.service.getSerieDetails(id).subscribe(async (result) => {
      console.log(result, 'getseriedetails#');
      this.getSerieDetailsResult = await result;


    });
  }

  /**
 * Obtém o vídeo da série com base no ID.
 * 
 * @param id O ID da série.
 * @returns void
 */
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

  /**
 * Obtém o elenco da série com base no ID.
 * 
 * @param id O ID da série.
 * @returns void
 */
  getSerieCast(id: any) {
    this.service.getSerieCast(id).subscribe((result) => {
      console.log(result, 'movieCast#');
      this.getMovieCastResult = result.cast;
    });
  }

  /**
 * Obtém os provedores de streaming da série com base no ID.
 * 
 * @param id O ID da série.
 * @returns void
 */

  getSerieProviders(id: any) {
    this.service.getSerieStreamingProvider(id).subscribe((result) => {
      console.log(result, 'serieProviders#');
      this.getMovieProviders = result.results.PT;
    });
  }


/**
 * Converte minutos para horas e minutos.
 * 
 * @param tempo O tempo em minutos.
 * @returns Uma string no formato "hh h mm min".
 */
  public convertMinutesToHours(time: number): string {//Converte para horas o tempo do filme
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}h ${minutes}min`;
  }

  /**
 * Converte pontos para uma porcentagem.
 * 
 * @param pontos O número de pontos.
 * @returns Uma string representando a porcentagem.
 */
  public convertToPercentage(points: number): string { //Converte para percentagem o valor dos pontos dos users da API
    const pointsPercentage = Math.round(points * 10); // Multiplicar por 10 para obter um número inteiro
    return `${pointsPercentage}%`;
  }

  /**
 * Formata um valor para moeda.
 * 
 * @param valor O valor a ser formatado.
 * @returns Uma string no formato de moeda.
 */
  public formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  /**
 * Verifica se a mídia foi marcada como favorita.
 * 
 * @param mediaId O ID da mídia a ser verificada.
 * @returns void
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
 * Alterna a marcação da mídia como favorita ou não favorita.
 * 
 * @returns void
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
 * Marca a mídia como favorita.
 * 
 * @returns void
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
 * Remove a marcação da mídia como favorita.
 * 
 * @returns void
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
 * Marca a mídia para assistir mais tarde ou remove a marcação, dependendo do estado atual.
 * 
 * @returns void
 */
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

  /**
 * Marca a mídia como assistida ou não assistida, dependendo do estado atual.
 * 
 * @returns void
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
 * Alterna a exibição dos comentários entre visível e oculto.
 * 
 * @returns void
 */
  toggleComents() {
    this.showComments = !this.showComments;
  }

  /**
 * Obtém os comentários da mídia especificada.
 * 
 * @param mediaId O ID da mídia para a qual os comentários devem ser obtidos.
 * @returns void
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
 * Obtém os comentários mais curtidos da mídia especificada.
 * 
 * @param mediaId O ID da mídia para a qual os comentários mais curtidos devem ser obtidos.
 * @returns void
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
 * Obtém os comentários mais antigos da mídia especificada.
 * 
 * @param mediaId O ID da mídia para a qual os comentários mais antigos devem ser obtidos.
 * @returns void
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
 * Obtém e exibe os comentários mais curtidos da mídia atualmente visualizada.
 * 
 * @returns void
 */
  fetchMostLikedComments(): void {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.getMostLikedComments(+mediaId);
    }
  }

  /**
 * Ordena os comentários com base na opção selecionada e exibe-os.
 * 
 * @param event O evento de seleção que desencadeou a ordenação.
 * @returns void
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
 * Obtém e exibe os comentários mais antigos da mídia atualmente visualizada.
 * 
 * @returns void
 */
  fetchCommentsSortedByDate(): void {
    let mediaId = this.router.snapshot.paramMap.get('id');
    if (mediaId) {
      this.getMostOldComments(+mediaId);
    }
  }

  /**
 * Ordena os comentários com base na opção selecionada e exibe-os.
 * 
 * @param event O evento de seleção que desencadeou a ordenação.
 * @returns void
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
 * Adiciona um novo comentário à mídia atualmente visualizada.
 * 
 * @returns void
 */
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

  /**
 * Verifica se o utilizador atual pode excluir o comentário com base no nome do utilizador do comentário.
 * 
 * @param commentUserName O nome de utilizador do autor do comentário.
 * @returns Um valor booleano indicando se o utilizador atual pode excluir o comentário.
 */
  canDeleteComment(commentUserName: string): boolean {
    if (!this.currentUser) return false;
    const isCurrentUser = this.currentUser.toLowerCase() === commentUserName.toLowerCase();
    const isAdminOrModerator = this.isAdminOrModerator$.getValue();
    return isCurrentUser || isAdminOrModerator;
  }

  /**
 * Exclui o comentário especificado.
 * 
 * @param commentId O ID do comentário a ser excluído.
 * @param parentCommentId O ID do comentário pai, se o comentário a ser excluído for uma resposta.
 * @returns void
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
 * Registra um voto de "curtir" em um comentário específico.
 * 
 * @param commentId O ID do comentário a ser curtido.
 * @returns void
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
 * Remove um voto de "curtir" de um comentário específico.
 * 
 * @param commentId O ID do comentário do qual remover o "curtir".
 * @returns void
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
 * Alterna a ação de "curtir" em um comentário, adicionando ou removendo a curtida conforme necessário.
 * 
 * @param commentId O ID do comentário a ser curtido ou descurtido.
 * @param parentCommentId (Opcional) O ID do comentário pai, se o comentário for uma resposta.
 * @returns void
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

  // Este é um exemplo, ajuste conforme sua lógica e nomes de propriedades
  showReplyForms: { [key: number]: boolean } = {};
  replyTexts: { [key: number]: string } = {};


  /**
 * Alterna a visibilidade do formulário de resposta de um comentário.
 * 
 * @param commentId O ID do comentário para o qual alternar a visibilidade do formulário de resposta.
 * @returns void
 */
  toggleReplyForm(commentId: number): void {
    // Isso alternará a exibição do formulário de resposta para um determinado comentário.
    this.showReplyForms[commentId] = !this.showReplyForms[commentId];
    // Garantir que um campo de texto esteja disponível para novas respostas.
    if (this.replyTexts[commentId] === undefined) {
      this.replyTexts[commentId] = '';
    }
  }

/**
 * Adiciona uma resposta a um comentário específico.
 * 
 * @param parentCommentId O ID do comentário ao qual adicionar a resposta.
 * @returns void
 */
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
/**
 * Define a avaliação do utilizador para a mídia.
 * 
 * @param rating A avaliação atribuída pelo utilizador à mídia.
 * @returns void
 */
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
      console.error('utilizador não está logado.');
    }
  }

  /**
 * Avalia a mídia.
 * 
 * @param rating A avaliação atribuída pelo utilizador à mídia.
 * @returns void
 */
  rateMovie(rating: number): void {
    this.movieRating = rating;
    this.setUserRatingForMedia(rating);
  }

  /**
 * Carrega a avaliação do utilizador para a mídia.
 * 
 * @param mediaId O ID da mídia para a qual carregar a avaliação do utilizador.
 * @returns void
 */
  loadUserRatingForMedia(mediaId: any): void {
    if (this.currentUser) {
      this.service.getUserRatingForMedia(this.currentUser, mediaId).subscribe({
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
 * Carrega a classificação média para uma determinada mídia.
 * 
 * @param mediaId O ID da mídia para a qual carregar a classificação média.
 * @returns void
 */
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
/**
 * Alterna a ação de favoritar ou desfavoritar um ator.
 * 
 * @param actor O objeto que representa o ator a ser favoritado ou desfavoritado.
 * @returns void
 */
  toggleFavorite(actor: Actor): void {
    if (!this.actorIsFavorite) {
      this.chooseFavoriteActor(actor);
    } else {
      console.log('Ator já é favorito');
    }
  }

  /**
 * Obtém as escolhas de atores favoritos do utilizador para uma determinada mídia.
 * 
 * @param mediaId O ID da mídia para a qual obter as escolhas de atores favoritos do utilizador.
 * @returns void
 */
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

/**
 * Obtém a escolha do ator favorito do utilizador para uma determinada mídia.
 * 
 * @param mediaId O ID da mídia para a qual obter a escolha do ator favorito do utilizador.
 * @returns void
 */
  getUserFavoriteActorChoice(mediaId: any): void {
    if (this.currentUser /*&& this.isWatched*/) {
      this.service.getUserActorChoice(this.currentUser, mediaId).subscribe({
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
 * Escolhe um ator como favorito para a mídia atual.
 * 
 * @param selectedActor O objeto que representa o ator selecionado como favorito.
 * @returns void
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

/**
 * Atualiza o status de favorito do ator na interface do utilizador.
 * 
 * @param selectedActorId O ID do ator selecionado como favorito.
 * @returns void
 */
  updateFavoriteActorStatus(selectedActorId: number): void {
    if (this.getMovieCastResult) {
      this.getMovieCastResult.forEach((actor: any) => {
        this.actorIsFavorite = actor.id === selectedActorId;
      });
    }
  }

  /**
 * Verifica se um determinado ator é favorito para o utilizador atual.
 * 
 * @param actorId O ID do ator a ser verificado.
 * @returns boolean
 */
  isFavoriteActor(actorId: number): boolean {
    return actorId === this.userFavoriteActorId;
  }

}
