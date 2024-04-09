import { Component, OnInit } from '@angular/core';
import { GamificationService } from './Service/gamification.service';
import { MedalsDto } from './models/MedalsDto';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-gamification',
  templateUrl: './gamification.component.html',
  styleUrl: './gamification.component.css'
})
export class GamificationComponent implements OnInit {

  unlockedMedals: MedalsDto[] = [];
  lockedMedals: MedalsDto[] = [];
  currentUsername: string | undefined; // Nome de usuário do perfil exibido

  constructor(private gamificationService: GamificationService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
      }
    });

    this.getLockedMedals();
    this.getUnlockedMedals();
  }

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
