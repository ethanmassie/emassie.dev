import { Component, OnInit } from '@angular/core';
import {InformationService} from '../core/information.service';
import {Observable} from 'rxjs';
import {Information} from '../core/models/information.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  information: Observable<Information>;

  constructor(public infoService: InformationService) { }

  ngOnInit() {
    this.information = this.infoService.getInformation();
  }

}
