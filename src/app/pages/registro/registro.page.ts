import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Asegúrate de tener la ruta correcta
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; // Importa AlertController

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private alertController: AlertController) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '', 
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/) // Al menos 1 mayúscula, 1 número y 1 carácter especial
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        this.showAlert('Error', 'Las contraseñas no coinciden.'); // Alerta si las contraseñas no coinciden
        return;
      }

      this.authService.register(this.registerForm.value).subscribe(
        response => {
          console.log('Registro exitoso', response);
          this.router.navigate(['/login']); // Navegar a la página de login
        },
        error => {
          console.error('Error en el registro', error);
          this.handleRegisterError(error); // Manejar el error de registro
        }
      );
    } else {
      this.checkFormValidity(); // Llamar a la función para comprobar la validez del formulario
    }
  }

  checkFormValidity() {
    if (this.registerForm.get('name')?.hasError('required')) {
      this.showAlert('Error', 'Rellena este campo: Nombre.');
    } else if (this.registerForm.get('email')?.hasError('required')) {
      this.showAlert('Error', 'Rellena este campo: Correo.');
    } else if (this.registerForm.get('email')?.hasError('email')) {
      this.showAlert('Error', 'Formato de correo inválido.');
    } else if (this.registerForm.get('password')?.hasError('required')) {
      this.showAlert('Error', 'Rellena este campo: Contraseña.');
    } else if (this.registerForm.get('password')?.hasError('minlength')) {
      this.showAlert('Error', 'La contraseña debe tener al menos 8 caracteres.');
    } else if (this.registerForm.get('password')?.hasError('pattern')) {
      this.showAlert('Error', 'La contraseña debe tener al menos 1 mayúscula, 1 número y 1 carácter especial.');
    } else if (this.registerForm.get('confirmPassword')?.hasError('required')) {
      this.showAlert('Error', 'Rellena este campo: Confirmar Contraseña.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  handleRegisterError(error: any) {
    switch (error.status) {
      case 409:
        this.showAlert('Error', 'El correo ya está registrado.'); // Alerta si el correo ya está registrado
        break;
      default:
        this.showAlert('Error', 'No se pudo completar el registro.'); // Alerta en caso de error en el registro
        break;
    }
  }
}
