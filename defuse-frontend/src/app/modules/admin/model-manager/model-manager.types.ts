export interface PredictiveModel {
    id: string;
    repository_id: string;
    repository: string;
    defect: string;
    language: string;
    mcc: number;
    average_precision: number;
}

export interface Item {
    id?: string;
    folderId?: string;
    folderName?: string;
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
