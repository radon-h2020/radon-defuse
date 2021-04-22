import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseMockApiService } from '@fuse/lib/mock-api/mock-api.service';
import { items as itemsData } from 'app/mock-api/apps/file-manager/data';

@Injectable({
    providedIn: 'root'
})
export class FileManagerMockApi
{
    private _items: any[] = itemsData;

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
        // @ Items - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/file-manager')
            .reply(() => {

                // Clone the items
                const items = cloneDeep(this._items);

                // Separate the items by folders and files
                const folders = items.filter((item) => item.type === 'folder');
                const files = items.filter((item) => item.type !== 'folder');

                // Sort the folders and files alphabetically by filename
                folders.sort((a, b) => a.name.localeCompare(b.name));
                files.sort((a, b) => a.name.localeCompare(b.name));

                return [
                    200,
                    {
                        folders,
                        files
                    }
                ];
            });
    }
}
