import { MessageType } from './MessageType';

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  imageUrl: string | null;
  isRead: boolean;
  senderId: string;
  senderName: string;
  conversationId: string;
  createdAt: string;
}
