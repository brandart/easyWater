import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { ActionListComponent } from './action-list/action-list.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { SynchronisationComponent } from './synchronisation/synchronisation.component';
import { PerformActionComponent } from './perform-action/perform-action.component';
import { AuthGuard } from './login/AuthGuard';
import { MachinesComponent } from './machines/machines.component';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    canActivate: [AuthGuard],
    children: [
      {

        path: '',
        component: ActionListComponent
      },
      {
        path: 'actionlist',
        component: ActionListComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'perform-action/:id',
        component: PerformActionComponent
      },
      {
        path: 'synchronisation',
        component: SynchronisationComponent
      },
      {
        path: 'machines',
        component: MachinesComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
