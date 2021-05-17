export interface PredictiveModel
{
    id: string;
    defect: string,
    language: string,
    name?: string;
    createdBy?: string;
    createdAt?: string;
    modifiedAt?: string;
    size?: string;
    type?: string;
    contents?: string | null;
    description?: string | null;
}
