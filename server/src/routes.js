import { Router } from 'express';

import multer from 'multer';

import CourierController from './app/controllers/CourierController';
import FileController from './app/controllers/FileController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

// import validatorFileStore from './app/validators/File/Store';
import validatorRecipientStore from './app/validators/Recipient/Store';
import validatorRecipientUpdate from './app/validators/Recipient/Update';
import validatorSessionStore from './app/validators/Session/Store';

import multerConfig from './config/multer';

const routes = Router();
const upload = multer(multerConfig);

routes.post('/sessions', validatorSessionStore, SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', validatorRecipientStore, RecipientController.store);
routes.put(
  '/recipients/:id',
  validatorRecipientUpdate,
  RecipientController.update
);

routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.delete);

routes.post(
  '/files',
  // validatorFileStore,
  upload.single('file'),
  FileController.store
);

export default routes;
