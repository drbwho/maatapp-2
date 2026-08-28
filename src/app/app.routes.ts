import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/splash',
    pathMatch: 'full'
  },
  {
    path: 'intro',
    loadComponent: () => import('./pages/intro/intro.page').then(m => m.IntroPage)
  },
  {
    path: 'intro/:pageId',
    loadComponent: () => import('./pages/intro/intro.page').then(m => m.IntroPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support').then(m => m.SupportPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup').then(m => m.SignupPage)
  },
    {
    path: 'app',
    loadComponent: () => import('./pages/tabs-page/tabs-page').then(m => m.TabsPage),
    children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
          },
          {
            path: 'meetings',
            loadComponent: () => import('./pages/meetings/meetings.page').then(m => m.MeetingsPage)
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'accounts',
            loadComponent: () => import('./pages/accounts/accounts.page').then(m => m.AccountsPage)
          },
          {
            path: 'about',
            loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage)
          },
          {
            path: 'settings',
            loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
          }
    ]
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage)
  },
  {
    path: 'about-app',
    loadComponent: () => import('./pages/about-app/about-app.page').then(m => m.AboutAppPage)
  },
  {
    path: 'countries',
    loadComponent: () => import('./pages/countries/countries.page').then(m => m.CountriesPage)
  },
  {
    path: 'country/:countryId/groups',
    loadComponent: () => import('./pages/groups/groups.page').then(m => m.GroupsPage)
  },
  {
    path: 'groups',
    loadComponent: () => import('./pages/groups/groups.page').then(m => m.GroupsPage)
  },
  {
    path: 'meeting-history',
    loadComponent: () => import('./pages/meeting-history/meeting-history.page').then(m => m.MeetingHistoryPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: 'new-meeting',
    loadComponent: () => import('./pages/new-meeting/new-meeting.page').then(m => m.NewMeetingPage)
  },
  {
    path: 'accounts',
    loadComponent: () => import('./pages/accounts/accounts.page').then(m => m.AccountsPage)
  },
  {
    path: 'meeting-transactions',
    loadComponent: () => import('./pages/meeting-transactions/meeting-transactions.page').then(m => m.MeetingTransactionsPage)
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then(m => m.SplashPage)
  }
];
