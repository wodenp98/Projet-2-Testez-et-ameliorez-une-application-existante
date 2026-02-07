import {Register} from '../models/Register';
import {Login} from '../models/Login';
import {Observable, of} from 'rxjs';


export class UserMockService {

  register(user: Register): Observable<Object> {
    return of();
  }

  login(user: Login): Observable<string> {
    return of('fake-jwt-token');
  }
}
