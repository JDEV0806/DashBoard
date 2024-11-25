import { Component } from '@angular/core';
import { ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormLabelDirective, ColComponent, RowComponent, CardComponent, CardBodyComponent, ContainerComponent, ButtonCloseDirective, ModalTitleDirective, ThemeDirective } from '@coreui/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormLabelDirective, ColComponent, RowComponent, CardComponent, CardBodyComponent, ContainerComponent, ButtonCloseDirective, ModalTitleDirective, ThemeDirective, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  public addClientModalVisible = false;
  public addPaymentModalVisible = false;
  public clientForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clientForm = this.fb.group({
      nombre: ['', Validators.required],
      email: [''],
      telefono: ['', [Validators.pattern('[0-9]{10}')]],
      direccion: [''],
      filtro_nombre: ['', Validators.required],
      precio_unitario: ['', [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      descripcion_filtro: ['']
    });
  }

  toggleAddClientModal() {
    this.addClientModalVisible = !this.addClientModalVisible;
  }

  handleAddClientModalChange(event: any) {
    this.addClientModalVisible = event;
  }

  toggleAddPaymentModal() {
    this.addPaymentModalVisible = !this.addPaymentModalVisible;
  }

  handleAddPaymentModalChange(event: any) {
    this.addPaymentModalVisible = event;
  }

  onSubmit() {
    if (this.clientForm.valid) {
      console.log(this.clientForm.value);
      this.toggleAddClientModal();
    }
  }
}
