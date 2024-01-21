import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendedAccountComponent } from './suspended-account.component';

describe('SuspendedAccountComponent', () => {
  let component: SuspendedAccountComponent;
  let fixture: ComponentFixture<SuspendedAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuspendedAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuspendedAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
