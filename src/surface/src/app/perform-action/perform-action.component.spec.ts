import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformActionComponent } from './perform-action.component';

describe('PerformActionComponent', () => {
  let component: PerformActionComponent;
  let fixture: ComponentFixture<PerformActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
