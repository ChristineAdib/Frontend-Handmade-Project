import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bestsellers } from './bestsellers';

describe('Bestsellers', () => {
  let component: Bestsellers;
  let fixture: ComponentFixture<Bestsellers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bestsellers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bestsellers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
