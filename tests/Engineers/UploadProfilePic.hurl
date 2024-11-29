POST http://localhost:{{port}}/api/auth/engineers/login
{
  "email": "oung@gmail.com",
  "password": "hello, world"
}
HTTP 200
[Captures]
token: jsonpath "$.token"


POST http://localhost:{{port}}/api/engineers/me/profile/upload
Authorization: bearer {{token}}
[MultipartFormData]
files: file,/home/oung/Downloads/ME.jpg; image/jpeg
HTTP 200
