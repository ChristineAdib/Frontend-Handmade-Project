import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { OrderStatus, OrderStatusLabel } from '../../../orders/models/order-status';
import { LanguageService } from '../../../core/services/language.service';
import { OrderService } from '../../../orders/services/order.service';
import { ShopService } from '../../../shop feature/services/shop-service';

interface SellerOrder {
  id: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
}

interface OrderDetail {
  id: string;
  buyerEmail: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  country: string;
  deliveryMethodName: string;
  deliveryMethodCost: number;
  subTotal: number;
  discountAmount?: number;
  total: number;
  notes?: string;
  couponCode?: string;
  items: {
    id: string;
    productName: string;
    pictureUrl: string;
    quantity: number;
    price: number;
    total: number;
  }[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  protected readonly langService = inject(LanguageService);
  OrderStatus = OrderStatus;
  OrderStatusLabel = OrderStatusLabel;
  private orderService = inject(OrderService);
  private shopService = inject(ShopService);
  private toastr = inject(ToastrService);

  orders = signal<SellerOrder[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  totalCount = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  selectedStatus = signal<string | null>(null);
  shopId = signal('');

  selectedOrder = signal<OrderDetail | null>(null);
  isDetailLoading = signal(false);
  isUpdatingStatus = signal(false);
  updateStatusError = signal<string | null>(null);

statuses = ['Processing', 'Shipped', 'Delivered'];
  ngOnInit() {
    this.shopService.getMyShop().subscribe({
      next: shop => {
        this.shopId.set(shop.id);
        this.loadOrders();
      },
      error: () => {
        this.error.set('Failed to load shop');
        this.isLoading.set(false);
      }
    });
  }

  loadOrders() {
    this.isLoading.set(true);
    this.orderService.getSellerOrders(this.shopId(), this.currentPage()).subscribe({
      next: res => {
        this.orders.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load orders');
        this.isLoading.set(false);
      }
    });
  }

  openOrderDetail(orderId: string) {
    this.isDetailLoading.set(true);
    this.selectedOrder.set(null);
    this.orderService.getOrderById(orderId).subscribe({
      next: order => {
        this.selectedOrder.set(order);
        this.isDetailLoading.set(false);
      },
      error: () => this.isDetailLoading.set(false)
    });
  }

  closeDetail() {
    this.selectedOrder.set(null);
  }

  translateOrderStatus(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return this.langService.translate('pending');
      case OrderStatus.Confirmed: return this.langService.translate('confirmed');
      case OrderStatus.Processing: return this.langService.translate('processing');
      case OrderStatus.Shipped: return this.langService.translate('shipped');
      case OrderStatus.Delivered: return this.langService.translate('delivered');
      case OrderStatus.Cancelled: return this.langService.translate('cancelled');
      case OrderStatus.Refunded: return this.langService.translate('refunded');
      default: return '';
    }
  }
 
  filteredOrders() {
    const status = this.selectedStatus();
    if (!status) return this.orders();
    return this.orders().filter(o => o.status === status);
  }
 
  filterByStatus(status: string | null) {
    this.selectedStatus.set(status);
  }
 
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending':    'status-pending',
      'Confirmed':  'status-confirmed',
      'Processing': 'status-processing',
      'Shipped':    'status-shipped',
      'Delivered':  'status-delivered',
      'Cancelled':  'status-cancelled',
      'Refunded':   'status-refunded',
    };
    return map[status] ?? '';
  }
 
 canTransition(current: string, next: string): boolean {
  if (current === 'Delivered') return false;
  if (current === 'Shipped' && next === 'Processing') return false;
  return this.getAvailableStatusOptions(current).includes(next);
}

getAvailableStatusOptions(currentStatus: string): string[] {
  if (currentStatus === 'Processing') return ['Processing', 'Shipped'];
  if (currentStatus === 'Shipped') return ['Shipped'];
  return [currentStatus]; // Delivered (أو أي حالة تانية) - مقفولة
}

isStatusEditable(currentStatus: string): boolean {
  return currentStatus === 'Processing' || currentStatus === 'Shipped';
}

onStatusChange(orderId: string, event: Event) {
  const select = event.target as HTMLSelectElement;
  const nextStatusStr = select.value;
  const currentOrder = this.selectedOrder();
  if (!currentOrder) return;

  if (nextStatusStr === currentOrder.status) return;

  if (!this.canTransition(currentOrder.status, nextStatusStr)) {
    select.value = currentOrder.status;
    return;
  }

  const statusMap: Record<string, OrderStatus> = {
    'Pending': OrderStatus.Pending,
    'Confirmed': OrderStatus.Confirmed,
    'Processing': OrderStatus.Processing,
    'Shipped': OrderStatus.Shipped,
    'Delivered': OrderStatus.Delivered,
    'Cancelled': OrderStatus.Cancelled,
    'Refunded': OrderStatus.Refunded,
  };

  const nextStatusEnum = statusMap[nextStatusStr];
  if (!nextStatusEnum) return;

  if (confirm(`Are you sure you want to change the order status to ${nextStatusStr}?`)) {
    this.isUpdatingStatus.set(true);
    this.updateStatusError.set(null);

    this.orderService.updateStatus(orderId, { status: nextStatusEnum }).then(success => {
      this.isUpdatingStatus.set(false);
      if (success) {
        this.selectedOrder.update(order => order ? { ...order, status: nextStatusStr } : null);
        this.orders.update(prevList =>
          prevList.map(o => o.id === orderId ? { ...o, status: nextStatusStr } : o)
        );
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تم تحديث حالة الطلب بنجاح!'
            : 'Order status updated successfully!'
        );
      } else {
        select.value = currentOrder.status;
        this.updateStatusError.set(this.orderService.error() || 'Failed to update order status.');
        this.toastr.error(this.updateStatusError()!);
      }
    }).catch(() => {
      this.isUpdatingStatus.set(false);
      select.value = currentOrder.status;
      this.updateStatusError.set('Failed to update status');
      this.toastr.error('Failed to update status');
    });
  } else {
    select.value = currentOrder.status;
  }
}
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadOrders();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadOrders();
    }
  }
}