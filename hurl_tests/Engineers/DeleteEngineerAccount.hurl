POST {{server_url}}/api/auth/engineers/register
{
  "name": "{{engineer_name}}",
  "email": "{{engineer_email}}",
  "password": "{{password}}",
  "nationality": "Mon"
}
HTTP 200


POST {{server_url}}/api/auth/engineers/login
{
  "email": "{{engineer_email}}",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.token"


DELETE {{server_url}}/api/auth
Authorization: Bearer {{token}}
{
  "password": "{{password}}"
}
HTTP 200
