import { object, number, date } from 'yup';

export default async (req, res, next) => {
  try {
    const schema = object().shape({
      recipient_id: number()
        .integer()
        .positive()
        .required('Recipient reference is required'),
      deliveryman_id: number()
        .integer()
        .positive()
        .required("Delivery person's reference required"),
      signature_id: number()
        .integer()
        .positive()
        .required('File reference is required'),
      end_date: date().required('delivery date final is required'),
      canceled_at: date(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res.status(403).json({
      error: {
        title: 'Validation failure',
        messages: err.inner.map(mes => mes.message),
      },
    });
  }
};
