import { MessageType } from "./MessageType";

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: MessageType;
  imageUrl?: string | null;
}