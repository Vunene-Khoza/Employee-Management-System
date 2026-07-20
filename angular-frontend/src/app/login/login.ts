import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';
import { Weather } from '../weather';
import { EmployeeRefresh } from '../employee-refresh';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  emailError = '';

  private emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  // Weather
  weatherTemp: number | null = null;
  weatherDesc: string = '';
  weatherCity: string = '';
  weatherWind: number | null = null;
  weatherLoading: boolean = true;
  weatherError: string = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private weather: Weather,
    private employeeRefresh: EmployeeRefresh
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.employeeRefresh.trigger();
      void this.router.navigate(['/employees'], { replaceUrl: true });
      return;
    }

    this.loadWeather();
  }

  loadWeather() {
    if (!navigator.geolocation) {
      this.weatherError = 'Geolocation is not supported by your browser';
      this.weatherLoading = false;
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Reverse geocode city name
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(res => res.json())
          .then(data => {
            this.weatherCity = data.address?.city
              || data.address?.town
              || data.address?.village
              || data.address?.county
              || 'Your Location';
          });
          this.weather.getWeather(lat, lon).subscribe({
          next: (data) => {
            this.weatherTemp = Math.round(data.current.temperature_2m);
            this.weatherDesc = this.weather.getWeatherDescription(data.current.weathercode);
            this.weatherWind = Math.round(data.current.windspeed_10m);
            this.weatherLoading = false;
          },
          error: () => {
            this.weatherError = 'Could not load weather';
            this.weatherLoading = false;
          }
        });
      },
      () => {
        this.weatherError = 'Location access denied';
        this.weatherLoading = false;
      }
    );


  }

  validateEmail(): void {
    if (!this.email) {
      this.emailError = 'Email is required';
    } else if (!this.emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

onLogin() {
  this.validateEmail();
  if (this.emailError) return;

  this.auth.login(this.email, this.password).subscribe({
    next: (res) => {
      this.auth.saveSession(
        res.token,
        res.email,
        res.role,
        res.userId,
        res.departmentId
      );
      this.employeeRefresh.trigger();
      void this.router.navigate(['/employees'], { replaceUrl: true });
    },
    error: () => {
      this.errorMessage = 'Invalid email or password';
    }
  });
}

}


