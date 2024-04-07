import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs-page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'countries',
        children: [
          {
            path: '',
            loadChildren: () => import('../countries/countries.module').then(m => m.CountriesPageModule)
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
        path: 'meetings/:meetingId',
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }

