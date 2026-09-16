import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AttendanceService } from './attendance.service';
import { environment } from '../../../environments/environment';
import { RegistrarAsistenciasSesionRequest } from '../api/models/registrar-asistencias-sesion-request.model';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AttendanceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía exclusivamente el contrato batch canónico', () => {
    const payload: RegistrarAsistenciasSesionRequest = {
      sesionId: 'ses-1',
      registros: [{ estudianteId: 'est-1', estado: 'EX' }],
    };

    service.saveBatchAttendance(payload).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/asistencias/lote`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body.grupoId).toBeUndefined();
    expect(request.request.body.registros[0].studentId).toBeUndefined();
    expect(request.request.body.registros[0].status).toBeUndefined();
    expect(request.request.body.registros[0].notes).toBeUndefined();
    expect(request.request.body.registros[0].observaciones).toBeUndefined();
    request.flush({ exitoso: true, mensaje: 'ok' });
  });
});
