import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TagsAttributesComponent } from "./components/tags/tags.component";
import { AttributeComponent } from "./components/attribute/attribute.component";

@Component({
  selector: 'app-tags-attribute',
  imports: [TagsAttributesComponent, AttributeComponent],
  templateUrl: './tags-attribute.component.html',
  styleUrl: './tags-attribute.component.css'
})
export class TagsAttributeComponent {

}
