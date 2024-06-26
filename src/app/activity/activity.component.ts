import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import axios from 'axios';

declare var mermaid: any;

/**
 * Komponent odpowiadajacy za widok dotyczacy generowania diagramu aktywnosci.
 */
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
  numberOfConditions: number = 1;
  elements: { id: number, type: string, label: string, visible: boolean }[] = [];
  connections: { id: number, src: number, trg: number }[] = [];
  actionFormText: string = "";
  connectionCommentFormText: string = "";
  displayConnectionDialog: boolean = false;
  displayConnectionCommentDialog: boolean = false;
  displayActionDialog: boolean = false;
  displayElementsDialog: boolean = false;
  displayConnectionsDialog: boolean = false;
  connectionRemoveOnClick: boolean = false;
  connectionCommentTarget: number = -1;
  code: string = "";

  /***
   * Inicjalizacja biblioteki mermaid.
   */
  ngAfterViewInit(): void {
    mermaid.initialize({
      theme: "neutral"
    })
    mermaid.init();
  }

  /***
   * Metoda uzywana przy wyswietleniu odpowiedniej ikony.
   */
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

  /***
   * Glowna metoda odpowiedzialna za przetworzenie danych w taki sposob, aby mogly zostac przedstawione w formie diagramu aktywnosci.
   */
  generateDiagramCode(): string {
    let code = "stateDiagram-v2";
    if (this.connections.length != 0) {
      this.elements.forEach(element => {
        if (element.label.includes("<<choice>>")) code += " " + element.label + "\n";
      })
      this.connections.forEach(connection => {
        let src = this.elements[connection.src];
        let trg = this.elements[connection.trg];
        if (src.visible && trg.visible) {
          let labelParts = src.label.split(" : ");
          if (labelParts.length == 2) {
            code += " " + labelParts[0] + "-->" + trg.label + "\n";
          } else {
            code += " " + src.label + "-->" + trg.label + "\n";
          }
        }
      });
    } else {
      this.elements.forEach(element => {
        code += " " + element.label + "\n";
      });
    }
    console.log(code);
    return code;
  }

  /***
   * Metoda odpowiedzialna za odswiezenie diagramu.
   */
  async refreshDiagramView() {
    let diagramCode = this.generateDiagramCode();
    const diagramView = await mermaid.render("mermaidid", diagramCode);
    let diagramDiv = <HTMLElement>document.getElementById("diagram");
    diagramDiv.innerHTML = diagramView.svg;
  }

  /***
   * Metoda odpowiedzialna za decyzje, czy wyswietlic menu polaczen.
   */
  showConnectionDialog() {
    if (this.elements.length != 0) {
      this.displayConnectionDialog = !this.displayConnectionDialog;
    }
  }

  /***
   * Metoda odpowiedzialna za decyzje, czy wyswietlic menu akcji.
   */
  showActionDialog() {
    this.displayActionDialog = !this.displayActionDialog;
  }

  /***
   * Metoda odpowiedzialna za decyzje, czy wyswietlic menu listy elementow.
   */
  showElementsDialog() {
    if (this.elements.length != 0) {
      this.displayElementsDialog = !this.displayElementsDialog;
    }
  }

  /***
   * Metoda odpowiedzialna za decyzje, czy wyswietlic menu listy polaczen.
   */
  showConnectionsDialog(removeOnClick: boolean) {
    this.connectionRemoveOnClick = removeOnClick;
    if (this.connections.length != 0) {
      this.displayConnectionsDialog = !this.displayConnectionsDialog;
    }
    if (this.displayConnectionCommentDialog) this.displayConnectionCommentDialog = !this.displayConnectionCommentDialog;
  }

  /***
   * Metoda odpowiedzialna za dodanie elementu poczatkowego.
   */
  appendFirstElement() {
    if (this.elements.some(element => element.type === "first")) return;
    this.elements.push({ id: this.idElement, type: "first", label: "[*]", visible: true });
    this.idElement++;
    this.refreshDiagramView();
  }

  /***
   * Metoda odpowiedzialna za dodanie elementu akcji.
   */
  appendActionElement(formText: string) {
    this.elements.push({ id: this.idElement, type: "action", label: formText, visible: true });
    this.idElement++;
    this.refreshDiagramView();
    this.actionFormText = "";
  }

  /***
   * Metoda odpowiedzialna za dodanie elementu warunkowego.
   */
  appendConditionElement() {
    let conditionName: string = "if_state";
    if (this.numberOfConditions !== 0) {
      conditionName += this.numberOfConditions;
    }
    this.numberOfConditions++;
    this.elements.push({ id: this.idElement, type: "condition", label: "state " + conditionName + " <<choice>>", visible: false });
    this.idElement++;
    this.elements.push({ id: this.idElement, type: "condition", label: conditionName, visible: true });
    this.idElement++;
    this.refreshDiagramView();
  }

  /***
   * Metoda odpowiedzialna za dodanie elementu koncowego.
   */
  appendLastElement() {
    if (this.elements.some(element => element.type === "last")) return;
    this.elements.push({ id: this.idElement, type: "last", label: "[*]", visible: true });
    this.idElement++;
    this.refreshDiagramView();
  }

  /***
   * Metoda odpowiedzialna za dodanie polaczenia miedzy elementami.
   */
  appendConnection(selectedElements: any) {
    this.connections.push({ id: this.idConnection, src: selectedElements[0].value, trg: selectedElements[1].value });
    this.idConnection++;
    this.refreshDiagramView();
  }

  /***
   * Metoda odpowiedzialna za dodanie komentarza na polaczeniu miedzy elementami.
   */
  appendConnectionCommentElement(connection: any) {
    if (typeof connection === "string") {
      this.elements[this.connectionCommentTarget].label += " : " + connection;
      this.refreshDiagramView();
      this.connectionCommentFormText = "";
      this.connectionCommentTarget = -1;
    } else {
      this.displayConnectionCommentDialog = true;
      this.connectionCommentTarget = connection.trg;
    }
  }

  /***
   * Metoda odpowiedzialna za wyczyszczenie diagramu.
   */
  clearElements() {
    this.elements = [];
    this.connections = [];
    this.displayConnectionDialog = false;
    window.location.reload();
  }

  /***
   * Metoda odpowiedzialna za usuniecie elementu diagramu.
   */
  removeElement(element: any) {
    this.connections = this.connections.filter(connection => connection.src === element.id || connection.trg === element.id);
    this.elements = this.elements.filter(elementFromArray => elementFromArray.id != element.id);
    this.displayConnectionDialog = false;
    this.refreshDiagramView();
  }

  /***
   * Metoda odpowiedzialna za usuniecie polaczenia miedzy elementami diagramu.
   */
  removeConnection(connection: any) {
    this.elements[connection.trg].label = this.elements[connection.trg].label.split(" : ")[0];
    this.connections = this.connections.filter(connectionFromArray => connectionFromArray.id !== connection.id);
    this.refreshDiagramView();
  }

  /***
   * Metoda odpowiedzialna za wyslanie diagramu do serwera, gdzie zostanie wygenerowany kod.
   */
  sendElements() {
    if (this.elements.some(element => element.type === "first") && this.elements.some(element => element.type === "last")) {
        axios.post('/api/activity', {
          elements: this.elements,
          connections: this.connections
        })
        .then(response => {
          this.code = response.data;
        })
        .catch(error => {
          alert("Błąd podczas generowania kodu.");
        });
    } else {
      alert("Brak początkowego lub końcowego elementu.");
    }
  }
}
