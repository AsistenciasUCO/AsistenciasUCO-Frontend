import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { UserService } from '../../../core/services/user.service';

describe('RegisterComponent', () => {
  it('no registra un usuario sin contraseña explícita', () => {
    const catalogService = jasmine.createSpyObj<CatalogService>('CatalogService', [
      'getIdentityDocumentTypes',
    ]);
    catalogService.getIdentityDocumentTypes.and.returnValue(of([]));
    const userService = jasmine.createSpyObj<UserService>('UserService', [
      'createUser',
    ]);
    userService.createUser.and.returnValue(
      of({ exitoso: true, mensajeUsuario: 'ok' } as any)
    );

    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: CatalogService, useValue: catalogService },
        { provide: UserService, useValue: userService },
      ],
    });

    const component = TestBed.createComponent(RegisterComponent).componentInstance;
    component.tipoIdentificacionId = 'tipo-1';
    component.numeroIdentificacion = '123456';
    component.primerNombre = 'Ada';
    component.primerApellido = 'Lovelace';
    component.email = 'ada@example.test';
    component.password = '   ';

    component.onRegister(new Event('submit'));

    expect(userService.createUser).not.toHaveBeenCalled();
    expect(component.fieldErrors()['password']).toBeTruthy();
  });
});
