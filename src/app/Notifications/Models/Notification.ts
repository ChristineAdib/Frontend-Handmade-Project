import { NotificationType } from "./NotificationType";

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type: NotificationType;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  createdAt: string;
}