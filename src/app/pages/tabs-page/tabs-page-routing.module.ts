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
          },
          {
            path: 'people/:showWhat/:taxName/:taxId',
            loadChildren: () => import('../people/people.module').then(m => m.PeoplePageModule)
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
        path: 'map/:mapType',
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
      path: 'taxonomy',
      children: [
        {
          path: '',
          loadChildren: () => import('../taxonomy/taxonomy.module').then(m => m.TaxonomyPageModule)
        },
        {
          path: 'type/:taxonomyType',
          loadChildren: () => import('../taxonomy/taxonomy.module').then(m => m.TaxonomyPageModule)
        },
        {
          path: 'people/:showWhat/:taxName/:taxId',
          loadChildren: () => import('../people/people.module').then(m => m.PeoplePageModule)
        }
      ]
    },
      {
        path: 'news',
        children: [
          {
            path: '',
            loadChildren: () => import('../news/news.module').then(m => m.NewsPageModule)
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

