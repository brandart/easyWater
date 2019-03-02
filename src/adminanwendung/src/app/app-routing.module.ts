import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SettingsComponent } from './settings/settings.component';
import { ActionsMenuComponent } from './actions-menu/actions-menu.component';
import { ActionDetailsComponent } from './action-details/action-details.component';
import { WorkersComponent } from './workers/workers.component';
import { MachinesComponent } from './machines/machines.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './login/AuthGuard';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'actions',
        pathMatch: 'full'
      },
      {
        path: 'actions',
        component: ActionsMenuComponent
      },
      {
        path: 'machines',
        component: MachinesComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'actionDetails',
        component: ActionDetailsComponent
      },
      {
        path: 'workers',
        component: WorkersComponent
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
