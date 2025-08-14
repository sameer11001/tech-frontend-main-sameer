import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addAttribute } from '../../../../../../../../../../core/services/attributes/ngrx/attributes.actions';

@Component({
  selector: 'app-add-attribute',
  standalone: true,
  imports: [CommonModule,FormsModule ],
  templateUrl: './add-attribute.component.html',
  styleUrl: './add-attribute.component.css'
})
export class AddAttributeComponent {
  constructor(private store : Store) {

  }

  tagName: string = '';

  addAttribute() {
    this.store.dispatch(
      addAttribute({
        name: this.tagName,
      })
    )
  }


}
