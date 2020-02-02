import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';

@NgModule({
   declarations: [
      AppComponent,
      NavbarComponent,
      HomeComponent,
   ],
   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      MatMenuModule,
      MatIconModule,

      AppRoutingModule,
   ],
   providers: [
     MatIconRegistry
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
