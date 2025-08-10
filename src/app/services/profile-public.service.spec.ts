import { TestBed } from '@angular/core/testing';

import { ProfilePublicService } from './profile-public.service';

describe('ProfilePublicService', () => {
  let service: ProfilePublicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfilePublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
