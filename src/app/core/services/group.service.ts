import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GrupoApiDto } from '../api/models/grupo-api-dto.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor(private http: HttpClient) {}

  getAllGroups(): Observable<GrupoApiDto[]> {
    return this.http.get<GrupoApiDto[]>(`${environment.apiUrl}/grupos`);
  }
}
