POST {{server_url}}/api/auth/engineers/login
{
  "email": "{{engineer_email}}",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.token"


POST {{server_url}}/api/engineers/me/profile/upload
Authorization: bearer {{token}}
[MultipartFormData]
files: file,ME.jpg; image/jpeg
HTTP 200
