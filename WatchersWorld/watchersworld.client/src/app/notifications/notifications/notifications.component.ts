import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Profile } from '../../profile/models/profile';
import { FollowerProfile } from '../../profile/models/follower-profile';
import { ProfileService } from '../../profile/services/profile.service';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { NotificationService } from '../services/notification.service';
import { NotificationModel } from '../models/notification-model';
import { FollowNotificationModel } from '../models/follow-notification-model';
import { ReplyNotificationModel } from '../models/reply-notification-model';


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
  followNotifications: FollowNotificationModel[] = [];
  replyNotifications: ReplyNotificationModel[] = [];


  constructor(private profileService: ProfileService, public authService: AuthenticationService, public notificationService: NotificationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
      }
    });
    this.loggedUserName = this.authService.getLoggedInUserName();
    this.getPendingFollowRequests();
    // this.getNotifications();

    this.loadFollowNotifications();
    this.loadReplyNotifications();
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

  getUserNameFromMessage(message: string): string {
    const usernameEndIndex = message.indexOf(' ');
    return message.substring(0, usernameEndIndex);
  }

  loadFollowNotifications(): void {
    if(this.loggedUserName)
    this.notificationService.getFollowNotificationsForUser(this.loggedUserName)
      .subscribe({
        next: (notifications) => {
          console.log(notifications);
          this.followNotifications = notifications;
        },
        error: (err) => {
          console.error('Erro ao buscar notificações de seguimento:', err);
        }
      });
  }

  loadReplyNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.getReplyNotifications(this.loggedUserName)
        .subscribe({
          next: (notifications) => {
            console.log(notifications);
            this.replyNotifications = notifications;
          },
          error: (err) => {
            console.error('Erro ao buscar notificações de resposta:', err);
          }
        });
    }
  }

  //getNotifications(): void {
  //  if (this.loggedUserName) {
  //    this.notificationService.getMyNotifications(this.loggedUserName)
  //      .pipe(takeUntil(this.unsubscribed$))
  //      .subscribe({
  //        next: (notifications: any[]) => { // Assumindo que você tem um tipo específico para o DTO
  //          this.notifications = notifications
  //            .filter(notification => notification.eventType === 'NewFollower')
  //            .map(notification => new FollowNotificationModel(
  //              notification.triggeredByUserId, // deve corresponder ao DTO do servidor
  //              notification.message, // deve corresponder ao DTO do servidor
  //              new Date(notification.createdAt), // ajuste conforme a serialização da data
  //              notification.isRead, // deve corresponder ao DTO do servidor
  //              notification.eventType, // deve corresponder ao DTO do servidor
  //              notification.targetUserId, // deve corresponder ao DTO do servidor
  //              notification.triggeredByUserPhoto // deve corresponder ao DTO do servidor
  //            ))
  //            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  //          console.log(this.notifications);
  //        },
  //        error: (error) => {
  //          console.error('Error fetching notifications:', error);
  //        }
  //      });
  //  }
  //}





  //clearAllNotifications(): void {
  //  this.notificationService.markAllNotificationsAsRead()
  //    .subscribe({
  //      next: () => {
  //        this.notifications.forEach(notification => notification.isRead = true);
  //        console.log('Todas as notificações foram marcadas como lidas.');
  //        this.getNotifications();
  //      },
  //      error: error => console.error('Erro ao marcar todas as notificações como lidas', error)
  //    });
  //}

}
