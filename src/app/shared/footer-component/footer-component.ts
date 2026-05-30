import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-component',
  imports: [],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.scss',
})
export class FooterComponent {
year = new Date().getFullYear();

scrollToTop() {
  window.scrollTo(0, 0);
}

}
