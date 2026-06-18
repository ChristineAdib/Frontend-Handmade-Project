import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { ShopService } from '../../../shop feature/services/shop-service';
import { SellerWallet } from '../../../payments/models/payment-models';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './earnings.html',
  styleUrl: './earnings.css',
})
export class Earnings implements OnInit {
  private paymentService = inject(PaymentService);
  private shopService = inject(ShopService);
  protected readonly langService = inject(LanguageService);

  wallet = signal<SellerWallet | null>(null);
  shopId = signal<string>('');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Withdrawal modal / form fields
  showWithdrawModal = signal<boolean>(false);
  withdrawAmount = signal<number | null>(null);
  withdrawNotes = signal<string>('');
  isSubmittingWithdrawal = signal<boolean>(false);
  withdrawalError = signal<string | null>(null);
  withdrawalSuccess = signal<string | null>(null);

  ngOnInit() {
    this.shopService.getMyShop().subscribe({
      next: (shop) => {
        this.shopId.set(shop.id);
        this.loadWallet();
      },
      error: () => {
        const isAr = this.langService.currentLang() === 'ar';
        this.error.set(isAr ? 'فشل تحميل تفاصيل المتجر' : 'Failed to load shop details.');
        this.isLoading.set(false);
      }
    });
  }

  async loadWallet() {
    this.isLoading.set(true);
    const data = await this.paymentService.getSellerWallet();
    if (data) {
      this.wallet.set(data);
      this.error.set(null);
    } else {
      const isAr = this.langService.currentLang() === 'ar';
      this.error.set(isAr ? 'فشل تحميل بيانات المحفظة' : 'Failed to load wallet details.');
    }
    this.isLoading.set(false);
  }

  openWithdrawModal() {
    this.withdrawAmount.set(null);
    this.withdrawNotes.set('');
    this.withdrawalError.set(null);
    this.withdrawalSuccess.set(null);
    this.showWithdrawModal.set(true);
  }

  closeWithdrawModal() {
    this.showWithdrawModal.set(false);
  }

  async submitWithdrawal() {
    const amount = this.withdrawAmount();
    const available = this.wallet()?.availableBalance || 0;
    const isAr = this.langService.currentLang() === 'ar';

    if (!amount || amount <= 0) {
      this.withdrawalError.set(isAr ? 'برجاء إدخال مبلغ صحيح أكبر من الصفر' : 'Please enter a valid amount greater than zero.');
      return;
    }

    if (amount > available) {
      this.withdrawalError.set(isAr ? 'المبلغ المطلوب يتجاوز الرصيد المتاح للسحب' : 'Requested amount exceeds your available balance.');
      return;
    }

    this.isSubmittingWithdrawal.set(true);
    this.withdrawalError.set(null);
    this.withdrawalSuccess.set(null);

    const success = await this.paymentService.requestWithdrawal({
      shopId: this.shopId(),
      amount: amount,
      notes: this.withdrawNotes()
    });

    if (success) {
      this.withdrawalSuccess.set(isAr ? 'تمت عملية السحب بنجاح كعملية محاكاة!' : 'Withdrawal processed successfully as a simulation!');
      // Reload wallet to show updated balance and transaction history
      await this.loadWallet();
      // Delay closing modal slightly so they see the success message
      setTimeout(() => {
        this.closeWithdrawModal();
      }, 2000);
    } else {
      this.withdrawalError.set(this.paymentService.error() || (isAr ? 'فشلت عملية السحب' : 'Withdrawal failed.'));
    }
    this.isSubmittingWithdrawal.set(false);
  }
}
