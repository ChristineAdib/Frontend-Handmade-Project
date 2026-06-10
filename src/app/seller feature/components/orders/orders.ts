import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private shopService = inject(ShopService);

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

  statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

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
      'Processing': 'status-processing',
      'Shipped':    'status-shipped',
      'Delivered':  'status-delivered',
      'Cancelled':  'status-cancelled',
      'Refunded':   'status-refunded',
    };
    return map[status] ?? '';
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