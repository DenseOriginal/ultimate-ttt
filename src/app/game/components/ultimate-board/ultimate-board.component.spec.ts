import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimateBoardComponent } from './ultimate-board.component';

describe('UltimateBoardComponent', () => {
  let component: UltimateBoardComponent;
  let fixture: ComponentFixture<UltimateBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UltimateBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UltimateBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
