import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Information} from './models/information.model';
import {Observable} from 'rxjs';

const myInfoId = 'cG7UZ5b5ueV3r8kJ5LsW';

@Injectable({
  providedIn: 'root'
})
export class InformationService {

  constructor(private firestore: AngularFirestore) { }

  public getInformation(): Observable<Information> {
    return this.firestore.doc<Information>(`information/${myInfoId}`).valueChanges();
  }
}
