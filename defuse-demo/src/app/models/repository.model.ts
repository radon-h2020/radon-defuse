export interface RepositoryModel {
    id: number;
    url: string;
    full_name: string;
    default_branch: string,
    language: string;
    size?: number;
}
