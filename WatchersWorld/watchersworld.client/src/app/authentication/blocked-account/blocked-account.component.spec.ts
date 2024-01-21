import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedAccountComponent } from './blocked-account.component';

describe('BlockedAccountComponent', () => {
  let component: BlockedAccountComponent;
  let fixture: ComponentFixture<BlockedAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlockedAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BlockedAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
