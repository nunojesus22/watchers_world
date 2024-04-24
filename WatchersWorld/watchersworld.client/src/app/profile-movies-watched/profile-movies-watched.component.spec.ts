import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMoviesWatchedComponent } from './profile-movies-watched.component';

describe('ProfileMoviesWatchedComponent', () => {
  let component: ProfileMoviesWatchedComponent;
  let fixture: ComponentFixture<ProfileMoviesWatchedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileMoviesWatchedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileMoviesWatchedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
