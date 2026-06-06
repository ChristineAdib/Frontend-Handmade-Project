import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddProduct } from '../add-product/add-product';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, AddProduct],
  templateUrl: './my-products.html',
  styleUrl: './my-products.css',
})
export class MyProducts {
  activeTab = signal<'list' | 'add'>('list');
  setTab(tab: 'list' | 'add') { this.activeTab.set(tab); }
}