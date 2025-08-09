import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.page.html',
  styleUrls: ['./chat-detail.page.scss'],
  standalone: false
})
export class ChatDetailPage implements OnInit, OnDestroy {
  @ViewChild('content', { static: false }) content!: IonContent;

  chatId!: number;
  chatName = 'Chat';
  newMessage = '';
  messages: any[] = [];
  userId!: number;
  selectedImage?: File;

  private qpSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    // Usuario autenticado
    const userData = localStorage.getItem('user');
    const currentUser = userData ? JSON.parse(userData) : null;
    if (!currentUser?.id) {
      console.error('⚠️ No se pudo obtener el ID del usuario autenticado');
      return;
    }
    this.userId = Number(currentUser.id);

    // Echo (si ya está, no vuelve a crear)
    this.chatService.initEcho();

    // Suscripción a cambios de chatId por query params
    this.qpSub = this.route.queryParams.subscribe(params => {
      const nextChatId = Number(params['chatId']);
      this.chatName = params['name'] || 'Chat';
      if (!nextChatId) {
        console.error('⚠️ chatId no válido en queryParams');
        return;
      }

      // Si cambias de chat, sal del anterior
      if (this.chatId && this.chatId !== nextChatId) {
        this.chatService.leaveChat(this.chatId);
      }
      this.chatId = nextChatId;

      // Cargar historial
      this.loadMessages();

      // Escuchar en tiempo real
      this.chatService.listenToChat(this.chatId, (e: any) => {

        // ✅ Evento de "mensajes leídos" (palomitas)
        if (e.__type === 'read' && Array.isArray(e.message_ids)) {
          if (e.reader_id !== this.userId) {
            this.messages = this.messages.map(m =>
              (m.sentByUser && e.message_ids.includes(m.id))
                ? { ...m, readAt: new Date().toISOString() }
                : m
            );
            this.scrollToBottomSoon();
          }
          return;
        }

        const time = this.formatTime(e.created_at);
        const senderId = this.senderIdFrom(e); // 👈 FIX aquí

        // ⛔️ Evitar duplicado: si el mensaje es mío, no lo agrego (ya se hizo push optimista)
        if (senderId === this.userId) {
          this.scrollToBottomSoon();
          return;
        }

        this.messages.push({
          id: e.id,                           // 👈 para poder marcar leído
          text: e.content,
          sentByUser: senderId === this.userId,
          time,
          imageUrl: e.image_path || null,
          readAt: e.read_at || null           // 👈 estado de lectura
        });
        this.scrollToBottomSoon();
      });
    });
  }

  // ---------- util para detectar el emisor, venga como venga ----------
  private senderIdFrom(msgOrEvent: any): number {
    // Historial suele venir como user_id; tiempo real como user.id
    const raw =
      msgOrEvent?.user_id ??
      msgOrEvent?.user?.id ??
      msgOrEvent?.userId ??
      msgOrEvent?.user?.ID;
    return Number(raw);
  }

  // Auto-scroll al entrar (por si ya había historial)
  ionViewDidEnter() {
    this.scrollToBottomSoon();
    if (this.chatId) this.chatService.markRead(this.chatId).subscribe(); // ✅ marca leídos al entrar
  }

  // Al salir de la vista, cierra canal
  ionViewWillLeave() {
    if (this.chatId) this.chatService.leaveChat(this.chatId);
  }

  ngOnDestroy(): void {
    if (this.chatId) this.chatService.leaveChat(this.chatId);
    this.qpSub?.unsubscribe();
  }

  // -------- Helpers ----------
  private scrollToBottomSoon() {
    setTimeout(() => this.content?.scrollToBottom(250), 0);
  }

  onImageLoaded() {
    this.scrollToBottomSoon();
  }

  private formatTime(dateStr?: string) {
    if (!dateStr) return 'Sin hora';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? 'Sin hora'
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // -------- Data ----------
  loadMessages() {
    this.chatService.getMessages(this.chatId).subscribe({
      next: (res) => {
        this.messages = res.data.map((msg: any) => {
          const senderId = this.senderIdFrom(msg); // 👈 FIX aquí
          return {
            id: msg.id,                              // 👈
            text: msg.content,
            sentByUser: senderId === this.userId,
            time: this.formatTime(msg.created_at),
            imageUrl: msg.image_path,
            readAt: msg.read_at || null              // 👈
          };
        });
        this.scrollToBottomSoon();
        this.chatService.markRead(this.chatId).subscribe(); // ✅ marca leídos al cargar
      },
      error: (err) => console.error('❌ Error al cargar mensajes:', err)
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.selectedImage = file;
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content && !this.selectedImage) return;

    this.chatService.sendMessage(this.chatId, content, this.selectedImage).subscribe({
      next: (res) => {
        // Optimista (el back usa toOthers, así no duplica)
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        this.messages.push({
          id: res.id,                       // 👈 para luego marcar leído
          text: res.content,
          sentByUser: true,
          time,
          imageUrl: res.image_path,
          readAt: res.read_at || null       // 👈 por si el back ya lo trae
        });

        this.newMessage = '';
        this.selectedImage = undefined;
        this.scrollToBottomSoon();
      },
      error: (err) => console.error('❌ Error al enviar mensaje:', err)
    });
  }

  // ---------- Borrar mensaje (mínimo cambio) ----------
  confirmDeleteMessage(msg: any) {
    if (!msg?.id || !msg.sentByUser) return; // solo puedes borrar lo tuyo
  
    Swal.fire({
      title: '¿Deseas eliminar el mensaje?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
      confirmButtonColor: '#ef4444',
      heightAuto: false
    }).then(result => {
      if (!result.isConfirmed) return;
  
      this.chatService.deleteMessage(msg.id).subscribe({
        next: () => {
          // No lo quitamos: lo marcamos como eliminado
          const i = this.messages.findIndex(m => m.id === msg.id);
          if (i >= 0) {
            this.messages[i] = {
              ...this.messages[i],
              text: null,
              imageUrl: null,
              deleted: true
            };
          }
  
          Swal.fire({
            icon: 'success',
            title: 'Mensaje eliminado',
            timer: 1200,
            showConfirmButton: false,
            heightAuto: false
          });
          this.scrollToBottomSoon();
        },
        error: (err) => {
          console.error('❌ No se pudo eliminar mensaje:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el mensaje.',
            heightAuto: false
          });
        }
      });
    });
  }
}  