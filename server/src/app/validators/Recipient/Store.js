import { object, string, number, boolean } from 'yup';

export default async (req, res, next) => {
  try {
    const schema = await object().shape({
      name: string()
        .strict(true)
        .required('Name is required'),
      street: string()
        .strict(true)
        .required('Street is required'),
      haveNumber: boolean().default(false),
      number: number()
        .integer()
        .positive()
        .when('haveNumber', (haveNumber, field) =>
          haveNumber ? field.required('Number is required') : field
        ),
      complement: string().strict(true),
      state: string()
        .strict(true)
        .required('State is required'),
      city: string()
        .strict(true)
        .required('City is required'),
      cep: string()
        .strict(true)
        .required('CEP is required'),
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
