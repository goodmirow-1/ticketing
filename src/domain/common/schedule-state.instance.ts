export class SchedulerState {
    private static instance: SchedulerState
    public check: boolean = true

    private constructor() {}

    public static getInstance(): SchedulerState {
        if (!this.instance) {
            this.instance = new SchedulerState()
        }
        return this.instance
    }
}
