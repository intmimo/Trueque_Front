import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RatingService } from 'src/app/services/rating.service';


@Component({
  selector: 'app-rate-user-modal',
  templateUrl: './rate-user-modal.component.html',
  styleUrls: ['./rate-user-modal.component.scss'],
  standalone: false
})
export class RateUserModalComponent {
  @Input() userId!: number;         // 👈 lo pasamos al abrir el modal
  @Input() userName?: string;       // opcional, para mostrar en el título

  stars = 0;
  comment = '';
  sending = false;

  constructor(
    private modalCtrl: ModalController,
    private ratingService: RatingService
  ) {}

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  setStars(n: number) {
    this.stars = n;
  }

  submit() {
    if (!this.stars) return;

    this.sending = true;
    this.ratingService.rateUser(this.userId, this.stars).subscribe({
      next: (res) => {
        this.sending = false;
        // Devolvemos un OK al cerrar para que el padre refresque si quiere
        this.modalCtrl.dismiss({ ok: true }, 'success');
      },
      error: (err) => {
        this.sending = false;
        console.error('Error al enviar calificación:', err);
      }
    });
  }
}
