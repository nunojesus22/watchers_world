import { NotificationModel } from "./notification-model";

export class ReplyNotificationModel extends NotificationModel {
  mediaId: number;
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
    commentId: number,
    targetUserId: string,
  triggeredByUserPhoto: string

  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.mediaId = mediaId;
    this.commentId = commentId;
    this.targetUserId = targetUserId;
    this.triggeredByUserPhoto = triggeredByUserPhoto;

  }
}
