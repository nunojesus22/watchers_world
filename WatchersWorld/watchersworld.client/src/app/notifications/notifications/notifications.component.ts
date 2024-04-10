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
import { AchievementNotificationModel } from '../models/achievement-notification-model';
import { MessageNotificationModel } from '../models/message-notification-model';
import { MediaNotificationModel } from '../models/media-notification-model';

/**
 * Componente responsável pela exibição e gestão das notificações dos utilizadores.
 * Permite visualizar diferentes tipos de notificações como novos seguidores, respostas,
 * conquistas, mensagens e notificações de media.
 */
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
  achievementNotifications: AchievementNotificationModel[] = [];
  messageNotifications: MessageNotificationModel[] = [];
  mediaNotifications: MediaNotificationModel[] = [];

  allNotifications: any[] = [];

  /**
  * Construtor da classe NotificationsComponent.
  * @param profileService Serviço para gestão das informações de perfil.
  * @param authService Serviço de autenticação.
  * @param notificationService Serviço para gestão das notificações.
  * @param route Informação sobre a rota ativa.
  */
  constructor(private profileService: ProfileService, public authService: AuthenticationService, public notificationService: NotificationService, private route: ActivatedRoute) { }

  /**
   * Método de inicialização do componente. Define o nome de utilizador atual e carrega todas as notificações pertinentes.
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
      }
    });
    this.loggedUserName = this.authService.getLoggedInUserName();
    this.getPendingFollowRequests();

    this.loadFollowNotifications();
    this.loadReplyNotifications();
    this.loadAchievementNotifications();
    this.loadMessageNotifications();
    this.loadMediaNotifications();
    setTimeout(() => {
      this.markNotificationsAsRead();
    }, 1000);
  }

  /**
   * Método de limpeza ao destruir o componente. Completa o Subject `unsubscribed$` para evitar vazamentos de memória.
   */
  ngOnDestroy() {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  /**
  * Carrega as solicitações de seguimento pendentes para o utilizador autenticado.
  * Atualiza a lista de solicitações de seguimento pendentes no componente.
  */
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

  /**
  * Aceita uma solicitação de seguimento de outro utilizador.
  * Após a aceitação, atualiza a lista de notificações de seguimento.
  * 
  * @param usernameWhoSend O nome de utilizador que enviou a solicitação de seguimento.
  */
  acceptFollowRequest(usernameWhoSend: string) {
    if (this.loggedUserName) {
      this.profileService.acceptFollowRequest(this.loggedUserName, usernameWhoSend)
        .subscribe({
          next: () => {
            this.pendingFollowRequests = this.pendingFollowRequests.filter(profile => profile.username !== usernameWhoSend);
            this.loadFollowNotifications();
          },
          error: (error) => {
            console.error('Error accepting follow request:', error);
          }
        });
    }
  }

  /**
  * Rejeita uma solicitação de seguimento de outro utilizador.
  * Após a rejeição, remove o utilizador da lista de solicitações de seguimento pendentes.
  * 
  * @param usernameWhoSend O nome de utilizador que enviou a solicitação de seguimento.
  */
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

  /**
   * Extrai o nome de utilizador de uma mensagem de notificação.
   * Utilizado para obter o nome do utilizador que enviou a notificação.
   * 
   * @param message A mensagem de notificação.
   * @returns O nome de utilizador extraído da mensagem.
   */
  getUserNameFromMessage(message: string): string {
    const usernameEndIndex = message.indexOf(' ');
    return message.substring(0, usernameEndIndex);
  }

  /**
   * Carrega as notificações de novos seguidores para o utilizador autenticado.
   * Atualiza a lista de notificações de seguimento no componente.
   */
  loadFollowNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.getFollowNotificationsForUser(this.loggedUserName)
        .subscribe({
          next: (notifications) => {
            if (notifications && notifications.length > 0) {
              this.followNotifications = notifications;
              this.combineAndSortNotifications();
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

  /**
   * Carrega as notificações de respostas a comentários para o utilizador autenticado.
   * Atualiza a lista de notificações de resposta no componente.
   */
  loadReplyNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.getReplyNotifications(this.loggedUserName)
        .subscribe({
          next: (notifications) => {
            if (notifications && notifications.length > 0) {
              this.replyNotifications = notifications;
              this.combineAndSortNotifications();
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

  /**
   * Carrega as notificações de conquistas alcançadas pelo utilizador autenticado.
   * Atualiza a lista de notificações de conquista no componente.
   */
  loadAchievementNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.getAchievementNotifications(this.loggedUserName)
        .subscribe({
          next: (notifications) => {
            if (notifications && notifications.length > 0) {
              this.achievementNotifications = notifications;
              this.combineAndSortNotifications();
              console.log('Notificações de conquista recebidas:', notifications);
            } else {
              this.achievementNotifications = [];
              console.log('Não há notificações de conquista.');
            }
          },
          error: (err) => {
            console.error('Erro ao buscar notificações de conquista:', err);
          }
        });
    }
  }

  /**
   * Carrega as notificações de mensagens recebidas pelo utilizador autenticado.
   * Atualiza a lista de notificações de mensagem no componente.
   */
  loadMessageNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.getMessageNotificationsForUser(this.loggedUserName)
        .subscribe({
          next: (notifications) => {
            if (notifications && notifications.length > 0) {
              this.messageNotifications = notifications;
              this.combineAndSortNotifications();
              console.log('Notificações de mensagem recebidas:', notifications);
            } else {
              this.messageNotifications = [];
              console.log('Não há notificações de conquista.');
            }
          },
          error: (err) => {
            console.error('Erro ao buscar notificações de conquista:', err);
          }
        });
    }
  }

  /**
   * Carrega as notificações relacionadas a media (filmes, séries) para o utilizador autenticado.
   * Atualiza a lista de notificações de media no componente.
   */
  loadMediaNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.getMediaNotifications(this.loggedUserName)
        .subscribe({
          next: (notifications) => {
            if (notifications && notifications.length > 0) {
              this.mediaNotifications = notifications;
              this.combineAndSortNotifications();
              console.log('Notificações de media recebidas:', notifications);
            } else {
              this.messageNotifications = [];
              console.log('Não há notificações de media.');
            }
          },
          error: (err) => {
            console.error('Erro ao buscar notificações de media:', err);
          }
        });
    }
  }

  /**
   * Marca todas as notificações do utilizador autenticado como lidas.
   * Realiza a operação para cada tipo de notificação.
   */
  markNotificationsAsRead(): void {
    if (this.loggedUserName) {
      this.notificationService.markAllFollowNotificationsAsRead(this.loggedUserName).subscribe(() => {
      });
      this.notificationService.markAllReplyNotificationsAsRead(this.loggedUserName).subscribe(() => {
      });
      this.notificationService.markAllAchievementNotificationsAsRead(this.loggedUserName).subscribe(() => {
      });
      this.notificationService.markAllMessageNotificationsAsRead(this.loggedUserName).subscribe(() => {
      });
      this.notificationService.markAllMediaNotificationsAsRead(this.loggedUserName).subscribe(() => {
      });
    }
  }

  /**
   * Limpa todas as notificações do utilizador autenticado.
   * Remove todas as notificações das listas no componente.
   */
  clearAllNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.clearNotifications(this.loggedUserName).subscribe(() => {
        this.followNotifications = [];
        this.replyNotifications = [];
        this.achievementNotifications = [];
        this.messageNotifications = [];
        this.mediaNotifications = [];
        console.log('Todas as notificações foram limpas.');
      });
    }
  }

  /**
   * Combina e ordena todas as notificações recebidas pelo utilizador autenticado em uma única lista.
   * Ordena as notificações pela data de criação, da mais recente para a mais antiga.
   */
  combineAndSortNotifications(): void {
    const allNotifications = [
      ...this.followNotifications,
      ...this.replyNotifications,
      ...this.achievementNotifications,
      ...this.messageNotifications,
      ...this.mediaNotifications
    ];

    allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.allNotifications = allNotifications;
  }
}
