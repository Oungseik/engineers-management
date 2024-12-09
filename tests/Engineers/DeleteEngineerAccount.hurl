POST http://localhost:{{port}}/api/auth/engineers/register
{
  "name": "{{engineer_name}}",
  "email": "{{engineer_email}}",
  "password": "{{password}}",
  "nationality": "Mon"
}
HTTP 200


POST http://localhost:{{port}}/api/auth/engineers/login
{
  "email": "{{engineer_email}}",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.token"


DELETE http://localhost:{{port}}/api/auth/engineers
Authorization: Bearer {{token}}
{
  "password": "{{password}}"
}
HTTP 200
