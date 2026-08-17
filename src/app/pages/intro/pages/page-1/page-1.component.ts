import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-page-1',
  templateUrl: './page-1.component.html',
  styleUrls: ['./page-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class Page1Component  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
