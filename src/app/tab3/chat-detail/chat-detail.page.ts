import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';

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
        const time = this.formatTime(e.created_at);
        const senderId = this.senderIdFrom(e); // 👈 FIX aquí

        this.messages.push({
          text: e.content,
          sentByUser: senderId === this.userId,
          time,
          imageUrl: e.image_path || null
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
            text: msg.content,
            sentByUser: senderId === this.userId,
            time: this.formatTime(msg.created_at),
            imageUrl: msg.image_path
          };
        });
        this.scrollToBottomSoon();
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
          text: res.content,
          sentByUser: true,
          time,
          imageUrl: res.image_path
        });

        this.newMessage = '';
        this.selectedImage = undefined;
        this.scrollToBottomSoon();
      },
      error: (err) => console.error('❌ Error al enviar mensaje:', err)
    });
  }
}
