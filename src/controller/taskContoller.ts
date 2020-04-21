import { Request, Response } from 'express';
import { MongoHelper } from '../mongoHelper';

class TaskController {
  getCollection = () => {
    return MongoHelper.client.db('task').collection('tasks');
  };

  getAllTasks = async (req: Request, res: Response) => {
    try {
      const taskList: any = this.getCollection();
      const data = await taskList.find({}).toArray();
      console.log(data);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (e) {
      res.status(500).json({
        status: 'fail',
        message: e.message,
      });
    }
  };
}

export default TaskController;
