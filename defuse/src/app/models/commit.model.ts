export interface CommitModel {
    hash: string;
    msg?: string;
    is_valid: boolean;
    defects: string[]
}
