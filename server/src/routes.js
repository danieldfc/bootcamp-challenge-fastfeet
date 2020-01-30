import { Router } from 'express';

import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

import validatorRecipientStore from './app/validators/Recipient/Store';
import validatorRecipientUpdate from './app/validators/Recipient/Update';
import validatorSessionStore from './app/validators/Session/Store';

const routes = Router();

routes.post('/sessions', validatorSessionStore, SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', validatorRecipientStore, RecipientController.store);
routes.put(
  '/recipients/:id',
  validatorRecipientUpdate,
  RecipientController.update
);

export default routes;
