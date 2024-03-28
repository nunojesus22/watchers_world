import { Message } from "./messages";


export interface ChatWithMessages {
  username: string,
  profilePhoto: string,
  messages: Message[]
}

