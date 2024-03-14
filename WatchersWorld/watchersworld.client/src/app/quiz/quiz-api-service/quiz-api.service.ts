import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { QuizMediaDto } from '../../quiz/models/QuizMediaDto';

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

  getRandomMovieInfo(movieId: number): Observable<any> {
    return this.http.get<any>(`${this.baseurl } / movie / ${ movieId } ? api_key = ${ this.apikey }`);
  }

  getRandomActorName(movieId: number): Observable<any> {
    return this.http.get<any>(`${ this.baseurl } / movie / ${ movieId } / credits ? api_key = ${ this.apikey }`).pipe(
      map((response: any) => {
        const cast = response.cast;
        const randomActor = cast[Math.floor(Math.random() * cast.length)];
        return randomActor.name;
      })
    );
  }

  getRandomDirectorName(movieId: number): Observable<any> {
    return this.http.get<any>(`${ this.baseurl } / movie / ${ movieId } / credits ? api_key = ${ this.apikey }`).pipe(
      map((response: any) => {
        const crew = response.crew;
        const directors = crew.filter((member: any) => member.job === 'Director');
        const randomDirector = directors[Math.floor(Math.random() * directors.length)];
        return randomDirector.name;
      })
    );
  }

  getRandomReleaseYear(movieId: number): Observable<any> {
    return this.http.get<any>(`${ this.baseurl } / movie / ${ movieId } ? api_key = ${ this.apikey }`).pipe(
      map((response: any) => {
        const releaseDate = response.release_date;
        return (new Date(releaseDate)).getFullYear();
      })
    );
  }

  getRandomGenre(movieId: number): Observable<any> {
    return this.http.get<any>(`${ this.baseurl } / movie / ${ movieId } ? api_key = ${ this.apikey }`).pipe(
      map((response: any) => {
        const genres = response.genres;
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        return randomGenre.name;
      })
    );
  }

  getRandomFictionalCharacter(movieId: number): Observable<any> {
    return this.http.get<any>(`${ this.baseurl } / movie / ${ movieId } / credits ? api_key = ${ this.apikey }`).pipe(
      map((response: any) => {
        const cast = response.cast;
        
        const characters = cast.map((actor: any) => actor.character);
        
        const filteredCharacters = characters.filter((character: string) => character.trim() !== "");
        
        const randomCharacter = filteredCharacters[Math.floor(Math.random() * filteredCharacters.length)];
        return randomCharacter;
      })
    );
  }

  constructQuizMediaDto(movieId: number): Observable<QuizMediaDto> {
    const movieInfoRequests: Observable<any>[] = [
      this.getRandomFictionalCharacter(movieId),
      this.getRandomReleaseYear(movieId),
      this.getRandomActorName(movieId),
      this.getRandomDirectorName(movieId),
      this.getRandomGenre(movieId)
    ];

    // combinar tudo
    return forkJoin(movieInfoRequests).pipe(
      map(([fictionalCharacter, releaseYear, randomActor, randomDirector, randomGenre]) => {
        const quizMediaDto: QuizMediaDto = {
          FictionalCharacter: fictionalCharacter,
          releaseDate: releaseYear,
          randomActor: randomActor,
          randomDirector: randomDirector,
          randomGenre: randomGenre
        };
        return quizMediaDto;
      })
    );
  }



  //-----------------


  
  //Nosso server

  isLogged(): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/isLogged`, { });
  }

  requestQuiz(media: any, mediaId: number): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/request-quiz`, { media, mediaId });
  }

  verifyQuiz(mediaId: number, type: string): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/Verify-quiz`, { mediaId, type });
  }

  resetQuiz(media : any, mediaId: any): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/quiz/reset-quiz`, {media, mediaId });
  }
  
  

  
}
