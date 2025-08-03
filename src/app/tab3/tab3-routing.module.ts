import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab3Page } from './tab3.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3Page,
    children: [
    {
      path: '',
      redirectTo: 'chat-list',
      pathMatch: 'full'
    },
    {
      path: 'chat-list',
      loadChildren: () => import ('./chat-list/chat-list.module').then(m => m.ChatListPageModule)
    },
    {
      path: 'chat-detail',
      loadChildren: () => import('./chat-detail/chat-detail.module').then(m => m.ChatDetailPageModule)
    }
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3PageRoutingModule {}
