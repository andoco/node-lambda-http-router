import { ALBEvent, ALBResult } from "aws-lambda";

type Handler = (event: ALBEvent, pathParams: object) => ALBResult;

class Route {
  constructor(
    public pattern: string,
    public method: string,
    public handler: Handler
  ) {}
}

export class Router {
  routes: Array<Route> = [];

  get(pattern: string, handler: Handler) {
    this.routes.push(new Route(pattern, "GET", handler));
  }

  route(event: ALBEvent): ALBResult {
    const pathParts = event.path.split("/");

    for (var route of this.routes) {
      const { matched, params } = this.matchToRoute(pathParts, route);

      if (matched && event.httpMethod === route.method) {
        return route.handler(event, params);
      }
    }

    return { statusCode: 404 };
  }

  private matchToRoute(
    pathParts: Array<string>,
    route: Route
  ): { matched: boolean; params: object } {
    const routeParts = route.pattern.split("/");
    const minParts = Math.min(pathParts.length, routeParts.length);
    const params = {};

    for (var i = 0; i < minParts; i++) {
      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].substring(1)] = pathParts[i];
      } else if (pathParts[i] !== routeParts[i]) {
        return { matched: false, params: null };
      }
    }

    return { matched: true, params: params };
  }
}
