import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MOCK_CURRENT_USER } from '../../core/mocks/user.mock';

import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AvatarComponent],
  template: `
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

      <!-- Sidebar Container (Fixed full height) -->
      <aside [class]="sidebarClasses()">
        <!-- Brand Header (Top - Shrink 0) -->
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

        <!-- Navigation Links (Middle - Scrollable) -->
        <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <!-- Overview Link -->
          <a
            routerLink="/app/dashboard"
            routerLinkActive="bg-primary-50 text-primary-800 font-semibold shadow-xs"
            (click)="isMobileMenuOpen.set(false)"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 hover:text-warm-900 transition-all duration-150 group"
          >
            <svg class="w-5 h-5 text-warm-500 group-hover:text-primary-700 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            @if (!isCollapsed()) {
              <span>Panel Principal</span>
            }
          </a>

          <!-- Attendance Control Link -->
          <a
            routerLink="/app/asistencia"
            routerLinkActive="bg-primary-50 text-primary-800 font-semibold shadow-xs"
            (click)="isMobileMenuOpen.set(false)"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 hover:text-warm-900 transition-all duration-150 group"
          >
            <svg class="w-5 h-5 text-warm-500 group-hover:text-primary-700 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            @if (!isCollapsed()) {
              <span>Toma de Asistencia</span>
            }
          </a>
        </nav>

        <!-- User Profile Card Footer (Bottom - Fixed Shrink 0) -->
        <div class="p-4 border-t border-warm-200/80 bg-warm-50/50 shrink-0">
          <div class="flex items-center gap-3 p-2 rounded-xl bg-white border border-warm-200 shadow-warm-sm">
            <app-avatar [name]="user.name"></app-avatar>
            @if (!isCollapsed()) {
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-warm-900 truncate">{{ user.name }}</p>
                <p class="text-[11px] text-warm-500 truncate">{{ user.email }}</p>
              </div>
              <a
                routerLink="/login"
                class="p-1 text-warm-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                title="Cerrar sesión"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </a>
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
              {{ user.institutionName }}
            </span>
            <span class="text-warm-300">/</span>
            <span class="text-xs text-warm-600 font-medium">{{ user.department }}</span>
          </div>

          <div class="flex items-center gap-4">
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
  user = MOCK_CURRENT_USER;
  isCollapsed = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  toggleCollapsed() {
    this.isCollapsed.update((val) => !val);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((val) => !val);
  }

  sidebarClasses() {
    const collapsedWidth = this.isCollapsed() ? 'w-20' : 'w-64';
    const mobileVisibility = this.isMobileMenuOpen()
      ? 'translate-x-0'
      : '-translate-x-full md:translate-x-0';

    return `fixed md:static inset-y-0 left-0 z-50 h-dvh max-h-dvh bg-white border-r border-warm-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-warm-md md:shadow-none ${collapsedWidth} ${mobileVisibility}`;
  }
}
