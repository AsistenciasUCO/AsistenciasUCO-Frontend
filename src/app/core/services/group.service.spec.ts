import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { GroupService } from './group.service';
import { environment } from '../../../environments/environment';

describe('GroupService', () => {
  let service: GroupService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GroupService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta los estudiantes del grupo en el endpoint definitivo', () => {
    service.getStudentsByGroup('grupo-1').subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/grupos/grupo-1/estudiantes`
    );
    expect(request.request.method).toBe('GET');
    request.flush({ exitoso: true, datos: [], total: 0 });
  });
});
