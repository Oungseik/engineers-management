POST {{server_url}}/api/auth/engineers/register
{
  "name": "{{engineer_name}}",
  "email": "{{engineer_email}}",
  "password": "{{password}}",
  "nationality": "Mon"
}
HTTP 200


POST {{server_url}}/api/auth/engineers/register
{
  "name": "{{engineer_name}}",
  "email": "{{engineer_email}}",
  "password": "{{password}}",
  "nationality": "Mon"
}
HTTP 422


POST {{server_url}}/api/auth/engineers/register
{
  "name": "{{engineer_name}}",
  "email": "{{engineer_email}}",
  "password": "InvalidPassword",
  "nationality": "Mon"
}
HTTP 400
[Asserts]
jsonpath "$.issues[0].path[0]" == "password" 


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
