import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchProducts } from './search-products';

describe('SearchProducts', () => {
  let component: SearchProducts;
  let fixture: ComponentFixture<SearchProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
