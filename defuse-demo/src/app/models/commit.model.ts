export interface CommitModel {
    hash: string;
    msg?: string;
    valid: boolean;
    defects: string[]
}
