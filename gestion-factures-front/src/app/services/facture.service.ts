import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facture } from '../models/facture';

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private apiUrl = 'http://localhost:5165/api/factures'; 

  constructor(private http: HttpClient) {}

  getFactures(): Observable<Facture[]> {
    return this.http.get<Facture[]>(this.apiUrl);
  }

  // Cette fonction manquante est maintenant bien là !
  addFacture(facture: Facture): Observable<Facture> {
    return this.http.post<Facture>(this.apiUrl, facture);
  }

  updateFacture(id: string, facture: Facture): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, facture);
  }

  updateFactureStatut(id: string, statut: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/statut`, statut, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteFacture(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}