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
          {
            path: 'schedule/:dayId',
            loadChildren: () => import('../schedule/schedule.module').then(m => m.ScheduleModule)
          },
          {
            path: 'schedule/session/:sessionId',
            loadChildren: () => import('../session-detail/session-detail.module').then(m => m.SessionDetailModule)
          },
          {
            path: 'speaker-details/:speakerId',
            loadChildren: () => import('../speaker-detail/speaker-detail.module').then(m => m.SpeakerDetailModule)
          },
          {
            path: 'schedule/byroom/:roomId',
            loadChildren: () => import('../schedule/schedule.module').then(m => m.ScheduleModule)
          },
          {
            path: 'schedule/bytrack/:trackId',
            loadChildren: () => import('../schedule/schedule.module').then(m => m.ScheduleModule)
          }
        ]
      },
      {
        path: 'schedule',
        children: [
          {
            path: '',
            loadChildren: () => import('../schedule/schedule.module').then(m => m.ScheduleModule)
          },
          {
            path: 'session/:sessionId',
            loadChildren: () => import('../session-detail/session-detail.module').then(m => m.SessionDetailModule)
          }
        ]
      },
      {
        path: 'people',
        children: [
          {
            path: '',
            loadChildren: () => import('../people/people.module').then(m => m.PeoplePageModule)
          },
          {
            path: 'session/:sessionId',
            loadChildren: () => import('../session-detail/session-detail.module').then(m => m.SessionDetailModule)
          },
          {
            path: 'speaker-details/:speakerId',
            loadChildren: () => import('../speaker-detail/speaker-detail.module').then(m => m.SpeakerDetailModule)
          }
        ]
      },
      {
        path: 'people/:showWhat/:taxName/:taxId',
        loadChildren: () => import('../people/people.module').then(m => m.PeoplePageModule)
      },
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: () => import('../map/map.module').then(m => m.MapModule)
          }
        ]
      },
      {
        path: 'rooms',
        children: [
          {
            path: '',
            loadChildren: () => import('../rooms/rooms.module').then(m => m.RoomsPageModule)
          }
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
        path: 'about',
        children: [
          {
            path: '',
            loadChildren: () => import('../about/about.module').then(m => m.AboutModule)
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

