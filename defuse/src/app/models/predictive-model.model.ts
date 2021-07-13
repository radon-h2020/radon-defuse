export interface PredictiveModel
{
    id: string;
    defect: string;
    language: string;
    mcc: number;
    averagePrecision: number;
    name?: string;
    createdAt?: string;
}
