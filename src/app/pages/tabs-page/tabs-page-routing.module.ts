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
        path: 'groups/:groupId',
        children: [
          {
            path: '',
            loadChildren: () => import('../group-details/group-details.module').then(m => m.GroupDetailsPageModule)
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
        path: 'meetings/:meetingId', // --OLD
        children: [
          {
            path: '',
            loadChildren: () => import('../meeting-details/meeting-details.module').then(m => m.MeetingDetailsPageModule)
          },
        ]
      },
      {
        path: 'notifications/:data',
        children: [
          {
            path: '',
            loadChildren: () => import('../notifications/notifications.module').then(m => m.NotificationsPageModule)
          }
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

