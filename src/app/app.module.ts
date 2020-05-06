import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import {AngularFireModule} from '@angular/fire';
import {AngularFireDatabaseModule} from '@angular/fire/database';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import {MatButtonModule} from '@angular/material/button';
import { ExperienceComponent } from './home/experience/experience.component';
import {CoreModule} from './core/core.module';
import { BubbleListComponent } from './home/bubble-list/bubble-list.component';
import {environment} from '../environments/environment';
import {AngularFirestoreModule} from "@angular/fire/firestore";

@NgModule({
   declarations: [
      AppComponent,
      NavbarComponent,
      HomeComponent,
      ExperienceComponent,
      BubbleListComponent,
   ],
   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      MatMenuModule,
      MatIconModule,
      MatButtonModule,
      AppRoutingModule,
      CoreModule,

      AngularFireModule.initializeApp(environment.firebaseConfig),
      AngularFirestoreModule
   ],
   providers: [
     MatIconRegistry
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
