import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { assign, cloneDeep } from 'lodash-es';
import { FuseMockApiService, FuseMockApiUtils } from '@fuse/lib/mock-api';
import { fixedFiles as fixedFilesData } from 'app/mock-api/apps/fixed-files/data';

@Injectable({
    providedIn: 'root'
})
export class FixedFilesMockApi
{
    private _fixedFiles: any[] = fixedFilesData;

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
        // @ FixedFiles - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/fixed-files/all')
            .reply(() => {

                // Clone the files
                const fixedFiles = cloneDeep(this._fixedFiles);

                // Sort the fixedFiles by the name field by default
                fixedFiles.sort((a, b) => a.filepath.localeCompare(b.filepath));

                // Return the response
                return [200, fixedFiles];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ FixedFiles by commit - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/fixed-files/commit')
            .reply(({request}) => {

                // Get the search query
                const commitHash = request.params.get('hash');

                // Clone the files
                let fixedFiles = cloneDeep(this._fixedFiles);

                if ( commitHash ) {
                    // Filter the fixedFiles
                    fixedFiles = fixedFiles.filter(file => file.hash_fix == commitHash);
                }

                // Sort the fixedFiles by the name field by default
                fixedFiles.sort((a, b) => a.filepath.localeCompare(b.filepath));

                // Return the response
                return [200, fixedFiles];
            });

 
        // -----------------------------------------------------------------------------------------------------
        // @ FixedFiles Search - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/fixed-files/search')
            .reply(({request}) => {

                // Get the search query
                const query = request.params.get('query');

                // Clone the fixedFiles
                let fixedFiles = cloneDeep(this._fixedFiles);

                // If the query exists...
                if ( query )
                {
                    // Filter the fixedFiles
                    fixedFiles = fixedFiles.filter(file => 
                        file.filepath.toLowerCase().includes(query.toLowerCase())
                        || file.hash_fix.toLowerCase().includes(query.toLowerCase())
                        || file.hash_bic.toLowerCase().includes(query.toLowerCase())
                    );
                }

                // Sort the fixedFiles by the filepath field by default
                fixedFiles.sort((a, b) => a.filepath.localeCompare(b.filepath));

                // Return the response
                return [200, fixedFiles];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ FixedFile - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/fixed-files/file')
            .reply(({request}) => {

                // Get the id from the params
                const id = request.params.get('id');

                // Clone the fixedFiles
                const fixedFiles = cloneDeep(this._fixedFiles);

                // Find the file
                const file = fixedFiles.find(item => item.id === id);

                // Return the response
                return [200, file];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ FixedFile - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/apps/fixed-files/file')
            .reply(({request}) => {

                // Get the id and file
                const id = request.body.hash;
                const file = cloneDeep(request.body.file);

                // Prepare the updated file
                let updatedFile = null;

                // Find the file and update it
                this._fixedFiles.forEach((item, index, fixedFiles) => {

                    if ( item.id === id ) {
                        // Update the file
                        fixedFiles[index] = assign({}, fixedFiles[index], file);

                        // Store the updated file
                        updatedFile = fixedFiles[index];
                    }
                });

                // Return the response
                return [200, updatedFile];
            });

    }
}
