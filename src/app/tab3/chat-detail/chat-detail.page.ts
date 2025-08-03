import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; //sirve para obtener los parametros que mandamos por el url
@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.page.html',
  styleUrls: ['./chat-detail.page.scss'],
  standalone: false
})
export class ChatDetailPage implements OnInit {
  chatName = ''; //nombre del chat, recibido por parametros
  newMessage = ''; //Mensaje que el usuario escribe en el input
  messages: {text:string, sentByUser: boolean, time: string}[]=[]; //arreglo de objetos que representan los mensajes enviados/recibidos

  constructor(private route: ActivatedRoute) { }

  //escucha los parametros que se mandan desde la otra pantalla
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      //asigna los mensajes simulados al iniciar la pagina, sirve como ejemplo de conversacion
      this.chatName = params['name'] || 'Chat';
    });

    //mensajes simulados
    this.messages = [
      { text: 'Hola, ¿cómo estás?', sentByUser: false, time: '10:00 AM' },
      { text: 'Bien, ¿y tú?', sentByUser: true, time: '10:01 AM' },
      { text: 'Todo bien 👍', sentByUser: false, time: '10:02 AM' }
    ];
  }

  //verifica que el mensaje no esté vacio, agrega un arreglo de mensaje, muestra hora actual limpia el input
  sendMessage(){
    if (this.newMessage.trim()){
      this.messages.push({
        text: this.newMessage,
        sentByUser: true,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
      });
      this.newMessage = '';
    }
  }

}
