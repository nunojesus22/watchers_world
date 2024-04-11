import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { User } from '../../../authentication/models/user';
import { UserRatingMedia } from '../../media-models/UserRatingMedia';
import { FavoriteActor } from '../../media-models/fav-actor';


@Injectable({
  providedIn: 'root'
})

/**
 * Serviço para interagir com a API da TMDb (The Movie Database).
 */
export class MovieApiServiceComponent {

   /**
   * Construtor do serviço MovieApiServiceComponent.
   * @param http Instância do HttpClient fornecida pelo Angular para realizar solicitações HTTP.
   */
  constructor(private http: HttpClient) { }

  baseurl = "https://api.themoviedb.org/3";
  apikey = "8e5d555177cf6c9221bb24f57822ef0d";

  /**
   * Obtém o token JWT do armazenamento local do navegador, se disponível.
   * @returns O token JWT, ou 'No JWT' se não estiver disponível.
   */
  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

   /**
   * Obtém os cabeçalhos HTTP necessários para autenticar as solicitações à API da TMDb.
   * @returns Cabeçalhos HTTP configurados com o token de autenticação.
   */
  getHeaders() {
    const jwt = this.getJWT();

    // Set up the headers with the authentication token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

   /**
   * Obtém filmes similares a um filme específico.
   * @param data Identificador do filme para o qual filmes similares serão buscados.
   * @returns Um Observable com a resposta da solicitação HTTP que contém filmes similares.
   */
  getSimilarMovie(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/similar?api_key=${this.apikey}`)

  }

   /**
   * Obtém séries de TV similares a uma série específica.
   * @param data Identificador da série para a qual séries similares serão buscadas.
   * @returns Um Observable com a resposta da solicitação HTTP que contém séries similares.
   */
  getSimilarSerie(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}/similar?api_key=${this.apikey}`)

  }

 /**
   * Obtém informações sobre provedores de streaming para um filme específico.
   * @param data Identificador do filme para o qual provedores de streaming serão buscados.
   * @returns Um Observable com a resposta da solicitação HTTP que contém informações sobre provedores de streaming.
   */
  getStreamingProvider(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/watch/providers?api_key=${this.apikey}`)

  }

   /**
   * Obtém informações sobre provedores de streaming para uma série de TV específica.
   * @param data Identificador da série para o qual provedores de streaming serão buscados.
   * @returns Um Observable com a resposta da solicitação HTTP que contém informações sobre provedores de streaming.
   */
  getSerieStreamingProvider(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}/watch/providers?api_key=${this.apikey}`)

  }


   /**
   * Obtém informações sobre uma temporada específica de uma série de TV.
   * @param seriesId Identificador da série de TV.
   * @param seasonNumber Número da temporada a ser obtida.
   * @returns Um Observable com a resposta da solicitação HTTP que contém informações sobre a temporada.
   */
  getSerieSeasonInfo(seriesId: any, seasonNumber: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${seriesId}/season/${seasonNumber}?api_key=${this.apikey}`);
  }


   /**
   * Obtém dados de filmes populares na semana.
   * @returns Um Observable com a resposta da solicitação HTTP que contém dados de filmes populares.
   */
  bannerApiData(): Observable<any> {
    return this.http.get(`${this.baseurl}/trending/all/week?api_key=${this.apikey}`);
  }


  /**
   * Obtém dados de filmes populares no dia.
   * @returns Um Observable com a resposta da solicitação HTTP que contém dados de filmes populares.
   */
  trendingMovieApiData(): Observable<any> {
    return this.http.get(`${this.baseurl}/trending/movie/day?api_key=${this.apikey}`);
  }

  /**
   * Realiza uma pesquisa de filmes com base no nome fornecido.
   * @param data Objeto contendo o nome do filme a ser pesquisado e o número da página (opcional).
   * @returns Um Observable com a resposta da solicitação HTTP que contém resultados da pesquisa de filmes.
   */
  getSearchMovie(data: any): Observable<any> {
    console.log(data, 'movie#');
    return this.http.get(`${this.baseurl}/search/movie?api_key=${this.apikey}&query=${data.movieName}&page=${data.page}`);
  }

   /**
   * Realiza uma pesquisa de séries de TV com base no nome fornecido.
   * @param data Objeto contendo o nome da série de TV a ser pesquisada e o número da página (opcional).
   * @returns Um Observable com a resposta da solicitação HTTP que contém resultados da pesquisa de séries de TV.
   */
  getSearchSerie(data: any): Observable<any> {
    console.log(data, 'serie#');

    return this.http.get(`${this.baseurl}/search/tv?api_key=${this.apikey}&query=${data.movieName}&page=${data.page}`);
  }


/**
   * Obtém detalhes de um filme com base no ID fornecido.
   * @param data O ID do filme.
   * @returns Um Observable com a resposta da solicitação HTTP que contém os detalhes do filme.
   */
    getMovieDetails(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}?api_key=${this.apikey}`)
  }

/**
   * Obtém detalhes de uma série de TV com base no ID fornecido.
   * @param data O ID da série de TV.
   * @returns Um Observable com a resposta da solicitação HTTP que contém os detalhes da série de TV.
   */
  getSerieDetails(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}?api_key=${this.apikey}`)
  }

/**
   * Realiza uma pesquisa multipla (filmes e séries) com base no nome fornecido.
   * @param data Objeto contendo o nome da mídia a ser pesquisada.
   * @returns Um Observable com a resposta da solicitação HTTP que contém os resultados da pesquisa multipla.
   */
  getMultiDetails(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/search/multi?api_key=${this.apikey}&query=${data.movieName}`)
  }


 /**
   * Obtém vídeos relacionados a um filme com base no ID fornecido.
   * @param data O ID do filme.
   * @returns Um Observable com a resposta da solicitação HTTP que contém os vídeos relacionados ao filme.
   */
  getMovieVideo(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/videos?api_key=${this.apikey}`)
  }

  /**
   * Obtém vídeos relacionados a uma série de TV com base no ID fornecido.
   * @param data O ID da série de TV.
   * @returns Um Observable com a resposta da solicitação HTTP que contém os vídeos relacionados à série de TV.
   */
  getSerieVideo(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}/videos?api_key=${this.apikey}`)
  }

  /**
   * Obtém o elenco de um filme com base no ID fornecido.
   * @param data O ID do filme.
   * @returns Um Observable com a resposta da solicitação HTTP que contém o elenco do filme.
   */
  getMovieCast(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/credits?api_key=${this.apikey}`)
  }

  /**
   * Obtém o elenco de uma série de TV com base no ID fornecido.
   * @param data O ID da série de TV.
   * @returns Um Observable com a resposta da solicitação HTTP que contém o elenco da série de TV.
   */
  getSerieCast(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}/credits?api_key=${this.apikey}`)
  }


/**
 * Obtém filmes de ação.
 * @returns Um Observable com a resposta da solicitação HTTP que contém os filmes de ação.
 */
  fetchActionMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=28`);
  }

/**
 * Obtém filmes de aventura.
 * @returns Um Observable com a resposta da solicitação HTTP que contém os filmes de aventura.
 */
  fetchAdventureMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=12`);
  }

/**
 * Obtém filmes de animação.
 * @returns Um Observable com a resposta da solicitação HTTP que contém os filmes de animação.
 */
  fetchAnimationMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=16`);
  }

/**
 * Obtém filmes de comédia.
 * @returns Um Observable com a resposta da solicitação HTTP que contém os filmes de comédia.
 */
  fetchComedyMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=35`);
  }

/**
 * Obtém filmes documentários.
 * @returns Um Observable com a resposta da solicitação HTTP que contém os filmes documentários.
 */
  fetchDocumentaryMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=99`);
  }

/**
 * Obtém filmes de ficção científica.
 * @returns Um Observable com a resposta da solicitação HTTP que contém os filmes de ficção científica.
 */
  fetchScienceFictionMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=878`);
  }

/**
 * Obtém filmes de suspense.
 * @returns Um Observable com a resposta da solicitação HTTP que contém os filmes de suspense.
 */
  fetchThrillerMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=53`);
  }


  //FETCH SERIES


/**
 * Obtém as séries mais bem avaliadas.
 * @returns Um Observable com a resposta da solicitação HTTP que contém as séries mais bem avaliadas.
 */
  fetchTopRatedSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/top_rated?api_key=${this.apikey}`);

  }

  /**
 * Obtém séries de ação e aventura.
 * @returns Um Observable com a resposta da solicitação HTTP que contém as séries de ação e aventura.
 */
  fetchActionAndAdvetureSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/tv?api_key=${this.apikey}&with_genres=10759`);
  }

  /**
 * Obtém séries de drama.
 * @returns Um Observable com a resposta da solicitação HTTP que contém as séries de drama.
 */
  fetchDramaSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/tv?api_key=${this.apikey}&with_genres=18`);
  }

  /**
 * Obtém séries de mistério.
 * @returns Um Observable com a resposta da solicitação HTTP que contém as séries de mistério.
 */
  fetchMysterySeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/tv?api_key=${this.apikey}&with_genres=9648`);
  }
  /**
 * Obtém séries de animação.
 * @returns Um Observable com a resposta da solicitação HTTP que contém as séries de animação.
 */
  fetchAnimationSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/tv?api_key=${this.apikey}&with_genres=16`);
  }

  // SERIES AIRING TODAY

  /**
 * Obtém as séries que estão sendo exibidas hoje.
 * @returns Um Observable com a resposta da solicitação HTTP que contém as séries que estão sendo exibidas hoje.
 */
  getAiringSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/airing_today?api_key=${this.apikey}`)
  }

  // FAVORITOS

  /**
 * Verifica se a mídia é favorita para o usuário atual.
 * @param mediaId O ID da mídia.
 * @param mediaType O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a mídia é favorita.
 */
  checkIfIsFavorite(mediaId: number, mediaType: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/is-favorite/${mediaId}/${mediaType}`, { headers });
  }

  /**
 * Marca a mídia como favorita para o usuário atual.
 * @param mediaId O ID da mídia.
 * @param type O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a mídia foi marcada como favorita com sucesso.
 */
  markMediaAsFavorite(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/mark-as-favorite`, { mediaId, type });
  }

  /**
 * Remove a marcação de favorito da mídia para o usuário atual.
 * @param mediaId O ID da mídia.
 * @param type O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a marcação de favorito da mídia foi removida com sucesso.
 */
  unmarkMediaAsFavorite(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/unmark-favorite`, { mediaId, type });
  }

  //MARCAR COMO VISTO

  /**
 * Marca a mídia como assistida pelo usuário atual.
 * @param mediaId O ID da mídia.
 * @param type O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a mídia foi marcada como assistida com sucesso.
 */
  markMediaAsWatched(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/mark-watched`, { mediaId, type });
  }


  /**
 * Remove a marcação de assistido da mídia para o usuário atual.
 * @param mediaId O ID da mídia.
 * @param type O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a marcação de assistido da mídia foi removida com sucesso.
 */
  unmarkMediaAsWatched(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/unmark-watched`, { mediaId, type });
  }


  /**
 * Verifica se a mídia foi assistida pelo usuário atual.
 * @param mediaId O ID da mídia.
 * @param mediaType O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a mídia foi assistida pelo usuário.
 */
  checkIfWatched(mediaId: number, mediaType: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/is-watched/${mediaId}/${mediaType}`, { headers });
  }


  
/**
 * Verifica se a mídia foi marcada como para assistir mais tarde pelo usuário atual.
 * @param mediaId O ID da mídia.
 * @param mediaType O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a mídia foi marcada para assistir mais tarde pelo usuário.
 */
  checkIfWatchedLater(mediaId: number, mediaType: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/is-watched-later/${mediaId}/${mediaType}`, {headers});
  } 


  /**
 * Marca a mídia como para assistir mais tarde pelo usuário atual.
 * @param mediaId O ID da mídia.
 * @param type O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a mídia foi marcada para assistir mais tarde com sucesso.
 */
  markMediaToWatchLater(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/mark-to-watch-later`, { mediaId, type });
  }


  /**
 * Remove a marcação de assistir mais tarde da mídia para o usuário atual.
 * @param mediaId O ID da mídia.
 * @param type O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @returns Um Observable com a resposta da solicitação HTTP que indica se a marcação de assistir mais tarde da mídia foi removida com sucesso.
 */
  unmarkMediaToWatchLater(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/unmark-to-watch-later`, { mediaId, type });
  }


  //COMENTARIOS


  /**
 * Obtém os comentários para uma determinada mídia.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com os comentários da mídia.
 */
  getMediaComments(mediaId: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/get-comments/${mediaId}`, { headers });
  }
  

  /**
 * Adiciona um novo comentário à mídia.
 * @param mediaId O ID da mídia.
 * @param mediaType O tipo de mídia (por exemplo, 'serie' ou 'movie').
 * @param text O texto do comentário.
 * @returns Um Observable com o comentário adicionado.
 */
  addComment(mediaId: number, mediaType: string, text: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/add-comment`, {
      mediaId,
      mediaType,
      text
    }).pipe(
      map((response: any) => response.comment) 
    );
  }

  /**
 * Exclui um comentário da mídia.
 * @param commentId O ID do comentário a ser excluído.
 * @returns Um Observable indicando se o comentário foi excluído com sucesso.
 */
  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${environment.appUrl}/api/media/delete-comment/${commentId}`);
  }


  /**
 * Adiciona um like a um comentário.
 * @param commentId O ID do comentário a ser curtido.
 * @returns Um Observable indicando se o like foi adicionado com sucesso.
 */
  likeComment(commentId: number): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/like-comment/${commentId}`, {});
  }

/**
 * Adiciona um dislike a um comentário.
 * @param commentId O ID do comentário a ser descurtido.
 * @returns Um Observable indicando se o dislike foi adicionado com sucesso.
 */
  dislikeComment(commentId: number): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/dislike-comment/${commentId}`, {});
  }


  /**
 * Remove um like de um comentário.
 * @param commentId O ID do comentário do qual o like será removido.
 * @returns Um Observable indicando se o like foi removido com sucesso.
 */
  removeLikeFromComment(commentId: number): Observable<any> {
    return this.http.delete(`${environment.appUrl}/api/media/remove-like/${commentId}`);
  }
  /**
 * Remove um dislike de um comentário.
 * @param commentId O ID do comentário do qual o dislike será removido.
 * @returns Um Observable indicando se o dislike foi removido com sucesso.
 */
  removeDislikeFromComment(commentId: number): Observable<any> {
    return this.http.delete(`${environment.appUrl}/api/media/remove-dislike/${commentId}`);
  }

  /**
 * Adiciona uma resposta a um comentário.
 * @param parentCommentId O ID do comentário pai ao qual a resposta será adicionada.
 * @param mediaId O ID da mídia à qual o comentário pertence.
 * @param text O texto da resposta.
 * @returns Um Observable indicando se a resposta foi adicionada com sucesso.
 */
  addCommentReply(parentCommentId: number, mediaId: number, text: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/add-comment-reply`, {
      parentCommentId,
      mediaId,
      text
    });
  }


  /**
 * Obtém os comentários da mídia ordenados pelo número de curtidas.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com os comentários da mídia ordenados pelo número de curtidas.
 */
  getMostLikedComments(mediaId: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/get-sorted-comments-by-likes/${mediaId}`, { headers });
  }


  /**
 * Obtém os comentários da mídia ordenados por data.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com os comentários da mídia ordenados por data.
 */
  getCommentsSortedByDate(mediaId: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/get-sorted-comments-by-date/${mediaId}`, { headers });
  }


  // RATINGS

  /**
 * Registra a classificação dada pelo usuário a uma mídia.
 * @param ratingMediaDto Os dados de classificação fornecidos pelo usuário.
 * @returns Um Observable indicando se a classificação foi registrada com sucesso.
 */
  giveRatingToMedia(ratingMediaDto: UserRatingMedia): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/UserRatingMedia/give-rating`, ratingMediaDto,  { headers });
  }


  /**
 * Obtém as classificações dadas à mídia.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com as classificações dadas à mídia.
 */
  getRatingForMedia(mediaId: number): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/UserRatingMedia/get-rates/${mediaId}`);
  }

  /**
 * Obtém a classificação média da mídia.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com a classificação média da mídia.
 */
  getAverageRatingForMedia(mediaId: number): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/UserRatingMedia/get-average-rating/${mediaId}`);
  }

  /**
 * Obtém a classificação dada pelo usuário à mídia.
 * @param username O nome de usuário do usuário.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com a classificação dada pelo usuário à mídia.
 */
  getUserRatingForMedia(username: string, mediaId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/UserRatingMedia/get-user-choice/${username}/${mediaId}`, { headers });
  }

  // ATORES

  /**
 * Obtém as escolhas de atores favoritos para uma mídia específica.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com as escolhas de atores favoritos para a mídia.
 */
  getActorChoicesForMedia(mediaId: number): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/FavoriteActorChoice/get-choices/${mediaId}`);
  }

  /**
 * Escolhe um ator como favorito para uma mídia específica.
 * @param favoriteActorChoice Os dados de escolha do ator favorito.
 * @returns Um Observable indicando se a escolha foi feita com sucesso.
 */
  chooseAnActor(favoriteActorChoice: FavoriteActor): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/FavoriteActorChoice/choose-an-actor`, favoriteActorChoice, { headers });
  }

  /**
 * Obtém a escolha de ator favorito feita pelo usuário para uma mídia específica.
 * @param username O nome de usuário do usuário.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com a escolha de ator favorito do usuário para a mídia.
 */
  getUserActorChoice(username: string, mediaId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/FavoriteActorChoice/get-user-choice/${username}/${mediaId}`, { headers });
  }

  /**
 * Obtém as perguntas do quiz para uma mídia específica.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com as perguntas do quiz para a mídia.
 */
  getQuizQuestions(mediaId: number): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/quiz/${mediaId}`);
  }

  /**
 * Submete uma tentativa de quiz.
 * @param quizAttempt Os dados da tentativa de quiz.
 * @returns Um Observable indicando se a tentativa de quiz foi submetida com sucesso.
 */
  submitQuizAttempt(quizAttempt: any): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/attempt/`, quizAttempt);
  }

  /**
 * Obtém a última tentativa de quiz para uma mídia específica.
 * @param mediaId O ID da mídia.
 * @returns Um Observable com a última tentativa de quiz para a mídia.
 */
  getLastQuizAttempt(mediaId: any): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/quiz/last-attempt/${mediaId}`);

  }
  
  /**
 * Verifica se o quiz para uma mídia específica foi concluído.
 * @param mediaId O ID da mídia.
 * @returns Um Observable indicando se o quiz foi concluído.
 */
  checkQuizCompleted(mediaId: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/quiz/check-completed/${mediaId}`, { headers });
  }




/**
 * Obtém a contagem de comentários por data para um usuário específico.
 * @param username O nome de usuário do usuário.
 * @returns Um Observable com a contagem de comentários por data para o usuário.
 */
  commentsDate(username:string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${environment.appUrl}/api/media/get-comments-count-by-date/${username}`, { headers });
  }

  /**
 * Obtém os filmes adicionados por data para um usuário específico.
 * @param username O nome de usuário do usuário.
 * @returns Um Observable com os filmes adicionados por data para o usuário.
 */
  getMovieAddedByDate(username:any): Observable<any[]> {
    const headers = this.getHeaders();

    return this.http.get<any[]>(`${environment.appUrl}/api/media/get-media-added-by-date/${username}`, { headers });
  }

/**
 * Obtém as séries adicionadas por data para um usuário específico.
 * @param username O nome de usuário do usuário.
 * @returns Um Observable com as séries adicionadas por data para o usuário.
 */
  getSeriesAddedByDate(username: any): Observable<any[]> {
    const headers = this.getHeaders();

    return this.http.get<any[]>(`${environment.appUrl}/api/media/get-serie-added-by-date/${username}`, { headers });
  }
}
