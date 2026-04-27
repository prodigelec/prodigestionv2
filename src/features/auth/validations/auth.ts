import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'L\'adresse email est requise.',
    'string.email': 'Veuillez entrer une adresse email valide.',
    'any.required': 'L\'adresse email est requise.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Le mot de passe est requis.',
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères.',
    'any.required': 'Le mot de passe est requis.',
  }),
});

export type LoginInput = {
  email?: string;
  password?: string;
};
