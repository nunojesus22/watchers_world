import { NotificationModel } from "./notification-model";

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
