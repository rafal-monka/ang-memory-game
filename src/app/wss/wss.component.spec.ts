/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WssComponent } from './wss.component';

describe('WssComponent', () => {
  let component: WssComponent;
  let fixture: ComponentFixture<WssComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WssComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
