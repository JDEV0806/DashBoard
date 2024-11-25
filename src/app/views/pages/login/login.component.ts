import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { Router } from '@angular/router';
import axios from 'axios';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, FormsModule, RouterModule]
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) { }

  onSubmit(event: Event) {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log('Form submitted:', this.username, this.password);
    const loginData = {
      username: this.username,
      password: this.password
    };

    console.log('Login data:', loginData);

    axios.post('http://localhost:5000/login', loginData)
      .then(response => {
        console.log('Response:', response);
        alert('Login exitoso');
        this.router.navigate(['/users']);
      })
      .catch(error => {
        console.error('Error:', error);
        console.error('Error response data:', error.response?.data);
        alert('Error en el login');
      });
  }
}
