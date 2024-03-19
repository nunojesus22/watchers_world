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

  quizQuestions: any[] = []; 
  userAnswers: { [questionId: number]: number } = {}; 
  quizResult: any; 

  quizCompleted: boolean = false;
  isQuizPopupVisible: boolean = false;
  lastQuizScore: any;
  isQuizActive: boolean = false;
  showLastScore: boolean = false;
  currentQuestionIndex: number = 0;

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
      // Imagine que você já tenha obtido os detalhes da mídia em getSerieDetailsResult
      const movieDetails = this.getSerieDetailsResult;

      // Exemplo de geração de perguntas
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
              id: 1, text: `${movieDetails.number_of_seasons}` }, 
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


  // Simula a geração de perguntas e respostas do quiz
  submitQuiz(): void {
    this.isQuizActive = false; // O quiz foi concluído
    this.quizCompleted = true; // Indica que o quiz foi completado
    let correctAnswers = 0;

    this.quizQuestions.forEach(question => {
      const userAnswer = this.userAnswers[question.id];
      let correctAnswerId;
      debugger
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
          correctAnswerId = question.answers.find((answer: any) => answer.text === this.getSerieDetailsResult.in_production? answer.text === 'Sim' : answer.text === 'Não')?.id;
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
