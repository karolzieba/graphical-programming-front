import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ActivityComponent } from './activity/activity.component';
import { ClassDiagramComponent } from './class-diagram/class-diagram.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ActivityComponent, MatButtonToggleModule, ClassDiagramComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
