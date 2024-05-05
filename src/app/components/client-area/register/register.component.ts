import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NgFor, NgIf } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NgIf,
    NzSelectModule,
    NzSliderModule,
    NzUploadModule,
    NzIconModule,
    NzTagModule,
    NgFor
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RegisterComponent implements OnInit {
  @ViewChild('tagInput') tagInputRef!: ElementRef<HTMLInputElement>;
  constructor(private fb: FormBuilder) {}
  uploadedPhoto:NzUploadFile[] = []
  tags:any[] = []
  message : string =''
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    addressType: new FormControl('', [Validators.required]),
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
    return this.registerForm.controls as any;
  }
  ngOnInit(): void {
    this.registerForm.get('addressType')?.valueChanges.subscribe(addressType => {
      if (addressType === 'home') {
        (<FormGroup<any>>this.registerForm).addControl('homeAddress1', new FormControl('',Validators.required));
        (<FormGroup<any>>this.registerForm).addControl('homeAddress2', new FormControl('',Validators.required));
      }
      if (addressType === 'company') {
        (<FormGroup<any>>this.registerForm).addControl('companyAddress1', new FormControl('',Validators.required));
        (<FormGroup<any>>this.registerForm).addControl('companyAddress2', new FormControl('',Validators.required));
      }
    })
  }

  handleChange(event: NzUploadChangeParam) {
    const fileList = event.fileList;
    if(event.type == 'removed'){
      this.message = ''
    }
    if (event.file.status === 'done') {
      fileList.forEach((file: any) => {
        this.processFile(file);
      });
    } else if (event.file.status === 'error') {
      this.message = `${event.file.name} file upload failed.`;
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
          this.registerForm.patchValue({
            profileImg:file.thumbUrl
          })
        } else {
          console.error('File does not meet requirements:', file);
        }
      };
    };
    reader.readAsDataURL(file.originFileObj);
  }
  
 
  addTag(tagValue: string): void {
    if (tagValue.trim() !== '') {
      const newTags = tagValue
        .split(/[ ,]+/)
        .filter(tag => tag.trim() !== '');

      this.tags.push(...newTags);
      this.tagInputRef.nativeElement.value = '';
      (this.registerForm.get('tags') as FormArray).push(this.fb.control(this.tags[0]));
    }
  }

  removeTag(tag: string,index:number): void {
    this.tags = this.tags.filter(t => t !== tag);
    (this.registerForm.get('tags') as FormArray).removeAt(index);
  }
}
