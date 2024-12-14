GET {{server_url}}/check-health
HTTP 200
[Asserts]
jsonpath "$.message" == "server is up and running"
