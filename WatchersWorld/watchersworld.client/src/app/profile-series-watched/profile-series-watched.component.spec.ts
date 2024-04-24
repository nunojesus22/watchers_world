import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSeriesWatchedComponent } from './profile-series-watched.component';

describe('ProfileSeriesWatchedComponent', () => {
  let component: ProfileSeriesWatchedComponent;
  let fixture: ComponentFixture<ProfileSeriesWatchedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileSeriesWatchedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileSeriesWatchedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
