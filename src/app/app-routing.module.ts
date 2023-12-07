import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
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
  { path: 'news', loadChildren: () => import('./pages/news/news.module').then(m => m.NewsPageModule) },
  { path: 'tweets', loadChildren: () => import('./pages/tweets/tweets.module').then(m => m.TweetsPageModule) },
  { path: 'sponsors', loadChildren: () => import('./pages/sponsors/sponsors.module').then(m => m.SponsorsPageModule) },
  { path: 'events', loadChildren: () => import('./pages/events/events.module').then(m => m.EventsPageModule) },
  { path: 'event-detail', loadChildren: () => import('./pages/event-detail/event-detail.module').then(m => m.EventDetailPageModule) },
  { path: 'info-pages', loadChildren: () => import('./pages/info-pages/info-pages.module').then(m => m.InfoPagesPageModule) },
  { path: 'about-app', loadChildren: () => import('./pages/about-app/about-app.module').then(m => m.AboutAppPageModule) },
  { path: 'chat', loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule) },
  { path: 'chat-rooms', loadChildren: () => import('./pages/chat-rooms/chat-rooms.module').then( m => m.ChatRoomsPageModule)},
  { path: 'file-explorer/:folder', loadChildren: () => import('./pages/file-explorer/file-explorer.module').then( m => m.FileExplorerPageModule)},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
