export interface TaskModel {
    id: string;
    name: string;
    status: string;
    language: string;
    started_at: number;
    ended_at?: number;
}
