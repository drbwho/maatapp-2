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
            path: 'schedule',
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
            path: 'schedule/type/:typeId',
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
        },
        {
          path: 'program/speaker-details/:speakerId',
          loadChildren: () => import('../speaker-detail/speaker-detail.module').then(m => m.SpeakerDetailModule)
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
        path: 'chat/:channel',
        children: [
          {
            path: '',
            loadChildren: () => import('../chat/chat.module').then(m => m.ChatPageModule)
          }
        ]
      },
      {
        path: 'chat-rooms',
        children: [
          {
            path: '',
            loadChildren: () => import('../chat-rooms/chat-rooms.module').then(m => m.ChatRoomsPageModule)
          }
        ]
      },
      {
        path: 'tweets',
        children: [
          {
            path: '',
            loadChildren: () => import('../tweets/tweets.module').then(m => m.TweetsPageModule)
          }
        ]
      },
      {
        path: 'sponsors',
        children: [
          {
            path: '',
            loadChildren: () => import('../sponsors/sponsors.module').then(m => m.SponsorsPageModule)
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
            path: 'event/:eventTitle',
            loadChildren: () => import('../event-detail/event-detail.module').then(m => m.EventDetailPageModule)
      },
      {
        path: 'infopages',
        children: [
          {
            path: '',
            loadChildren: () => import('../info-pages/info-pages.module').then(m => m.InfoPagesPageModule)
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

