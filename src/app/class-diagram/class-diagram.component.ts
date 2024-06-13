import { Component, AfterViewInit } from '@angular/core';
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
  selector: 'app-class-diagram',
  standalone: true,
  imports: [
    MatGridListModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatListModule,
    CommonModule, FormsModule
  ],
  templateUrl: './class-diagram.component.html',
  styleUrls: ['./class-diagram.component.css']
})
export class ClassDiagramComponent implements AfterViewInit {
  classes: { id: number, name: string, fields: string[], methods: string[] }[] = [];
  relationships: { id: number, from: number, to: number, type: string }[] = [];
  idClass: number = 0;
  idRelationship: number = 0;
  className: string = '';
  fieldText: string = '';
  methodText: string = '';
  relationshipType: string = '';
  relationshipSource: number | null = null;
  relationshipTarget: number | null = null;

  ngAfterViewInit(): void {
    mermaid.initialize({ theme: 'neutral' });
    this.renderDiagram();
  }

  addClass() {
    if (this.className.trim()) {
      this.classes.push({ id: this.idClass++, name: this.className.trim(), fields: [], methods: [] });
      this.className = '';
      this.renderDiagram();
    }
  }

  addField(classId: number) {
    const field = prompt('Enter field (e.g., int age):');
    if (field) {
      const cls = this.classes.find(c => c.id === classId);
      if (cls) {
        cls.fields.push(field.trim());
        this.renderDiagram();
      }
    }
  }

  addMethod(classId: number) {
    const method = prompt('Enter method (e.g., void setName(String name)):');
    if (method) {
      const cls = this.classes.find(c => c.id === classId);
      if (cls) {
        cls.methods.push(method.trim());
        this.renderDiagram();
      }
    }
  }

  addRelationship() {
    if (this.relationshipSource !== null && this.relationshipTarget !== null && this.relationshipType.trim()) {
      this.relationships.push({
        id: this.idRelationship++,
        from: this.relationshipSource,
        to: this.relationshipTarget,
        type: this.relationshipType.trim()
      });
      this.relationshipSource = null;
      this.relationshipTarget = null;
      this.relationshipType = '';
      this.renderDiagram();
    }
  }

  removeClass(classId: number) {
    this.classes = this.classes.filter(cls => cls.id !== classId);
    this.relationships = this.relationships.filter(rel => rel.from !== classId && rel.to !== classId);
    this.renderDiagram();
  }

  removeRelationship(relationshipId: number) {
    this.relationships = this.relationships.filter(rel => rel.id !== relationshipId);
    this.renderDiagram();
  }

  renderDiagram() {
    let diagramCode = 'classDiagram\n';
    this.classes.forEach(cls => {
      diagramCode += `class ${cls.name} {\n`;
      cls.fields.forEach(field => {
        diagramCode += `  ${field}\n`;
      });
      cls.methods.forEach(method => {
        diagramCode += `  ${method}\n`;
      });
      diagramCode += '}\n';
    });

    this.relationships.forEach(rel => {
      const fromClass = this.classes.find(c => c.id === rel.from);
      const toClass = this.classes.find(c => c.id === rel.to);
      if (fromClass && toClass) {
        diagramCode += `${fromClass.name} ${this.getRelationshipSymbol(rel.type)} ${toClass.name}\n`;
      }
    });

    const diagramDiv = document.getElementById('class-diagram');
    if (diagramDiv) {
      mermaid.render('mermaid-class-diagram', diagramCode, (svgCode: string) => {
        diagramDiv.innerHTML = svgCode;
      });
    }
  }

  getRelationshipSymbol(type: string): string {
    switch (type.toLowerCase()) {
      case 'inheritance': return '--|>';
      case 'composition': return '*--';
      case 'aggregation': return 'o--';
      default: return '--';
    }
  }
}
