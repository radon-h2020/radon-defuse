export interface FixedFileModel {
    id: string; // Firebase id
    hash_fix: string; // Hash of the fixing commit
    hash_bic: string; // Hash of the bug introducing commit
    filepath: string;
    is_valid: boolean;
}
