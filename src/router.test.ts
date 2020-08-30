import { Router } from "./router";
import { ALBEvent, ALBResult } from "aws-lambda";

describe("router", () => {
  test("route", () => {
    const router = new Router();
    const handler = jest.fn();
    const handlerResult = {} as ALBResult;
    handler.mockReturnValue(handlerResult);

    router.get("/foo", handler);

    const result = router.route({
      path: "/foo",
      httpMethod: "GET",
    } as ALBEvent);

    expect(handler).toHaveBeenCalled();
    expect(result).toEqual(handlerResult);
  });
});
