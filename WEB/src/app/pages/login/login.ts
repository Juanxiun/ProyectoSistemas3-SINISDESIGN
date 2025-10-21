import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginCli } from '../../components/login-cli/login-cli';
import { LoginArq } from '../../components/login-arq/login-arq';
import { RecuperarPass } from '../../components/recuperar-pass/recuperar-pass';
import { NuevoPass } from '../../components/nuevo-pass/nuevo-pass';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoginCli, LoginArq, RecuperarPass, NuevoPass],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // Controla qué componente se muestra
  currentView: 'cli' | 'arq' | 'recuperar' | 'nuevo' = 'cli';

  // Métodos para cambiar de vista
  showCliente() { this.currentView = 'cli'; }
  showArquitecto() { this.currentView = 'arq'; }
  showRecuperar() { this.currentView = 'recuperar'; }
  showNuevoPass() { this.currentView = 'nuevo'; }

    onNavigate(view: 'cli' | 'arq' | 'recuperar' | 'nuevo') {
    this.currentView = view;
  }
}
