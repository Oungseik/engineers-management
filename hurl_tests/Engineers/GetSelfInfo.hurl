POST {{server_url}}/api/auth/engineers/login
{
  "email": "{{engineer_email}}",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.token"


GET {{server_url}}/api/engineers/me
Authorization: Bearer {{token}}
HTTP 200
