import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopShopsComponent } from './top-shops';

describe('TopShops', () => {
  let component: TopShopsComponent;
  let fixture: ComponentFixture<TopShopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopShopsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopShopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
