export function onRequestGet() {
  return Response.json({
    status: "success",
    data: { hello: "world" },
  });
}
