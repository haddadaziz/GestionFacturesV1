import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Societe } from '../models/societe';

@Injectable({
  providedIn: 'root'
})
export class SocieteService {
  private apiUrl = 'http://localhost:5165/api/societes'; 

  constructor(private http: HttpClient) {}

  getSocietes(): Observable<Societe[]> {
    return this.http.get<Societe[]>(this.apiUrl);
  }

  addSociete(societe: Societe): Observable<Societe> {
    return this.http.post<Societe>(this.apiUrl, societe);
  }
}
