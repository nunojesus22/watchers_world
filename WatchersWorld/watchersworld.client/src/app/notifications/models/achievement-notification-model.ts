import { NotificationModel } from "./notification-model";

/**
 * Modelo para notificações de conquistas, como a obtenção de medalhas.
 * Estende o modelo base de notificação para incluir o ID da medalha do utilizador e a foto da conquista.
 *
 * Propriedades:
 * - userMedalId: Identificador da medalha do utilizador associada à notificação.
 * - achievementPhoto: URL ou caminho da foto representando a conquista ou medalha obtida.
 */
export class AchievementNotificationModel extends NotificationModel {
  userMedalId: number;
  achievementPhoto: string;

  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string,
    userMedalId: number,
    achievementPhoto: string
  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.achievementPhoto = achievementPhoto;
    this.userMedalId = userMedalId;
  }
}
