import * as ambient from 'express-session'
import csurf from 'csurf';
import { NextFunction, Request, Response } from 'express'
import config, { logger, SECURITY_MODE_STANDALONE } from '../config'
import { PublicApi, Session } from '@ory/kratos-client'
import {
  AdminApi as HydraAdminApi,
  AcceptConsentRequest,
  AcceptLoginRequest,
  RejectRequest,
  ConsentRequestSession,
} from '@ory/hydra-client'
import { isString } from '../helpers'
import crypto from 'crypto'

// Client for interacting with Hydra's Admin API
const hydraClient = new HydraAdminApi({basePath: config.hydra.admin})

// Client for interacting with Kratos' Public and Admin API
const kratosClient = new PublicApi({basePath: config.kratos.public})

const redirectToLogin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    next(Error('Unable to used express-session'))
    return
  }

  // 3. Initiate login flow with ORY Kratos:
  //
  //   - `prompt=login` forces a new login from kratos regardless of browser sessions.
  //      This is important because we are letting Hydra handle sessions
  //   - `redirect_to` ensures that when we redirect back to this url,
  //      we will have both the initial ORY Hydra Login Challenge and the ORY Kratos Login Request ID in
  //      the URL query parameters.
  logger.info(
    'Initiating ORY Kratos Login flow because neither a ORY Kratos Login Request nor a valid ORY Kratos Session was found.'
  )

  const state = crypto.randomBytes(48).toString('hex')
  req.session['hydraLoginState'] = state
  req.session.save(error => {
    if (error) {
      next(error)
      return
    }

    const host = `${req.headers.host}`.replace(/\/$/, "")
    const base = `${host}${config.baseUrl}`.replace(/\/$/, "")
    logger.debug('Return to: ', {
      url: req.url,
      base: base,
      prot: `${req.protocol}`,
    })
    const returnTo = new URL(`${config.baseUrl.replace(/\/$/, "")}${req.url}`, `${req.protocol}://${base}`)
    returnTo.searchParams.set('hydra_login_state', state)
    logger.debug(`returnTo: "${returnTo.toString()}"`, returnTo)

    logger.debug('Performing redirect', {
      kratosBrowser: config.kratos.browser,
      url: '/self-service/login/browser',
      host: base
    });

    const redirectTo = new URL(
      `${config.kratos.browser}/self-service/login/browser`,
      `${req.protocol}://${host}`
    );
    redirectTo.searchParams.set('refresh', 'true')
    redirectTo.searchParams.set('return_to', returnTo.toString())

    logger.debug(`redirectTo: "${redirectTo.toString()}"`, redirectTo)

    res.redirect(redirectTo.toString())
  })
}

export const hydraLogin = (req: Request, res: Response, next: NextFunction) => {
  // The hydraChallenge represents the Hydra login_challenge query parameter.
  const hydraChallenge = req.query.login_challenge

  if (config.securityMode !== SECURITY_MODE_STANDALONE) {
    next(
      new Error(
        'Interaction with ORY Hydra only works in security standalone mode right now.'
      )
    )
    return
  }

  if (!hydraChallenge || !isString(hydraChallenge)) {
    const error = new Error(
      'ORY Hydra Login flow could not be completed because no ORY Hydra Login Challenge was found in the HTTP request.'
    )
    next(error)
    return
  }

  // 1. Parse Hydra hydraChallenge from query params
  // The hydraChallenge is used to fetch information about the login kratosRequest from ORY Hydra.
  // Means we have just been redirected from Hydra, and are on the login page
  // We must check the hydra session to see if we can skip login

  // 2. Call Hydra and check the session of this user
  return hydraClient
    .getLoginRequest(hydraChallenge)
    .then(({ data }) => {
      // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
      // the user.
      if (data.skip) {
        // You can apply logic here, for example update the number of times the user logged in...
        // Now it's time to grant the login kratosRequest. You could also deny the kratosRequest if something went terribly wrong
        // (e.g. your arch-enemy logging in...)
        const acceptLoginRequest: AcceptLoginRequest = {
          subject: String(data.subject),
          context: data,
        };

        logger.debug(
          'Accepting ORY Hydra Login Request because skip is true',
          acceptLoginRequest
        )

        return hydraClient
          .acceptLoginRequest(hydraChallenge, acceptLoginRequest)
          .then(({ data }) => {
            // All we need to do now is to redirect the user back to hydra!
            res.redirect(String(data.redirect_to))
          })
      }

      const hydraLoginState = req.query.hydra_login_state
      if (!hydraLoginState || !isString(hydraLoginState)) {
        logger.debug(
          'Redirecting to login page because hydra_login_state was not found in the HTTP URL query parameters.'
        )
        redirectToLogin(req, res, next)
        return
      }

      const kratosSessionCookie = req.cookies.ory_kratos_session
      if (!kratosSessionCookie) {
        // The state was set but we did not receive a session. Let's retry.
        logger.debug(
          'Redirecting to login page because no ORY Kratos session cookie was set.'
        )
        redirectToLogin(req, res, next)
        return
      }

      if (hydraLoginState !== req.session['hydraLoginState']) {
        // States mismatch, retry.
        logger.debug(
          'Redirecting to login page because login states do not match.'
        )
        redirectToLogin(req, res, next)
        return
      }
      // Figuring out the user
      req.headers['host'] = config.kratos.public.split('/')[2]
      return (
        kratosClient
          // We need to know who the user is for hydra
          .whoami(req.headers.cookie)
          .then(({ data: session }) => {
            // We need to get the email of the user. We don't want to do that via traits as
            // they are dynamic. They would be part of the PublicAPI. That's not true
            // for identity.addresses So let's get it via the AdmninAPI
            const subject = session.identity.id
            logger.debug("Forwarding kratos user to hydra", session)

            // User is authenticated, accept the LoginRequest and tell Hydra
            let acceptLoginRequest: AcceptLoginRequest = {
              subject: subject,
              context: session
            };

            return hydraClient
              .acceptLoginRequest(hydraChallenge, acceptLoginRequest)
              .then(({ data }) => {
                // All we need to do now is to redirect the user back to hydra!
                res.redirect(String(data.redirect_to))
              })
          })
      )
    })
    .catch(next)
}

const createHydraSession = (
  requestedScope: string[] = [],
  context: Session
) => {
  const verifiableAddresses = context.identity.verifiable_addresses || []
  if (
    requestedScope.indexOf('email') === -1 ||
    verifiableAddresses.length === 0
  ) {
    return {}
  }

  return {
    // This data will be available when introspecting the token. Try to avoid sensitive information here,
    // unless you limit who can introspect tokens. (Therefore the scope-check above)
    // access_token: { foo: 'bar' },

    // This data will be available in the ID token.
    // Most services need email-addresses, so let's include that.
    id_token: {
      ...context.identity.traits, // dump all traits into id token
      email: verifiableAddresses[0].value as Object, // FIXME Small typescript workaround caused by a bug in Go-swagger
    },
    access_token: {
      ...context.identity.traits, // dump all traits into id token
      email: verifiableAddresses[0].value as Object, // FIXME Small typescript workaround caused by a bug in Go-swagger
    },
  }
}

export const hydraGetConsent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Parses the URL query
  // The challenge is used to fetch information about the consent request from ORY Hydra.
  const challenge = req.query.consent_challenge

  if (!challenge || !isString(challenge)) {
    next(new Error('Expected consent_challenge to be set.'))
    return
  }

  hydraClient
    .getConsentRequest(challenge)
    // This will be called if the HTTP request was successful
    .then(({ data }) => {
      // If a user has granted this application the requested scope, hydra will tell us to not show the UI.
      if (data.skip) {
        // You can apply logic here, for example grant another scope, or do whatever...
        logger.debug("handling consent request", data)

        // The session allows us to set session data for id and access tokens. Let's add the email if it is included.
        const sesh = createHydraSession(
          data.requested_scope,
          data.context as Session
        );

        // Now it's time to grant the consent request. You could also deny the request if something went terribly wrong
        const acceptConsentRequest: AcceptConsentRequest = {
          // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
          // are requested accidentally.
          grant_scope: data.requested_scope,
          // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
          grant_access_token_audience: data.requested_access_token_audience,
          session: sesh
        };

        return hydraClient
          .acceptConsentRequest(challenge, acceptConsentRequest)
          .then(({ data }) => {
            // All we need to do now is to redirect the user back to hydra!
            res.redirect(String(data.redirect_to))
          })
      }

      // If consent can't be skipped we MUST show the consent UI.
      res.render('consent', {
        csrfToken: req.csrfToken(),
        challenge: challenge,
        // We have a bunch of data available from the response, check out the API docs to find what these values mean
        // and what additional data you have available.
        requested_scope: data.requested_scope,
        user: data.subject,
        client: data.client,
      })
    })
    // This will handle any error that happens when making HTTP calls to hydra
    .catch(next)
}

export const hydraPostConsent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // The challenge is now a hidden input field, so let's take it from the request body instead
  const challenge = req.body.challenge;

  // Let's see if the user decided to accept or reject the consent request..
  if (req.body.submit !== 'Allow access') {
    // Looks like the consent request was denied by the user
    const rejectConsentRequest: RejectRequest = {
      error: 'access_denied',
      error_description: 'The resource owner denied the request',
    };

    return (
      hydraClient
        .rejectConsentRequest(challenge, rejectConsentRequest)
        .then(({ data }) => {
          // All we need to do now is to redirect the browser back to hydra!
          res.redirect(String(data.redirect_to));
        })
        // This will handle any error that happens when making HTTP calls to hydra
        .catch(next)
    );
  }

  let grantScope = req.body.grant_scope;
  if (!Array.isArray(grantScope)) {
    grantScope = [grantScope];
  }

  // Seems like the user authenticated! Let's tell hydra...
  hydraClient
    .getConsentRequest(challenge)
    // This will be called if the HTTP request was successful
    .then(({ data }) => {
      const sesh = createHydraSession(data.requested_scope, data.context as Session) 
      const acceptConsentRequest: AcceptConsentRequest = {
        // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
        // are requested accidentally.
        grant_scope: grantScope,
        // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
        grant_access_token_audience: data.requested_access_token_audience,

        // This tells hydra to remember this consent request and allow the same client to request the same
        // scopes from the same user, without showing the UI, in the future.
        remember: Boolean(req.body.remember),

        // When this "remember" sesion expires, in seconds. Set this to 0 so it will never expire.
        remember_for: 0,

        // The session allows us to set session data for id and access tokens. Let's add the email if it is included.
        session: sesh
      };

      return hydraClient.acceptConsentRequest(challenge, acceptConsentRequest);
    })
    .then(({ data }) => {
      // All we need to do now is to redirect the user back to hydra!
      res.redirect(String(data.redirect_to));
    })
    // This will handle any error that happens when making HTTP calls to hydra
    .catch(next);
};
