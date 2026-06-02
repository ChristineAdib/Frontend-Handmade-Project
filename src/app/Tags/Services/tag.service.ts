import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TagItem } from '../Models/TagItem';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/tags`;

  readonly tags         = signal<TagItem[]>([]);
  readonly selectedTag  = signal<TagItem | null>(null);
  readonly isLoading    = signal<boolean>(false);
  readonly error        = signal<string | null>(null);

  async loadAll(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<TagItem[]>(this.apiUrl)
      );
      this.tags.set(data);
    } catch {
      this.error.set('Failed to load tags.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async getById(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<TagItem>(`${this.apiUrl}/${id}`)
      );
      this.selectedTag.set(data);
    } catch {
      this.error.set('Tag not found.');
    } finally {
      this.isLoading.set(false);
    }
  }
}