# Pomodoro API

Backend da aplicação Chronos Pomodoro, construído com Node.js, Express, Prisma e MySQL.

## Tecnologias

- Node.js + TypeScript
- Express
- Prisma ORM (v5)
- MySQL

## Instalação

```bash
npm install
```

Configure o arquivo `.env` com suas credenciais:

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/pomodoro_db"
PORT=3333
```

Crie o banco de dados no MySQL:

```sql
CREATE DATABASE pomodoro_db;
```

Rode a migration:

```bash
npx prisma migrate dev --name init
```

Inicie o servidor:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`.

---

## Endpoints

### Health

#### `GET /health`
Verifica se a API está no ar.

**Resposta:**
```json
{ "ok": true }
```

---

### Settings

#### `GET /settings`
Retorna as configurações do Pomodoro. Se não existirem, retorna os valores padrão.

**Resposta:**
```json
{
  "id": 1,
  "workTime": 25,
  "shortBreakTime": 5,
  "longBreakTime": 15,
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

#### `PUT /settings`
Atualiza as configurações do Pomodoro.

**Body:**
```json
{
  "workTime": 30,
  "shortBreakTime": 5,
  "longBreakTime": 20
}
```

**Resposta:**
```json
{
  "id": 1,
  "workTime": 30,
  "shortBreakTime": 5,
  "longBreakTime": 20,
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

**Erros:**
- `400` — Valores inválidos (não inteiros)

---

### Tasks

#### `GET /tasks`
Retorna todas as tarefas ordenadas por data de início (mais recentes primeiro).

**Resposta:**
```json
[
  {
    "id": "1700000000000",
    "name": "Estudar React",
    "duration": 25,
    "type": "workTime",
    "startDate": 1700000000000,
    "completeDate": 1700001500000,
    "interruptDate": null,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

#### `POST /tasks`
Cria uma nova tarefa.

**Body:**
```json
{
  "id": "1700000000000",
  "name": "Estudar React",
  "duration": 25,
  "type": "workTime",
  "startDate": 1700000000000
}
```

**Resposta:** `201` com a tarefa criada.

---

#### `PATCH /tasks/:id/complete`
Marca uma tarefa como concluída.

**Body:**
```json
{
  "completeDate": 1700001500000
}
```

**Resposta:** Tarefa atualizada.

---

#### `PATCH /tasks/:id/interrupt`
Marca uma tarefa como interrompida.

**Body:**
```json
{
  "interruptDate": 1700000800000
}
```

**Resposta:** Tarefa atualizada.

---

#### `DELETE /tasks`
Remove todas as tarefas do histórico.

**Resposta:** `204 No Content`

---

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npm run build` | Compila o TypeScript |
| `npm start` | Inicia o servidor em produção |
| `npm run prisma:migrate` | Roda as migrations |
| `npm run prisma:studio` | Abre o Prisma Studio |
