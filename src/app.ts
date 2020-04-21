import * as express from 'express';
import * as bodyParser from 'body-parser';
import { TaskRoutes } from './routes/taskRoutes';

class App {
  public app: express.Application;
  public taskRoutes: TaskRoutes = new TaskRoutes();
  constructor() {
    this.app = express();
    this.config();
    this.taskRoutes.routes(this.app);
  }

  private config(): void {
    this.app.use(express.json());
    this.app.use(bodyParser.json());
    this.app.use(express.urlencoded({ extended: false }));
  }
}

export default new App().app;
