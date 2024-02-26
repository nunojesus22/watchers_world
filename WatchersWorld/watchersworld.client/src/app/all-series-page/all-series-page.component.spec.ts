import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSeriesPageComponent } from './all-series-page.component';

describe('AllSeriesPageComponent', () => {
  let component: AllSeriesPageComponent;
  let fixture: ComponentFixture<AllSeriesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllSeriesPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllSeriesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
