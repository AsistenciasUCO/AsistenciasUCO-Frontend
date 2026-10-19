import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { TeacherClaimsComponent } from './teacher-claims.component';
import { AttendanceClaimService } from '../../../core/services/attendance-claim.service';
import { ToastService } from '../../../shared/components/toast/toast.component';

describe('TeacherClaimsComponent — descarga de soporte (LB-004D FE-06)', () => {
  let component: TeacherClaimsComponent;
  let claims: jasmine.SpyObj<AttendanceClaimService>;
  let toast: jasmine.SpyObj<ToastService>;
  const adjunto = { fileId: 'f-1', nombre: 'evi/dencia?.pdf', tipo: 'application/pdf', tamanioKb: 2, fechaSubida: '2026-10-19' };

  beforeEach(() => {
    claims = jasmine.createSpyObj<AttendanceClaimService>('AttendanceClaimService', ['getReclamosDocente', 'descargarSoporte', 'resolverReclamo']);
    claims.getReclamosDocente.and.returnValue(of({ exitoso: true, datos: [] }) as never);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error', 'warning', 'info']);
    TestBed.configureTestingModule({
      imports: [TeacherClaimsComponent],
      providers: [
        { provide: AttendanceClaimService, useValue: claims },
        { provide: ToastService, useValue: toast },
      ],
    });
    component = TestBed.createComponent(TeacherClaimsComponent).componentInstance;
  });

  it('descarga por HttpClient (Blob) y nombra el archivo sin caracteres peligrosos; nunca abre una URL', () => {
    claims.descargarSoporte.and.returnValue(of(new Blob(['x'], { type: 'application/pdf' })));
    const createUrl = spyOn(URL, 'createObjectURL').and.returnValue('blob:x');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const abrir = spyOn(window, 'open');
    const anchor = document.createElement('a');
    const click = spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.returnValue(anchor);

    component.descargarSoporte(adjunto);

    expect(claims.descargarSoporte).toHaveBeenCalledOnceWith('f-1');
    expect(createUrl).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(anchor.download).toBe('evi_dencia_.pdf');
    expect(revoke).toHaveBeenCalledWith('blob:x');
    expect(abrir).not.toHaveBeenCalled();
    expect(anchor.href).not.toContain('token');
    expect(component.descargandoSoporte()).toBeFalse();
  });

  it('sin fileId advierte y no consulta el backend', () => {
    component.descargarSoporte({ ...adjunto, fileId: undefined });
    expect(claims.descargarSoporte).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalled();
  });

  it('ignora un segundo clic mientras la descarga está en curso', () => {
    const pendiente = new Subject<Blob>();
    claims.descargarSoporte.and.returnValue(pendiente.asObservable());

    component.descargarSoporte(adjunto);
    component.descargarSoporte(adjunto);

    expect(claims.descargarSoporte).toHaveBeenCalledTimes(1);
    expect(component.descargandoSoporte()).toBeTrue();
  });

  it('pérdida de autorización (404) y sesión vencida (401) tienen mensajes claros y distintos', () => {
    const mensajes: string[] = [];
    for (const status of [404, 401]) {
      claims.descargarSoporte.and.returnValue(throwError(() => new HttpErrorResponse({ status })));
      component.descargarSoporte(adjunto);
      mensajes.push(toast.error.calls.mostRecent().args[0] as string);
    }
    expect(mensajes[0]).toContain('ya no tienes autorización');
    expect(mensajes[1]).toContain('sesión expiró');
    expect(mensajes[0]).not.toBe(mensajes[1]);
    expect(component.descargandoSoporte()).toBeFalse();
  });
});
