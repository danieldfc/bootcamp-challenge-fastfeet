import Courier from '../models/Courier';
import DeliveryProblem from '../models/DeliveryProblem';
import File from '../models/File';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

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
              model: Courier,
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
}

export default new DeliveryProblemController();
