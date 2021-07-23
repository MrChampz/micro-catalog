import {Provider} from "@loopback/core";
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer
} from "@loopback/authorization";

export class SubscriberAuthorizationProvider implements Provider<Authorizer> {
  value() {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata
  ) {
    const allowedRoles = metadata.allowedRoles;
    const userRoles = authorizationCtx.principals[0].roles;
    return allowedRoles && allowedRoles.find(r => userRoles.includes(r))
      ? AuthorizationDecision.ALLOW
      : AuthorizationDecision.DENY;
  }
}