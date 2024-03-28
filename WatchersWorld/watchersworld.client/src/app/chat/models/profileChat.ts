import { Message } from "./messages";

export interface ProfileChat {
  userName: string | undefined,
  profilePhoto: string,
  lastMessage: Message
}


