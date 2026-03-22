# SkillSwap Network - Complete System Architecture & Frontend Flow

## 📊 Database Schema (Prisma)

### Core Models & Relationships

```
User (Core User Account)
├── id: UUID (Primary Key)
├── name: String
├── email: String (Unique)
├── password: String (Hashed)
├── bio: String? (Optional profile description)
├── avatarUrl: String? (Profile picture URL)
├── createdAt: DateTime
├── updatedAt: DateTime
├── Relations:
│   ├── skillsOffered: SkillOffered[] (1-to-Many)
│   ├── skillsWanted: SkillWanted[] (1-to-Many)
│   ├── initiatedSwaps: Swap[] (Relation: "Initiator")
│   ├── receivedSwaps: Swap[] (Relation: "Receiver")
│   ├── sessions: Session[] (1-to-Many)
│   ├── messagesSent: Message[] (Relation: "Sender")
│   ├── messagesReceived: Message[] (Relation: "Receiver")
│   ├── reviewsGiven: Review[] (Relation: "Reviewer")
│   ├── reviewsReceived: Review[] (Relation: "Reviewee")
│   └── refreshTokens: RefreshToken[] (1-to-Many, Cascade Delete)

SkillOffered (Skills User Can Teach)
├── id: UUID (Primary Key)
├── name: String (Skill name)
├── userId: String (Foreign Key → User.id)
└── user: User (Relation)

SkillWanted (Skills User Wants to Learn)
├── id: UUID (Primary Key)
├── name: String (Skill name)
├── userId: String (Foreign Key → User.id)
└── user: User (Relation)

Swap (Skill Exchange Request)
├── id: UUID (Primary Key)
├── initiatorId: String (User who starts the swap)
├── receiverId: String (User receiving the swap request)
├── skillOffered: String (What initiator teaches)
├── skillWanted: String (What initiator wants to learn)
├── status: SwapStatus enum (PENDING | ACCEPTED | REJECTED | CANCELLED)
├── createdAt: DateTime
├── updatedAt: DateTime
├── Relations:
│   ├── initiator: User (Foreign Key)
│   ├── receiver: User (Foreign Key)
│   ├── sessions: Session[] (1-to-Many)
│   └── messages: Message[] (1-to-Many)

Session (Learning Session/Meeting)
├── id: UUID (Primary Key)
├── swapId: String (Foreign Key → Swap.id)
├── userId: String (User attending the session)
├── scheduledAt: DateTime (Meeting time)
├── meetLink: String? (Zoom/Google Meet link)
├── status: SessionStatus enum (SCHEDULED | COMPLETED | CANCELLED)
├── createdAt: DateTime
├── updatedAt: DateTime
├── Relations:
│   ├── swap: Swap (Foreign Key)
│   ├── user: User (Foreign Key)
│   └── review: Review? (1-to-1, Optional - one review per session)

Message (Real-time Chat)
├── id: UUID (Primary Key)
├── swapId: String (Foreign Key → Swap.id)
├── senderId: String (Foreign Key → User.id)
├── receiverId: String (Foreign Key → User.id)
├── content: String (Message text)
├── createdAt: DateTime
├── Relations:
│   ├── swap: Swap (Foreign Key)
│   ├── sender: User (Foreign Key)
│   └── receiver: User (Foreign Key)

Review (User Rating/Feedback)
├── id: UUID (Primary Key)
├── reviewerId: String (Who gave the review)
├── revieweeId: String (Who received the review)
├── sessionId: String (Foreign Key → Session.id, Unique)
├── rating: Int (1-5 scale)
├── comment: String? (Optional feedback text)
├── createdAt: DateTime
├── Relations:
│   ├── reviewer: User (Foreign Key)
│   ├── reviewee: User (Foreign Key)
│   └── session: Session (Foreign Key)

RefreshToken (JWT Token Management)
├── id: UUID (Primary Key)
├── token: String (Unique)
├── userId: String (Foreign Key → User.id)
├── expiresAt: DateTime
├── createdAt: DateTime
└── user: User (Relation, Cascade Delete)
```

---

## 🔐 Authentication Flow

### 1. **User Registration**
```
Frontend Request:
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Validation (Zod Schema):
- name: min 2 characters
- email: valid email format
- password: min 6 characters

Backend Process:
1. Hash password using bcrypt
2. Create User record in database
3. Generate JWT Access Token (expires in 15min typically)
4. Create Refresh Token record + store in DB with expiry
5. Return Access Token in response body
6. Set Refresh Token as HttpOnly cookie (cannot be accessed by JS)

Success Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-123",
      "name": "John Doe",
      "email": "john@example.com",
      "bio": null,
      "avatarUrl": null,
      "createdAt": "2026-03-22T10:00:00Z",
      "updatedAt": "2026-03-22T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}

Cookies Set:
- refreshToken: [HttpOnly Cookie, Secure, SameSite=Strict, maxAge=7 days]
```

### 2. **User Login**
```
Frontend Request:
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Backend Process:
1. Find user by email
2. Verify password hash matches
3. Generate new Access Token
4. Generate/rotate Refresh Token
5. Store new refresh token in DB
6. Set cookie and return token

Response (200 OK):
Same structure as registration
```

### 3. **Token Refresh**
```
Frontend Request:
POST /api/auth/refresh
Cookies: refreshToken=[value from cookie]

Backend Process:
1. Read refreshToken from HttpOnly cookie (browser sends automatically)
2. Verify token signature & expiry
3. Check token exists in RefreshToken table
4. Generate new Access Token
5. Rotate Refresh Token (create new one, invalidate old)
6. Update RefreshToken in database

Response (200 OK):
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}

New Refresh Cookie automatically set
```

### 4. **User Logout**
```
Frontend Request:
POST /api/auth/logout
Cookies: refreshToken=[value]

Backend Process:
1. Read refreshToken from cookie
2. Delete token record from RefreshToken table
3. Clear refreshToken cookie from browser

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Security Features:**
- Passwords hashed with bcrypt
- Access Token stored in memory (short-lived, ~15 min)
- Refresh Token stored as HttpOnly cookie (long-lived, ~7 days, protected from XSS)
- SameSite=Strict prevents CSRF attacks
- Secure flag ensures HTTPS only in production

---

## 👤 User Management Flow

### 1. **Get Current User Profile**
```
Frontend Request:
GET /api/users/me
Authorization: Bearer [accessToken]

Backend Process:
1. AuthMiddleware: Extract & verify access token from Authorization header
2. Query User record by userId from JWT payload
3. Include all relations (skills offered/wanted)

Response (200 OK):
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid-123",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Teaching React and Python",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2026-03-22T10:00:00Z",
    "updatedAt": "2026-03-22T10:00:00Z"
  }
}
```

### 2. **Update User Profile**
```
Frontend Request:
PUT /api/users/me
Authorization: Bearer [accessToken]
Content-Type: application/json

{
  "name": "John Developer",
  "bio": "Expert in MERN Stack",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}

Validation (Zod Schema):
- name: min 2 characters (optional)
- bio: max 500 characters (optional)
- avatarUrl: valid URL format (optional)

Response (200 OK):
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid-123",
    "name": "John Developer",
    "email": "john@example.com",
    "bio": "Expert in MERN Stack",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "updatedAt": "2026-03-22T11:00:00Z"
  }
}
```

### 3. **Get All Users (Browse)**
```
Frontend Request:
GET /api/users/
(Optional - No auth required to view user list)

Response (200 OK):
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "uuid-123",
      "name": "John Doe",
      "email": "john@example.com",
      "bio": "Teaching React and Python",
      "avatarUrl": "https://example.com/avatar.jpg",
      "createdAt": "2026-03-22T10:00:00Z",
      "updatedAt": "2026-03-22T10:00:00Z"
    },
    ...
  ]
}
```

### 4. **Get Specific User Profile**
```
Frontend Request:
GET /api/users/:id

Response (200 OK):
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid-456",
    "name": "Jane Smith",
    "bio": "Learning Web Development",
    "avatarUrl": "https://example.com/jane.jpg",
    ...
  }
}
```

### 5. **Delete Account**
```
Frontend Request:
DELETE /api/users/me
Authorization: Bearer [accessToken]

Backend Process:
1. Delete all associated data (due to cascade deletes in Prisma)
2. Remove User record from database
3. Clear refresh tokens

Response (200 OK):
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

## 🎯 Skills Management Flow

### 1. **Add Skills Offered (What User Can Teach)**
```
Frontend Request:
POST /api/users/skills/offered
Authorization: Bearer [accessToken]
Content-Type: application/json

{
  "skills": ["React", "Node.js", "TypeScript"]
}

Validation:
- skills: array of strings, each min 2 characters, at least 1 skill required

Backend Process:
1. For each skill, create SkillOffered record linked to user
2. Multiple calls create multiple skill records

Response (201 Created):
{
  "success": true,
  "message": "Offered skills added successfully",
  "data": [
    {
      "id": "uuid-skill-1",
      "name": "React",
      "userId": "uuid-123"
    },
    {
      "id": "uuid-skill-2",
      "name": "Node.js",
      "userId": "uuid-123"
    },
    {
      "id": "uuid-skill-3",
      "name": "TypeScript",
      "userId": "uuid-123"
    }
  ]
}
```

### 2. **Add Skills Wanted (What User Wants to Learn)**
```
Frontend Request:
POST /api/users/skills/wanted
Authorization: Bearer [accessToken]
Content-Type: application/json

{
  "skills": ["Python", "Machine Learning"]
}

Response (201 Created):
{
  "success": true,
  "message": "Wanted skills added successfully",
  "data": [
    {
      "id": "uuid-skill-4",
      "name": "Python",
      "userId": "uuid-123"
    },
    {
      "id": "uuid-skill-5",
      "name": "Machine Learning",
      "userId": "uuid-123"
    }
  ]
}
```

### 3. **Get My Skills**
```
Frontend Request:
GET /api/users/skills/me
Authorization: Bearer [accessToken]

Response (200 OK):
{
  "success": true,
  "message": "Skills fetched successfully",
  "data": {
    "skillsOffered": [
      { "id": "uuid-skill-1", "name": "React", "userId": "uuid-123" },
      { "id": "uuid-skill-2", "name": "Node.js", "userId": "uuid-123" }
    ],
    "skillsWanted": [
      { "id": "uuid-skill-4", "name": "Python", "userId": "uuid-123" }
    ]
  }
}
```

### 4. **Remove Skill Offered**
```
Frontend Request:
DELETE /api/users/skills/offered/:skillId
Authorization: Bearer [accessToken]

Backend Process:
1. Delete SkillOffered record by ID
2. Verify ownership (skill belongs to authenticated user)

Response (200 OK):
{
  "success": true,
  "message": "Skill removed successfully",
  "data": null
}
```

### 5. **Remove Skill Wanted**
```
Frontend Request:
DELETE /api/users/skills/wanted/:skillId
Authorization: Bearer [accessToken]

Response (200 OK):
{
  "success": true,
  "message": "Skill removed successfully",
  "data": null
}
```

---

## 🔄 Swap (Skill Exchange) Flow

### 1. **Browse Available Users for Swaps**
```
Frontend Request:
GET /api/swaps/
Authorization: Bearer [accessToken]

Backend Process:
1. Return all users except current user
2. Include their skills offered/wanted

Response (200 OK):
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "uuid-456",
      "name": "Jane Smith",
      "bio": "Learning Web Development",
      "avatarUrl": "...",
      "skillsOffered": [
        { "id": "...", "name": "Python" },
        { "id": "...", "name": "Data Science" }
      ],
      "skillsWanted": [
        { "id": "...", "name": "React" }
      ]
    },
    ...
  ]
}
```

### 2. **Send Swap Request**
```
Frontend Request:
POST /api/swaps/
Authorization: Bearer [accessToken]
Content-Type: application/json

{
  "receiverId": "uuid-456"
}

Backend Process:
1. Create Swap record with:
   - initiatorId: current user
   - receiverId: selected user
   - skillOffered: (what initiator offers - from profile)
   - skillWanted: (what initiator wants - from profile)
   - status: PENDING
2. Notify receiver in real-time (Socket.io)

Response (201 Created):
{
  "success": true,
  "message": "Swap request sent successfully",
  "data": {
    "id": "uuid-swap-1",
    "initiatorId": "uuid-123",
    "receiverId": "uuid-456",
    "skillOffered": "React",
    "skillWanted": "Python",
    "status": "PENDING",
    "createdAt": "2026-03-22T10:00:00Z",
    "updatedAt": "2026-03-22T10:00:00Z"
  }
}
```

### 3. **Get Incoming Swap Requests**
```
Frontend Request:
GET /api/swaps/incoming
Authorization: Bearer [accessToken]

Backend Process:
1. Query Swaps where receiverId = current user
2. Include initiator details
3. Filter by status

Response (200 OK):
{
  "success": true,
  "message": "Incoming swaps fetched successfully",
  "data": [
    {
      "id": "uuid-swap-1",
      "initiatorId": "uuid-123",
      "receiverId": "uuid-456",
      "skillOffered": "React",
      "skillWanted": "Python",
      "status": "PENDING",
      "createdAt": "2026-03-22T10:00:00Z",
      "initiator": {
        "id": "uuid-123",
        "name": "John Doe",
        "bio": "Teaching React",
        "avatarUrl": "..."
      }
    }
  ]
}
```

### 4. **Get Outgoing Swap Requests**
```
Frontend Request:
GET /api/swaps/outgoing
Authorization: Bearer [accessToken]

Backend Process:
1. Query Swaps where initiatorId = current user
2. Include receiver details

Response (200 OK):
{
  "success": true,
  "message": "Outgoing swaps fetched successfully",
  "data": [
    {
      "id": "uuid-swap-1",
      "initiatorId": "uuid-123",
      "receiverId": "uuid-456",
      "skillOffered": "React",
      "skillWanted": "Python",
      "status": "PENDING",
      "receiver": {
        "id": "uuid-456",
        "name": "Jane Smith",
        "bio": "Learning Web Development",
        "avatarUrl": "..."
      }
    }
  ]
}
```

### 5. **Get Specific Swap Details**
```
Frontend Request:
GET /api/swaps/:id
Authorization: Bearer [accessToken]

Response (200 OK):
{
  "success": true,
  "message": "Swap fetched successfully",
  "data": {
    "id": "uuid-swap-1",
    "initiatorId": "uuid-123",
    "receiverId": "uuid-456",
    "skillOffered": "React",
    "skillWanted": "Python",
    "status": "PENDING",
    "createdAt": "2026-03-22T10:00:00Z",
    "updatedAt": "2026-03-22T10:00:00Z",
    "initiator": { ... },
    "receiver": { ... },
    "sessions": [ ... ],
    "messages": [ ... ]
  }
}
```

### 6. **Respond to Swap Request**
```
Frontend Request:
PATCH /api/swaps/:id/respond
Authorization: Bearer [accessToken]
Content-Type: application/json

{
  "accept": true  // or false to reject
}

Backend Process:
If accept = true:
  1. Update Swap status to ACCEPTED
  2. Both parties can now create sessions
If accept = false:
  1. Update Swap status to REJECTED

Response (200 OK):
{
  "success": true,
  "message": "Swap response recorded",
  "data": {
    "id": "uuid-swap-1",
    "status": "ACCEPTED"  // or REJECTED
  }
}
```

### 7. **Cancel Swap**
```
Frontend Request:
DELETE /api/swaps/:id
Authorization: Bearer [accessToken]

Backend Process:
1. Update Swap status to CANCELLED
2. OR delete if it's still PENDING

Response (200 OK):
{
  "success": true,
  "message": "Swap cancelled",
  "data": null
}
```

---

## 📅 Session Management Flow

Sessions are scheduled learning/teaching meetings for accepted swaps.

### 1. **Create Session**
```
Frontend Request:
POST /api/sessions/
Authorization: Bearer [accessToken]
Content-Type: application/json

{
  "swapId": "uuid-swap-1",
  "scheduledAt": "2026-03-25T14:30:00Z",
  "meetLink": "https://zoom.us/j/123456789"  // optional
}

Validation:
- swapId: valid UUID
- scheduledAt: valid ISO 8601 datetime
- meetLink: valid URL (optional)

Backend Process:
1. Verify swap exists and status is ACCEPTED
2. Create Session record
3. Associate with both users in the swap

Response (201 Created):
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "id": "uuid-session-1",
    "swapId": "uuid-swap-1",
    "userId": "uuid-123",
    "scheduledAt": "2026-03-25T14:30:00Z",
    "meetLink": "https://zoom.us/j/123456789",
    "status": "SCHEDULED",
    "createdAt": "2026-03-22T10:00:00Z",
    "updatedAt": "2026-03-22T10:00:00Z"
  }
}
```

### 2. **Get My Sessions**
```
Frontend Request:
GET /api/sessions/
Authorization: Bearer [accessToken]

Backend Process:
1. Query Session records for current user
2. Include swap and related user details
3. Can filter by status (SCHEDULED, COMPLETED, CANCELLED)

Response (200 OK):
{
  "success": true,
  "message": "Sessions fetched successfully",
  "data": [
    {
      "id": "uuid-session-1",
      "swapId": "uuid-swap-1",
      "userId": "uuid-123",
      "scheduledAt": "2026-03-25T14:30:00Z",
      "meetLink": "https://zoom.us/j/123456789",
      "status": "SCHEDULED",
      "swap": {
        "id": "uuid-swap-1",
        "initiatorId": "uuid-123",
        "receiverId": "uuid-456",
        "skillOffered": "React",
        "skillWanted": "Python"
      },
      "createdAt": "2026-03-22T10:00:00Z"
    }
  ]
}
```

### 3. **Get Session Details**
```
Frontend Request:
GET /api/sessions/:id
Authorization: Bearer [accessToken]

Response (200 OK):
{
  "success": true,
  "message": "Session fetched successfully",
  "data": {
    "id": "uuid-session-1",
    "swapId": "uuid-swap-1",
    "userId": "uuid-123",
    "scheduledAt": "2026-03-25T14:30:00Z",
    "meetLink": "https://zoom.us/j/123456789",
    "status": "SCHEDULED",
    "swap": { ... },
    "user": { ... },
    "review": null  // or Review object if session was completed
  }
}
```

### 4. **Update Session**
```
Frontend Request:
PUT /api/sessions/:id
Authorization: Bearer [accessToken]
Content-Type: application/json

{
  "scheduledAt": "2026-03-26T15:00:00Z",
  "meetLink": "https://meet.google.com/abc-defg-hij"
}

Backend Process:
1. Update scheduledAt and/or meetLink
2. Session status remains SCHEDULED
3. Verify only swap participants can update

Response (200 OK):
{
  "success": true,
  "message": "Session updated successfully",
  "data": {
    "id": "uuid-session-1",
    "scheduledAt": "2026-03-26T15:00:00Z",
    "meetLink": "https://meet.google.com/abc-defg-hij",
    "status": "SCHEDULED"
  }
}
```

### 5. **Mark Session as Completed**
```
Frontend Request:
PATCH /api/sessions/:id/complete
Authorization: Bearer [accessToken]

Backend Process:
1. Update Session status to COMPLETED
2. Allow review to be created for this session

Response (200 OK):
{
  "success": true,
  "message": "Session marked as completed",
  "data": {
    "id": "uuid-session-1",
    "status": "COMPLETED",
    "updatedAt": "2026-03-25T16:00:00Z"
  }
}
```

### 6. **Delete Session**
```
Frontend Request:
DELETE /api/sessions/:id
Authorization: Bearer [accessToken]

Backend Process:
1. Mark session as CANCELLED
2. OR soft delete if no review exists

Response (200 OK):
{
  "success": true,
  "message": "Session deleted successfully",
  "data": null
}
```

---

## 💬 Real-Time Messaging Flow (WebSocket)

Messages are sent in real-time via Socket.io within a swap context.

### Connection & Auth
```
Frontend Connection:
const socket = io('http://localhost:5000', {
  auth: {
    token: accessToken  // Pass JWT in auth payload
  }
})

Backend Process:
1. Socket.io middleware verifies token
2. Extracts userId from JWT
3. Allows connection or rejects if invalid
4. Sets socket.data.userId for later use
```

### Join Swap Room (Start Messaging)
```
Frontend Event:
socket.emit('join_swap', swapId)

Backend Process:
1. Add socket to Socket.io room: swapId
2. All messages sent to this room reach both users

Event Handlers:
- 'join_swap' (swapId: string) - User joins swap conversation room
- 'leave_swap' (swapId: string) - User leaves room
```

### Send Message
```
Frontend Event:
socket.emit('send_message', {
  swapId: 'uuid-swap-1',
  content: 'Hi! When can we schedule our first session?'
})

Backend Process:
1. Validate swap exists
2. Verify sender is swap participant (initiator or receiver)
3. Calculate receiverId (the other participant)
4. Save Message record to database:
   - swapId: the swap this message belongs to
   - senderId: current user
   - receiverId: the other user
   - content: message text
   - createdAt: timestamp
5. Emit 'new_message' event to the swap room

Backend Emits:
io.to(swapId).emit('new_message', {
  id: 'uuid-msg-1',
  swapId: 'uuid-swap-1',
  senderId: 'uuid-123',
  receiverId: 'uuid-456',
  content: 'Hi! When can we schedule our first session?',
  createdAt: '2026-03-22T10:00:00Z',
  sender: {
    id: 'uuid-123',
    name: 'John Doe',
    avatarUrl: '...'
  }
})

Both users receive the same event with full message details.
```

### Receive Message
```
Frontend Event Listener:
socket.on('new_message', (message) => {
  // Handle received message
  // Update UI with message
  // Add to conversation list
})

Message Structure Received:
{
  id: 'uuid-msg-1',
  swapId: 'uuid-swap-1',
  senderId: 'uuid-123',
  receiverId: 'uuid-456',
  content: 'Hi! When can we schedule our first session?',
  createdAt: '2026-03-22T10:00:00Z',
  sender: {
    id: 'uuid-123',
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg'
  }
}
```

### Connection Events
```
Frontend Listeners:
socket.on('connect', () => {
  console.log('Connected to server')
})

socket.on('disconnect', () => {
  console.log('Disconnected from server')
})

socket.on('error', (error) => {
  console.error('Socket error:', error.message)
})
```

### REST API for Message History
```
Frontend Request:
GET /api/messages/swaps/:swapId
Authorization: Bearer [accessToken]

Backend Process:
1. Query all Message records for swap
2. Order by createdAt ascending
3. Include sender details for each message

Response (200 OK):
{
  "success": true,
  "message": "Messages fetched successfully",
  "data": [
    {
      "id": "uuid-msg-1",
      "swapId": "uuid-swap-1",
      "senderId": "uuid-123",
      "content": "Hi! When can we schedule?",
      "createdAt": "2026-03-22T10:00:00Z",
      "sender": {
        "id": "uuid-123",
        "name": "John Doe",
        "avatarUrl": "..."
      }
    },
    {
      "id": "uuid-msg-2",
      "swapId": "uuid-swap-1",
      "senderId": "uuid-456",
      "content": "How about this Friday at 3 PM?",
      "createdAt": "2026-03-22T10:30:00Z",
      "sender": {
        "id": "uuid-456",
        "name": "Jane Smith",
        "avatarUrl": "..."
      }
    }
  ]
}
```

### Get All Conversations
```
Frontend Request:
GET /api/messages/
Authorization: Bearer [accessToken]

Backend Process:
1. Get all swaps user is part of (as initiator or receiver)
2. Get latest message from each swap
3. Include other participant info
4. Order by message recency

Response (200 OK):
{
  "success": true,
  "message": "Conversations fetched successfully",
  "data": [
    {
      "swapId": "uuid-swap-1",
      "otherUser": {
        "id": "uuid-456",
        "name": "Jane Smith",
        "avatarUrl": "..."
      },
      "lastMessage": {
        "content": "How about this Friday at 3 PM?",
        "createdAt": "2026-03-22T10:30:00Z"
      }
    }
  ]
}
```

### Delete Message
```
Frontend Request:
DELETE /api/messages/:id
Authorization: Bearer [accessToken]

Backend Process:
1. Verify current user is the sender
2. Delete Message record
3. Emit 'message_deleted' event to swap room

Response (200 OK):
{
  "success": true,
  "message": "Message deleted successfully",
  "data": null
}
```

---

## ⭐ Reviews & Ratings Flow

Reviews are created after a session is completed.

### 1. **Create Review**
```
Frontend Request:
POST /api/reviews/
Authorization: Bearer [accessToken]
Content-Type: application/json

{
  "sessionId": "uuid-session-1",
  "revieweeId": "uuid-456",
  "rating": 5,
  "comment": "Jane is an excellent teacher! Very patient and knowledgeable."
}

Validation:
- sessionId: valid UUID
- revieweeId: valid UUID
- rating: integer between 1-5
- comment: max 500 characters (optional)

Backend Process:
1. Verify session exists and is COMPLETED
2. Verify reviewer is participant in the swap
3. Create Review record
4. Link to session (1-to-1 unique relationship)

Response (201 Created):
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "uuid-review-1",
    "reviewerId": "uuid-123",
    "revieweeId": "uuid-456",
    "sessionId": "uuid-session-1",
    "rating": 5,
    "comment": "Jane is an excellent teacher!",
    "createdAt": "2026-03-22T10:00:00Z"
  }
}
```

### 2. **Get Reviews for User**
```
Frontend Request:
GET /api/reviews/users/:id
Authorization: Bearer [accessToken]

Backend Process:
1. Query all Review records where revieweeId = :id
2. Include reviewer details
3. Calculate average rating
4. Order by createdAt descending

Response (200 OK):
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "averageRating": 4.7,
    "totalReviews": 3,
    "reviews": [
      {
        "id": "uuid-review-1",
        "reviewerId": "uuid-123",
        "rating": 5,
        "comment": "Excellent teacher!",
        "createdAt": "2026-03-22T10:00:00Z",
        "reviewer": {
          "id": "uuid-123",
          "name": "John Doe",
          "avatarUrl": "..."
        }
      },
      {
        "id": "uuid-review-2",
        "reviewerId": "uuid-789",
        "rating": 4,
        "comment": "Good explanations",
        "createdAt": "2026-03-20T10:00:00Z",
        "reviewer": {
          "id": "uuid-789",
          "name": "Alice Brown",
          "avatarUrl": "..."
        }
      }
    ]
  }
}
```

### 3. **Get Reviews by Session**
```
Frontend Request:
GET /api/reviews/sessions/:id
Authorization: Bearer [accessToken]

Backend Process:
1. Query Review record for specific session (1-to-1)
2. Include both reviewer and reviewee details

Response (200 OK):
{
  "success": true,
  "message": "Review fetched successfully",
  "data": {
    "id": "uuid-review-1",
    "reviewerId": "uuid-123",
    "revieweeId": "uuid-456",
    "sessionId": "uuid-session-1",
    "rating": 5,
    "comment": "Excellent teacher!",
    "createdAt": "2026-03-22T10:00:00Z",
    "reviewer": { ... },
    "reviewee": { ... }
  }
}
```

### 4. **Get Specific Review**
```
Frontend Request:
GET /api/reviews/:id
Authorization: Bearer [accessToken]

Response (200 OK):
{
  "success": true,
  "message": "Review fetched successfully",
  "data": {
    "id": "uuid-review-1",
    "rating": 5,
    "comment": "Excellent teacher!",
    ...
  }
}
```

---

## 🏗️ API Architecture & Response Standards

### Base URL
```
http://localhost:5000
or
https://api.skillswap.com (production)
```

### Standard Response Format
All responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean          // true for success, false for errors
  message: string           // Human-readable message
  data: T | null           // Response payload (null on errors/deletions)
  error?: {                // Only for errors
    code: string
    details?: string
  }
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE (optional)
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid auth token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate email, etc.
- `500 Internal Server Error` - Server error

### Request Headers
```
Authorization: Bearer [accessToken]
Content-Type: application/json
Accept: application/json
```

### Error Response Format
```json
{
  "success": false,
  "message": "Validation error",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "Email must be a valid email address"
  }
}
```

---

## 🔒 Security & Middleware

### Authentication Middleware
```typescript
// Verifies JWT token from Authorization header
// Sets req.user with decoded token payload
// Protects routes requiring authentication

Protected Route Example:
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Validation Middleware
```typescript
// Uses Zod schemas to validate request body
// Runs before controller handler
// Returns 400 error with validation details if invalid
```

### Rate Limiting
```typescript
// General Limiter: Applied to most routes
// Auth Limiter: Stricter limit on /api/auth routes
// Prevents brute force attacks
```

### Error Handling Middleware
```typescript
// Catches all errors from routes and controllers
// Converts to standardized error format
// Returns appropriate HTTP status codes
```

### CORS Configuration
```typescript
{
  origin: true,          // Allow any origin
  credentials: true      // Allow cookies (for refresh token)
}
```

---

## 📝 Frontend Integration Checklist

1. **Authentication**
   - [ ] Sign up with name, email, password
   - [ ] Log in with email and password
   - [ ] Store access token in memory
   - [ ] Refresh token automatically via cookie
   - [ ] Log out and clear session

2. **Profile Management**
   - [ ] View current user profile
   - [ ] Edit profile (name, bio, avatar)
   - [ ] Delete account
   - [ ] Add/remove skills offered
   - [ ] Add/remove skills wanted

3. **Browse & Search**
   - [ ] View all users
   - [ ] View specific user profile with skills
   - [ ] Filter/search users by skills

4. **Swaps**
   - [ ] Send swap request to user
   - [ ] View incoming swap requests
   - [ ] Accept/reject swap request
   - [ ] View outgoing swap requests
   - [ ] View accepted swaps
   - [ ] Cancel swap

5. **Sessions**
   - [ ] Create session for accepted swap
   - [ ] View my sessions
   - [ ] Update session (reschedule, change meet link)
   - [ ] Mark session as completed
   - [ ] Delete session

6. **Messaging**
   - [ ] Connect to WebSocket with auth token
   - [ ] Join swap room via Socket.io
   - [ ] Send message in real-time
   - [ ] Receive messages in real-time
   - [ ] View message history
   - [ ] View conversations list

7. **Reviews**
   - [ ] Create review after session completion
   - [ ] View reviews received by user
   - [ ] View average rating

---

## 🚀 Complete Frontend Flow Example: Skill Exchange

```
1. USER SIGNUP/LOGIN
   POST /api/auth/register → Get accessToken in body + refreshToken in cookie

2. COMPLETE PROFILE
   POST /api/users/skills/offered (add React, Node.js)
   POST /api/users/skills/wanted (add Python)

3. BROWSE USERS
   GET /api/users/ → See all users with their skills

4. INITIATE SWAP
   POST /api/swaps/ (with receiverId)
   → Swap created with status PENDING

5. RECEIVER RESPONDS
   GET /api/swaps/incoming → See swap request
   PATCH /api/swaps/:id/respond (accept: true)
   → Swap status changes to ACCEPTED

6. SCHEDULE SESSION
   POST /api/sessions/ (with swapId, scheduledAt, meetLink)
   → Session status SCHEDULED

7. REAL-TIME CHAT
   Socket.io: emit 'join_swap'
   Socket.io: emit 'send_message' → Both users see message in real-time
   GET /api/messages/swaps/:swapId → Get history

8. COMPLETE SESSION
   PATCH /api/sessions/:id/complete
   → Session status COMPLETED

9. LEAVE REVIEW
   POST /api/reviews/ (with sessionId, rating, comment)
   → Review saved to database

10. VIEW FEEDBACK
    GET /api/reviews/users/:id → See all reviews received
```

---

## 🔑 Key Technical Details

**Database:** PostgreSQL with Prisma ORM
**Authentication:** JWT (Access + Refresh tokens)
**Real-time Messaging:** Socket.io WebSockets
**Input Validation:** Zod schemas
**Error Handling:** Custom ApiError class
**Password Security:** Bcrypt hashing
**Token Storage:** 
  - Access: In-memory (short-lived, 15 min)
  - Refresh: HttpOnly cookie (long-lived, 7 days)

**Rate Limiting:** Enabled on auth routes
**CORS:** Enabled for browser requests
**Logging:** Winston/custom logger
**Environment:** Node.js + Express + TypeScript
