import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RegisterRequest {
  userName: string;
  userEmailId: string;
  userPassword: string;
  userPhoneNumber: string;
}

export interface LoginRequest {
  userEmailId: string;
  userPassword: string;
}

export interface LoginResponse {
  userId: number;
  userName: string;
  userEmailId: string;
  userPhoneNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8000/users';

  // USERNAME observable
  private userNameSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('userName')
  );
  userName$ = this.userNameSubject.asObservable();

  // USERID observable
  private userIdSubject = new BehaviorSubject<number | null>(
    Number(localStorage.getItem('userId')) || null
  );
  userId$ = this.userIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data);
  }

  // Store userId + name + email after login
  setLoggedInUser(user: LoginResponse): void {
    localStorage.setItem('userId', user.userId.toString());
    localStorage.setItem('userName', user.userName);
    localStorage.setItem('userEmailId', user.userEmailId);

    this.userIdSubject.next(user.userId);
    this.userNameSubject.next(user.userName);
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmailId');

    this.userIdSubject.next(null);
    this.userNameSubject.next(null);
  }
}
