import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { ShopService } from '../../../shop feature/services/shop-service';
import { SellerWallet, BankAccount } from '../../../payments/models/payment-models';

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

  // Bank Account / Payout Method
  bankAccount = signal<BankAccount | null>(null);
  isBankAccountConfigured = signal<boolean>(false);
  showBankForm = signal<boolean>(false);
  bankFormData = signal<BankAccount>({ bankName: '', accountHolderName: '', accountNumber: '' });
  isSavingBank = signal<boolean>(false);
  bankSaveError = signal<string | null>(null);
  bankSaveSuccess = signal<string | null>(null);

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
        this.loadBankAccount();
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

  async loadBankAccount() {
    const data = await this.paymentService.getBankAccount();
    if (data) {
      this.bankAccount.set(data);
      this.isBankAccountConfigured.set(
        !!(data.bankName && data.accountHolderName && data.accountNumber)
      );
    }
  }

  openBankForm() {
    const current = this.bankAccount();
    this.bankFormData.set({
      bankName: current?.bankName || '',
      accountHolderName: current?.accountHolderName || '',
      accountNumber: current?.accountNumber || ''
    });
    this.bankSaveError.set(null);
    this.bankSaveSuccess.set(null);
    this.showBankForm.set(true);
  }

  closeBankForm() {
    this.showBankForm.set(false);
  }

  updateBankField(field: keyof BankAccount, value: string) {
    this.bankFormData.update(prev => ({ ...prev, [field]: value }));
  }

  async saveBankAccount() {
    const form = this.bankFormData();
    const isAr = this.langService.currentLang() === 'ar';

    if (!form.bankName || !form.accountHolderName || !form.accountNumber) {
      this.bankSaveError.set(isAr ? 'جميع الحقول مطلوبة' : 'All fields are required.');
      return;
    }

    this.isSavingBank.set(true);
    this.bankSaveError.set(null);
    this.bankSaveSuccess.set(null);

    const success = await this.paymentService.updateBankAccount(form);
    if (success) {
      this.bankSaveSuccess.set(isAr ? 'تم حفظ بيانات الحساب بنجاح!' : 'Bank account saved successfully!');
      this.bankAccount.set({ ...form });
      this.isBankAccountConfigured.set(true);
      setTimeout(() => this.closeBankForm(), 1500);
    } else {
      this.bankSaveError.set(this.paymentService.error() || (isAr ? 'فشل حفظ البيانات' : 'Failed to save bank account.'));
    }
    this.isSavingBank.set(false);
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
      await this.loadWallet();
      setTimeout(() => {
        this.closeWithdrawModal();
      }, 2000);
    } else {
      this.withdrawalError.set(this.paymentService.error() || (isAr ? 'فشلت عملية السحب' : 'Withdrawal failed.'));
    }
    this.isSubmittingWithdrawal.set(false);
  }
}
