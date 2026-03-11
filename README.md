## User/Role API (Express + In-Memory)

### Cài đặt & chạy

- **Yêu cầu**: Node.js (KHÔNG cần database)
- **Cài package**:

```bash
npm install
```

- **Tạo file `.env`** (tham khảo `env.example`):
  - `PORT=3000`

> Dữ liệu lưu **trong RAM** và sẽ **mất khi restart server**.

- **Chạy dev**:

```bash
npm run dev
```

### Giao diện web (UI)

- Mở trình duyệt:
  - `http://localhost:3000/`
  - Nếu port 3000 bị chiếm, server sẽ tự nhảy sang `3001`, `3002`, ... (xem log `Server listening on port ...`)

### Models

- **User**
  - `username`: string, unique, required
  - `password`: string, required
  - `email`: string, unique, required
  - `fullName`: string, default `""`
  - `avatarUrl`: string, default `"https://i.sstatic.net/l60Hf.png"`
  - `status`: boolean, default `false`
  - `roleId`: number (FK ref `Role.id`)
  - `loginCount`: int, default `0`, min `0`
  - `timestamps`: `createdAt`, `updatedAt`
  - **soft delete**: `isDeleted`, `deletedAt`

- **Role**
  - `name`: string, unique, required
  - `description`: string, default `""`
  - `timestamps`: `createdAt`, `updatedAt`
  - **soft delete**: `isDeleted`, `deletedAt`

### API

#### Role CRUD (xoá mềm)

- **Create**: `POST /roles`

```json
{ "name": "admin", "description": "Administrator" }
```

- **Get all**: `GET /roles`
- **Get by id**: `GET /roles/:id`
- **Update**: `PUT /roles/:id`
- **Soft delete**: `DELETE /roles/:id`

#### User CRUD (xoá mềm)

- **Create**: `POST /users`

```json
{ "username": "kiet", "password": "123", "email": "kiet@gmail.com", "roleId": 1 }
```

- **Get all**: `GET /users`
- **Get by id**: `GET /users/:id`
- **Update**: `PUT /users/:id`
- **Soft delete**: `DELETE /users/:id`

> API luôn trả về user **không có** trường `password`.

#### Enable/Disable theo email + username

- **Enable**: `POST /users/enable`

```json
{ "email": "kiet@gmail.com", "username": "kiet" }
```

- **Disable**: `POST /users/disable`

```json
{ "email": "kiet@gmail.com", "username": "kiet" }
```

#### Lấy users theo role

- **Get users by role**: `GET /roles/:id/users`


