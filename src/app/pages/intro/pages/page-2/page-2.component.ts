import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-page-2',
  templateUrl: './page-2.component.html',
  styleUrls: ['./page-2.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class Page2Component  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
