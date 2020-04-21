import TaskController from '../controller/taskContoller';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

import * as util from 'util';
import * as morgan from 'morgan';

export class TaskRoutes {
  public controller: TaskController = new TaskController();
  public map: Map<string, number> = new Map();

  public routes(app: express.Application): void {
    app.use(morgan('dev'));
    app.use(this.LoggerMiddleware);
    app.use(this.countRequest);

    app.route('/api/tasks/').get(this.controller.getAllTasks);
    app
      .route('/api/tasks/:id')
      .get(this.idChecker, this.controller.getTaskById);
    app.route('/api/tasks/').post(this.controller.createNewTask);
    app.route('/api/tasks/:id').put(this.idChecker, this.controller.updateTask);
    app
      .route('/api/tasks/:id')
      .patch(this.idChecker, this.controller.patchUpdateTaskById);
    app
      .route('/api/tasks/:id/comments')
      .post(this.idChecker, this.controller.addCommentById);
    app
      .route('/api/tasks/:taskId/:commentId')
      .delete(this.idChecker, this.controller.deleteCommentById);
    app.use('*', (req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });
  }
  public idChecker(req: Request, res: Response, next: NextFunction) {
    if (
      (req.params.id && !req.params.id.match(/^[0-9a-fA-F]{24}$/)) ||
      (req.params.taskId && !req.params.taskId.match(/^[0-9a-fA-F]{24}$/))
    ) {
      return res
        .status(400)
        .json({ status: 'fail', error: 'It should be valid obejct id' });
    }
    next();
  }
  public LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    console.log(`📑  Request.body \n${util.inspect(req.body, false, null)}`);
    next();
  }
  public countRequest = (req: Request, res: Response, next: NextFunction) => {
    if (this.map.has(req.url)) {
      this.map.set(req.url, this.map.get(req.url) + 1);
    } else {
      this.map.set(req.url, 1);
    }
    console.log('#️⃣  Number of requests = ' + this.map.get(req.url));
    next();
  };
}
