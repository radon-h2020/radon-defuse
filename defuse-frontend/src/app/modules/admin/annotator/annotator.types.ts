export interface Commit {
    hash: string;
    msg?: string;
    is_valid: boolean;
    defects: string[];
    repository_id: number;
}

export interface FixedFile {
    id: string; // Firebase id
    filepath: string,
    hash_fix: string;
    hash_bic: string;
    is_valid: boolean;
    repository_id: number;
}

export interface Pagination {
    index: number,
    size: number,
    length: number
}