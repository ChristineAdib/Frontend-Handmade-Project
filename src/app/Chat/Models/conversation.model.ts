import { MessageItem } from './MessageItem';

export interface Conversation {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: MessageItem | null;
  unreadCount: number;
  createdAt: string;
}
