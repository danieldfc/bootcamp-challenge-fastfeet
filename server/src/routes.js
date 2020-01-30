import { Router } from 'express';

import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

import validatorSessionStore from './app/validators/Session/Store';

const routes = Router();

routes.post('/sessions', validatorSessionStore, SessionController.store);

routes.use(authMiddleware);

export default routes;
