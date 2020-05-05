import { Component } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.template.html'
})
export class DashboardComponent {

  constructor(private message: MessageService) {

  }
}
