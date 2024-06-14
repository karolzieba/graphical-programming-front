import { Component, AfterViewInit } from '@angular/core';
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


/***
 * Interfejsy ClassElement i Relationship definiują strukturę elementów diagramu klas i relacji między nimi.
 */
interface ClassElement {
  id: number;
  name: string;
  fields: { name: string; type: string }[];
  methods: { name: string; returnType: string }[];
}

interface Relationship {
  id: number;
  from: string;
  to: string;
  type: string;
}

/***
 * Komponent odpowiadajacy za widok dotyczacy generowania diagramu klas.
 */
@Component({
  selector: 'app-class-diagram',
  standalone: true,
  imports: [MatGridListModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatListModule,
    CommonModule, FormsModule],
  templateUrl: './class-diagram.component.html',
  styleUrls: ['./class-diagram.component.css']
})
export class ClassDiagramComponent implements AfterViewInit {
  classId: number = 0;
  relationId: number = 0;
  classes: ClassElement[] = [];
  relationships: Relationship[] = [];
  code: string = "";
  newClassName: string = "";
  displayAddClassDialog: boolean = false;

  /***
   * Inicjalizacja biblioteki mermaid.
   */
  ngAfterViewInit(): void {
    mermaid.initialize({
      theme: "neutral"
    });
    mermaid.init();
  }
  /***
   * Generuje kod Mermaid na podstawie listy klas i relacji.
   */
  generateDiagramCode(): string {
    let code = "classDiagram\n";
    this.classes.forEach(cls => {
      code += `class ${cls.name} {\n`;
      if (cls.fields.length === 0 && cls.methods.length === 0) {
        code += "  dummyField: int\n";
      }
      cls.fields.forEach(field => {
        code += `  ${field.name}: ${field.type}\n`;
      });
      cls.methods.forEach(method => {
        code += `  ${method.name}: ${method.returnType}()\n`;
      });
      code += `}\n`;
    });
    this.relationships.forEach(rel => {
      code += `${rel.from} ${rel.type} ${rel.to}\n`;
    });
    console.log("Generated Mermaid Code:\n", code);
    return code;
  }

  /***
   * Metoda odpowiedzialna za odswiezenie diagramu.
   */
  async refreshDiagramView() {
    let diagramCode = this.generateDiagramCode();
    console.log("Diagram Code:\n", diagramCode);
    try {
      const diagramView = await mermaid.render("mermaidid", diagramCode);
      let diagramDiv = <HTMLElement>document.getElementById("class-diagram");
      diagramDiv.innerHTML = diagramView.svg;
    } catch (error) {
      console.error("Error rendering Mermaid diagram:", error);
    }
  }
  /***
   * Wyświetla dialog do dodania nowej klasy.
   */
  addClass() {
    this.displayAddClassDialog = true;
  }
  /***
   * Dodaje nową klasę na podstawie wprowadzonej nazwy.
   */
  submitNewClass() {
    if (this.newClassName.trim() !== '') {
      const newClass: ClassElement = {
        id: this.classId++,
        name: this.newClassName,
        fields: [],
        methods: []
      };
      this.classes.push(newClass);
      this.refreshDiagramView();
      this.newClassName = '';
      this.displayAddClassDialog = false;
    } else {
      alert('Proszę podać nazwę klasy.');
    }
  }
  /***
   * Dodaje pole do klasy o podanym classId.
   */
  addField(classId: number) {
    const fieldName = prompt('Podaj nazwę pola:');
    const fieldType = prompt('Podaj typ pola:');
    if (fieldName && fieldType) {
      const classElement = this.classes.find(cls => cls.id === classId);
      if (classElement) {
        classElement.fields.push({name: fieldName, type: fieldType});
        this.refreshDiagramView();
      }
    }
  }

  /***
   * Dodaje metodę do klasy o podanym classId.
   */
  addMethod(classId: number) {
    const methodName = prompt('Podaj nazwę metody:');
    const methodType = prompt('Podaj typ metody:');
    if (methodName && methodType) {
      const classElement = this.classes.find(cls => cls.id === classId);
      if (classElement) {
        classElement.methods.push({name:methodName, returnType: methodType});
        this.refreshDiagramView();
      }
    }
  }
 /***
  * Usuwa klasę o podanym classId.
  */
  removeClass(classId: number) {
    this.classes = this.classes.filter(cls => cls.id !== classId);
    if(this.classes.length < 1) {
      window.location.reload();
    }else {
      this.refreshDiagramView();
    }
  } 

  /***
   * Dodaje nową relację między klasami.
   */
  addRelationship() {
    const fromClass = prompt('Enter from class:', '');
    const toClass = prompt('Enter to class:', '');
    const relType = prompt('Enter relationship type (e.g., --, <|--, *--, o--):', '--');
    if (fromClass && toClass && relType) {
      this.relationships.push({
        id: this.relationId++,
        from: fromClass,
        to: toClass,
        type: relType
      });
      this.refreshDiagramView();
    }
  }
  /***
   * Usuwa relację o podanym relationId.
   */
  removeRelationship(relationId: number) {
    this.relationships = this.relationships.filter(rel => rel.id !== relationId);
    this.refreshDiagramView();
  }

  /***
   * Czyści diagram, usuwając wszystkie klasy i relacje.
   */
  clearDiagram() {
    this.classes = [];
    this.relationships = [];
    window.location.reload();
  }
  
  /***
   * Wysyła elementy diagramu do backendu w celu wygenerowania kodu
   */
  sendElements() {
    axios.post('/api/class-diagram', {
      classes: this.classes,
      relationships: this.relationships
    })
      .then(response => {
        this.code = response.data;
      })
      .catch(error => {
        alert("Błąd podczas generowania kodu.");
      });
  }
}
