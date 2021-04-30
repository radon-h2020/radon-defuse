export interface FixedFile {
    hash_fix: string; // Hash of the fixing commit
    hash_bic: string; // Hash of the bug introducing commit
    path: string;
    valid: boolean;
}
