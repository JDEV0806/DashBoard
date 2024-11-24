import { Component } from '@angular/core';
import { ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormLabelDirective, ColComponent, RowComponent, CardComponent, CardBodyComponent, ContainerComponent, ButtonCloseDirective, ModalTitleDirective, ThemeDirective } from '@coreui/angular';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormLabelDirective, ColComponent, RowComponent, CardComponent, CardBodyComponent, ContainerComponent, ButtonCloseDirective, ModalTitleDirective, ThemeDirective],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  public addClientModalVisible = false;
  public addPaymentModalVisible = false;

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
}
