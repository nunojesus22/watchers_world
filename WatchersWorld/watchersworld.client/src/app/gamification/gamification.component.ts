import { Component, OnInit } from '@angular/core';
import { GamificationService } from './Service/gamification.service';
import { MedalsDto } from './models/MedalsDto';

@Component({
  selector: 'app-gamification',
  templateUrl: './gamification.component.html',
  styleUrl: './gamification.component.css'
})
export class GamificationComponent implements OnInit {

  availableMedals: MedalsDto[] = [];

  constructor(private gamificationService: GamificationService) { }

  ngOnInit(): void {
    this.loadAvailableMedals();
  }

  loadAvailableMedals(): void {
    this.gamificationService.getAvailableMedals().subscribe({
      next: (medals) => {
        this.availableMedals = medals;
      },
      error: (err) => {
        console.error('Error retrieving available medals:', err);
      }
    });
  }

}
