import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelManagerComponent } from './model-manager.component';

describe('ModelManagerComponent', () => {
  let component: ModelManagerComponent;
  let fixture: ComponentFixture<ModelManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
