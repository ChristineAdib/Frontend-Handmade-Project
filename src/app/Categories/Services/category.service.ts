import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CategoryResponse} from '../Models/CategoryResponse';
import { CategorySummary } from '../Models/CategorySummary';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/categories`;

  // ── Signals ────────────────────────────────────────────────
  readonly categories      = signal<CategoryResponse[]>([]);
  readonly selectedCategory = signal<CategoryResponse | null>(null);
  readonly subCategories   = signal<CategorySummary[]>([]);
  readonly isLoading       = signal<boolean>(false);
  readonly error           = signal<string | null>(null);

  // ── GET /api/categories ────────────────────────────────────
  async loadAll(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<CategoryResponse[]>(this.apiUrl,
      {withCredentials:  true})
      );
      this.categories.set(data);
    } catch {
      this.error.set('Failed to load categories.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── GET /api/categories/{id} ───────────────────────────────
  async getById(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<CategoryResponse>(`${this.apiUrl}/${id}`, {withCredentials:  true})
      );
      this.selectedCategory.set(data);
    } catch {
      this.error.set('Category not found.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── GET /api/categories/{parentId}/subcategories ───────────
  async loadSubCategories(parentId: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<CategorySummary[]>(`${this.apiUrl}/${parentId}/subcategories`, {withCredentials:  true})
      );
      this.subCategories.set(data);
    } catch {
      this.error.set('Failed to load subcategories.');
    } finally {
      this.isLoading.set(false);
    }
  }
}