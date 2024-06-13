import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ActivityComponent } from './activity/activity.component';
import { SequenceDiagramComponent } from './sequence-diagram/sequence-diagram.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassDiagramComponent } from './class-diagram/class-diagram.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    ActivityComponent, 
    MatButtonToggleModule, 
    SequenceDiagramComponent, 
    ClassDiagramComponent,
    CommonModule, 
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  selectedDiagram: string = 'sequence';
}
