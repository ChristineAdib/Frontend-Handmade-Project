import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopShops } from './top-shops';

describe('TopShops', () => {
  let component: TopShops;
  let fixture: ComponentFixture<TopShops>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopShops]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopShops);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
