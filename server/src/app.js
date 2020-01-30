import './bootstrap';

import express from 'express';

import cors from 'cors';
import morgan from 'morgan';
import Youch from 'youch';

import 'express-async-errors';

import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(cors());
    this.server.use(morgan('dev'));
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res
        .status(500)
        .json({ error: { message: 'Internal server error' } });
    });
  }
}

export default new App().server;
