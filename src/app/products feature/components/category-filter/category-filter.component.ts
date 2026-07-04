import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../Categories/Services/category.service';
import { CategoryResponse } from '../../../Categories/Models/CategoryResponse';
import { CategorySummary } from '../../../Categories/Models/CategorySummary';
import { LanguageService } from '../../../core/services/language.service';
 
@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss'
})
export class CategoryFilterComponent implements OnInit, OnChanges {
  private categoryService = inject(CategoryService);
  public langService = inject(LanguageService);
 
  // اسم الكاتيجوري الجاي من الـ URL (من الهيدر / الهوم)
  @Input() initialCategoryName: string | null = null;
 
  // بيرجع الـ ids اللي هنفلتر بيها فعليًا (أب + subs، أو sub واحد بس، أو [] لو All)
  @Output() categoryIdsChange = new EventEmitter<string[]>();
 
  categories: CategoryResponse[] = [];
  selectedParent: CategoryResponse | null = null;
  selectedSub: CategorySummary | null = null;
  isLoading = true;
 
  // لو جاي من لينك category محدد (هيدر/هوم) → نخفي صف "All Categories/Beads/Crochet/Pottery"
  // ونعرض بس السب-كاتيجوري بتاعة الكاتيجوري دي
  lockedToCategory = false;
 
  private appliedInitial = false;
 
  async ngOnInit(): Promise<void> {
    this.isLoading = true;
 
    if (this.categoryService.categories().length === 0) {
      await this.categoryService.loadAll();
    }
    this.categories = this.categoryService.categories();
    this.isLoading = false;
 
    this.tryApplyInitial();
  }
 
  // ✅ بيتفاعل مع أي تغيير في initialCategoryName حتى لو الـ component نفسه
  // فضل موجود من غير إعادة إنشاء (مثلاً لما تدوسي كاتيجوري تانية من الهيدر
  // وانتي أصلاً واقفة على /products)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialCategoryName'] && !changes['initialCategoryName'].firstChange) {
      this.applyCategoryName(this.initialCategoryName);
    }
  }
 
  private tryApplyInitial(): void {
    if (this.appliedInitial || !this.categories.length) return;
    this.appliedInitial = true;
    this.applyCategoryName(this.initialCategoryName);
  }
 
  private applyCategoryName(name: string | null): void {
    if (name) {
      const match = this.categories.find(
        c => c.nameEn.toLowerCase() === name.toLowerCase()
      );
      if (match) {
        this.lockedToCategory = true;
        this.selectedParent = match;
        this.selectedSub = null;
        this.emitIds();
        return;
      }
    }
 
    // مفيش category param → صفحة تصفح عادية، نبعت [] (كل المنتجات)
    this.lockedToCategory = false;
    this.selectedParent = null;
    this.selectedSub = null;
    this.emitIds();
  }
 
  // ── صف الكاتيجوري الرئيسي (بيظهر بس لو مش lockedToCategory) ──
  selectParent(cat: CategoryResponse | null): void {
    this.selectedParent = cat;
    this.selectedSub = null;
    this.emitIds();
  }
 
  // ── صف السب-كاتيجوري ──
  selectSub(sub: CategorySummary | null): void {
    this.selectedSub = sub;
    this.emitIds();
  }
 
  private emitIds(): void {
    if (!this.selectedParent) {
      this.categoryIdsChange.emit([]);
      return;
    }
    if (this.selectedSub) {
      this.categoryIdsChange.emit([this.selectedSub.id]);
      return;
    }
    // كل الكاتيجوري (الأب + كل السب بتاعته)
    const subIds = (this.selectedParent.subCategories || []).map(s => s.id);
    this.categoryIdsChange.emit([this.selectedParent.id, ...subIds]);
  }
 
  get hasSubcategories(): boolean {
    return !!this.selectedParent?.subCategories?.length;
  }
 
  displayName(cat: CategoryResponse | CategorySummary): string {
    return this.langService.currentLang() === 'ar' ? cat.nameAr : cat.nameEn;
  }
}