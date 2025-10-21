import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment.development";

export interface LoginProps {
  id: string;
  admin?: number;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private cookieName = "sesion";

  constructor(private cookieService: CookieService, private router: Router) {}

  async login(username: string, password: string): Promise<LoginProps> {
    const url = `${environment.api}/sesion/`;

    const formData = new FormData();
    formData.append("usr", username);
    formData.append("password", password);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (response.status !== 200) {
      throw new Error("Usuario o contraseña incorrecta");
    }

    const data = await response.json();

    const usuario = Array.isArray(data.data.data) ? data.data.data[0] : null;

    if (!usuario) {
      throw new Error("No se recibió información del usuario.");
    }

    this.cookieService.set(this.cookieName, JSON.stringify(usuario), {
      expires: 1,
      path: "/",
    });

    return usuario;
  }

  logout(): void {
    this.cookieService.delete(this.cookieName, "/");
    this.router.navigate(["/login"]);
  }

  isLoggedIn(): boolean {
    return this.cookieService.check(this.cookieName);
  }

  getUser(): LoginProps | null {
    if (this.isLoggedIn()) {
      return JSON.parse(this.cookieService.get(this.cookieName));
    }
    return null;
  }
}
