import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

declare var mermaid: any;

@Component({
  selector: 'app-sequence-diagram',
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatButtonModule, MatIconModule],
  templateUrl: './sequence-diagram.component.html',
  styleUrls: ['./sequence-diagram.component.css']
})
export class SequenceDiagramComponent implements AfterViewInit {
  lifelines: string[] = [];
  messages: { from: string, to: string, label: string }[] = [];

  ngAfterViewInit(): void {
    mermaid.initialize({ theme: 'neutral' });
    this.renderDiagram();
  }

  addLifeline() {
    const lifelineName = prompt('Enter lifeline name:');
    if (lifelineName) {
      this.lifelines.push(lifelineName);
      this.renderDiagram();
    }
  }

  addMessage() {
    if (this.lifelines.length < 2) {
      alert('Add at least two lifelines before adding a message.');
      return;
    }
    const from = prompt('Message from:');
    const to = prompt('Message to:');
    const label = prompt('Message label:');
    if (from && to && label) {
      this.messages.push({ from, to, label });
      this.renderDiagram();
    }
  }

  clearDiagram() {
    this.lifelines = [];
    this.messages = [];
    this.renderDiagram();
  }

  renderDiagram() {
    let diagramCode = 'sequenceDiagram\n';
    this.lifelines.forEach(lifeline => {
      diagramCode += `participant ${lifeline}\n`;
    });
    this.messages.forEach(message => {
      diagramCode += `${message.from}->>${message.to}: ${message.label}\n`;
    });

    const diagramDiv = document.getElementById('sequence-diagram');
    // if (diagramDiv) {
    //   mermaid.render('mermaid-sequence-diagram', diagramCode, (svgCode) => {
    //     diagramDiv.innerHTML = svgCode;
    //   });
    // }
  }
}
