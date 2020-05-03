import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleListComponent } from './bubble-list.component';

describe('BubbleListComponent', () => {
  let component: BubbleListComponent;
  let fixture: ComponentFixture<BubbleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BubbleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BubbleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
