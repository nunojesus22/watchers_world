import { NotificationModel } from "./notification-model";

/**
 * Modelo para notificações relacionadas a novos episódios de mídia, como filmes ou séries.
 * Estende o modelo base de notificação para incluir informações específicas da mídia.
 *
 * Propriedades:
 * - mediaId: Identificador da mídia associada à notificação.
 * - mediaName: Nome da mídia associada.
 * - mediaPhoto: URL ou caminho da foto da mídia associada.
 * - userMediaId: Identificador único da relação UserMedia associada à notificação.
 */
export class MediaNotificationModel extends NotificationModel {
  mediaId: number;
  mediaName: string;
  mediaPhoto: string;
  userMediaId: number;

  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string,
    mediaId: number,
    mediaName: string,
    mediaPhoto: string,
    userMediaId: number
  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.mediaId = mediaId;
    this.mediaName = mediaName;
    this.mediaPhoto = mediaPhoto;
    this.userMediaId = userMediaId;
  }
}
