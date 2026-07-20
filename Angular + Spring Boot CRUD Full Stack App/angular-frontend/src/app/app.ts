import { Component, HostListener, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from './auth';
import { SweetAlert } from './sweet-alert';
import { filter } from 'rxjs';
import { ChatbotComponent } from './chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ChatbotComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('');

  constructor(
    private auth: Auth,
    private sweetAlert: SweetAlert,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handlePageLoad();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.handlePageLoad());
  }

  @HostListener('window:load')
  onWindowLoad(): void {
    this.handlePageLoad();
  }

  private handlePageLoad(): void {
    if (!this.auth.isLoggedIn()) return;

    if (this.router.url === '/' || this.router.url === '/login') {
      void this.router.navigate(['/employees'], { replaceUrl: true });
    }
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  showChatbot(): boolean {
    if (!this.isLoggedIn()) {
      return false;
    }
    const url = this.router.url;
    return !(url.includes('/login') || url.includes('/register'));
  }

  isAdmin(): boolean {
    return this.auth.getRole() === 'ADMIN';
  }

  isSupervisor(): boolean {
    return this.auth.getRole() === 'SUPERVISOR';
  }

  userEmail(): string {
    return this.auth.getEmail() || '';
  }

  userRole(): string {
    return this.auth.getRole() || '';
  }

  async logout(): Promise<void> {
    const confirmed = await this.sweetAlert.confirmAction(
      'Logout?',
      'Are you sure you want to logout?',
      'Yes, logout'
    );
    if (!confirmed) return;
    this.auth.logout();
  }
}

