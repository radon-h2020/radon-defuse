import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteRepositoryComponent } from './dialog-delete-repository.component';

describe('DialogDeleteRepositoryComponent', () => {
  let component: DialogDeleteRepositoryComponent;
  let fixture: ComponentFixture<DialogDeleteRepositoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDeleteRepositoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeleteRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
