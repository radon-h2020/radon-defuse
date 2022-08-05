export interface Task {
    id: string;
    name: string;
    language: string;
    status: string;
    repository_id?: string;
    progress_value?: number;
    started_at: number;
    ended_at?: number;

    // Status
    completed: boolean;
    in_progress: boolean;
    failed: boolean;
}