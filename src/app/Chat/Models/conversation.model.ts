import { MessageItem } from './MessageItem';

export interface Conversation {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerImage?: string;
  sellerId: string;
  sellerName: string;
  sellerImage?: string;
  lastMessage: MessageItem | null;
  unreadCount: number;
  createdAt: string;
}
