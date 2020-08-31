import { Router } from "./router";
import { ALBEvent, ALBResult } from "aws-lambda";

const buildHandler = (result: ALBResult = {} as ALBResult) => {
  const handler = jest.fn();
  handler.mockReturnValue(result);
  return handler;
};

describe("Router", () => {
  test("should route", () => {
    const router = new Router();
    const handler = buildHandler();

    router.get("/foo", handler);

    router.route({
      path: "/foo",
      httpMethod: "GET",
    } as ALBEvent);

    expect(handler).toHaveBeenCalled();
  });

  test("should route with path param", () => {
    const router = new Router();
    const handler = buildHandler();

    router.get("/user/:userId/profile", handler);

    const event = {
      path: "/user/1234/profile",
      httpMethod: "GET",
    } as ALBEvent;

    router.route(event);

    expect(handler).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(event, { userId: "1234" });
  });

  test("should return result from handler", () => {
    const router = new Router();
    const handlerResult = {} as ALBResult;
    const handler = buildHandler(handlerResult);

    router.get("/foo", handler);

    const result = router.route({
      path: "/foo",
      httpMethod: "GET",
    } as ALBEvent);

    expect(handler).toHaveBeenCalled();
    expect(result).toEqual(handlerResult);
  });

  test("should return 404 when route not found", () => {
    const router = new Router();

    const result = router.route({
      path: "/foo",
      httpMethod: "GET",
    } as ALBEvent);

    expect(result).toEqual({ statusCode: 404 });
  });
});
