POST http://localhost:{{port}}/api/auth/engineers/login
{
  "email": "{{engineer_email}}",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.token"


POST http://localhost:{{port}}/api/engineers/me/profile/upload
Authorization: bearer {{token}}
[MultipartFormData]
files: file,ME.jpg; image/jpeg
HTTP 200
