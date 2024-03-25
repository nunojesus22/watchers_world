import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Profile } from '../../profile/models/profile';
import { FollowerProfile } from '../../profile/models/follower-profile';
import { ProfileService } from '../../profile/services/profile.service';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { NotificationService } from '../services/notification.service';
import { NotificationModel } from '../models/notification-model';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  currentUsername: string | undefined; 
  isBanPopupVisible = false;
  unsubscribed$: Subject<void> = new Subject<void>();
  usersProfiles: Profile[] | undefined;
  loggedUserName: string | null = null;
  selectedUserForBan: string | null = null;
  banDuration: number | undefined;
  pendingFollowRequests: FollowerProfile[] = [];
  notifications: NotificationModel[] = [];


  constructor(private profileService: ProfileService, public authService: AuthenticationService, public notificationService: NotificationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
      }
    });
    this.loggedUserName = this.authService.getLoggedInUserName();
    this.getPendingFollowRequests();
    this.getNotifications();
  }

  ngOnDestroy() {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  getPendingFollowRequests() {
    if (this.loggedUserName) {
      this.profileService.getPendingFollowRequests(this.loggedUserName)
        .pipe(takeUntil(this.unsubscribed$))
        .subscribe({
          next: (profiles: FollowerProfile[]) => {
            this.pendingFollowRequests = profiles;
          },
          error: (error) => {
            console.error('Error fetching pending follow requests:', error);
          }
        });
    }
  }

  acceptFollowRequest(usernameWhoSend: string) {
    if (this.loggedUserName) {
      this.profileService.acceptFollowRequest(this.loggedUserName, usernameWhoSend)
        .subscribe({
          next: () => {
            // Remove the accepted user from the pendingFollowRequests list
            this.pendingFollowRequests = this.pendingFollowRequests.filter(profile => profile.username !== usernameWhoSend);
            // Additional UI feedback or actions can be done here
          },
          error: (error) => {
            console.error('Error accepting follow request:', error);
          }
        });
    }
  }

  rejectFollowRequest(usernameWhoSend: string) {
    if (this.loggedUserName) {
      this.profileService.rejectFollowRequest(this.loggedUserName, usernameWhoSend)
        .subscribe({
          next: () => {
            // Remove the rejected user from the pendingFollowRequests list
            this.pendingFollowRequests = this.pendingFollowRequests.filter(profile => profile.username !== usernameWhoSend);
            // Additional UI feedback or actions can be done here
          },
          error: (error) => {
            console.error('Error rejecting follow request:', error);
          }
        });
    }
  }

  getNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.getMyNotifications()
        .pipe(takeUntil(this.unsubscribed$))
        .subscribe({
          next: (notifications) => {
            this.notifications = notifications
              .map(notification => new NotificationModel(
                notification.id,
                notification.triggeredByUserName,
                notification.triggeredByUserPhoto,
                notification.message,
                new Date(notification.createdAt),
                notification.isRead,
                notification.eventType
              ))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); 
            console.log(this.notifications);
          },
          error: (error) => {
            console.error('Error fetching notifications:', error);
          }
        });
    }
  }

  clearAllNotifications(): void {
    this.notificationService.markAllNotificationsAsRead()
      .subscribe({
        next: () => {
          this.notifications.forEach(notification => notification.isRead = true);
          console.log('Todas as notificações foram marcadas como lidas.');
          this.getNotifications();
        },
        error: error => console.error('Erro ao marcar todas as notificações como lidas', error)
      });
  }

}
