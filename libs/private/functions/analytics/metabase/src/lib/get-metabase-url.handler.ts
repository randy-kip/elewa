import 'dotenv/config'

import * as jwt from 'jsonwebtoken';

import { FunctionHandler, FunctionContext } from '@ngfi/functions';
import { HandlerTools } from '@iote/cqrs';
import { User } from '@iote/bricks';

import { iTalUser } from '@app/model/user';

/** This handler is responsible for creating an authenticated jwt token
 * for the metabase ebedded iframe source.
 */

export class GetMetabaseUrlHandler extends FunctionHandler<User, string>
{
  public async execute(user: iTalUser, context: FunctionContext, tools: HandlerTools)
  {
    // Load environment variables from the context
    const environment = context.environment as any;

    const METABASE_SITE_URL = process.env.METABASE_SITE_URL;
    const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;

    tools.Logger.log(() => `Setting up metabase url for User: ${JSON.stringify(user.uid)}`);

    const displayname = user.displayName!.split(' ');

    //Define user's payload containing user's relevant details.
    const payload = {
      email: user.email,
      id: user.uid,
      org_id: user.activeOrg,
      first_name: displayname[0],
      last_name: displayname[1],
      groups: ["CLM"],
      exp: Math.round(Date.now() / 1000) + (525600 * 60 * 100), // 100 years expiration
    };

    //Sign the jwt with secret key provided by metabase.
    const token = jwt.sign(payload, METABASE_SECRET_KEY);

    const iframeUrl = `${METABASE_SITE_URL}/auth/sso?jwt=${token}&return_to=${encodeURIComponent(METABASE_SITE_URL)}`;

    return iframeUrl;
  }
}
