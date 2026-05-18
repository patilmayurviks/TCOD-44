
# Stage 1

## Overview

The notification platform is designed for students to receive real-time updates related to placements, events, and results.

The system supports:
- Creating notifications
- Fetching notifications
- Marking notifications as read
- Deleting notifications
- Real-time notification delivery

---

## Base URL

```text
/api/v1
```

---

## 1. Get All Notifications

### Endpoint

```http
GET /api/v1/notifications
```

### Headers

```json
{
  "Content-Type": "application/json"
}
```

### Response

```json
{
  "success": true,
  "notifications": [
    {
      "id": "1",
      "student_id": "TCOD-44",
      "type": "Placement",
      "message": "TCS Hiring Drive",
      "is_read": false,
      "created_at": "2026-05-18T10:00:00Z"
    }
  ]
}
```

---

## 2. Create Notification

### Endpoint

```http
POST /api/v1/notifications
```

### Request Body

```json
{
  "student_id": "TCOD-44",
  "type": "Placement",
  "message": "Infosys Hiring"
}
```

### Response

```json
{
  "success": true,
  "message": "Notification created successfully"
}
```

---

## 3. Mark Notification as Read

### Endpoint

```http
PATCH /api/v1/notifications/:id/read
```

### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 4. Delete Notification

### Endpoint

```http
DELETE /api/v1/notifications/:id
```

### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Real-Time Notification Mechanism

The application uses WebSockets through Socket.IO for real-time notifications.

### Advantages

- Instant notification delivery
- Reduced API polling
- Better user experience
- Efficient real-time communication

# Stage 2

## Database Choice

PostgreSQL is chosen as the database because:

- Strong relational support
- ACID compliance
- Efficient indexing
- Better scalability
- Strong querying support

---

## Database Schema

### notifications Table

| Column Name | Data Type |
|-------------|-----------|
| id | UUID |
| student_id | VARCHAR |
| type | VARCHAR |
| message | TEXT |
| is_read | BOOLEAN |
| created_at | TIMESTAMP |

---

## Sample SQL Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id VARCHAR(50),
    type VARCHAR(20),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Scaling Problems

As notification volume increases, the following issues may occur:

- Slow query execution
- Increased storage requirements
- High DB load
- Delayed response times

---

## Solutions

### 1. Indexing
Indexes improve search performance.

### 2. Pagination
Fetch limited records instead of all notifications.

### 3. Database Partitioning
Split large tables into smaller partitions.

### 4. Redis Caching
Store frequently accessed notifications.

### 5. Read Replicas
Separate read operations from write operations.
# Stage 3

## Given Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

---

## Problems in Query

### 1. SELECT *
Fetching all columns increases unnecessary data transfer.

### 2. Missing Index
Without indexes, the database performs full table scans.

### 3. Sorting Cost
ORDER BY becomes expensive on large datasets.

---

## Optimized Query

```sql
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = 1042
AND is_read = false
ORDER BY created_at DESC
LIMIT 50;
```

---

## Recommended Index

```sql
CREATE INDEX idx_notifications
ON notifications(student_id, is_read, created_at DESC);
```

---

## Why Not Add Indexes on Every Column?

Adding indexes on every column:

- Increases storage usage
- Slows insert operations
- Reduces write performance

Indexes should only be created on frequently queried columns.

---

## Query to Find Placement Notifications

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```# Stage 4

## Problem

Notifications are fetched from the database on every page load which increases database load and reduces performance.

---

## Solutions

### 1. Redis Caching

Store recent notifications in Redis to reduce database queries.

### 2. Pagination

Fetch notifications page by page instead of loading everything at once.

### 3. Lazy Loading

Load additional notifications only when the user scrolls.

### 4. WebSockets

Push real-time notifications directly to users instead of frequent polling.

### 5. Read Replicas

Use separate database replicas for read operations.

---

## Tradeoffs

| Solution | Advantages | Disadvantages |
|----------|-------------|---------------|
| Redis | Faster reads | Additional infrastructure |
| Pagination | Reduced load | Multiple requests |
| WebSockets | Real-time updates | Persistent connections |
| Read Replicas | Better scalability | Replication complexity |
# Stage 5

## Problems in Existing Implementation

The current implementation processes notifications sequentially which causes:

- Slow execution
- Blocking operations
- Failure handling issues
- No retry mechanism
- Poor scalability

---

## Improved Architecture

The system should use asynchronous processing with queues.

### Recommended Tools

- RabbitMQ
- BullMQ
- Kafka

---

## Improved Workflow

1. HR clicks Notify All
2. Notification jobs are pushed into a queue
3. Workers process notifications asynchronously
4. Emails and push notifications are sent independently

---

## Why DB Save and Email Should Be Separate

Database operations and external email APIs should not be part of the same transaction because:

- Email APIs may fail
- Long transactions reduce DB performance
- Retry handling becomes difficult

---

## Revised Pseudocode

```js
async function notifyAll(studentIds, message) {

    for (const studentId of studentIds) {

        await notificationQueue.add({
            studentId,
            message
        });
    }
}
```