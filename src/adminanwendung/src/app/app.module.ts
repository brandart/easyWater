import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LayoutModule } from '@angular/cdk/layout';
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
  MatTableModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatSnackBarModule,
  MatSortModule,
  MatPaginatorModule,
  MatCheckboxModule,
  MatAutocompleteModule
} from '@angular/material';

import { ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { FormsModule } from '@angular/forms';
import { StartService } from './angular_services/start.service';
import { ActionsComponent } from './actions/actions.component';
import { HttpClientModule } from '@angular/common/http';
import { AddMachineComponent } from './add-machine/add-machine.component';
import { ActionDetailsComponent } from './action-details/action-details.component';
import { WorkersComponent } from './workers/workers.component';
import { MachinesComponent } from './machines/machines.component';
import { ListMachinesComponent } from './list-machines/list-machines.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './login/AuthGuard';
import { ActionsMenuComponent } from './actions-menu/actions-menu.component';
import { AddActionComponent } from './add-action/add-action.component';
import { MachineTypeComponent } from './machine-type/machine-type.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    SettingsComponent,
    ActionsComponent,
    AddMachineComponent,
    ActionDetailsComponent,
    WorkersComponent,
    MachinesComponent,
    ListMachinesComponent,
    LoginComponent,
    ActionsMenuComponent,
    AddActionComponent,
    MachineTypeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LayoutModule,
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
    FormsModule,
    MatTableModule,
    HttpClientModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSortModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  providers: [StartService, AuthGuard, LoginComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
