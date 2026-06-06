import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomRequests } from './custom-requests';

describe('CustomRequests', () => {
  let component: CustomRequests;
  let fixture: ComponentFixture<CustomRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
