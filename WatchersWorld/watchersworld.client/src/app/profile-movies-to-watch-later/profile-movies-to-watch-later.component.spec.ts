import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMoviesToWatchLaterComponent } from './profile-movies-to-watch-later.component';

describe('ProfileMoviesToWatchLaterComponent', () => {
  let component: ProfileMoviesToWatchLaterComponent;
  let fixture: ComponentFixture<ProfileMoviesToWatchLaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileMoviesToWatchLaterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileMoviesToWatchLaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
