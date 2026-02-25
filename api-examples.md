# SynapseMail API Examples

## Authentication

### Login
`POST /auth/login`
```json
{
  "email": "admin@synapse.com",
  "password": "adminPassword123!"
}
```

## Mail Operations

### Send Mail
`POST /mail/send` (Requires JWT)
```json
{
  "recipientEmail": "john@synapse.com",
  "subject": "Project Update",
  "body": "Hi John, the production migration is complete.",
  "attachments": []
}
```

### Get Inbox
`GET /mail/inbox` (Requires JWT)

### Delete Mail
`DELETE /mail/:id` (Requires JWT)

## Admin Operations

### Create Employee
`POST /admin/create-user` (Requires Super Admin JWT)
```json
{
  "email": "jane@synapse.com",
  "name": "Jane Doe",
  "password": "user123!",
  "role": "employee",
  "storageLimit": 1073741824
}
```

### Dashboard Stats
`GET /admin/stats` (Requires Admin JWT)

## Attachments

### Upload
`POST /attachment/upload` (Form-data: file)

### Download
`GET /attachment/:id`
