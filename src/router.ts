import { ALBEvent, ALBResult } from "aws-lambda";

type Handler = (event: ALBEvent) => ALBResult;

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
    for (var route of this.routes) {
      if (route.pattern === event.path) {
        return route.handler(event);
      }
    }
  }
}
