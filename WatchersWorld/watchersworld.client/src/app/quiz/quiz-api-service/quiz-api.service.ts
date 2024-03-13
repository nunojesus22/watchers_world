import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class QuizApiService {

  
  constructor(private http: HttpClient) { }


  baseurl = "https://api.themoviedb.org/3";
  apikey = "8e5d555177cf6c9221bb24f57822ef0d";

  //API filmes
  getMovieDetails(data: any): Observable<any> {
    return this.http.get(`${this.baseurl}/movie/${data}?api_key=${this.apikey}`)
  }

  //Nosso server
  requestQuiz(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/request-quiz`, { mediaId, type });
  }

  verifyQuiz(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/Verify-quiz`, { mediaId, type });
  }

  resetQuiz(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/reset-quiz`, { mediaId, type });
  }

  
}
