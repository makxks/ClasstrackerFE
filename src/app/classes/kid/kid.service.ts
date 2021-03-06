
import { throwError, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import 'rxjs';

import { Kid } from './kid.model';
import { ErrorService } from '../../errors/error.service';

import { AuthService } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment.prod';

@Injectable()
export class KidService {
  //currentAddress: string = "https://class-tracker.herokuapp.com";
  //currentAddress: string = "https://class-tracker-staging.herokuapp.com";
  currentAddress: string = environment.apiUrl;
  kids: Kid[] = [];
  kid: Kid | undefined;
  deleteOccurred = new Subject<Kid>();
  username: string = "";

  constructor(private errorService: ErrorService, private http: HttpClient, private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe((response) => {
      this.username = response?.name!;
    })
  }

  addKid(kid: Kid){
    const body = JSON.stringify(kid);
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(this.currentAddress + '/kids', body, {headers: headers})
      .pipe(
        map((response: any) => {
          const result = response.obj;
          const kid = new Kid(
            result.kidsName,
            result.age,
            result.strengths,
            result.weaknesses,
            result.comments,
            this.username,
            result.classCode,
            result.hasPhoto
          );
          this.router.navigate(['/classes/show-class/' + result.classCode])
          return kid;
        })
        , catchError((err: any) => {
          var errorMessage;
          var errorCode;
          errorMessage = err.message;
          errorCode = err.status;
          console.log(err);
          this.errorService.handleError(errorCode, errorMessage);
          return throwError(() => new Error(err));
        })
      );
  }

  getKids(classCode: string) {
    //need to pass the user as a param to find the user in the db
    let options = new HttpParams();
    options = options.append("email", this.username);
    return this.http.get(this.currentAddress + '/kids/' + classCode, {params: options})
      .pipe(
        map((response: any) => {
          const kids = response.obj;
          let transformedKids: Kid[] = [];
          for (let kid of kids) {
            transformedKids.push(new Kid(
              kid.kidsName,
              kid.age,
              kid.strengths,
              kid.weaknesses,
              kid.comments,
              kid.user,
              kid.classCode,
              kid.hasPhoto)
            );
          }
          this.kids = transformedKids;
          return transformedKids;
        })
        , catchError((err: any) => {
          var errorMessage;
          var errorCode;
          errorMessage = err.message;
          errorCode = err.status;
          console.log(err);
          this.errorService.handleError(errorCode, errorMessage);
          return throwError(() => new Error(err));
        })
      );
  }

  getKid(classCode: string, name: string) {
    //need to pass the user as a param to find the user in the db
    let options = new HttpParams();
    options = options.append("email", this.username);
    return this.http.get(this.currentAddress + '/kids/' + classCode + '/' + name , {params: options})
      .pipe(
        map((response: any) => {
          const responseObject = response.obj;
          var kid = new Kid(
              responseObject.kidsName,
              responseObject.age,
              responseObject.strengths,
              responseObject.weaknesses,
              responseObject.comments,
              responseObject.user,
              responseObject.classCode,
              responseObject.hasPhoto)
              this.kid = kid;
              return kid;
        })
        , catchError((err: any) => {
          var errorMessage;
          var errorCode;
          errorMessage = err.message;
          errorCode = err.status;
          console.log(err);
          this.errorService.handleError(errorCode, errorMessage);
          return throwError(() => new Error(err));
        })
      );
  }

  editKid(classCode: string, name: string, kid: Kid) {
    const body = JSON.stringify(kid);
    //need to pass the user as a param to find the user in the db
    let options = new HttpParams;
    options = options.append("email", this.username);
    let headers = new HttpHeaders;
    headers.set('Content-Type', 'application/json');

    return this.http.patch(this.currentAddress + '/kids/' + classCode + "/" + name, body, {headers: headers, params: options})
      .pipe(
        map((response: any) => {
          const responseObject = response.obj;
          var kid = new Kid(
            responseObject.kidsName,
            responseObject.age,
            responseObject.strengths,
            responseObject.weaknesses,
            responseObject.comments,
            responseObject.user,
            responseObject.classCode,
            responseObject.hasPhoto
          )
          this.kid = kid;
          return kid;
        })
        , catchError((err: any) => {
          var errorMessage;
          var errorCode;
          errorMessage = err.message;
          errorCode = err.status;
          console.log(err);
          this.errorService.handleError(errorCode, errorMessage);
          return throwError(() => new Error(err));
        })
      );
  }

  handleDelete(kid: any){
		this.deleteOccurred.next(kid);
	}

  deleteKid(classCode: string, name: string, kid: Kid) {
    this.kids.splice(this.kids.indexOf(kid), 1);
    //need to pass the user as a param to find the user in the db
    let options = new HttpParams;
    options = options.append("email", this.username);
    let headers = new HttpHeaders;
    headers.set('Content-Type', 'application/json');

    return this.http.delete(this.currentAddress + '/kids/' + classCode + '/' + name , {headers: headers, params: options})
      .pipe(
        map((response: any) => {
          const responseObject = response.obj;
          this.router.navigate(['/classes/show-class/' + classCode]);
        })
        , catchError((err: any) => {
          var errorMessage;
          var errorCode;
          errorMessage = err.message;
          errorCode = err.status;
          console.log(err);
          this.errorService.handleError(errorCode, errorMessage);
          return throwError(() => new Error(err));
        })
      );
  }

}
