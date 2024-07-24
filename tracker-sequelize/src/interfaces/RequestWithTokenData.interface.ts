import { Request } from 'express';

// @TODO: include the user Role too?
interface TokenData {
  userId: number;
  surveyId: number; // TODO: Allow null for username/password authentication.
  accessKeyId: number; // TODO: Allow null for username/password authentication.
}

interface RequestWithTokenData extends Request {
  token : TokenData;
}

export { RequestWithTokenData, TokenData };
