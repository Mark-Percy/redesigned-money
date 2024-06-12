import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-bills',
    templateUrl: './bills.component.html',
    styleUrls: ['./bills.component.css'],
    standalone: true
})
export class BillsComponent {
    @Input() panelWidth = '45vw';
}
