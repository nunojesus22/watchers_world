import { NotificationModel } from "./notification-model";

/**
 * Modelo para notificações de mensagens. Estende o modelo de notificação base,
 * incluindo propriedades específicas como ID do usuário alvo e foto do usuário que disparou a notificação.
 *
 * Propriedades:
 * - targetUserId: Identificador do usuário alvo da notificação.
 * - triggeredByUserPhoto: Foto do usuário que disparou a notificação.
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
