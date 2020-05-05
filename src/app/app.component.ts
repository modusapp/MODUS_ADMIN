import { Component } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  constructor(private messageService: MessageService) {
    this.messageService.add({severity:'success', summary:'Service Message', detail:'Via MessageService'});

  }
}
