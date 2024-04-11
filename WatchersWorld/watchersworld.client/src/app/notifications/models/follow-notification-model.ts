import { NotificationModel } from "./notification-model";

/**
 * Modelo para notificações de novos seguidores. Estende o modelo base de notificação,
 * incluindo o ID do usuário alvo e a foto do usuário que disparou a notificação.
 *
 * Propriedades:
 * - targetUserId: Identificador do usuário alvo da notificação.
 * - triggeredByUserPhoto: URL ou caminho da foto do usuário que disparou a notificação.
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
