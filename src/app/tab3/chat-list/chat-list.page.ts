import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
  standalone: false
})
export class ChatListPage implements OnInit {

  // Simulación de lista de chats
  chats = [
    {
      id: 1,
      name: 'Ana López',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Hola, ¿todavía te interesa el libro?',
      time: '09:45 AM',
      date: 'Hoy',
      unreadCount: 2,
    },
    {
      id: 2,
      name: 'Carlos Méndez',
      avatar: 'https://i.pravatar.cc/150?img=2',
      lastMessage: 'Gracias por el trueque, estuvo excelente.',
      time: 'Ayer',
      date: 'Ayer',
      unreadCount: 0,
    },
    {
      id: 3,
      name: 'Lucía Pérez',
      avatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: '¿Puedes venir a las 5 PM?',
      time: '07:10 PM',
      date: 'Hoy',
      unreadCount: 5,
    }
  ];

  constructor(private router: Router) { }

  //redirije a la pantalla de chatdetalle y se envian los objetos como parametros
  openChat(chat: any){
    this.router.navigate(['/tabs/tab3/chat-detail'],{
      queryParams: {
        id: chat.id,
        name: chat.name
      }
    });
  }

  ngOnInit() {
  }


}
