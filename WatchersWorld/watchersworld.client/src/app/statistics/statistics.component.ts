import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { UserMedia } from '../profile/models/user-media';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  followersCount: number | undefined;
  followingCount: number | undefined;
  watchedMoviesCount: number = 0;
  watchLaterMoviesCount: number = 0;
  watchedSeriesCount: number = 0;
  watchLaterSeriesCount: number = 0;
  currentUser: any;
  totalCommentsCount: number | undefined;


  constructor(
    private profileService: ProfileService,
    private authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getLoggedInUserName();
    if (this.currentUser) {
      this.fetchStatistics(this.currentUser);
      this.fetchMediaCounts(this.currentUser);
      this.fetchTotalComments(this.currentUser);
    }
  }

  private fetchStatistics(username: string): void {
    this.profileService.getUserData(username).subscribe({
      next: (profileData) => {
        this.followersCount = profileData.followers;
        this.followingCount = profileData.following;
      },
      error: (error) => console.error("Error fetching user statistics:", error)
    });
  }
  private fetchMediaCounts(username: string): void {
    // Fetch watched movies and series
    this.profileService.getUserWatchedMedia(username).subscribe({
      next: (media: UserMedia[]) => {
        this.watchedMoviesCount = media.filter(m => m.type === 'movie').length;
        this.watchedSeriesCount = media.filter(m => m.type === 'serie').length; 
      },
      error: (error) => console.error("Error fetching watched media:", error)
    });

    // Fetch movies and series to watch later
    this.profileService.getUserWatchLaterMedia(username).subscribe({
      next: (media: UserMedia[]) => {
        this.watchLaterMoviesCount = media.filter(m => m.type === 'movie').length;
        this.watchLaterSeriesCount = media.filter(m => m.type === 'serie').length; 
      },
      error: (error) => console.error("Error fetching watch later media:", error)
    });
  }
  private fetchTotalComments(username: string): void {
    // Chamadas existentes para buscar followers, following, etc.
    this.profileService.getUserTotalComments(username).subscribe({
      next: (count) => {
        this.totalCommentsCount = count;
      },
      error: (error) => console.error("Error fetching total user comments:", error)
    });
  }
}
