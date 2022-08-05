export interface Task {
    id: string;
    name: string;
    language: string;
    status: string;
    repository_id?: string;
    progress_value?: number;
    started_at: number;
    ended_at?: number;
    analyzed?: number;
    total?: number;
    quota?: number;
    quota_reset_at?: string;

    // Status
    completed: boolean;
    in_progress: boolean;
    failed: boolean;
}