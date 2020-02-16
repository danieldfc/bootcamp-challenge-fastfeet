import { object, string, number, date } from 'yup';

export default async (req, res, next) => {
  try {
    const schema = object().shape({
      product: string()
        .strict(true)
        .required('Product is required'),
      recipient_id: number()
        .integer()
        .positive()
        .required('Recipient reference is required'),
      deliveryman_id: number()
        .integer()
        .positive()
        .required("Delivery person's reference required"),
      start_date: date(),
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
