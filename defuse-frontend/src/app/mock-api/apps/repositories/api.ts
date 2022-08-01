import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { assign, cloneDeep } from 'lodash-es';
import { FuseMockApiService, FuseMockApiUtils } from '@fuse/lib/mock-api';
import { repositories as repositoriesData } from 'app/mock-api/apps/repositories/data';

@Injectable({
    providedIn: 'root'
})
export class RepositoriesMockApi
{
    private _repositories: any[] = repositoriesData;

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
        // @ Repositorys - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/repositories/all')
            .reply(() => {

                // Clone the repositories
                const repositories = cloneDeep(this._repositories);

                // Sort the repositories by the name field by default
                repositories.sort((a, b) => a.full_name.localeCompare(b.full_name));

                // Return the response
                return [200, repositories];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Repositories Search - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/repositories/search')
            .reply(({request}) => {

                // Get the search query
                const query = request.params.get('query');

                // Clone the repositories
                let repositories = cloneDeep(this._repositories);

                // If the query exists...
                if ( query )
                {
                    // Filter the repositories
                    repositories = repositories.filter(repository => repository.full_name && repository.full_name.toLowerCase().includes(query.toLowerCase()));
                }

                // Sort the repositories by the name field by default
                repositories.sort((a, b) => a.full_name.localeCompare(b.full_name));

                // Return the response
                return [200, repositories];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Repository - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/repositories/repository')
            .reply(({request}) => {

                // Get the id from the params
                const id = request.params.get('id');

                // Clone the repositories
                const repositories = cloneDeep(this._repositories);

                // Find the repository
                const repository = repositories.find(item => item.id === id);

                // Return the response
                return [200, repository];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Repository - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/apps/repositories/repository')
            .reply(() => {

                // Generate a new repository
                const newRepository = {
                    id          : 0,
                    url         : 'https://github.com/radon-h2020/new-repository',
                    full_name   : 'radon-h2020/new-repository',
                    default_branch: 'main',
                    language: 'ansible'
                };

                // Unshift the new repository
                this._repositories.unshift(newRepository);

                // Return the response
                return [200, newRepository];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Repository - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/apps/repositories/repository')
            .reply(({request}) => {

                // Get the id and repository
                const id = request.body.id;
                const repository = cloneDeep(request.body.repository);

                // Prepare the updated repository
                let updatedRepository = null;

                // Find the repository and update it
                this._repositories.forEach((item, index, repositories) => {

                    if ( item.id === id )
                    {
                        // Update the repository
                        repositories[index] = assign({}, repositories[index], repository);

                        // Store the updated repository
                        updatedRepository = repositories[index];
                    }
                });

                // Return the response
                return [200, updatedRepository];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Repository - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete('api/apps/repositories/repository')
            .reply(({request}) => {

                // Get the id
                const id = request.params.get('id');

                // Find the repository and delete it
                this._repositories.forEach((item, index) => {

                    if ( item.id === id )
                    {
                        this._repositories.splice(index, 1);
                    }
                });

                // Return the response
                return [200, true];
            });
    }
}
