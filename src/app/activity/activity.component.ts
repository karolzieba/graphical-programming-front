import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var mermaid: any;

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [MatGridListModule, MatButtonModule, MatIconModule, 
    MatFormFieldModule, MatInputModule, MatListModule,
    CommonModule, FormsModule ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css'
})
export class ActivityComponent {
  idElement: number = 0;
  idConnection: number = 0;

  elements: { id: number, type: string, label: string, visible: boolean }[] = [];
  connections: { id: number, src: number, trg: number }[] = [];

  actionFormText: string = "";

  displayConnectionDialog: boolean = false;
  displayActionDialog: boolean = false;

  ngAfterViewInit(): void {
    mermaid.initialize({
      theme: 'forest'
    })
    mermaid.init();
  }

  setCssClass(element: { iconType: string }) {
    let cssClass: string = "";
    switch (element.iconType) {
      case "circle":
      case "radio_button_checked":
      case "cancel":
        cssClass = "circle-icon-scale";
        break;
      case "arrow_downward":
        cssClass = "arrow-icon-scale";
        break;
      case "crop_16_9":
        cssClass = "action-icon-scale";
        break;
      case "crop_square":
        cssClass = "condition-icon";
        break;
    }
    return cssClass;
  }

  generateDiagramCode(): string {
    let code = "stateDiagram-v2";
    if (this.connections.length != 0) {
      this.elements.forEach(element => {
        if (element.label.includes("<<choice>>")) code += " " + element.label;
      })
      this.connections.forEach(connection => {
        let src = this.elements[connection.src];
        let trg = this.elements[connection.trg];
        if (src.visible && trg.visible) {
          code += " " + src.label + "-->" + trg.label;
        }
      });
    } else {
      this.elements.forEach(element => {
        code += " " + element.label;
      });
    }
    console.log(code);
    return code;
  }

  async refreshDiagramView() {
    let diagramCode = this.generateDiagramCode();
    const diagramView = await mermaid.render("mermaidid", diagramCode);
    let diagramDiv = <HTMLElement>document.getElementById("diagram");
    diagramDiv.innerHTML = diagramView.svg;
  }

  showConnectionDialog() {
    if (this.elements.length != 0) {
      this.displayConnectionDialog = !this.displayConnectionDialog;
    }
  }

  showActionDialog() {
    this.displayActionDialog = !this.displayActionDialog;
  }

  appendFirstElement() {
    this.elements.push({ id: this.idElement, type: "first", label: "[*]", visible: true });
    this.idElement++;
    this.refreshDiagramView();
  }

  appendActionElement(formText: string) {
    this.elements.push({ id: this.idElement, type: "action", label: formText, visible: true });
    this.idElement++;
    this.refreshDiagramView();
    this.actionFormText = "";
  }

  appendConditionElement() {
    this.elements.push({ id: this.idElement, type: "condition", label: "state if_state <<choice>>", visible: false});
    this.idElement++;
    this.elements.push({ id: this.idElement, type: "condition", label: "if_state", visible: true});
    this.idElement++;
    this.refreshDiagramView();
  }

  appendLastElement() {
    this.elements.push({ id: this.idElement, type: "last", label: "[*]", visible: true });
    this.idElement++;
    this.refreshDiagramView();
  }

  appendConnection(selectedElements: any) {
    this.connections.push({ id: this.idConnection, src: selectedElements[0].value, trg: selectedElements[1].value });
    this.idConnection++;
    this.refreshDiagramView();
  }

  clearElements() {
    this.elements = [];
    this.connections = [];
    this.refreshDiagramView();
  }
}
