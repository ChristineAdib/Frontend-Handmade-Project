export enum OrderStatus {
  Pending = 1,
  Confirmed = 2,
  Processing = 3,
  Shipped = 4,
  Delivered = 5,
  Cancelled = 6,
  Refunded = 7
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Confirmed]: 'Confirmed',
  [OrderStatus.Processing]: 'Processing',
  [OrderStatus.Shipped]: 'Shipped',
  [OrderStatus.Delivered]: 'Delivered',
  [OrderStatus.Cancelled]: 'Cancelled',
  [OrderStatus.Refunded]: 'Refunded',
};
