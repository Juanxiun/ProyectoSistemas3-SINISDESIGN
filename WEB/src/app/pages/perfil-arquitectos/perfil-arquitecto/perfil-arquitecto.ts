

import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { Navbar } from '../../../components/navbar/navbar';
import { Siderbar } from '../../../components/siderbar/siderbar';
import { ConnectA } from '../../../../config/index';

import { InformacionProfesional } from '../../../components/arquitecto/informacion-profesional/informacion-profesional';
import { EspecializacionesComponent } from '../../../components/arquitecto/especializaciones/especializaciones';

import { CookieService } from "ngx-cookie-service";

import { NotificacionComponent } from "../../../components/notificacion/notificacion";

interface Arquitecto {
  codigo?: string;
  nombre: string;
  apellido: string;
  correo: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  data?: { data?: T | T[]; msg?: string; } | T;
  status?: number;
}

@Component({
  selector: 'app-perfil-arquitecto',
  standalone: true,
  imports: [
    CommonModule, RouterModule, Navbar, Siderbar, FormsModule, HttpClientModule,
    InformacionProfesional, EspecializacionesComponent, NotificacionComponent,
  ],
  templateUrl: './perfil-arquitecto.html',
  styleUrl: './perfil-arquitecto.css'
})
export class PerfilArquitectoComponent implements OnInit {

  @ViewChild(InformacionProfesional) infoProfesionalComponent!: InformacionProfesional;
  @ViewChild(EspecializacionesComponent) especializacionesComponent!: EspecializacionesComponent;


  arquitecto: Arquitecto | null = null;
  arquitectoCodigo: string | null = null;
  isLoading = true;
  isEditing = false;
  isSaving = false;

  isInfoFormValid = true;

  userData: any;

  //notis
  notificationData: { type: 1 | 2 | 3, Tittle: string, message: string } | null = null;

  //kambio contraseña
  showPassModal = false;
  newPassword = '';
  confirmPassword = '';
  isSavingPass = false;


  private apiUrl = `${ConnectA.api}/arquitectos`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.loadArquitectoFromSession();
  }


  loadArquitectoFromSession() {
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      try {
        this.userData = JSON.parse(cookieValue);
        console.log(this.userData);
      } catch (e) {
        console.error("Error al parsear cookie de sesión:", e);
        this.router.navigate(["/"]);
        return;
      }
    } else {
      this.router.navigate(["/"]);
      return;
    }

    if (!this.userData || !this.userData.id) {
      this.router.navigate(["/"]);
      return;
    }


    this.arquitectoCodigo = this.userData.id;


    if (this.arquitectoCodigo) {
      this.fetchArquitectoDetails(this.arquitectoCodigo);
    } else {
      this.isLoading = false;
    }
    this.cdr.detectChanges();
  }

  fetchArquitectoDetails(codigo: string) {
    this.isLoading = true;

    this.http.get<ApiResponse<Arquitecto>>(`${this.apiUrl}/${codigo}`).subscribe({
      next: (response: ApiResponse<Arquitecto>) => {
        const data = response.data && 'data' in response.data && Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data;

        if (data && 'codigo' in data) {
          this.arquitecto = data as Arquitecto;
        } else {
          this.arquitecto = null;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar datos del arquitecto:', err);
        this.isLoading = false;
        this.arquitecto = null;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit() {
    if (this.isEditing) {
      this.infoProfesionalComponent.resetForm();
    }
    this.isEditing = !this.isEditing;
  }

  onInfoFormValidityChange(isValid: boolean) {
    this.isInfoFormValid = isValid;
  }


  saveChanges() {
    if (!this.arquitectoCodigo) return;

    this.isSaving = true;

    this.infoProfesionalComponent.saveInformacion().subscribe({
      next: (infoResponse) => {
        // alert(infoResponse.data?.msg || 'Información profesional actualizada exitosamente!');
        this.onNotification({
          type: 1,
          Tittle: "atctualización exitosa",
          message: 'Información profesional actualizada exitosamente!',
        });

        this.isEditing = false;
        this.cdr.detectChanges();
      },

      error: (infoErr: any) => {
        console.error('Error al guardar info profesional:', infoErr);


        const errorMessage = (infoErr instanceof HttpErrorResponse)
          ? (infoErr.error?.data?.msg || infoErr.message)
          : (infoErr.message || 'Error de validación interna, revise los campos.');

        //alert('Error al actualizar info profesional: ' + errorMessage);
        this.onNotification({
          type: 3,
          Tittle: "Error de atctualización",
          message: 'Error al actualizar info profesional: ' + errorMessage,
        });
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
  // password modal logica
  openPassModal() {
    this.newPassword = '';
    this.confirmPassword = '';
    this.showPassModal = true;
  }

  closePassModal() {
    this.showPassModal = false;
  }

  updatePassword() {

    const passLimpia = this.newPassword.trim();
    const confirmLimpia = this.confirmPassword.trim();

    if (passLimpia.length < 8) {
      this.onNotification({ type: 3, Tittle: "Error", message: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (passLimpia !== confirmLimpia) {
      this.onNotification({ type: 3, Tittle: "Error", message: "Las contraseñas no coinciden." });
      return;
    }
    if (passLimpia.split(" ")[1]) {
      this.onNotification({ type: 3, Tittle: "Error", message: "La contraseña no debe tener espacios" });
      return;
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_+\-=]/;
    if (!specialCharRegex.test(passLimpia)) {
      this.onNotification({ type: 3, Tittle: "Error", message: "La contraseña debe incluir al menos un carácter especial (ej: @, #, $)." });
      return;
    }

    if (!this.arquitectoCodigo) return;

    this.isSavingPass = true;

    this.cdr.detectChanges();

    const url = `${this.apiUrl}/${this.arquitectoCodigo}`;
    const body = { password: passLimpia };

    this.http.put<ApiResponse<any>>(url, body).subscribe({
      next: (resp) => {
        this.onNotification({
          type: 1,
          Tittle: "Éxito",
          message: "Contraseña actualizada correctamente."
        });
        this.isSavingPass = false;
        this.closePassModal();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cambiar password:', err);
        const msg = err.error?.msg || err.error?.data?.msg || "Error al actualizar la contraseña.";
        this.onNotification({
          type: 3,
          Tittle: "Error",
          message: msg
        });
        this.isSavingPass = false;
        this.cdr.detectChanges();
      }
    });
  }

  //notis
  onNotification(data: { type: 1 | 2 | 3, Tittle: string, message: string }) {
    this.notificationData = data;
  }
}