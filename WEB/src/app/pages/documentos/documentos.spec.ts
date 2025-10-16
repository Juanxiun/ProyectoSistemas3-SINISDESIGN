import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentosCrudPage } from './documentos';

describe('DocumentosCrudPage', () => {
  let component: DocumentosCrudPage;
  let fixture: ComponentFixture<DocumentosCrudPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentosCrudPage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DocumentosCrudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
