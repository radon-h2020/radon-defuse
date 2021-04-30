import { Injectable } from '@angular/core';
import { assign, cloneDeep } from 'lodash-es';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { commits as commitData } from 'app/mock-api/common/commit/data';

@Injectable({
    providedIn: 'root'
})
export class CommitsMockApi
{
    private _commit: any = commitData;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService)
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        // -----------------------------------------------------------------------------------------------------
        // @ Commit - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/common/commits')
            .reply(() => [200, cloneDeep(this._commit)]);

        // -----------------------------------------------------------------------------------------------------
        // @ Commit - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/common/commits')
            .reply(({request}) => {

                // Get the commit mock-api
                const commit = cloneDeep(request.body.commit);

                // Update the commit mock-api
                this._commit = assign({}, this._commit, commit);

                // Return the response
                return [200, cloneDeep(this._commit)];
            });
    }
}
