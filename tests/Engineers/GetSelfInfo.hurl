POST http://localhost:{{port}}/api/auth/login/engineer
{
  "email": "oung@gmail.com",
  "password": "hello, world"
}
HTTP 200
[Captures]
token: jsonpath "$.token"


GET http://localhost:{{port}}/api/engineers/me
Authorization: Bearer {{token}}
HTTP 200
