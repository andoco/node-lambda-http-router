import { Router } from "./router";
import { ALBEvent, ALBResult } from "aws-lambda";

const buildHandler = (result: ALBResult = {} as ALBResult) => {
  const handler = jest.fn();
  handler.mockReturnValue(result);
  return handler;
};

describe("Router", () => {
  test("should route plain path", () => {
    const router = new Router();
    const handler = buildHandler();

    router.get("/foo", handler);

    router.route({
      path: "/foo",
      httpMethod: "GET",
    } as ALBEvent);

    expect(handler).toHaveBeenCalled();
  });

  test("should not route partial path match", () => {
    const router = new Router();
    const handler = buildHandler();

    router.get("/foo", handler);

    const result = router.route({
      path: "/foo/bar",
      httpMethod: "GET",
    } as ALBEvent);

    expect(handler).not.toHaveBeenCalled();
    expect(result).toEqual({ statusCode: 404 });
  });

  test("should not route different http method", () => {
    const router = new Router();
    const handler = buildHandler();

    router.get("/foo", handler);

    const result = router.route({
      path: "/foo",
      httpMethod: "POST",
    } as ALBEvent);

    expect(handler).not.toHaveBeenCalled();
    expect(result).toEqual({ statusCode: 404 });
  });

  test("should route to correct method", () => {
    const router = new Router();

    const handlers = {
      get: buildHandler(),
      post: buildHandler(),
      put: buildHandler(),
      patch: buildHandler(),
      delete: buildHandler(),
    };

    router
      .get("/foo", handlers.get)
      .post("/foo", handlers.post)
      .put("/foo", handlers.put)
      .patch("/foo", handlers.patch)
      .delete("/foo", handlers.delete);

    for (const key in handlers) {
      router.route({
        path: "/foo",
        httpMethod: key.toUpperCase(),
      } as ALBEvent);

      expect(handlers[key]).toHaveBeenCalled();

      handlers[key].mockClear();
    }
  });

  test("should route with path params", () => {
    const router = new Router();
    const handler = buildHandler();

    router.get("/user/:userId/post/:postId", handler);

    const event = {
      path: "/user/1234/post/abcd",
      httpMethod: "GET",
    } as ALBEvent;

    router.route(event);

    expect(handler).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(event, {
      userId: "1234",
      postId: "abcd",
    });
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
