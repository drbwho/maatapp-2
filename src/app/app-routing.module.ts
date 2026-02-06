import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/intro',
    pathMatch: 'full'
  },
  {
    path: 'intro',
    loadChildren: () => import('./pages/intro/intro.module').then(m => m.IntroPageModule)
  },
  {
    path: 'intro/:pageId',
    loadChildren: () => import('./pages/intro/intro.module').then(m => m.IntroPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule)
  },
  {
    path: 'support',
    loadChildren: () => import('./pages/support/support.module').then(m => m.SupportModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignUpModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./pages/tabs-page/tabs-page.module').then(m => m.TabsModule)
  },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule) },
  { path: 'about-app', loadChildren: () => import('./pages/about-app/about-app.module').then(m => m.AboutAppPageModule) },
  {
    path: 'countries',
    loadChildren: () => import('./pages/countries/countries.module').then( m => m.CountriesPageModule)
  },
  {
    path: 'country/:countryId/groups',
    loadChildren: () => import('./pages/groups/groups.module').then(m => m.GroupsPageModule)
  },
  {
    path: 'groups',
    loadChildren: () => import('./pages/groups/groups.module').then( m => m.GroupsPageModule)
  },
  {
    path: 'meeting-details',
    loadChildren: () => import('./pages/meeting-details/meeting-details.module').then( m => m.MeetingDetailsPageModule)
  },
  {
    path: 'group-details',
    loadChildren: () => import('./pages/group-details/group-details.module').then( m => m.GroupDetailsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },  {
    path: 'new-meeting',
    loadChildren: () => import('./pages/new-meeting/new-meeting.module').then( m => m.NewMeetingPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
