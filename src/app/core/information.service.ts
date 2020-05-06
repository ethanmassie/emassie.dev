import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Information} from './models/information.model';
import {Observable} from 'rxjs';
import {tap} from "rxjs/operators";

const information: Information = {
  name: 'Ethan Massie',
  links: [
    {icon: 'fa fa-at', display: 'ethan@emassie.dev', href: 'mailto:ethan@emassie.dev'},
    {icon: 'fa fa-linkedin', display: 'linkedin.com/in/ethan-massie', href: 'https://linkedin.com/in/ethan-massie'},
    {icon: 'fa fa-github', display: 'github.com/ethanmassie', href: 'https://github.com/ethanmassie'},
  ],
  experience: [
    {
      title: 'Full Stack Developer',
      employer: 'CAIT',
      timeFrame: 'May 2019 - (Current)',
      location: 'Macomb, IL',
      details: [
        'Developed a dynamic form system with an Angular front-end, Java Spring back-end, and a MySQL database.',
        'Directly communicated with clients, and adjusted designs to meet their requirements.',
        'Used JPA and hibernate for ORM.',
        'Refactored legacy code bases to meet the latest standards and practices.'
      ]
    },
    {
      title: 'Technical Assistant',
      employer: 'CAIT',
      timeFrame: 'May 2017 - May 2019',
      location: 'Macomb, IL',
      details: [
        'Used Puppet for automating configuration.',
        'Administered and deployed Ceph object storage clusters and wrote scripts to automate upgrades.',
        'Researched and tested OpenStack as a potential cloud solution.',
        'Second runner-up for student worker of the year.'
      ]
    }
  ],
  education: [
    {
      title: 'B.S. in computer Science',
      employer: 'Western Illinois University',
      timeFrame: 'August 2016 - December 2019',
      details: [
        'Cumulative GPA: 3.9',
        'Summa Cum Laude',
        'Minors in Math and Philosophy',
        'President of the WIU Computer Science Association (Fall, 2019)'
      ]
    }
  ],
  skillGroups: [
    {name: 'Languages', skills: ['Typescript', 'Java', 'HTML5', 'CSS', 'SCSS', 'BASH', 'SQL', 'Python', 'Go']},
    {name: 'Web Development', skills: ['Angular', 'RxJS', 'Spring', 'JPA', 'Hibernate', 'PrimeNG', 'Angular Material', 'Angular CDK']},
    {name: 'System Administration', skills: ['Linux', 'Ceph', 'Virtualization', 'Puppet', 'Ansible', ]},
    {name: 'Tools', skills: ['GIT', 'SVN', 'Jenkins', 'NPM', 'Maven', 'VSCode', 'Vim', 'Visual Paradigm']}
  ],
  interests: ['Open Source', 'Linux', 'Philosophy', 'Japanese', 'Musical Instruments', 'Trading Card Games']
};

const myInfoId = 'cG7UZ5b5ueV3r8kJ5LsW';

@Injectable({
  providedIn: 'root'
})
export class InformationService {

  constructor(private firestore: AngularFirestore) { }

  public getInformation(): Observable<Information> {
    return this.firestore.doc<Information>(`information/${myInfoId}`).valueChanges().pipe(
      tap(data => {
        console.log(data);
      })
    );
  }
}
