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
    setTimeout(() => {
      this.markNotificationsAsRead();
    }, 1000);
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
            this.pendingFollowRequests = this.pendingFollowRequests.filter(profile => profile.username !== usernameWhoSend);
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
            this.pendingFollowRequests = this.pendingFollowRequests.filter(profile => profile.username !== usernameWhoSend);
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
    if (this.loggedUserName) {
      this.notificationService.getFollowNotificationsForUser(this.loggedUserName)
        .subscribe({
          next: (notifications) => {
            if (notifications && notifications.length > 0) {
              this.followNotifications = notifications;
              console.log('Notificações de seguimento recebidas:', notifications);
            } else {
              this.followNotifications = [];
              console.log('Não há notificações de seguimento.');
            }
          },
          error: (err) => {
            console.error('Erro ao buscar notificações de seguimento:', err);
          }
        });
    }
  }

  loadReplyNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.getReplyNotifications(this.loggedUserName)
        .subscribe({
          next: (notifications) => {
            if (notifications && notifications.length > 0) {
              this.replyNotifications = notifications;
              console.log('Notificações de resposta recebidas:', notifications);
            } else {
              this.replyNotifications = [];
              console.log('Não há notificações de resposta.');
            }
          },
          error: (err) => {
            console.error('Erro ao buscar notificações de resposta:', err);
          }
        });
    }
  }

  markNotificationsAsRead(): void {
    if (this.loggedUserName) {
      this.notificationService.markAllFollowNotificationsAsRead(this.loggedUserName).subscribe(() => {
      });
      this.notificationService.markAllReplyNotificationsAsRead(this.loggedUserName).subscribe(() => {
      });
    }
  }

  clearAllNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.clearNotifications(this.loggedUserName).subscribe(() => {
        this.followNotifications = [];
        this.replyNotifications = [];
        console.log('Todas as notificações foram limpas.');
      });
    }
  }


}
