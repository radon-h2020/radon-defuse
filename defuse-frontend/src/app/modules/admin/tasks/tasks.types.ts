export interface Task {
    id: string;
    name: string;
    language: string;
    status: string;
    started_at: number;
    ended_at?: number;

    // Status
    completed: boolean;
    in_progress: boolean;
    failed: boolean;
}