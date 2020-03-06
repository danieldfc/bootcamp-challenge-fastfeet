import Deliveryman from '../models/Deliveryman';
import DeliveryProblem from '../models/DeliveryProblem';
import File from '../models/File';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

import Queue from '../../lib/Queue';

import CanceledDeliveryProblemMail from '../jobs/CanceledDeliveryProblemMail';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const limit = 20;
    const deliveriesProblems = await DeliveryProblem.findAll({
      order: [['created_at', 'desc']],
      limit,
      offset: (page - 1) * 20,
      attributes: ['id', 'description'],
      include: [
        {
          where: {
            canceled_at: null,
          },
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'name', 'path', 'url'],
                },
              ],
            },
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'street',
                'number',
                'complement',
                'state',
                'city',
                'cep',
              ],
            },
            {
              model: File,
              as: 'signature_recipient',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(deliveriesProblems);
  }

  async show(req, res) {
    const { page = 1 } = req.query;
    const { id } = req.params;

    const checkOrder = await Order.findByPk(id);

    if (!checkOrder) {
      return res
        .status(404)
        .json({ error: { message: 'Delivery problem not found' } });
    }
    const delivery_id = checkOrder.id;

    const limit = 20;
    const deliveriesProblems = await DeliveryProblem.findAll({
      where: { delivery_id },
      order: [['created_at', 'desc']],
      limit,
      offset: (page - 1) * 20,
      attributes: ['id', 'description'],
      include: [
        {
          where: {
            canceled_at: null,
          },
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'name', 'path', 'url'],
                },
              ],
            },
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'street',
                'number',
                'complement',
                'state',
                'city',
                'cep',
              ],
            },
            {
              model: File,
              as: 'signature_recipient',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(deliveriesProblems);
  }

  async store(req, res) {
    const { id: delivery_id } = req.params;
    const { description, deliveryman_id } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Deliveryman not found' } });
    }

    const order = await Order.findOne({
      where: {
        id: delivery_id,
        canceled_at: null,
      },
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }

    if (order.deliveryman.id !== deliveryman.id) {
      return res
        .status(400)
        .json({ erro: { message: 'Deliveryman not registed this order' } });
    }

    const { id } = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    const delivery = await DeliveryProblem.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'canceled_at'],
        },
      ],
    });

    return res.json({
      id,
      delivery,
      description,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryProblem = await DeliveryProblem.findByPk(id);

    if (!deliveryProblem) {
      return res
        .status(404)
        .json({ error: { message: 'Delivery problem not exist' } });
    }

    const order = await Order.findOne({
      where: {
        id: deliveryProblem.delivery_id,
        canceled_at: null,
      },
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .json({ error: { message: 'Order already canceled or not found' } });
    }

    await order.update(
      {
        canceled_at: new Date(),
      },
      {
        where: {
          id: deliveryProblem.delivery_id,
        },
      }
    );

    await Queue.add(CanceledDeliveryProblemMail.key, {
      order,
      deliveryman: order.deliveryman,
      problem: deliveryProblem,
    });

    return res.json();
  }
}

export default new DeliveryProblemController();
