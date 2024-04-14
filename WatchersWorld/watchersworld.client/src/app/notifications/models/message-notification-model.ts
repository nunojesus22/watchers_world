import { NotificationModel } from "./notification-model";

/**
 * Modelo para notificações de mensagens. Estende o modelo de notificação base,
 * incluindo propriedades específicas como ID do utilizador alvo e foto do utilizador que disparou a notificação.
 *
 * Propriedades:
 * - targetUserId: Identificador do utilizador alvo da notificação.
 * - triggeredByUserPhoto: Foto do utilizador que disparou a notificação.
 */
export class MessageNotificationModel extends NotificationModel {
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
