import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocInfo } from './doc-info';

describe('DocInfo', () => {
  let component: DocInfo;
  let fixture: ComponentFixture<DocInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
