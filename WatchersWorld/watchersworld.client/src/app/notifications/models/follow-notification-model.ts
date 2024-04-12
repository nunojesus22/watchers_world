import { NotificationModel } from "./notification-model";

/**
 * Modelo para notificações de novos seguidores. Estende o modelo base de notificação,
 * incluindo o ID do utilizador alvo e a foto do utilizador que disparou a notificação.
 *
 * Propriedades:
 * - targetUserId: Identificador do utilizador alvo da notificação.
 * - triggeredByUserPhoto: URL ou caminho da foto do utilizador que disparou a notificação.
 */
export class FollowNotificationModel extends NotificationModel {
  targetUserId: string;
  triggeredByUserPhoto: string;

  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string,
    targetUserId: string,
    triggeredByUserPhoto: string
  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.targetUserId = targetUserId;
    this.triggeredByUserPhoto = triggeredByUserPhoto;
  }
}
