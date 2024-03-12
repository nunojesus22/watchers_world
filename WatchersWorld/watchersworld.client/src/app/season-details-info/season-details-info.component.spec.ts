import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonDetailsInfoComponent } from './season-details-info.component';

describe('SeasonDetailsInfoComponent', () => {
  let component: SeasonDetailsInfoComponent;
  let fixture: ComponentFixture<SeasonDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeasonDetailsInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeasonDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
