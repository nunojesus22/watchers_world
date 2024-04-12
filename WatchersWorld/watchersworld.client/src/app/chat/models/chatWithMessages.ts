import { Message } from "./messages";

/**
 * Representa um chat contendo um conjunto de mensagens entre utilizadors.
 */
export interface ChatWithMessages {
  /**
   * Nome de utilizador associado ao chat.
   */
  username: string;

  /**
   * URL para a fotografia de perfil do utilizador associado ao chat.
   */
  profilePhoto: string;

  /**
   * Lista de mensagens pertencentes ao chat.
   */
  messages: Message[];
}

