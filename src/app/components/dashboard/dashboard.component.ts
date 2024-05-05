import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, NO_ERRORS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SharedService } from '../../services/shared/shared.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { RegisterComponent } from '../client-area/register/register.component';
import { NgIf, NgFor } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzUploadChangeParam, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NzCardModule,
    RegisterComponent,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NgIf,
    NzSelectModule,
    NzUploadModule,
    NzIconModule,
    NzTagModule,
    NgFor,
    NzSliderModule,
    NzInputNumberModule,
    HttpClientModule,
    NzMessageModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  schemas: [NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA],
  providers: [NzModalService],
})
export class DashboardComponent implements OnInit {
  constructor(private service: SharedService,private fb:FormBuilder,private http: HttpClient,
    private message: NzMessageService,) {}
  tags:any[]=[]
  @ViewChild('tagInput') tagInputRef!: ElementRef<HTMLInputElement>;
  userDetails: any = {};
  userAge:number = 0;
  isDisabled: boolean = false;
  msg:string = ''
  userDetailsForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    addressType: new FormControl('', [Validators.required]),
    homeAddress1: new FormControl(''),
    homeAddress2: new FormControl(''),
    companyAddress1: new FormControl(''),
    companyAddress2: new FormControl(''),
    age: new FormControl(0, [Validators.required]),
    firstName: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
      Validators.pattern(/^.{1,20}$/),
    ]),
    lastName: new FormControl('', [Validators.required]),
    tags: new FormArray([]),
    profileImg: new FormControl(''),
  });

  get formControls() {
    return this.userDetailsForm.controls as any;
  }

  ngOnInit(): void {
    this.service.logInUserData.subscribe((res: any) => {
      if(res !== false){
        this.userDetails = res;
        this.userDetailsForm.disable();
        this.isDisabled = true;
        this.tags = res.tags;
        this.userDetailsForm.patchValue({
          firstName:this.userDetails.firstName,
          lastName:this.userDetails.lastName,
          password:this.userDetails.password,
          username:this.userDetails.username,
          addressType:this.userDetails.addressType,
          homeAddress1:this.userDetails.homeAddress1,
          age:Number(this.userDetails.age),
          homeAddress2:this.userDetails.homeAddress2,
          companyAddress1:this.userDetails.companyAddress1,
          companyAddress2:this.userDetails.companyAddress2,
          profileImg: this.userDetails.profileImg
        });
        
      }
    });
  }

  addTag(tagValue: string): void {
    if (tagValue.trim() !== '') {
      const newTags = tagValue
        .split(/[ ,]+/)
        .filter(tag => tag.trim() !== '');
      this.tags.push(...newTags);
      this.tagInputRef.nativeElement.value = '';
      (this.userDetailsForm.get('tags') as FormArray).push(this.fb.control(this.tags));
    }
  }

  removeTag(tag: string,index:number): void {
    this.tags = this.tags.filter(t => t !== tag);
    (this.userDetailsForm.get('tags') as FormArray).removeAt(index);
  }

  editDetails(){
    this.userDetailsForm.enable();
    this.isDisabled = false;
  }

  submktDetails(){
    this.userDetailsForm.disable();
    this.isDisabled = true;
    this.http.put(`http://localhost:3000/users/${this.userDetails.id}`,this.userDetailsForm.value).subscribe((res:any) => {
      if(!res){
        return;
      }
      this.userDetails = res;
      this.message.success('User Details Updated');
    })
  }

  handleChange(event: NzUploadChangeParam) {
    const fileList = event.fileList;
    if(event.type == 'removed'){
      this.msg = ''
    }
    if (event.file.status === 'done') {
      fileList.forEach((file: any) => {
        this.processFile(file);
      });
    } else if (event.file.status === 'error') {
      this.msg = `${event.file.name} file upload failed.`;
    }
  }
  
  processFile(file: any) {
    if (!(file.originFileObj instanceof Blob)) {
      console.error('Invalid file type');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const maxWidth = 310;
        const maxHeight = 325;
        const validTypes = ['image/jpeg', 'image/png'];
        if (
          img.width <= maxWidth &&
          img.height <= maxHeight &&
          validTypes.includes(file.originFileObj.type)
        ) {
          this.userDetailsForm.patchValue({
            profileImg:file.thumbUrl
          })
        } else {
          console.error('File does not meet requirements:', file);
        }
      };
    };
    reader.readAsDataURL(file.originFileObj);
  }
}
