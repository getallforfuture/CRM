import {Injectable} from "@angular/core";
import {AuthService} from "../services/auth-service";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {Router} from "@angular/router";

@Injectable()
export class TokenInterceptor implements HttpInterceptor{
  constructor(private auth: AuthService,
              private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.auth.isAuthenticated()){
      req = req.clone({
        setHeaders:{
          Authorization: this.auth.getToken()
        }
      })
    }

    return next.handle(req).pipe(
      catchError(
        (e: HttpErrorResponse) => this.handleAuthError(e)
      )
    )
  }

  private handleAuthError(e: HttpErrorResponse): Observable<any>{
    if (e.status === 401){
      this.router.navigate(['/login'], {
        queryParams: {
          sessionFailed: true
        }
      })
    }

    return throwError(e)
  }
}
