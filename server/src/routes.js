import { Router } from 'express';

import multer from 'multer';

import DeliverymanController from './app/controllers/DeliverymanController';
import DeliverymanOrderController from './app/controllers/DeliverymanOrderController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import FileController from './app/controllers/FileController';
import ListOrderDeliveredController from './app/controllers/ListOrderDeliveredController';
import OrderController from './app/controllers/OrderController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

import validatorDeliverymanStore from './app/validators/Deliveryman/Store';
import validatorDeliverymanUpdate from './app/validators/Deliveryman/Update';
import validatorFileStore from './app/validators/File/Store';
import validatorOrderStore from './app/validators/Order/Store';
import validatorOrderUpdate from './app/validators/Order/Update';
import validatorRecipientStore from './app/validators/Recipient/Store';
import validatorRecipientUpdate from './app/validators/Recipient/Update';
import validatorSessionStore from './app/validators/Session/Store';

import multerConfig from './config/multer';

const routes = Router();
const upload = multer(multerConfig);

routes.post('/sessions', validatorSessionStore, SessionController.store);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', validatorRecipientStore, RecipientController.store);
routes.put(
  '/recipients/:id',
  validatorRecipientUpdate,
  RecipientController.update
);

routes.get('/deliveryman', DeliverymanController.index);
routes.post(
  '/deliveryman',
  validatorDeliverymanStore,
  DeliverymanController.store
);
routes.put(
  '/deliveryman/:id',
  validatorDeliverymanUpdate,
  DeliverymanController.update
);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

routes.get('/orders', OrderController.index);
routes.post('/orders', validatorOrderStore, OrderController.store);
routes.put('/orders/:id', validatorOrderUpdate, OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

routes.get('/deliveryman/:id/deliveries', DeliverymanOrderController.index);
routes.put(
  '/deliveryman/:deliveryman_id/order/:id',
  DeliverymanOrderController.update
);
routes.get('/deliveryman/:id/delivered', ListOrderDeliveredController.index);

routes.get('/delivery/problems', DeliveryProblemController.index);
routes.get('/delivery/:id/problems', DeliveryProblemController.show);
routes.post('/delivery/:id/problems', DeliveryProblemController.store);
routes.delete('/problem/:id/cancel-delivery', DeliveryProblemController.delete);

routes.post(
  '/files',
  upload.single('file'),
  validatorFileStore,
  FileController.store
);

export default routes;
