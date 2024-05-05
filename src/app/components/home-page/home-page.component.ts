import { CUSTOM_ELEMENTS_SCHEMA, Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { SharedService } from '../../services/shared/shared.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { LoginComponent } from '../client-area/login/login.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterComponent } from '../client-area/register/register.component';
import { NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { NzSliderModule } from 'ng-zorro-antd/slider';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    NzLayoutModule,
    NzMenuModule,
    NzModalModule,
    NgIf,
    HttpClientModule,
    NzMessageModule,
    DashboardComponent,
    NzSliderModule
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
  providers:[NzModalService]
})
export class HomePageComponent {
  constructor(
    private service: SharedService,
    private nzmodal: NzModalService,
    private http: HttpClient,
    private message: NzMessageService,
    private router:Router
  ) {}
  isRegister = false;
  isActiveModal: string = '';
  openDialog(title: string) {
    this.isActiveModal = title;
    if (title == 'login') {
      const modalRef = this.nzmodal.create({
        nzTitle: 'Login Form',
        nzContent: LoginComponent,
        nzFooter: [
          {
            label: 'Submit',
            type: 'primary',
            onClick: (componentInstance: any) => {
              if (componentInstance.loginForm.valid) {
                this.http
                  .get('http://localhost:3000/users')
                  .subscribe((res: any) => {
                    if (!res) {
                      return;
                    }
                    let isMatched = res.find((loginAccount: any) => {
                      if (
                        loginAccount.username ===
                          componentInstance.loginForm.value.username &&
                        loginAccount.password ===
                          componentInstance.loginForm.value.password
                      ) {
                        modalRef.close();
                        this.message.success(
                          `${loginAccount.username} is logged in`
                        );
                        this.isRegister = true
                        this.service.logInUserData.next(loginAccount);
                        return true;
                      }
                      return;
                    });
                    if (!isMatched) {
                      this.message.error('Username/Password Not Exists');
                    }
                  });
              } else {
                componentInstance.loginForm.markAllAsTouched();
              }
            },
          },
        ],
      });
    }
    if (title == 'register') {
      const modalRef = this.nzmodal.create({
        nzTitle: 'Register Form',
        nzContent: RegisterComponent,
        nzFooter: [
          {
            label: 'Submit',
            type: 'primary',
            onClick: (componentInstance: any) => {
              if (componentInstance.registerForm.valid) {
                this.http
                  .post(
                    'http://localhost:3000/users',
                    componentInstance.registerForm.value
                  )
                  .subscribe((res: any) => {
                    if (!res) {
                      return;
                    }
                    this.message.success('Registration Success');
                    this.isRegister = true;
                  });
                modalRef.close();
              } else {
                componentInstance.registerForm.markAllAsTouched();
              }
            },
          },
        ],
      });
    }
  }
  logout() {
    this.isRegister = false;
    this.service.logInUserData.next([]);
  }
}
