export interface Repository {
    id: string;
    url: string;
    full_name: string;
    default_branch?: string,
    language?: string;
    comments_ratio?: number;
    commit_frequency?: number;
    core_contributors?: number;
    has_ci?: boolean;
    has_license?: boolean;
    iac_ratio?: number;
    repository_size?: number;
    modified_at?: number; 
}

export interface RepositoryPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}