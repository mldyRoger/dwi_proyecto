import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private user: { name: string } | null = null; // Almacena la información del usuario
  private API_URL = 'http://localhost:3000/api';  // Cambia esto por el URL de tu backend

  constructor(private http: HttpClient) { 
    // Inicializa el usuario desde el almacenamiento local, si existe
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;
  }
  getEventsx(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  // Obetener los eventos
  getEvents(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/calendar/`);
  }

}
