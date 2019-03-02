import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './navbar/navbar.component';
import { LayoutModule } from '@angular/cdk/layout';
import { SignaturePadModule } from 'angular2-signaturepad';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatTabsModule,
  MatFormFieldModule,
  MatCardModule,
  MatInputModule,
  MatNativeDateModule,
  MatTableModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatProgressBarModule,
  MatSortModule,
  MatPaginatorModule,
} from '@angular/material';

import { ReactiveFormsModule } from '@angular/forms';
import { ActionListComponent } from './action-list/action-list.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { FormsModule } from '@angular/forms';
import { StartService } from './services/start.service';
import { SynchronisationComponent } from './synchronisation/synchronisation.component';
import { PerformActionComponent } from './perform-action/perform-action.component';
import { AuthGuard } from './login/AuthGuard';
import { MachinesComponent } from './machines/machines.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ActionListComponent,
    LoginComponent,
    SettingsComponent,
    SynchronisationComponent,
    PerformActionComponent,
    MachinesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatCardModule,
    SignaturePadModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatSortModule,
    ReactiveFormsModule
  ],
  providers: [
    StartService,
     AuthGuard,
     LoginComponent
    // PouchDB.plugin(findPlugin)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
