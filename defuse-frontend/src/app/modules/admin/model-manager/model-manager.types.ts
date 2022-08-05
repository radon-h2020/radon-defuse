export interface PredictiveModel {
    id: string;
    repository_id: string;
    repository: string;
    defect: string;
    language: string;
    mcc: number;
    average_precision: number;
    name?: string;
    created_at?: string;
}

export interface Item {
    id?: string;
    folderId?: string;
    name?: string;
    createdBy?: string;
    createdAt?: string;
    modifiedAt?: string;
    size?: string;
    type?: string;
    contents?: string | null;
    description?: string | null;
}

export interface Items {
    folders: Item[];
    files: Item[];
}
