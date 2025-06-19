import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BureauSuiviComponent } from './bureau-suivi.component';

describe('BureauSuiviComponent', () => {
  let component: BureauSuiviComponent;
  let fixture: ComponentFixture<BureauSuiviComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BureauSuiviComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BureauSuiviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
