import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CategoriesService} from "../../shared/services/categories.service";
import {switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {MaterialService} from "../../shared/classes/material.service";


@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.sass']
})
export class CategoriesFormComponent implements OnInit {

  @ViewChild('input') inputRef!: ElementRef
  form!: FormGroup
  image!: File
  imagePreview: any
  isNew = true
  category: any
  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private router: Router
  ) {
  }

  ngOnInit(): void {

    this.form = this.formBuilder.group({
      name: [null, [Validators.required]]
    })

    this.form.disable()
    this.route.params
      .pipe(
        switchMap(
          (params: Params) => {
            if (params.id) {
              this.isNew = false
              return this.categoriesService.getById(params.id)
            }
            return of(null)
          }
        )
      )
      .subscribe(
        (category) => {
          if (category) {
            this.category = category
            this.form.patchValue({
              name: category.name
            })
            this.imagePreview = category.imageSrc
            MaterialService.updateTextInputs()
          }
          this.form.enable()
        },
        error => MaterialService.toast(error.error.message)
      )
  }

  onSubmit() {
    let obs$
    this.form.disabled

    if (this.isNew) {
     obs$ = this.categoriesService.create(this.form.value.name, this.image)
    } else {
     obs$ = this.categoriesService.update(this.category._id,this.form.value.name, this.image)
    }

    obs$.subscribe(
      category =>{
        this.category = category
        MaterialService.toast('Changes has been saved')
        this.form.enable()
      },
      error=>{
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }

  deleteCategory(){
    const dicision = window.confirm(`Do you sure that you what delete category "${this.category.name}"`)
    if (dicision){
      this.categoriesService.remove(this.category._id)
        .subscribe(
          res => MaterialService.toast(res.message),
          error => MaterialService.toast(error.error.message),
          () => this.router.navigate(['/categories'])
        )
    }


  }
  get getControl() {
    return this.form.controls;
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]
    this.image = file

    const reader = new FileReader()

    reader.onload = () => {
      this.imagePreview = reader.result
    }

    reader.readAsDataURL(file)
  }

  triggerClick() {
    this.inputRef.nativeElement.click()
  }
}
