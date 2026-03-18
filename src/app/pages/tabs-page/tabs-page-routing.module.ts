import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs-page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
       {
        path: 'dashboard',
        children: [
          {
            path: '',
            loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)
          },

        ]
      },
      {
        path: 'country/:countryId/groups',
        children: [
          {
            path: '',
            loadChildren: () => import('../groups/groups.module').then(m => m.GroupsPageModule)
          },
        ]
      },
      {
        path: 'meetings',
        children: [
          {
            path: '',
            loadChildren: () => import('../meetings/meetings.module').then(m => m.MeetingsPageModule)
          },
        ]
      },
      {
        path: 'meetings/close',
        children: [
          {
            path: '',
            loadChildren: () => import('../meetings/meetings.module').then(m => m.MeetingsPageModule)
          },
        ]
      },
      {
        path: 'accounts',
        children: [
          {
            path: '',
            loadChildren: () => import('../accounts/accounts.module').then(m => m.AccountsPageModule)
          },
        ]
      },
      {
        path: 'about',
        children: [
          {
            path: '',
            loadChildren: () => import('../about/about.module').then(m => m.AboutPageModule)
          }
        ]
      },
      {
        path: 'home',
        children: [
          {
            path: '',
            redirectTo: '/home',
          }
        ]
      },
      {
        path: '',
        redirectTo: '/app/tabs/program',
        pathMatch: 'full'
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
          }
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }

