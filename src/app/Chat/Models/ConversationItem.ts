import { MessageItem } from "./MessageItem";

export interface ConversationItem {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: MessageItem | null;
  unreadCount: number;
  createdAt: string;
}