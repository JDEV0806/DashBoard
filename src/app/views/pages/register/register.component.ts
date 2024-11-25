import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { Router } from '@angular/router';
import axios from 'axios';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: true,
    imports: [ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, FormsModule]
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  repeatPassword: string = '';

  constructor(private router: Router) { }

  onSubmit(event: Event) {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log('Form submitted:', this);
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    console.log('User data:', userData);

    axios.post('http://localhost:5000/agrUsuario', userData)
      .then(response => {
        console.log('Response:', response);
        alert('Registro exitoso');
        this.router.navigate(['/login']);
      })
      .catch(error => {
        console.error('Error:', error);
        console.error('Error response data:', error.response.data);
        alert('Error en el registro');
      });
  }
}
