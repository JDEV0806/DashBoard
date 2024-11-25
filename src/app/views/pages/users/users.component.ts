import { Component, OnInit } from '@angular/core';
import { ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormLabelDirective, ColComponent, RowComponent, CardComponent, CardBodyComponent, ContainerComponent, ButtonCloseDirective, ModalTitleDirective, ThemeDirective } from '@coreui/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { ChartData } from 'chart.js';
import axios from 'axios';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormLabelDirective, ColComponent, RowComponent, CardComponent, CardBodyComponent, ContainerComponent, ButtonCloseDirective, ModalTitleDirective, ThemeDirective, ReactiveFormsModule, ChartjsComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public addClientModalVisible = false;
  public addPaymentModalVisible = false;
  public clientForm: FormGroup;
  public clients: any[] = [];
  public selectedClient: any = null;
  public orders: any[] = [];
  public paymentForm: FormGroup;
  public payments: any[] = [];
  public remainingAmount: number = 0;

  public barChartData: ChartData = {
    labels: [],
    datasets: []
  };

  public pieChartData: ChartData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: []
      }
    ]
  };

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

    this.paymentForm = this.fb.group({
      monto_pagado: ['', [Validators.required, Validators.min(0)]],
      metodo_pago: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getClients();
    this.getBarChartData();
    this.getPieChartData();
  }

  async getClients() {
    try {
      const response = await axios.get('http://localhost:5000/clientes');
      this.clients = response.data;
      await this.getOrdersForClients();
    } catch (error: any) {
      console.error('Error al obtener los clientes:', error.response ? error.response.data : error.message);
    }
  }

  async getOrdersForClients() {
    try {
      const response = await axios.get('http://localhost:5000/pedidos');
      const orders = response.data;
      this.clients = this.clients.map((client: any) => {
        const clientOrders = orders.filter((order: any) => order.cliente_id === client.cliente_id);
        return { ...client, estado: clientOrders.length > 0 ? clientOrders[0].estado : 'No Pagado' };
      });
    } catch (error: any) {
      console.error('Error al obtener los pedidos:', error.response ? error.response.data : error.message);
    }
  }

  async getBarChartData() {
    try {
      const response = await axios.get('http://localhost:5000/pedidos');
      const orders = response.data;

      const labels = [...new Set(orders.map((order: any) => new Date(order.fecha_pedido).toLocaleDateString()))];
      const datasets = this.clients.map((client: any) => {
        const clientOrders = orders.filter((order: any) => order.cliente_id === client.cliente_id);
        const data = labels.map(label => {
          const ordersForDate = clientOrders.filter((order: any) => new Date(order.fecha_pedido).toLocaleDateString() === label);
          return ordersForDate.reduce((sum: number, order: any) => sum + order.subtotal, 0);
        });
        return {
          label: client.filtro_nombre,
          backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          data
        };
      });

      this.barChartData = {
        labels,
        datasets
      };
    } catch (error: any) {
      console.error('Error al obtener los datos de los pedidos:', error.response ? error.response.data : error.message);
    }
  }

  async getPieChartData() {
    try {
      const response = await axios.get('http://localhost:5000/pedidos');
      const orders = response.data;

      const labels = orders.map((order: any) => order.filtro_nombre);
      const data = orders.map((order: any) => order.subtotal);
      const backgroundColor = orders.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`);

      this.pieChartData = {
        labels,
        datasets: [
          {
            data,
            backgroundColor
          }
        ]
      };
    } catch (error: any) {
      console.error('Error al obtener los datos de los pedidos para el gráfico de pie:', error.response ? error.response.data : error.message);
    }
  }

  async getOrders(clientId: number) {
    try {
      const response = await axios.get('http://localhost:5000/pedidos');
      this.orders = response.data.filter((order: any) => order.cliente_id === clientId);
      this.selectedClient = this.clients.find(client => client.cliente_id === clientId);
      this.getPayments(this.orders[0].pedido_id);
      this.toggleAddPaymentModal();
    } catch (error: any) {
      console.error('Error al obtener los pedidos:', error.response ? error.response.data : error.message);
    }
  }

  async getPayments(pedidoId: number) {
    try {
      const response = await axios.get('http://localhost:5000/pagos');
      this.payments = response.data.filter((payment: any) => payment.pedido_id === pedidoId);
      this.calculateRemainingAmount();
    } catch (error: any) {
      console.error('Error al obtener los pagos:', error.response ? error.response.data : error.message);
    }
  }

  calculateRemainingAmount() {
    const totalPaid = this.payments.reduce((sum, payment) => sum + payment.monto_pagado, 0);
    const totalAmount = this.orders[0].subtotal;
    this.remainingAmount = totalAmount - totalPaid;
  }

  async addPayment() {
    if (this.paymentForm.valid) {
      const paymentData = { ...this.paymentForm.value, pedido_id: this.orders[0].pedido_id };
      try {
        console.log('Enviando datos del pago:', paymentData);
        const response = await axios.post('http://localhost:5000/agrPago', paymentData);
        console.log('Respuesta del servidor:', response.data);
        alert('Pago guardado exitosamente');
        this.getPayments(this.orders[0].pedido_id);
      } catch (error: any) {
        console.error('Error al guardar el pago:', error.response ? error.response.data : error.message);
        alert('Error al guardar el pago: ' + (error.response ? error.response.data.error : error.message));
      }
    }
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

  async onSubmit() {
    if (this.clientForm.valid) {
      const clientData = { ...this.clientForm.value, cantidad: 1 };
      try {
        console.log('Enviando datos del cliente:', clientData);
        const response = await axios.post('http://localhost:5000/agrCliente', clientData);
        console.log('Respuesta del servidor:', response.data);
        alert('Cliente guardado exitosamente');
        this.toggleAddClientModal();
        this.getClients();
      } catch (error: any) {
        console.error('Error al guardar el cliente:', error.response ? error.response.data : error.message);
        alert('Error al guardar el cliente: ' + (error.response ? error.response.data.error : error.message));
      }
    }
  }
}
