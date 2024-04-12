import { NotificationModel } from "./notification-model";

/**
 * Modelo para notificações de respostas a comentários. Estende o modelo de notificação base,
 * adicionando propriedades específicas como ID da mídia, tipo da mídia, ID do comentário,
 * ID do utilizador alvo e foto do utilizador que disparou a notificação.
 *
 * Propriedades:
 * - mediaId: Identificador da mídia associada à notificação.
 * - mediaType: Tipo da mídia (por exemplo, filme, série).
 * - commentId: Identificador do comentário associado à notificação.
 * - targetUserId: Identificador do utilizador alvo da notificação.
 * - triggeredByUserPhoto: Foto do utilizador que disparou a notificação.
 */
export class ReplyNotificationModel extends NotificationModel {
  mediaId: number;
  mediaType: string;
  commentId: number;
  targetUserId: string;
  triggeredByUserPhoto: string;


  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string,
    mediaId: number,
    mediaType: string,
    commentId: number,
    targetUserId: string,
  triggeredByUserPhoto: string

  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.mediaId = mediaId;
    this.mediaType = mediaType;
    this.commentId = commentId;
    this.targetUserId = targetUserId;
    this.triggeredByUserPhoto = triggeredByUserPhoto;

  }
}
