import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopPublic } from './shop-public';

describe('ShopPublic', () => {
  let component: ShopPublic;
  let fixture: ComponentFixture<ShopPublic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopPublic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopPublic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
