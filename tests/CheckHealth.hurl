GET http://localhost:{{port}}/check-health
HTTP 200
[Asserts]
jsonpath "$.message" == "server is up and running"
