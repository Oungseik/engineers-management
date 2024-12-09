# register an account
POST {{server_url}}/api/auth/engineers/register
{
  "name": "{{engineer_name}}",
  "email": "{{engineer_email}}",
  "password": "{{password}}",
  "nationality": "Mon"
}
HTTP 200


# ------------------------------------------------------------
# register an account with already used email
POST {{server_url}}/api/auth/engineers/register
{
  "name": "{{engineer_name}}",
  "email": "{{engineer_email}}",
  "password": "{{password}}",
  "nationality": "Mon"
}
HTTP 422


# ------------------------------------------------------------
# register an account with invalid field
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


# ------------------------------------------------------------
# login an account and store the token, then delete the account as a clean-up process
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
