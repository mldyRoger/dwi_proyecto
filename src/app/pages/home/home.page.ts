import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Asegúrate de tener la ruta correcta
import { Router, NavigationEnd } from '@angular/router'; // Importa Router para redireccionar
import { Subscription } from 'rxjs';

import { CalendarOptions} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarService } from '../../services/calendar.service';
import { ModalController } from '@ionic/angular';
import { CalendarModalComponent } from 'src/app/components/calendar-modal/calendar-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  isProfileMenuOpen: boolean = false; // Controlar si el menú está abierto o cerrado
  isLoggedIn: boolean = false;
  userName: string; // Variable para almacenar el nombre del usuario
  today: string;
  events: any[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    firstDay: 0,
    dayCellDidMount: (info) => {
      info.el.classList.add('custom-day-class');
    },
    plugins: [dayGridPlugin, interactionPlugin],
    locale: esLocale,
    dateClick: (arg) => this.handleDateClick(arg),
    events: this.events,
    datesSet: () => {
      // Llama a applyEventStyles cada vez que se cambia la vista
      setTimeout(() => {
        this.applyEventStyles();
      }, 0);
    },
    headerToolbar: {
      left: 'title',
      right: 'prev,next'
    }
  };

  handleDateClick(arg:any) {
    this.presentModal()
    //alert('date click! ' + arg.dateStr)
    console.log(arg);
  }

  private routerSubscription!: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private calendarService: CalendarService,
    private renderer: Renderer2,
    private modalController: ModalController
  ) {
    this.userName = this.authService.getUserName(); // Método para obtener el nombre del usuario
    this.isLoggedIn = !!this.userName;
    const date = new Date();
    this.today = date.toISOString().split('T')[0]; 
  }

  ngOnInit() {
    this.loadEvents();
    // Suscribirse a los eventos de navegación
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeProfileMenu(); // Cerrar el menú al cambiar de página
      }
    });
  }

  loadEvents() {
    this.calendarService.getEvents().subscribe((data) => {
      // Asignar los eventos obtenidos a la variable
      this.events = data.map((event:any) => ({
        title: event.relleno === 7 ? event.nombre_evento : '',
        start: event.start, // Asegúrate de que el formato sea correcto
        end: event.end === '0000-00-00' ? null : event.end,
        backgroundColor: event.relleno === 7 ? event.backgroundColor : 'transparent',
        colorBD: event.backgroundColor,
        display: event.display,
        relleno: event.relleno,
        textColor: event.textColor

      }));
      
      // Actualizar las opciones del calendario
      this.calendarOptions.events = this.events;

      setTimeout(() => {
        this.applyEventStyles();
      }, 0);
    }, (error) => {
      console.error('Error al cargar los eventos:', error);
    });
  }
  onDatesSet(dateInfo: any) {
    // Llamar a applyEventStyles después de que el calendario se haya actualizado
    setTimeout(() => {
      this.applyEventStyles();
    }, 0);
  }

  applyEventStyles() {
    this.events.forEach(event => {
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : start;
  console.log('fechas: '+start+' 2: '+end);
      if (start <= end) {
        let d = new Date(start);
        console.log('D: '+d+' 2: '+end);
        const totalDays = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1; // Total de días en el rango
        let index = 0;
  
        while (d <= end) {
          const dateStr = d.toISOString().split('T')[0];
          console.log('DATE STR'+dateStr);
          const cell = document.querySelector(`.fc-day[data-date="${dateStr}"]`);
          console.log('Cell: '+cell);
          if (cell) {
            const dateNumber = cell.querySelector('.fc-daygrid-day-number'); 
            this.renderer.setStyle(dateNumber, 'color', event.textColor);
            // Limpiar estilos anteriores
            //this.renderer.setStyle(cell, 'boxShadow', 'none');
           // this.renderer.setStyle(cell, 'backgroundColor', 'transparent');
            
  
            // Aplicar estilos según el valor de event.relleno
            if (event.relleno === 0) {
              // Borde interno
              if (index === 0) {
                this.renderer.setStyle(cell, 'boxShadow', `inset 3px 0 0 0 ${event.colorBD}, inset 0 -3px 0 0 ${event.colorBD}, inset 0 3px 0 0 ${event.colorBD}`);
              } else if (index === totalDays - 1) {
                this.renderer.setStyle(cell, 'boxShadow', `inset -3px 0 0 0 ${event.colorBD}, inset 0 -3px 0 0 ${event.colorBD}, inset 0 3px 0 0 ${event.colorBD}`);
              } else {
                this.renderer.setStyle(cell, 'boxShadow', `inset 0 -3px 0 0 ${event.colorBD}, inset 0 3px 0 0 ${event.colorBD}`);
              }
            } else if (event.relleno > 0 && event.relleno < 3) {
              // Relleno
              //this.renderer.setStyle(cell, 'boxShadow', `inset 0px 0px 0px 10px blue`); 
              this.renderer.setStyle(cell, 'backgroundColor', event.colorBD);
              
              
            }else if(event.relleno === 4 || event.relleno === 5){
              const icon_type = event.relleno === 4 ? 'caret-forward-outline' : 'caret-back-outline';
              const icon = document.createElement('ion-icon');
  icon.setAttribute('name', icon_type); // Cambia por el ícono que desees
  this.renderer.setStyle(icon, 'font-size', '50px');
  this.renderer.setStyle(icon, 'color', event.colorBD);
  this.renderer.setStyle(icon, 'position', 'absolute');
  this.renderer.setStyle(icon, 'top', '50%');
  this.renderer.setStyle(icon, 'left', '50%');
  this.renderer.setStyle(icon, 'transform', 'translate(-50%, -50%)');
  this.renderer.setStyle(icon, 'pointer-events', 'none');

  // Asegúrate de que la celda tenga posición relativa
  this.renderer.setStyle(cell, 'position', 'relative');
  cell.appendChild(icon);
             // this.renderer.setStyle(cell, 'backgroundColor', event.colorBD);
            }
            // Eliminar el fondo si hay borde interno
          /*if (event.relleno === 0) {
            this.renderer.setStyle(cell, 'backgroundColor', 'transparent'); // Asegurar que el fondo sea transparente
          }*/
  
            // Puedes agregar más condiciones si necesitas más valores de event.relleno
          }
  
          d.setDate(d.getDate() + 1);
          index++;
        }
      }
    });
  }
  
  
  
  
  ngOnDestroy() {
    // Cancelar la suscripción para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }  
  
  // Método para cerrar sesión
  logout() {
    this.authService.logout(); // Lógica para cerrar sesión
    this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión
  }

  login() {
    this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen; // Alternar el estado de apertura/cierre del menú
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false; // Cerrar el menú al presionar fuera de él
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CalendarModalComponent,
    });
    return await modal.present();
  }

  
}
