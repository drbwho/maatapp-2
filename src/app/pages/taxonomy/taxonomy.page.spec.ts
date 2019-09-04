import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonomyPage } from './taxonomy.page';

describe('TaxonomyPage', () => {
  let component: TaxonomyPage;
  let fixture: ComponentFixture<TaxonomyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonomyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonomyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
