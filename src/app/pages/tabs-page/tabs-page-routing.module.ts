import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs-page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'program',
        children: [
          {
            path: '',
            loadChildren: () => import('../dates/dates.module').then(m => m.DatesPageModule)
          },

        ]
      },

      {
        path: 'tracks',
        children: [
          {
            path: '',
            loadChildren: () => import('../tracks/tracks.module').then(m => m.TracksPageModule)
          }
        ]
      },
      {
        path: 'info/:infoType',
        children: [
          {
            path: '',
            loadChildren: () => import('../info/info.module').then(m => m.InfoPageModule)
          }
        ]
      },
      {
        path: 'info/:infoType/:page',
        children: [
          {
            path: '',
            loadChildren: () => import('../info/info.module').then(m => m.InfoPageModule)
          }
        ]
      },
      {
        path: 'events',
        children: [
          {
            path: '',
            loadChildren: () => import('../events/events.module').then(m => m.EventsPageModule)
          }
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
        path: 'tourpages',
        children: [
          {
            path: '',
            loadChildren: () => import('../tour-pages/tour-pages.module').then(m => m.TourPagesPageModule)
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

