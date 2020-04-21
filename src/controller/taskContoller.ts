import { Request, Response } from 'express';
import { MongoHelper } from '../mongoHelper';
const ObjectId = require('mongodb').ObjectId;
import { Validator } from 'node-input-validator';
import { v4 as uuid } from 'uuid';

class TaskController {
  getCollection = () => {
    return MongoHelper.client.db('task').collection('tasks');
  };

  getAllTasks = async (req: Request, res: Response) => {
    try {
      const taskList: any = this.getCollection();
      const data = await taskList.find({}).toArray();
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

  getTaskById = async (req: Request, res: Response) => {
    try {
      const taskCollection: any = this.getCollection();
      const thisTask = await taskCollection.findOne(ObjectId(req.params.id));
      if (thisTask === null) throw new Error('400 No task found with this Id');

      res.status(200).json({
        status: 'success',
        data: {
          thisTask,
        },
      });
    } catch (e) {
      this.errorHandler(res, e);
    }
  };

  createNewTask = async (req: Request, res: Response) => {
    try {
      const v = new Validator(req.body, {
        title: 'required|string',
        description: 'required|string',
        hoursEstimated: 'required|integer',
        completed: 'required|in:true,false',
        comments: 'required|array',
      });
      const matched = await v.check();
      if (!matched) throw new Error('400 creating task info validating failed');
      const obj: Array<Object> = req.body.comments;
      for (var i = 0; i < obj.length; i++) {
        const eachCommentValidate: any = new Validator(obj[i], {
          name: 'required|string',
          comment: 'required|string',
        });
        const eachCommentValidateResult = await eachCommentValidate.check();
        if (!eachCommentValidateResult) {
          throw new Error('400 creating task comment info validating failed');
        }
      }

      var commentsEdit = req.body.comments.map(function (el) {
        var o = Object.assign({}, el);
        const id: string = uuid();
        o.id = id;
        return o;
      });
      let task = {
        title: req.body.title,
        description: req.body.description,
        hoursEstimated: req.body.hoursEstimated,
        completed: req.body.completed,
        comments: commentsEdit,
      };
      const taskCollection: any = this.getCollection();
      await taskCollection.insertOne(task);
      res.status(200).json({
        status: 'success',
        data: {
          task,
        },
      });
    } catch (e) {
      res.status(500).json({
        status: 'fail',
        message: e.message,
      });
    }
  };

  updateTask = async (req: Request, res: Response) => {
    try {
      const v: Validator = new Validator(req.body, {
        title: 'required|string',
        description: 'required|string',
        hoursEstimated: 'required|integer',
        completed: 'required|in:true,false',
      });
      const matched = await v.check();
      if (!matched) throw new Error('400 Updating task info validating failed');
      console.log('hi');
      let updateInfo = {
        title: req.body.title,
        description: req.body.description,
        hoursEstimated: req.body.hoursEstimated,
        completed: req.body.completed,
      };
      const taskCollection: any = this.getCollection();
      await taskCollection.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: updateInfo }
      );
      const newTask = await taskCollection.findOne(ObjectId(req.params.id));
      res.status(200).json({
        status: 'success',
        newTask,
      });
    } catch (e) {
      console.log(e.message);
      this.errorHandler(res, e);
    }
  };

  patchUpdateTaskById = async (req: Request, res: Response) => {
    try {
      const result = {};
      Object.entries(req.body).forEach(([key, value]) => {
        if (key === 'title') {
          if (typeof value === 'string' || value instanceof String) {
            Object.assign(result, { title: value });
          } else {
            throw new Error('400 patching task title validating failed');
          }
        } else if (key === 'description') {
          if (typeof value === 'string' || value instanceof String) {
            Object.assign(result, { description: value });
          } else {
            throw new Error('400 patching task description validating failed');
          }
        } else if (key === 'hoursEstimated') {
          if (typeof value === 'number') {
            Object.assign(result, { hoursEstimated: value });
          } else {
            throw new Error('400 patching task description validating failed');
          }
        } else if (key === 'completed') {
          if (typeof value === 'boolean') {
            Object.assign(result, { complted: value });
          } else {
            throw new Error('400 patching task completed validating failed');
          }
        }
      });

      const taskCollection: any = this.getCollection();
      await taskCollection.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: result }
      );
      const newTask = await taskCollection.findOne(ObjectId(req.params.id));
      res.status(200).json({
        status: 'success',
        newTask,
      });
    } catch (e) {
      this.errorHandler(res, e);
    }
  };

  addCommentById = async (req: Request, res: Response) => {
    try {
      const v = new Validator(req.body, {
        name: 'required|string',
        comment: 'required|string',
      });
      const matched = await v.check();
      if (!matched)
        throw new Error('400 not enough information for adding comment');
      const taskCollection: any = this.getCollection();
      const thisTask = await taskCollection.findOne(ObjectId(req.params.id));
      if (thisTask === null) throw new Error('400 No task found with this Id');
      await taskCollection.updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $push: {
            comments: {
              id: uuid(),
              name: req.body.name,
              comment: req.body.comment,
            },
          },
        }
      );
      const newTask = await taskCollection.findOne(ObjectId(req.params.id));
      res.status(200).json({
        status: 'success',
        newTask,
      });
    } catch (e) {
      this.errorHandler(res, e);
    }
  };

  deleteCommentById = async (req: Request, res: Response) => {
    try {
      const taskCollection: any = this.getCollection();
      const task = await taskCollection.findOne(ObjectId(req.params.taskId));
      if (task === null) throw new Error('400 No task found with this Id');
      const comments = task.comments;
      if (!comments.some((e) => e.id === req.params.commentId)) {
        throw new Error('400 No comment found with this Id');
      }

      await taskCollection.updateOne(
        { _id: ObjectId(req.params.taskId) },
        { $pull: { comments: { id: req.params.commentId } } },
        false,
        true
      );
      res.status(200).json({
        status: 'success',
        message: 'deleted comment successfully',
      });
    } catch (e) {
      this.errorHandler(res, e);
    }
  };

  errorHandler = (res: Response, e: Error) => {
    res.status(parseInt(e.message.substring(0, 3))).json({
      status: 'fail',
      error: e.message.substring(4),
    });
  };
}

export default TaskController;
