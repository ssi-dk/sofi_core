import { BasicQueryStringUtils, LocationLike } from "@openid/appauth";

export class NoHashQueryStringUtils extends BasicQueryStringUtils {
  parse(input: LocationLike) {
    return super.parse(input, false);
  }
}
