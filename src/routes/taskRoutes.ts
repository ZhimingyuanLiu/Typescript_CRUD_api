import TaskController from '../controller/taskContoller';

export class TaskRoutes {
  public controller: TaskController = new TaskController();
  public routes(app): void {
    app.route('/api/tasks/').get(this.controller.getAllTasks);
  }
}
