import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable} from 'rxjs';

import { RepositoryModel } from 'app/models/repository.model'
import { RepositoryListService } from 'app/services/repository-list.service'

@Injectable({providedIn : "root"})
export class RepositoryResolver implements Resolve<Observable<RepositoryModel>> {

  constructor(private _repositoryService: RepositoryListService) {}

   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : Observable<RepositoryModel> {
        const id = route.params["id"];
        return this._repositoryService.get(+id);
  }
}
