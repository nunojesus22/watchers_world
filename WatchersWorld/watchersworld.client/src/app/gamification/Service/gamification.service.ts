import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { User } from '../../authentication/models/user';
import { Observable } from 'rxjs';
import { MedalsDto } from '../models/MedalsDto';

/**
 * Este serviço é responsável pela gestão de operações relacionadas à gamificação,
 * como a obtenção de medalhas desbloqueadas e bloqueadas pelos utilizadores, a atribuição de medalhas
 * e a recolha de informações sobre todas as medalhas disponíveis.
 */
@Injectable({
  providedIn: 'root'
})
export class GamificationService {

  constructor(private http: HttpClient) { }

  /**
   * Recupera o token JWT do localStorage do navegador. Este token é utilizado para
   * autenticação nas requisições à API.
   * 
   * @returns O token JWT ou 'No JWT' se o token não estiver presente.
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
   * Constrói os cabeçalhos HTTP para inclusão do token JWT nas solicitações à API.
   * 
   * @returns Um objeto HttpHeaders configurado com o tipo de conteúdo e o token JWT.
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
   * Obtém as medalhas desbloqueadas por um determinado utilizador.
   * 
   * @param userName O nome do utilizador cujas medalhas desbloqueadas são solicitadas.
   * @returns Um Observable que emite uma lista de medalhas desbloqueadas (MedalsDto[]).
   */
  getUnlockedMedals(userName: string): Observable<MedalsDto[]> {
    const headers = this.getHeaders();
    return this.http.get<MedalsDto[]>(`${environment.appUrl}/api/gamification/unlocked-medals/${userName}`, { headers });
  }

  /**
  * Atribui uma medalha a um utilizador específico.
  * 
  * @param userName O nome do utilizador ao qual a medalha será atribuída.
  * @param medalName O nome da medalha a ser atribuída.
  * @returns Um Observable que emite a lista atualizada de medalhas do utilizador após a atribuição.
  */
  awardMedal(userName: string, medalName: string): Observable<MedalsDto[]> {
    const headers = this.getHeaders();
    return this.http.post<MedalsDto[]>(`${environment.appUrl}/api/gamification/AwardMedal`, { userName, medalName }, { headers });
  }

  /**
   * Obtém todas as medalhas disponíveis no sistema.
   * 
   * @returns Um Observable que emite uma lista de todas as medalhas disponíveis (MedalsDto[]).
   */
  getAvailableMedals(): Observable<MedalsDto[]> {
    return this.http.get<MedalsDto[]>(`${environment.appUrl}/api/gamification/available-medals`);
  }

  /**
   * Obtém as medalhas que ainda estão bloqueadas para um determinado utilizador.
   * 
   * @param userName O nome do utilizador cujas medalhas bloqueadas são solicitadas.
   * @returns Um Observable que emite uma lista de medalhas bloqueadas (MedalsDto[]).
   */
  getLockedMedals(userName: string): Observable<MedalsDto[]> {
    const headers = this.getHeaders();
    return this.http.get<MedalsDto[]>(`${environment.appUrl}/api/gamification/locked-medals/${userName}`, { headers });
  }

}
