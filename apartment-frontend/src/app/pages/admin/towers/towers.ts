import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Towers</h2>

    <form (ngSubmit)="addTower()">
      <input
        [(ngModel)]="newTower"
        name="tower"
        placeholder="Tower name"
        required
      />
      <button type="submit">Add</button>
    </form>

    <ul>
      <li *ngFor="let tower of towers">
        {{ tower.name }}
        <button (click)="deleteTower(tower.id)">Delete</button>
      </li>
    </ul>
  `
})
export class Towers implements OnInit {

  towers: any[] = [];
  newTower = '';

  constructor(private admin: AdminService) {}

  ngOnInit() {
    this.loadTowers();
  }

  loadTowers() {
    this.admin.getTowers().subscribe(data => {
      this.towers = data;
    });
  }

  addTower() {
    if (!this.newTower) return;

    this.admin.addTower(this.newTower).subscribe(() => {
      this.newTower = '';
      this.loadTowers();
    });
  }

  deleteTower(id: number) {
    this.admin.deleteTower(id).subscribe(() => {
      this.loadTowers();
    });
  }
}
