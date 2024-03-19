import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MovieApiServiceComponent } from '../../api/movie-api-service/movie-api-service.component';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css' 
})
export class MovieDetailsComponent {

  constructor(private service: MovieApiServiceComponent, private router: ActivatedRoute, private title: Title, private meta: Meta) { }
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

  quizQuestions: any[] = []; 
  userAnswers: { [questionId: number]: number } = {}; 
  quizResult: any; 

  quizCompleted: boolean=false;
  isQuizPopupVisible: boolean = false;


  lastQuizScore: any;
  isQuizActive: boolean = false;
  showLastScore: boolean = false


  currentQuestionIndex: number = 0;

  ngOnInit(): void {
    let getParamId = this.router.snapshot.paramMap.get('id');
    console.log(getParamId, 'getparamid#');
    this.showAll = false;
    this.getMovie(getParamId);
    this.getVideo(getParamId);
    this.getMovieCast(getParamId);
    this.getProviders(getParamId);
    this.getMovie(getParamId);
    this.checkIfWatched(getParamId); // Novo método para verificar se o filme foi assistido
    this.checkIfWatchedLater(getParamId);

    this.checkQuizCompleted(getParamId);
    this.loadQuizQuestions();
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

      // Exemplo de geração de perguntas
      this.quizQuestions = [
        {
          id: 1,
          text: 'Qual é o título original do filme?',
          answers: [
            { id: 1, text: `${movieDetails.original_title }` }, // Resposta correta
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


}

