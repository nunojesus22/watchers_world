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
export class MovieApiServiceComponent {
  constructor(private http: HttpClient) { }

  baseurl = "https://api.themoviedb.org/3";
  apikey = "8e5d555177cf6c9221bb24f57822ef0d";

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  getHeaders() {
    const jwt = this.getJWT();

    // Set up the headers with the authentication token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  getSimilarMovie(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/similar?api_key=${this.apikey}`)

  }


  //getStreamingProvider
  getStreamingProvider(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/watch/providers?api_key=${this.apikey}`)

  }

  getSerieStreamingProvider(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}/watch/providers?api_key=${this.apikey}`)

  }


  getSerieSeasonInfo(seriesId: any, seasonNumber: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${seriesId}/season/${seasonNumber}?api_key=${this.apikey}`);
  }

  //bannerapidata

  bannerApiData(): Observable<any> {
    return this.http.get(`${this.baseurl}/trending/all/week?api_key=${this.apikey}`);
  }


  // trendingmovieapidata 
  trendingMovieApiData(): Observable<any> {
    return this.http.get(`${this.baseurl}/trending/movie/day?api_key=${this.apikey}`);
  }

  // searchmovive
  getSearchMovie(data: any): Observable<any> {
    console.log(data, 'movie#');
    return this.http.get(`${this.baseurl}/search/movie?api_key=${this.apikey}&query=${data.movieName}&page=${data.page}`);
  }

  getSearchSerie(data: any): Observable<any> {
    console.log(data, 'serie#');

    return this.http.get(`${this.baseurl}/search/tv?api_key=${this.apikey}&query=${data.movieName}&page=${data.page}`);
  }

  // getmoviedatails
  getMovieDetails(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}?api_key=${this.apikey}`)
  }

  // getmoviedatails
  getSerieDetails(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}?api_key=${this.apikey}`)
  }

  //Filmes e Series
  getMultiDetails(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/search/multi?api_key=${this.apikey}&query=${data.movieName}`)
  }


  // getMovieVideo
  getMovieVideo(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/videos?api_key=${this.apikey}`)
  }

  // getMovieVideo
  getSerieVideo(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}/videos?api_key=${this.apikey}`)
  }

  // getMovieCast
  getMovieCast(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/credits?api_key=${this.apikey}`)
  }

  getSerieCast(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}/credits?api_key=${this.apikey}`)
  }
  // action 
  fetchActionMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=28`);
  }

  // adventure
  fetchAdventureMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=12`);
  }

  // animation
  fetchAnimationMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=16`);
  }

  // comedy
  fetchComedyMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=35`);
  }

  // documentary
  fetchDocumentaryMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=99`);
  }

  // science-fiction:878

  fetchScienceFictionMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=878`);
  }

  // thriller:53
  fetchThrillerMovies(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/movie?api_key=${this.apikey}&with_genres=53`);
  }


  //FETCH SERIES


  // topRated
  fetchTopRatedSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/top_rated?api_key=${this.apikey}`);

  }

  fetchActionAndAdvetureSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/tv?api_key=${this.apikey}&with_genres=10759`);
  }

  fetchDramaSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/tv?api_key=${this.apikey}&with_genres=18`);
  }

  fetchMysterySeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/tv?api_key=${this.apikey}&with_genres=9648`);
  }
  fetchAnimationSeries(): Observable<any> {
    return this.http.get(`${this.baseurl}/discover/tv?api_key=${this.apikey}&with_genres=16`);
  }



  //MARCAR COMO VISTO

  markMediaAsWatched(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/mark-watched`, { mediaId, type });
  }


  unmarkMediaAsWatched(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/unmark-watched`, { mediaId, type });
  }

  checkIfWatched(mediaId: number, mediaType: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/is-watched/${mediaId}/${mediaType}`, { headers });
  }

  checkIfWatchedLater(mediaId: number, mediaType: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/is-watched-later/${mediaId}/${mediaType}`, {headers});
  } 

  markMediaToWatchLater(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/mark-to-watch-later`, { mediaId, type });
  }

  unmarkMediaToWatchLater(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/unmark-to-watch-later`, { mediaId, type });
  }


  //COMENTARIOS


  getMediaComments(mediaId: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/media/get-comments/${mediaId}`, { headers });
  }
  

  addComment(mediaId: number, mediaType: string, text: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/add-comment`, {
      mediaId,
      mediaType,
      text
    }).pipe(
      map((response: any) => response.comment) 
    );
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${environment.appUrl}/api/media/delete-comment/${commentId}`);
  }


  likeComment(commentId: number): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/like-comment/${commentId}`, {});
  }

  dislikeComment(commentId: number): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/dislike-comment/${commentId}`, {});
  }


  removeLikeFromComment(commentId: number): Observable<any> {
    return this.http.delete(`${environment.appUrl}/api/media/remove-like/${commentId}`);
  }

  removeDislikeFromComment(commentId: number): Observable<any> {
    return this.http.delete(`${environment.appUrl}/api/media/remove-dislike/${commentId}`);
  }

  addCommentReply(parentCommentId: number, mediaId: number, text: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/add-comment-reply`, {
      parentCommentId,
      mediaId,
      text
    });
  }

  // RATINGS

  giveRatingToMedia(ratingMediaDto: UserRatingMedia): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/UserRatingMedia/give-rating`, ratingMediaDto,  { headers });
  }

  getRatingForMedia(mediaId: number): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/UserRatingMedia/get-rates/${mediaId}`);
  }

  getAverageRatingForMedia(mediaId: number): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/UserRatingMedia/get-average-rating/${mediaId}`);
  }

  getUserRatingForMedia(username: string, mediaId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/UserRatingMedia/get-user-choice/${username}/${mediaId}`, { headers });
  }

  // ATORES

  getActorChoicesForMedia(mediaId: number): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/FavoriteActorChoice/get-choices/${mediaId}`);
  }

  chooseAnActor(favoriteActorChoice: FavoriteActor): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/FavoriteActorChoice/choose-an-actor`, favoriteActorChoice, { headers });
  }

  getUserActorChoice(username: string, mediaId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/FavoriteActorChoice/get-user-choice/${username}/${mediaId}`, { headers });
  }

  //QUIZ
  getQuizQuestions(mediaId: number): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/quiz/${mediaId}`);
  }

  submitQuizAttempt(quizAttempt: any): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/attempt/`, quizAttempt);
  }

  getLastQuizAttempt(mediaId: any): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/quiz/last-attempt/${mediaId}`);

  }
  checkQuizCompleted(mediaId: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/quiz/check-completed/${mediaId}`, { headers });
  }



}
