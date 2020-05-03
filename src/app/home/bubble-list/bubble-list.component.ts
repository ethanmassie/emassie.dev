import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-bubble-list',
  templateUrl: './bubble-list.component.html',
  styleUrls: ['./bubble-list.component.scss']
})
export class BubbleListComponent implements OnInit {

  @Input() items: string[];

  constructor() { }

  ngOnInit(): void {
  }

}
