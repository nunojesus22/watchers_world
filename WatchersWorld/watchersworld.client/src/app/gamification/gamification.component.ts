import { Component, OnInit } from '@angular/core';
import { GamificationService } from './Service/gamification.service';
import { MedalsDto } from './models/MedalsDto';
import { ActivatedRoute } from '@angular/router';

/**
 * Componente responsável por exibir a gamificação do utilizador, incluindo medalhas desbloqueadas e bloqueadas.
 * Este componente permite aos utilizadores verem as suas conquistas dentro do sistema e o que ainda podem alcançar,
 * aumentando a interação e o engajamento com a plataforma.
 */
@Component({
  selector: 'app-gamification',
  templateUrl: './gamification.component.html',
  styleUrl: './gamification.component.css'
})
export class GamificationComponent implements OnInit {

  unlockedMedals: MedalsDto[] = [];
  lockedMedals: MedalsDto[] = [];
  currentUsername: string | undefined;

  constructor(private gamificationService: GamificationService, private router: ActivatedRoute) { }

  /**
   * Método de inicialização do componente. Obtém o nome do utilizador a partir dos parâmetros da rota
   * e chama os métodos para recuperar as medalhas desbloqueadas e bloqueadas.
   */
  ngOnInit(): void {
    this.router.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
      }
    });

    this.getLockedMedals();
    this.getUnlockedMedals();
  }

  /**
   * Recupera as medalhas desbloqueadas pelo utilizador.
   * Este método consulta o serviço de gamificação para obter as medalhas que o utilizador já conseguiu desbloquear.
   */
  getUnlockedMedals(): void {
    if (this.currentUsername)
      this.gamificationService.getUnlockedMedals(this.currentUsername).subscribe({
        next: (medals) => {
          this.unlockedMedals = medals;
        },
        error: (err) => {
          console.error('Error retrieving available medals:', err);
        }
      });
  }

  /**
   * Recupera as medalhas ainda bloqueadas para o utilizador.
   * Este método consulta o serviço de gamificação para obter as medalhas que o utilizador ainda não conseguiu desbloquear.
   */
  getLockedMedals(): void {
    if (this.currentUsername)
      this.gamificationService.getLockedMedals(this.currentUsername).subscribe({
        next: (medals) => {
          this.lockedMedals = medals;
        },
        error: (err) => {
          console.error('Error retrieving available medals:', err);
        }
      });
  }
}
