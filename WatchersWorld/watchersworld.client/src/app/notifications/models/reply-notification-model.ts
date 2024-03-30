import { NotificationModel } from "./notification-model";

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