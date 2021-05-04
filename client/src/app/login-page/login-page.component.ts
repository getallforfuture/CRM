import {Component, OnDestroy, OnInit} from '@angular/core'
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../shared/services/auth-service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Observable, Subject, Subscription} from "rxjs";
import {User} from "../shared/interfaces";
import {MaterialService} from "../shared/classes/material.service";


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.sass']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  form!: FormGroup
  aSub!: Subscription

  constructor(private formBuilder: FormBuilder,
              private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.form =  this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]]
    })

    this.route.queryParams.subscribe((params: Params) => {
      if(params['registered']){
        MaterialService.toast('Now you can start your work in app.')
      }else if(params['accessDenied']){
        MaterialService.toast('Access denied.')
      }else if(params['sessionFailed']){
        MaterialService.toast('Please log in again.')
      }
    })

  }

  ngOnDestroy() {
   if(this.aSub){
      this.aSub.unsubscribe()
    }
  }

  get getControl(){
    return this.form.controls;
  }

  onSubmit(){
    this.form.disable()

    this.aSub = this.auth.login(this.form.value).subscribe(
      () => this.router.navigate(['/overview']),
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }
}
