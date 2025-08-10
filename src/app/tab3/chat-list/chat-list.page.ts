import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import Swal from 'sweetalert2';


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

  // 🗑️ Eliminar chat completo (confirmación)
  confirmDeleteChat(chat: any) {
    if (!chat?.id) return;

    Swal.fire({
      title: '¿Eliminar chat?',
      text: 'Se borrará todo el historial de mensajes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
      confirmButtonColor: '#ef4444',
      heightAuto: false
    }).then(res => {
      if (!res.isConfirmed) return;

      this.chatService.deleteChat(chat.id).subscribe({
        next: () => {
          this.chats = this.chats.filter(c => c.id !== chat.id);
          Swal.fire({
            icon: 'success',
            title: 'Chat eliminado',
            timer: 1200,
            showConfirmButton: false,
            heightAuto: false
          });
        },
        error: (err) => {
          console.error('❌ No se pudo eliminar chat:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el chat.',
            heightAuto: false
          });
        }
      });
    });
  }
}
