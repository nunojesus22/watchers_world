import { NotificationModel } from "./notification-model";

export class MediaNotificationModel extends NotificationModel {
  mediaName: string;
  mediaPhoto: string;
  userMediaId: number;

  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string,
    mediaName: string,
    mediaPhoto: string,
    userMediaId: number
  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.mediaName = mediaName;
    this.mediaPhoto = mediaPhoto;
    this.userMediaId = userMediaId;
  }
}
