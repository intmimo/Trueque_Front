import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
  standalone: false
})
export class ChatListPage implements OnInit {

  chats: any[] = [];

  constructor(private router: Router, private chatService: ChatService) {}

  ngOnInit() {
    this.loadChats();
  }

  loadChats() {
    this.chatService.getChats().subscribe({
      next: (res) => {
        this.chats = res;
        console.log('✅ Chats cargados:', res);
      },
      error: (err) => {
        console.error('❌ Error al obtener chats', err);
      }
    });
  }

  openChat(chat: any) {
    this.router.navigate(['/tabs/tab3/chat-detail'], {
      queryParams: {
        chatId: chat.id,
        name: chat.users[0]?.name || 'Usuario'
      }
    });
  }
}