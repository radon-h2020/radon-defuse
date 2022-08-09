import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { assign, cloneDeep } from 'lodash-es';
import { FuseMockApiService, FuseMockApiUtils } from '@fuse/lib/mock-api';
import { commits as commitsData, tags as tagsData } from 'app/mock-api/apps/commits/data';

@Injectable({
    providedIn: 'root'
})
export class CommitsMockApi
{
    private _commits: any[] = commitsData;
    private _tags: any[] = tagsData;

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
        // @ Commits - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/commits/all')
            .reply(({request}) => {

                // Get available queries
                const query = request.params.get('query');
                const page = parseInt(request.params.get('page') ?? '1', 10);
                const size = parseInt(request.params.get('size') ?? '10', 10);
                

                // Clone the commits
                let commits: any[] | null = cloneDeep(this._commits);

                // Sort the commits by the name field by default
                commits.sort((a, b) => a.hash.localeCompare(b.hash));
                
                if ( query ) {
                    // Filter the commits based on query
                    commits = commits.filter(commit => 
                        commit.hash.toLowerCase().includes(query.toLowerCase()) 
                        || commit?.msg.toLowerCase().includes(query.toLowerCase())
                        || commit?.defects?.includes(query.toLowerCase())
                    );
                }

                // Paginate - Start
                const commitsLength = commits.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), commitsLength);
                const lastPage = Math.max(Math.ceil(commitsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // products but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    commits = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    commits = commits.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : commitsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }

                
                // Return the response
                return [200, 
                    {
                        commits,
                        pagination
                    }];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Commits Filter - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
        .onGet('api/apps/commits/filter')
        .reply(({request}) => {

            // Get the repository id
            const repositoryId = request.params.get('repositoryId');

            // Clone the commits
            let commits = []

            if ( repositoryId ) {
                commits = cloneDeep(this._commits);
                
                // Filter the commits
                commits = commits.filter(commit => commit.id == repositoryId);

                // Sort the commits by the name field by default
                commits.sort((a, b) => a.hash.localeCompare(b.hash));
            }

            // Return the response
            return [200, commits];
        });


        // -----------------------------------------------------------------------------------------------------
        // @ Commits Search - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/commits/search')
            .reply(({request}) => {

                // Get the search query
                const query = request.params.get('query');

                // Clone the commits
                let commits = cloneDeep(this._commits);

                // If the query exists...
                if ( query )
                {
                    // Filter the commits
                    // commits = commits.filter(commit => commit.hash && commit.hash.toLowerCase().includes(query.toLowerCase()));
                    commits = commits.filter(commit => 
                        commit.hash.toLowerCase().includes(query.toLowerCase()) 
                        || commit?.msg.toLowerCase().includes(query.toLowerCase())
                        || commit?.defects?.includes(query.toLowerCase())
                    );
                }

                // Sort the commits by the name field by default
                commits.sort((a, b) => a.hash.localeCompare(b.hash));

                // Return the response
                return [200, commits];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Commit - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/commits/commit')
            .reply(({request}) => {

                // Get the id from the params
                const hash = request.params.get('hash');

                // Clone the commits
                const commits = cloneDeep(this._commits);

                // Find the commit
                const commit = commits.find(item => item.hash === hash);

                // Return the response
                return [200, commit];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Commit - POST
        // -----------------------------------------------------------------------------------------------------
        // this._fuseMockApiService
        //     .onPost('api/apps/commits/commit')
        //     .reply(() => {

        //         // Generate a new commit
        //         const newCommit = {
        //             id          : 0,
        //             url         : 'https://github.com/radon-h2020/new-commit',
        //             full_name   : 'radon-h2020/new-commit',
        //             default_branch: 'main',
        //             language: 'ansible'
        //         };

        //         // Unshift the new commit
        //         this._commits.unshift(newRepository);

        //         // Return the response
        //         return [200, newRepository];
        //     });

        // -----------------------------------------------------------------------------------------------------
        // @ Commit - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/apps/commits/commit')
            .reply(({request}) => {

                // Get the hash and commit
                const hash = request.body.hash;
                const commit = cloneDeep(request.body.commit);

                // Prepare the updated commit
                let updatedCommit = null;

                // Find the commit and update it
                this._commits.forEach((item, index, commits) => {

                    if ( item.hash === hash )
                    {
                        // Update the commit
                        commits[index] = assign({}, commits[index], commit);

                        // Store the updated commit
                        updatedCommit = commits[index];
                    }
                });

                // Return the response
                return [200, updatedCommit];
            });
        
        // -----------------------------------------------------------------------------------------------------
        // @ Tags - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/commits/tags')
            .reply(() => {

                // Clone the commits
                const tags = cloneDeep(this._tags);

                // Sort the tags by the name
                tags.sort((a, b) => a.localeCompare(b));

                // Return the response
                return [200, tags];
            });
        // -----------------------------------------------------------------------------------------------------
        // @ Tags - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
        .onPost('api/apps/commits/tag')
        .reply(({request}) => {

            // Get the tag
            const newTag = cloneDeep(request.body.tag);

            // Unshift the new tag
            this._tags.unshift(newTag);

            // Return the response
            return [200, newTag];
        });

        // -----------------------------------------------------------------------------------------------------
        // @ Tags - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
        .onPatch('api/apps/commits/tag')
        .reply(({request}) => {

            // Get the id and tag
            const tag = cloneDeep(request.body.tag);

            // Prepare the updated tag
            let updatedTag = null;

            // Find the tag and update it
            this._tags.forEach((item, index, tags) => {

                if ( item === tag )
                {
                    // Update the tag
                    tags[index] = assign({}, tags[index], tag);

                    // Store the updated tag
                    updatedTag = tags[index];
                }
            });

            // Return the response
            return [200, updatedTag];
        });

        // -----------------------------------------------------------------------------------------------------
        // @ Tag - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete('api/apps/commits/tag')
            .reply(({request}) => {

                // Get the tag
                const tag = request.params.get('tag');

                // Find the tag and delete it
                this._tags.forEach((item, index) => {

                    if ( item === tag )
                    {
                        this._tags.splice(index, 1);
                    }
                });

                // Get the commits that have the tag
                const commitsWithTag = this._commits.filter(commit => commit.defects.indexOf(tag) > -1);

                // Iterate through them and delete the tag
                commitsWithTag.forEach((commit) => {
                    commit.defects.splice(commit.defects.indexOf(tag), 1);
                });

                // Return the response
                return [200, true];
            });
    }
}
