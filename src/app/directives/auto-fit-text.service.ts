import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AutofitService {
  private groups: { [key: string]: BehaviorSubject<number> } = {};

  private ensureGroupExists(groupName: string, initialSize: number = 100) {
    if (!this.groups[groupName]) {
      this.groups[groupName] = new BehaviorSubject<number>(initialSize);
    }
  }

  getGroup(groupName: string, initialSize: number): BehaviorSubject<number> {
    this.ensureGroupExists(groupName, initialSize);
    return this.groups[groupName];
  }

  updateMinSize(groupName: string, newSize: number) {
    this.ensureGroupExists(groupName, newSize);

    const currentMin = this.groups[groupName].value;

    if (newSize < currentMin) {
      this.groups[groupName].next(newSize);
    }
  }

  resetGroups() {
    this.groups = {};
  }

  resetGroup(groupName: string) {
  if (this.groups[groupName]) {
    this.groups[groupName].next(40);
  }
}
}
