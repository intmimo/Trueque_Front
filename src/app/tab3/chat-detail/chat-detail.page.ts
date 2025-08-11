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

      // Sal del canal anterior si cambió
      if (this.chatId && this.chatId !== nextChatId) {
        this.chatService.leaveChat(this.chatId);
      }
      this.chatId = nextChatId;

      // Cargar historial
      this.loadMessages();

      // Escuchar en tiempo real
      this.chatService.listenToChat(this.chatId, (e: any) => {
        // Evento de lectura
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

        const senderId = this.senderIdFrom(e);

        // Evitar duplicar mi propio mensaje (ya hicimos push optimista)
        if (senderId === this.userId) {
          this.scrollToBottomSoon();
          return;
        }

        this.messages.push({
          id: e.id,
          text: e.content,
          sentByUser: senderId === this.userId,
          time: this.formatTime(e.created_at),
          imageUrl: e.image_path || null,
          readAt: e.read_at || null
        });
        this.scrollToBottomSoon();
      });
    });
  }

  // Detectar emisor venga como venga
  private senderIdFrom(msgOrEvent: any): number {
    const raw =
      msgOrEvent?.user_id ??
      msgOrEvent?.user?.id ??
      msgOrEvent?.userId ??
      msgOrEvent?.user?.ID;
    return Number(raw);
  }

  // Autoscroll al entrar y marcar leídos
  ionViewDidEnter() {
    this.scrollToBottomSoon();
    if (this.chatId) this.chatService.markRead(this.chatId).subscribe();
  }

  ionViewWillLeave() {
    if (this.chatId) this.chatService.leaveChat(this.chatId);
  }

  ngOnDestroy(): void {
    if (this.chatId) this.chatService.leaveChat(this.chatId);
    this.qpSub?.unsubscribe();
  }

  // -------- Helpers ----------
  scrollToBottomSoon(): void {
    const delays = [0, 80, 160, 280, 400];
    delays.forEach(d =>
      setTimeout(() => this.content?.scrollToBottom(250), d)
    );
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
        this.messages = (res.data || []).map((msg: any) => {
          const senderId = this.senderIdFrom(msg);
          return {
            id: msg.id,
            text: msg.content,
            sentByUser: senderId === this.userId,
            time: this.formatTime(msg.created_at),
            imageUrl: msg.image_path,
            readAt: msg.read_at || null
          };
        });
        this.scrollToBottomSoon();
        this.chatService.markRead(this.chatId).subscribe();
      },
      error: (err) => console.error('❌ Error al cargar mensajes:', err)
    });
  }

  onImageSelected(event: any) {
    const file = event.target?.files?.[0];
    if (file) this.selectedImage = file;
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content && !this.selectedImage) return;

    this.chatService.sendMessage(this.chatId, content, this.selectedImage).subscribe({
      next: (res) => {
        // Push optimista
        const now = new Date();
        this.messages.push({
          id: res.id,
          text: res.content,
          sentByUser: true,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: res.image_path,
          readAt: res.read_at || null
        });

        this.newMessage = '';
        this.selectedImage = undefined;
        this.scrollToBottomSoon();
      },
      error: (err) => console.error('❌ Error al enviar mensaje:', err)
    });
  }

  // ---------- Borrar mensaje ----------
  confirmDeleteMessage(msg: any) {
    if (!msg?.id || !msg.sentByUser) return;

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
          const i = this.messages.findIndex(m => m.id === msg.id);
          if (i >= 0) {
            this.messages[i] = { ...this.messages[i], text: null, imageUrl: null, deleted: true };
          }
          Swal.fire({ icon: 'success', title: 'Mensaje eliminado', timer: 1200, showConfirmButton: false, heightAuto: false });
          this.scrollToBottomSoon();
        },
        error: (err) => {
          console.error('❌ No se pudo eliminar mensaje:', err);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el mensaje.', heightAuto: false });
        }
      });
    });
  }
}
