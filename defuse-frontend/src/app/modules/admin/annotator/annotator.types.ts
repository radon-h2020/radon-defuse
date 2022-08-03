export interface Commit {
    hash: string;
    msg?: string;
    url: string;
    is_valid: boolean;
    defects: string[];
    repository_id: string;
}

export interface Defect {
    id: string;
    title: string;
}

export interface FixedFile {
    id: string; // Firebase id
    filepath: string,
    hash_fix: string;
    hash_bic: string;
    is_valid: boolean;
    repository_id: string;
}

export interface CommitsPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}