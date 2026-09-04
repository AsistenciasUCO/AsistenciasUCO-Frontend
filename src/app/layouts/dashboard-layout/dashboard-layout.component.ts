import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ToastComponent, ToastService } from '../../shared/components/toast/toast.component';

interface NavItem {
  label: string;
  route: string;
  roles: UserRole[];
  icon: string;
}

interface ProcessedNavItem {
  label: string;
  route: string;
  roles: UserRole[];
  icon: SafeHtml;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AvatarComponent, BadgeComponent, ToastComponent],
  template: `
    <app-toast
      [visible]="toastState().visible"
      [message]="toastState().message"
      [type]="toastState().type"
      (dismissed)="toastService.dismiss()"
    ></app-toast>
    <div class="h-dvh max-h-dvh w-full bg-warm-50 flex flex-col md:flex-row overflow-hidden">
      <!-- Mobile Top Navbar -->
      <header class="md:hidden bg-white border-b border-warm-200 px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-warm-sm">
        <div class="flex items-center gap-2.5">
          <img src="logo.svg" alt="Gestió Asistencia Logo" class="w-8 h-8 object-contain shrink-0" />
          <span class="font-serif font-bold text-warm-900 text-lg">Gestió Asistencia</span>
        </div>
        <button
          type="button"
          (click)="toggleMobileMenu()"
          class="p-2 text-warm-600 hover:text-warm-900 rounded-lg hover:bg-warm-100"
          aria-label="Menú principal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @if (isMobileMenuOpen()) {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </header>

      <!-- Sidebar Overlay for Mobile -->
      @if (isMobileMenuOpen()) {
        <div
          class="md:hidden fixed inset-0 bg-warm-950/50 backdrop-blur-xs z-40"
          (click)="isMobileMenuOpen.set(false)"
        ></div>
      }

      <!-- Sidebar Container -->
      <aside [class]="sidebarClasses()">
        <!-- Brand Header -->
        <div class="p-5 flex items-center justify-between border-b border-warm-200/80 shrink-0">
          <div class="flex items-center gap-3">
            <img src="logo.svg" alt="Gestió Asistencia Logo" class="w-9 h-9 object-contain shrink-0" />
            @if (!isCollapsed()) {
              <div>
                <h1 class="font-serif font-bold text-warm-900 text-base leading-tight tracking-tight">Gestió Asistencia</h1>
                <p class="text-[10px] uppercase font-bold text-primary-700 tracking-wider">Universidad Católica de Oriente</p>
              </div>
            }
          </div>
          <!-- Desktop Collapse Toggle -->
          <button
            type="button"
            (click)="toggleCollapsed()"
            class="hidden md:flex p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors"
            [title]="isCollapsed() ? 'Expandir menú' : 'Colapsar menú'"
          >
            <svg class="w-5 h-5 transform transition-transform" [class.rotate-180]="isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links Filtrados por Rol -->
        <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
          @if (!isCollapsed()) {
            <div class="px-3 pb-2 text-[10px] font-bold tracking-wider text-warm-400 uppercase">
              Módulos para {{ currentRole() }}
            </div>
          }

          @for (item of filteredNavItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary-50 text-primary-800 font-semibold shadow-xs"
              (click)="isMobileMenuOpen.set(false)"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 hover:text-warm-900 transition-all duration-150 group"
              [title]="isCollapsed() ? item.label : ''"
            >
              <div [innerHTML]="item.icon" class="w-5 h-5 text-warm-500 group-hover:text-primary-700 shrink-0 transition-colors flex items-center justify-center"></div>
              @if (!isCollapsed()) {
                <span class="truncate">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <!-- Mock Role Switcher (Visible en modo Mock) -->
        @if (isMockMode() && !isCollapsed()) {
          <div class="px-4 py-3 mx-3 mb-2 rounded-xl bg-warm-100/70 border border-warm-200/80 shrink-0">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-warm-600">Simulador de Rol</span>
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary-100 text-primary-800">Mock</span>
            </div>
            <select
              [value]="currentRole()"
              (change)="onRoleChange($event)"
              class="w-full text-xs font-semibold py-1.5 px-2 bg-white border border-warm-300 rounded-lg text-warm-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="DECANO">Decano</option>
              <option value="COORDINADOR">Coordinador</option>
              <option value="DOCENTE">Docente</option>
              <option value="ESTUDIANTE">Estudiante</option>
            </select>
          </div>
        }

        <!-- User Profile Card Footer -->
        <div class="p-4 border-t border-warm-200/80 bg-warm-50/50 shrink-0">
          <div class="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-warm-200 shadow-warm-sm hover:border-primary-300 transition-colors">
            <!-- Clickable User Profile Area -->
            <a
              routerLink="/app/perfil"
              class="flex items-center gap-2.5 flex-1 min-w-0 p-1 rounded-lg hover:bg-warm-50 group cursor-pointer transition-colors"
              title="Ver y editar mi perfil institucional"
            >
              <app-avatar [name]="user()?.name || 'Usuario'" size="md"></app-avatar>
              @if (!isCollapsed()) {
                <div class="flex-1 min-w-0 text-left">
                  <p class="text-xs font-bold text-warm-900 truncate group-hover:text-primary-800 transition-colors">
                    {{ user()?.name }}
                  </p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <app-badge [variant]="getRoleBadgeVariant(currentRole())" size="sm">
                      {{ currentRole() }}
                    </app-badge>
                    <span class="text-[10px] text-warm-400 group-hover:text-primary-600 transition-colors">
                      • Editar
                    </span>
                  </div>
                </div>
              }
            </a>

            @if (!isCollapsed()) {
              <button
                type="button"
                (click)="logout()"
                class="p-2 text-warm-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                title="Cerrar sesión"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            }
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <!-- Top Desktop Bar -->
        <div class="hidden md:flex items-center justify-between bg-white border-b border-warm-200 px-8 py-3.5 shadow-warm-sm shrink-0 sticky top-0 z-20">
          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-100 text-accent-800 border border-accent-200">
              {{ user()?.institutionName || 'UCO' }}
            </span>
            <span class="text-warm-300">/</span>
            <span class="text-xs text-warm-600 font-medium">{{ user()?.department }}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-warm-500">Sesión activa como:</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-warm-100 text-warm-800 border border-warm-200">
              {{ currentRole() }}
            </span>
          </div>
        </div>

        <!-- Page View Container -->
        <div class="p-4 sm:p-6 lg:p-8 flex-1">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class DashboardLayoutComponent {
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  toastService = inject(ToastService);
  toastState = this.toastService.currentToast;

  user = this.authService.currentUser;
  isMockMode = this.authService.isMockMode;
  isCollapsed = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  currentRole = computed<UserRole>(() => {
    const role = this.user()?.role;
    if (role === 'ADMIN') return 'ADMINISTRADOR';
    return (role || 'DOCENTE') as UserRole;
  });

  private allNavItems: NavItem[] = [
    {
      label: 'Panel Principal',
      route: '/app/dashboard',
      roles: ['ADMINISTRADOR', 'DECANO', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE', 'ADMIN'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`,
    },
    {
      label: 'Gestión de Decanos',
      route: '/app/admin/decanos',
      roles: ['ADMINISTRADOR', 'ADMIN'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`,
    },
    {
      label: 'Infraestructura & Sedes',
      route: '/app/admin/catalogos',
      roles: ['ADMINISTRADOR', 'ADMIN'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>`,
    },
    {
      label: 'Sistema & Auditoría',
      route: '/app/admin/sistema',
      roles: ['ADMINISTRADOR', 'ADMIN'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    },
    {
      label: 'Facultad & Grupos',
      route: '/app/decano/facultad',
      roles: ['DECANO'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`,
    },
    {
      label: 'Gestión de Coordinadores',
      route: '/app/decano/coordinadores',
      roles: ['DECANO'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
    },
    {
      label: 'Gestión de Docentes',
      route: '/app/coordinador/docentes',
      roles: ['COORDINADOR'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
    },
    {
      label: 'Planes de Estudio',
      route: '/app/coordinador/planes-estudio',
      roles: ['COORDINADOR'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`,
    },
    {
      label: 'Estudiantes & Matrícula',
      route: '/app/coordinador/estudiantes',
      roles: ['COORDINADOR'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
    },
    {
      label: 'Mis Horarios',
      route: '/app/docente/horarios',
      roles: ['DOCENTE'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
    },
    {
      label: 'Gestión de Grupos',
      route: '/app/docente/grupos',
      roles: ['DOCENTE'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`,
    },
    {
      label: 'Toma de Asistencia',
      route: '/app/asistencia',
      roles: ['DOCENTE'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>`,
    },
    {
      label: 'Reclamos de Asistencia',
      route: '/app/docente/reclamos',
      roles: ['DOCENTE'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`,
    },
    {
      label: 'Mis Horarios',
      route: '/app/estudiante/horarios',
      roles: ['ESTUDIANTE'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
    },
    {
      label: 'Mis Materias',
      route: '/app/estudiante/materias',
      roles: ['ESTUDIANTE'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`,
    },
  ];

  filteredNavItems = computed<ProcessedNavItem[]>(() => {
    const role = this.currentRole();
    return this.allNavItems
      .filter((item) => item.roles.includes(role))
      .map((item) => ({
        ...item,
        icon: this.sanitizer.bypassSecurityTrustHtml(item.icon),
      }));
  });

  toggleCollapsed(): void {
    this.isCollapsed.update((val) => !val);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((val) => !val);
  }

  onRoleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newRole = target.value as UserRole;
    this.authService.loginAsMockUser(newRole, true);
  }

  logout(): void {
    this.authService.logout();
  }

  sidebarClasses(): string {
    const collapsedWidth = this.isCollapsed() ? 'w-20' : 'w-64';
    const mobileVisibility = this.isMobileMenuOpen()
      ? 'translate-x-0'
      : '-translate-x-full md:translate-x-0';

    return `fixed md:static inset-y-0 left-0 z-50 h-dvh max-h-dvh bg-white border-r border-warm-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-warm-md md:shadow-none ${collapsedWidth} ${mobileVisibility}`;
  }

  getRoleBadgeVariant(role: UserRole): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    switch (role) {
      case 'ADMINISTRADOR':
      case 'ADMIN':
        return 'danger';
      case 'DECANO':
        return 'warning';
      case 'COORDINADOR':
        return 'info';
      case 'DOCENTE':
        return 'success';
      case 'ESTUDIANTE':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
}
