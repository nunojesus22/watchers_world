import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSeriesToWatchLaterComponent } from './profile-series-to-watch-later.component';

describe('ProfileSeriesToWatchLaterComponent', () => {
  let component: ProfileSeriesToWatchLaterComponent;
  let fixture: ComponentFixture<ProfileSeriesToWatchLaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileSeriesToWatchLaterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileSeriesToWatchLaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
