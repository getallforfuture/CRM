import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {AuthService} from "../shared/services/auth-service";
import {Router} from "@angular/router";
import {MaterialService} from "../shared/classes/material.service";


@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.sass']
})
export class RegisterPageComponent implements OnInit, OnDestroy {

  form!: FormGroup
  aSub!: Subscription
  constructor(public formBuilder: FormBuilder,
              private auth: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.form =  this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]]
    })
  }
  ngOnDestroy() {
    if (this.aSub){
      this.aSub.unsubscribe()
    }
  }

  get getControl(){
    return this.form.controls;
  }

  onSubmit() {
    this.aSub = this.auth.register(this.form.value).subscribe(
      ()=> this.router.navigate(['/login'], {
        queryParams: {
          registered: true
        }
      }),
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }

}
