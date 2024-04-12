import { Message } from "./messages";

/**
 * Define a estrutura para um perfil de chat, mostrando informações resumidas do chat na interface do utilizador.
 */
export interface ProfileChat {
  /**
   * Nome de utilizador do proprietário do perfil de chat.
   */
  userName: string | undefined;

  /**
   * URL da fotografia de perfil associada ao chat.
   */
  profilePhoto: string;

  /**
   * Última mensagem enviada ou recebida no chat.
   */
  lastMessage: Message | undefined;

  /**
   * Lista de mensagens não lidas no chat.
   */
  unreadMessages: Message[] | null;
}

