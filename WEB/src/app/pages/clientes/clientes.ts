import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CookieService } from "ngx-cookie-service";
import { NotificacionComponent } from "../../components/notificacion/notificacion";
import { ConnectA } from "../../../config/index";

interface Cliente {
  ci: number;
  nombre: string;
  apellido: string;
  telefono: number;
  correo: string;
  estado: number;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    Siderbar,
    NotificacionComponent,
  ],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css'] 
})
export class Clientes implements OnInit {
  private apiUrl = ConnectA.api + '/clientes';

  userData: any = { id: '', admin: 0 };
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  loading: boolean = true;
  
  searchTerm: string = '';
  searchActive: boolean = false;
  campoBusqueda: 'todos' | 'ci' | 'nombre' | 'telefono' | 'correo' = 'todos';
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';
  
  mostrarNotif: boolean = false;
  tipoNotif: 1 | 2 | 3 = 1;
  mensajeNotif: string = "";

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.cookieService.check("sesion")) {
      const cookieValue = this.cookieService.get("sesion");
      this.userData = JSON.parse(cookieValue);
      this.cargarClientes();
    } else {
      this.router.navigate(["/"]);
    }
  }

  cargarClientes(): void {
    this.loading = true;
    
    fetch(this.apiUrl)
      .then(response => response.json())
      .then(res => {
        let clientesData: Cliente[] = [];
        
        if (Array.isArray(res.data)) {
          clientesData = res.data;
        } else if (res.data && typeof res.data === 'object') {
          if (Array.isArray(res.data.clientes)) {
            clientesData = res.data.clientes;
          } else if (Array.isArray(res.data.data)) {
            clientesData = res.data.data;
          } else {
            const firstArrayKey = Object.keys(res.data).find(key => Array.isArray(res.data[key]));
            if (firstArrayKey) {
              clientesData = res.data[firstArrayKey];
            }
          }
        }
        
        this.clientes = clientesData;
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      })
      .catch(error => {
        this.loading = false;
        this.clientes = [];
        this.clientesFiltrados = [];
        this.mostrarNotificacion(3, 'Error al cargar los clientes');
        this.cdr.detectChanges();
      });
  }

  aplicarFiltros(): void {
    let resultado = [...this.clientes];

    if (this.filtroEstado !== 'todos') {
      const estadoBuscado = this.filtroEstado === 'activos' ? 1 : 0;
      
      resultado = resultado.filter(cliente => {
        const estadoCliente = Number(cliente.estado);
        return estadoCliente === estadoBuscado;
      });
    }

    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase().trim();
      resultado = resultado.filter(cliente => {
        switch(this.campoBusqueda) {
          case 'ci':
            return cliente.ci.toString().includes(termino);
          
          case 'nombre':
            const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
            return nombreCompleto.includes(termino);
          
          case 'telefono':
            return cliente.telefono.toString().includes(termino);
          
          case 'correo':
            return cliente.correo.toLowerCase().includes(termino);
          
          case 'todos':
          default:
            const nombreCompleto2 = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
            return cliente.ci.toString().includes(termino) ||
                   nombreCompleto2.includes(termino) ||
                   cliente.telefono.toString().includes(termino) ||
                   cliente.correo.toLowerCase().includes(termino);
        }
      });
    }

    this.clientesFiltrados = resultado;
    this.searchActive = this.searchTerm.trim() !== '' || this.filtroEstado !== 'todos';
  }

  onSearchChange(): void {
    this.searchTerm = this.limpiarBusqueda(this.searchTerm);
    this.aplicarFiltros();
  }

  limpiarBusqueda(texto: string): string {
    if (this.campoBusqueda === 'ci' || this.campoBusqueda === 'telefono') {
      return texto.replace(/[^0-9]/g, '');
    } else if (this.campoBusqueda === 'correo') {
      return texto.replace(/[^a-zA-Z0-9@._\-]/g, '');
    } else {
      return texto.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ0-9@._\-\s]/g, '');
    }
  }

  onCampoBusquedaChange(): void {
    this.searchTerm = '';
    this.aplicarFiltros();
  }

  onFiltroEstadoChange(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  limpiarBusqueda2(): void {
    this.searchTerm = '';
    this.campoBusqueda = 'todos';
    this.filtroEstado = 'todos';
    this.aplicarFiltros();
  }

  cambiarEstadoCliente(ci: number): void {
    const cliente = this.clientes.find(c => c.ci === ci);
    if (!cliente) {
      this.mostrarNotificacion(3, 'Cliente no encontrado');
      return;
    }
    
    const nuevoEstado = cliente.estado === 1 ? 0 : 1;
    const confirmMessage = nuevoEstado === 1 
      ? '¿Estás seguro de que deseas activar este cliente?'
      : '¿Estás seguro de que deseas desactivar este cliente?';
    
    if (confirm(confirmMessage)) {
      this.loading = true;
      
      fetch(`${this.apiUrl}/${ci}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          telefono: cliente.telefono.toString(),
          correo: cliente.correo,
          estado: nuevoEstado.toString()
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }
        return response.json();
      })
      .then(res => {
        const clienteIndex = this.clientes.findIndex(c => c.ci === ci);
        if (clienteIndex !== -1) {
          this.clientes[clienteIndex].estado = nuevoEstado;
        }
        
        this.aplicarFiltros();
        
        const mensaje = nuevoEstado === 1 
          ? 'Cliente activado correctamente' 
          : 'Cliente desactivado correctamente';
        
        this.mostrarNotificacion(1, mensaje);
        this.loading = false;
      })
      .catch(error => {
        this.mostrarNotificacion(3, 'Error al cambiar el estado del cliente');
        this.loading = false;
      });
    }
  }

  getEstadoTexto(estado: number): string {
    return estado === 1 ? 'Activo' : 'Inactivo';
  }

  getColorEstado(estado: number): string {
    return estado === 1 ? 'estado-activo' : 'estado-inactivo';
  }

  get placeholderBusqueda(): string {
    switch(this.campoBusqueda) {
      case 'ci':
        return 'Buscar por CI...';
      case 'nombre':
        return 'Buscar por nombre...';
      case 'telefono':
        return 'Buscar por teléfono...';
      case 'correo':
        return 'Buscar por correo...';
      default:
        return 'Buscar cliente...';
    }
  }

  get resultadosBusqueda(): string {
    if (!this.searchActive) return '';
    
    const total = this.clientes.length;
    const encontrados = this.clientesFiltrados.length;
    
    if (encontrados === total) {
      return `Mostrando todos los clientes (${total})`;
    } else {
      return `${encontrados} de ${total} clientes`;
    }
  }

  get totalActivos(): number {
    return this.clientes.filter(c => Number(c.estado) === 1).length;
  }

  get totalInactivos(): number {
    return this.clientes.filter(c => Number(c.estado) === 0).length;
  }

  convertirANumero(valor: any): number {
    return Number(valor);
  }

  navegarACrear(): void {
    this.router.navigate(['/crear-clientes']);
  }

  navegarAEditar(ci: number): void {
    this.router.navigate(['/crear-clientes'], { 
      queryParams: { ci: ci }
    });
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