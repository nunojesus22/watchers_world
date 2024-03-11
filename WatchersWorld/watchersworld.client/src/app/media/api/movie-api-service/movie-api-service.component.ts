import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class MovieApiServiceComponent {
  constructor(private http: HttpClient) { }

  baseurl = "https://api.themoviedb.org/3";
  apikey = "8e5d555177cf6c9221bb24f57822ef0d";



  //getStreamingProvider
  getStreamingProvider(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}/watch/providers?api_key=${this.apikey}`)

  }

  getSerieStreamingProvider(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/tv/${data}/watch/providers?api_key=${this.apikey}`)

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
    return this.http.get(`${environment.appUrl}/api/media/is-watched/${mediaId}/${mediaType}`);
  }

  checkIfWatchedLater(mediaId: number, mediaType: string): Observable<any> {
    return this.http.get(`${environment.appUrl}/api/media/is-watched-later/${mediaId}/${mediaType}`);
  }

  markMediaToWatchLater(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/mark-to-watch-later`, { mediaId, type });
  }

  unmarkMediaToWatchLater(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/media/unmark-to-watch-later`, { mediaId, type });
  }

}
