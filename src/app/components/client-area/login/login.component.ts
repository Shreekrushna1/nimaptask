import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,NzInputModule,NzButtonModule,NzFormModule,NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  get formControls() {
    return this.loginForm.controls as any;
  }

  onSubmit(){}
}
