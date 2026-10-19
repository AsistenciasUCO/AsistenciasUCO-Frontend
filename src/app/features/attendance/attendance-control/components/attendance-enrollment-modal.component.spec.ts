import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { AttendanceEnrollmentModalComponent } from './attendance-enrollment-modal.component';
import { StudentService } from '../../../../core/services/student.service';
import { EstudiantePaginaApiDto } from '../../../../core/api/models/estudiante-api-dto.model';

describe('AttendanceEnrollmentModalComponent', () => {
  let fixture: ComponentFixture<AttendanceEnrollmentModalComponent>;
  let component: AttendanceEnrollmentModalComponent;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;

  beforeEach(async () => {
    studentServiceSpy = jasmine.createSpyObj('StudentService', ['searchStudentByIdentification']);

    await TestBed.configureTestingModule({
      imports: [AttendanceEnrollmentModalComponent],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceEnrollmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('onDocTypeChange actualiza el tipo de documento y emite clearFieldError', () => {
    let clearedField = '';
    component.clearFieldError.subscribe((f) => (clearedField = f));

    component.onDocTypeChange('tipo-cc-uuid');
    expect(component.docType()).toBe('tipo-cc-uuid');
    expect(clearedField).toBe('tipoIdentificacionId');
  });

  it('onCodeChange actualiza el código y limpia el error', () => {
    let clearedField = '';
    component.clearFieldError.subscribe((f) => (clearedField = f));

    component.onCodeChange('1017123456');
    expect(component.code()).toBe('1017123456');
    expect(clearedField).toBe('numeroIdentificacion');
  });

  it('buscarEstudiante carga los datos cuando el estudiante ya existe en la base de datos', () => {
    const mockRespuesta: EstudiantePaginaApiDto = {
      items: [
        {
          id: 'est-1',
          idUsuario: 'usr-1',
          tipoIdentificacionId: 'tipo-cc',
          numeroIdentificacion: 1017123456,
          primerNombre: 'Ana',
          segundoNombre: 'María',
          primerApellido: 'Gómez',
          segundoApellido: 'Restrepo',
          nombreCompleto: 'Ana María Gómez Restrepo',
          correo: 'ana.gomez@uco.edu.co',
          estaActivoUsuario: true,
        },
      ],
      totalItems: 1,
      totalPages: 1,
      page: 0,
      size: 1,
    };

    studentServiceSpy.searchStudentByIdentification.and.returnValue(of(mockRespuesta));

    component.docType.set('tipo-cc');
    component.code.set('1017123456');
    component.buscarEstudiante();

    expect(studentServiceSpy.searchStudentByIdentification).toHaveBeenCalledWith('tipo-cc', 1017123456);
    expect(component.isExistingStudent()).toBeTrue();
    expect(component.firstName()).toBe('Ana');
    expect(component.lastName()).toBe('Gómez');
    expect(component.email()).toBe('ana.gomez@uco.edu.co');
    expect(component.searchStatus()).toBe('FOUND');
  });

  it('buscarEstudiante despliega formulario de registro si el estudiante no existe', () => {
    const mockVacio: EstudiantePaginaApiDto = {
      items: [],
      totalItems: 0,
      totalPages: 0,
      page: 0,
      size: 1,
    };

    studentServiceSpy.searchStudentByIdentification.and.returnValue(of(mockVacio));

    component.docType.set('tipo-cc');
    component.code.set('1017999999');
    component.buscarEstudiante();

    expect(component.isExistingStudent()).toBeFalse();
    expect(component.showRegistrationForm()).toBeTrue();
    expect(component.searchStatus()).toBe('NOT_FOUND');
  });

  it('buscarEstudiante despliega formulario limpio si el servicio responde con error', () => {
    studentServiceSpy.searchStudentByIdentification.and.returnValue(throwError(() => new Error('Not found')));

    component.docType.set('tipo-cc');
    component.code.set('1017999999');
    component.buscarEstudiante();

    expect(component.isExistingStudent()).toBeFalse();
    expect(component.showRegistrationForm()).toBeTrue();
    expect(component.searchStatus()).toBe('NOT_FOUND');
  });

  it('onSubmit emite submitted con datos válidos', () => {
    let payloadEmitido: any = null;
    component.submitted.subscribe((p) => (payloadEmitido = p));

    component.docType.set('tipo-cc');
    component.code.set('1017123456');
    component.firstName.set('Carlos');
    component.lastName.set('Ramírez');
    component.email.set('carlos.ramirez@uco.edu.co');
    component.password.set('Temporal2026*');
    component.confirmPassword.set('Temporal2026*');
    component.isExistingStudent.set(true);

    const event = new Event('submit');
    component.onSubmit(event);

    expect(payloadEmitido).toBeTruthy();
    expect(payloadEmitido.primerNombre).toBe('Carlos');
    expect(payloadEmitido.correo).toBe('carlos.ramirez@uco.edu.co');
  });

  it('onClose emite evento closed', () => {
    let cerrado = false;
    component.closed.subscribe(() => (cerrado = true));

    component.onClose();
    expect(cerrado).toBeTrue();
  });
});
