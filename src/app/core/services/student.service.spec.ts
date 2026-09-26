import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { environment } from '../../../environments/environment';

describe('StudentService', () => {
  let service: StudentService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('USE_MOCKS', 'false');
    TestBed.configureTestingModule({
      providers: [StudentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('USE_MOCKS');
  });

  it('rechaza una matrícula sin contraseña explícita y no llama al backend', () => {
    let receivedError: unknown;

    service
      .enrollStudentInGroup({
        grupo: 'grupo-1',
        tipoDocumento: 'tipo-1',
        numeroIdentificacion: 123456,
        primerNombre: 'Ada',
        primerApellido: 'Lovelace',
        correoElectronico: 'ada@example.test',
        password: '   ',
      })
      .subscribe({ error: (error) => (receivedError = error) });

    expect(receivedError).toBeTruthy();
    http.expectNone(`${environment.apiUrl}/grupos/grupo-1/estudiantes`);
  });
});
