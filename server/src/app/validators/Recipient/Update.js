import { object, string, number, boolean } from 'yup';

export default async (req, res, next) => {
  try {
    const schema = object().shape({
      name: string().strict(true),
      street: string().strict(true),
      haveNumber: boolean().default(false),
      number: number()
        .integer()
        .positive()
        .when('haveNumber', (haveNumber, field) =>
          haveNumber ? field.required('Number is required') : field
        ),
      complement: string().strict(true),
      state: string().strict(true),
      city: string().strict(true),
      cep: string().strict(true),
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
