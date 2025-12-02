import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Navbar } from "../../../components/navbar/navbar";
import { Siderbar } from "../../../components/siderbar/siderbar";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CookieService } from "ngx-cookie-service";
import { NotificacionComponent } from "../../../components/notificacion/notificacion";
import { ConnectA } from "../../../../config/index";

interface Cliente {
  ci: number;
  nombre: string;
  apellido: string;
  telefono: number;
  correo: string;
  password?: string;
  estado: number;
}

@Component({
  selector: 'app-crear-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    Siderbar,
    NotificacionComponent,
  ],
  templateUrl: './crear-clientes.html',
  styleUrl: './crear-clientes.css'
})
export class CrearClientes implements OnInit {
  private apiUrl = ConnectA.api + '/clientes';

  userData: any = { id: '', admin: 0 };
  modoEdicion: boolean = false;
  ciOriginal: number | null = null;
  
  cliente: Cliente = {
    ci: 0,
    nombre: '',
    apellido: '',
    telefono: 0,
    correo: '',
    password: '',
    estado: 1
  };

  errores = {
    ci: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    password: ''
  };

  camposTocados = {
    ci: false,
    nombre: false,
    apellido: false,
    telefono: false,
    correo: false,
    password: false
  };

  mostrarNotif: boolean = false;
  tipoNotif: 1 | 2 | 3 = 1;
  mensajeNotif: string = "";
  guardando: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
      
      this.route.queryParams.subscribe(params => {
        const ciParam = params['ci'];
        if (ciParam) {
          this.modoEdicion = true;
          this.ciOriginal = parseInt(ciParam);
          this.cargarCliente(this.ciOriginal);
        }
      });
    } else {
      this.router.navigate(["/"]);
    }
  }

  cargarCliente(ci: number): void {
    fetch(`${this.apiUrl}/${ci}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(res => {
        let clienteData = null;
        
        if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          clienteData = res.data.data[0];
        } else if (Array.isArray(res.data) && res.data.length > 0) {
          clienteData = res.data[0];
        } else if (res.data && typeof res.data === 'object' && res.data.ci) {
          clienteData = res.data;
        } else if (res && typeof res === 'object' && res.ci) {
          clienteData = res;
        }
        
        if (clienteData && clienteData.ci) {
          this.cliente = {
            ci: clienteData.ci,
            nombre: clienteData.nombre,
            apellido: clienteData.apellido,
            telefono: clienteData.telefono,
            correo: clienteData.correo,
            password: '',
            estado: clienteData.estado
          };
          this.cdr.detectChanges();
        } else {
          this.mostrarNotificacion(3, 'Cliente no encontrado');
          setTimeout(() => {
            this.volver();
          }, 1500);
        }
      })
      .catch(error => {
        // Mostrar en notificación en lugar de consola
        this.mostrarNotificacion(3, `Error al cargar cliente: ${error.message}`);
        setTimeout(() => {
          this.volver();
        }, 2000);
      });
  }

  marcarCampoTocado(campo: keyof typeof this.camposTocados): void {
    this.camposTocados[campo] = true;
  }

  validarCI(): void {
    if (!this.camposTocados.ci) return;

    const ci = this.cliente.ci;
    
    if (!ci || ci === 0) {
      this.errores.ci = 'El CI es obligatorio';
      return;
    }

    const ciStr = ci.toString();
    
    if (!/^\d+$/.test(ciStr)) {
      this.errores.ci = 'El CI solo debe contener números';
      return;
    }

    if (ciStr.length < 6 || ciStr.length > 10) {
      this.errores.ci = 'El CI debe tener entre 6 y 10 dígitos';
      return;
    }

    if (ci < 0) {
      this.errores.ci = 'El CI no puede ser negativo';
      return;
    }

    if (/^(\d)\1+$/.test(ciStr)) {
      this.errores.ci = 'El CI no puede tener todos los números iguales';
      return;
    }

    this.errores.ci = '';
  }

  validarNombre(): void {
    if (!this.camposTocados.nombre) return;

    const nombre = this.cliente.nombre;

    if (!nombre || nombre.trim() === '') {
      this.errores.nombre = 'El nombre es obligatorio';
      return;
    }

    const nombreTrim = nombre.trim();

    if (nombreTrim.length < 2) {
      this.errores.nombre = 'El nombre debe tener al menos 2 caracteres';
      return;
    }

    if (nombreTrim.length > 50) {
      this.errores.nombre = 'El nombre no puede tener más de 50 caracteres';
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrim)) {
      this.errores.nombre = 'El nombre solo puede contener letras';
      return;
    }

    if (/\d/.test(nombreTrim)) {
      this.errores.nombre = 'El nombre no puede contener números';
      return;
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nombreTrim)) {
      this.errores.nombre = 'El nombre no puede contener caracteres especiales';
      return;
    }

    if (/\s{2,}/.test(nombreTrim)) {
      this.errores.nombre = 'El nombre no puede tener espacios consecutivos';
      return;
    }

    this.errores.nombre = '';
  }

  validarApellido(): void {
    if (!this.camposTocados.apellido) return;

    const apellido = this.cliente.apellido;

    if (!apellido || apellido.trim() === '') {
      this.errores.apellido = 'El apellido es obligatorio';
      return;
    }

    const apellidoTrim = apellido.trim();

    if (apellidoTrim.length < 2) {
      this.errores.apellido = 'El apellido debe tener al menos 2 caracteres';
      return;
    }

    if (apellidoTrim.length > 50) {
      this.errores.apellido = 'El apellido no puede tener más de 50 caracteres';
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoTrim)) {
      this.errores.apellido = 'El apellido solo puede contener letras';
      return;
    }

    if (/\d/.test(apellidoTrim)) {
      this.errores.apellido = 'El apellido no puede contener números';
      return;
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(apellidoTrim)) {
      this.errores.apellido = 'El apellido no puede contener caracteres especiales';
      return;
    }

    if (/\s{2,}/.test(apellidoTrim)) {
      this.errores.apellido = 'El apellido no puede tener espacios consecutivos';
      return;
    }

    this.errores.apellido = '';
  }

  validarTelefono(): void {
    if (!this.camposTocados.telefono) return;

    const telefono = this.cliente.telefono;

    if (!telefono || telefono === 0) {
      this.errores.telefono = 'El teléfono es obligatorio';
      return;
    }

    const telefonoStr = telefono.toString();

    if (!/^\d+$/.test(telefonoStr)) {
      this.errores.telefono = 'El teléfono solo debe contener números';
      return;
    }

    if (telefonoStr.length < 8 || telefonoStr.length > 10) {
      this.errores.telefono = 'El teléfono debe tener entre 8 y 10 dígitos';
      return;
    }

    if (telefono < 0) {
      this.errores.telefono = 'El teléfono no puede ser negativo';
      return;
    }

    if (/^(\d)\1+$/.test(telefonoStr)) {
      this.errores.telefono = 'El teléfono no es válido';
      return;
    }

    if (telefonoStr.length === 8 && !['6', '7'].includes(telefonoStr[0])) {
      this.errores.telefono = 'El número de celular debe empezar con 6 o 7';
      return;
    }

    this.errores.telefono = '';
  }

  validarCorreo(): void {
    if (!this.camposTocados.correo) return;

    const correo = this.cliente.correo;

    if (!correo || correo.trim() === '') {
      this.errores.correo = 'El correo es obligatorio';
      return;
    }

    const correoTrim = correo.trim().toLowerCase();

    if (correoTrim.length < 5) {
      this.errores.correo = 'El correo es demasiado corto';
      return;
    }

    if (correoTrim.length > 100) {
      this.errores.correo = 'El correo no puede tener más de 100 caracteres';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoTrim)) {
      this.errores.correo = 'El formato del correo no es válido';
      return;
    }

    const emailRegexEstricto = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegexEstricto.test(correoTrim)) {
      this.errores.correo = 'El correo contiene caracteres no válidos';
      return;
    }

    if (/\s/.test(correoTrim)) {
      this.errores.correo = 'El correo no puede contener espacios';
      return;
    }

    if ((correoTrim.match(/@/g) || []).length !== 1) {
      this.errores.correo = 'El correo debe contener exactamente un símbolo @';
      return;
    }

    const partes = correoTrim.split('@');
    if (partes[0].startsWith('.') || partes[0].endsWith('.')) {
      this.errores.correo = 'El correo no puede empezar o terminar con punto';
      return;
    }

    if (/\.{2,}/.test(correoTrim)) {
      this.errores.correo = 'El correo no puede tener puntos consecutivos';
      return;
    }

    this.errores.correo = '';
  }

  validarPassword(): void {
    if (!this.camposTocados.password || this.modoEdicion) return;

    const password = this.cliente.password || '';

    if (!password || password.trim() === '') {
      this.errores.password = 'La contraseña es obligatoria';
      return;
    }

    if (password.length < 6) {
      this.errores.password = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (password.length > 50) {
      this.errores.password = 'La contraseña no puede tener más de 50 caracteres';
      return;
    }

    if (!/[a-zA-Z]/.test(password)) {
      this.errores.password = 'La contraseña debe contener al menos una letra';
      return;
    }

    if (!/\d/.test(password)) {
      this.errores.password = 'La contraseña debe contener al menos un número';
      return;
    }

    if (/\s/.test(password)) {
      this.errores.password = 'La contraseña no puede contener espacios';
      return;
    }

    const passwordsComunes = ['123456', 'password', '123456789', 'qwerty', 'abc123', '111111', '000000'];
    if (passwordsComunes.includes(password.toLowerCase())) {
      this.errores.password = 'La contraseña es demasiado común. Usa una más segura';
      return;
    }

    this.errores.password = '';
  }

  validarFormularioCompleto(): boolean {
    this.camposTocados = {
      ci: true,
      nombre: true,
      apellido: true,
      telefono: true,
      correo: true,
      password: !this.modoEdicion
    };

    this.validarCI();
    this.validarNombre();
    this.validarApellido();
    this.validarTelefono();
    this.validarCorreo();
    if (!this.modoEdicion) {
      this.validarPassword();
    }

    return !this.errores.ci && 
           !this.errores.nombre && 
           !this.errores.apellido && 
           !this.errores.telefono && 
           !this.errores.correo && 
           (this.modoEdicion || !this.errores.password);
  }

  sanitizarDatos(): void {
    this.cliente.nombre = this.cliente.nombre.trim();
    this.cliente.apellido = this.cliente.apellido.trim();
    this.cliente.correo = this.cliente.correo.trim().toLowerCase();
    
    this.cliente.nombre = this.capitalizarPalabras(this.cliente.nombre);
    this.cliente.apellido = this.capitalizarPalabras(this.cliente.apellido);
  }

  capitalizarPalabras(texto: string): string {
    return texto
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  async guardarCliente(): Promise<void> {
  if (!this.validarFormularioCompleto()) {
    this.mostrarNotificacion(2, 'Por favor completa todos los campos correctamente');
    return;
  }

  this.sanitizarDatos();
  this.guardando = true;

  const formData = new FormData();
  formData.append('ci', this.cliente.ci.toString());
  formData.append('nombre', this.cliente.nombre);
  formData.append('apellido', this.cliente.apellido);
  formData.append('telefono', this.cliente.telefono.toString());
  formData.append('correo', this.cliente.correo);
  
  if (!this.modoEdicion) {
    if (!this.cliente.password || this.cliente.password.trim() === '') {
      this.guardando = false;
      this.mostrarNotificacion(3, 'La contraseña es obligatoria');
      return;
    }
    formData.append('password', this.cliente.password);
  }
  
  if (this.modoEdicion) {
    formData.append('estado', this.cliente.estado.toString());
  }

  const url = this.modoEdicion 
    ? `${this.apiUrl}/${this.ciOriginal}`
    : this.apiUrl;
  
  const method = this.modoEdicion ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      body: formData
    });
    
    const responseText = await response.text();
    
    let res: any;
    try {
      res = JSON.parse(responseText);
    } catch (parseError) {
      res = { raw: responseText };
    }

    // Extraer mensaje de error o éxito desde TODAS las ubicaciones posibles
    let mensaje = '';
    
    // Buscar en múltiples ubicaciones (prioridad de más específico a más general)
    if (res?.msg) {
      mensaje = res.msg;
    } else if (res?.data?.msg) {
      mensaje = res.data.msg;
    } else if (res?.message) {
      mensaje = res.message;
    } else if (res?.error) {
      mensaje = res.error;
    } else if (res?.data?.message) {
      mensaje = res.data.message;
    } else if (res?.data?.error) {
      mensaje = res.data.error;
    }

    if (!response.ok) {
      this.guardando = false;
      
      // Si no se encontró mensaje, usar uno genérico según el status
      if (!mensaje) {
        if (response.status === 400) {
          mensaje = 'Error en los datos enviados';
        } else if (response.status === 409) {
          mensaje = 'El registro ya existe en el sistema';
        } else if (response.status === 500) {
          mensaje = 'Error interno del servidor';
        } else {
          mensaje = `Error: ${response.status}`;
        }
      }
      
      // MOSTRAR LA NOTIFICACIÓN DE ERROR
      this.mostrarNotificacion(3, mensaje);
      this.cdr.detectChanges();
      return;
    }

    this.guardando = false;
    
    // Mensaje de éxito
    const mensajeExito = mensaje || (this.modoEdicion 
      ? 'Cliente actualizado exitosamente' 
      : 'Cliente creado exitosamente');
    
    this.mostrarNotificacion(1, mensajeExito);
    
    setTimeout(() => {
      this.router.navigate(['/clientes']);
    }, 1500);

  } catch (error: any) {
    this.guardando = false;
    
    let mensajeError = 'Error al conectar con el servidor';
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      mensajeError = 'Error de conexión. Verifica tu internet o si el servidor está corriendo';
    } else if (error.message) {
      mensajeError = error.message;
    }
    
    this.mostrarNotificacion(3, mensajeError);
    this.cdr.detectChanges();
  }
}

  volver(): void {
    this.router.navigate(['/clientes']);
  }

  mostrarNotificacion(tipo: 1 | 2 | 3, mensaje: string): void {
    this.tipoNotif = tipo;
    this.mensajeNotif = mensaje;
    this.mostrarNotif = true;
    
    setTimeout(() => {
      this.mostrarNotif = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}