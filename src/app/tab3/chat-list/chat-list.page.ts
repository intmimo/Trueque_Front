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
    { id: 1, nombre: 'Pedro', ultimoMensaje: 'Hola, ¿aún quieres intercambiar?', avatarUrl: 'https://i.pravatar.cc/100?img=1' },
    { id: 2, nombre: 'Ana', ultimoMensaje: 'Tengo otro artículo para ti', avatarUrl: 'https://i.pravatar.cc/100?img=2' }
  ];

  constructor(private router: Router) { }

  //redirije a la pantalla de chatdetalle
  abrirChat(id:number){
    this.router.navigate(['tabs/tab3/chat-detail',id]);
  }

  ngOnInit() {
  }


}
