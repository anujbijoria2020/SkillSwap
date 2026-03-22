# SkillSwapNetwork Users Module Updates

## Summary of Changes
Updated the users module to support new user fields (location, availability) and improved API responses to include skills as flat string arrays.

---

## Change 1: Updated Validation Schema ✅
**File:** [src/modules/Users/user.validation.ts](src/modules/Users/user.validation.ts)

Added new fields to `updateUserSchema`:
```typescript
export const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    avatarUrl: z.string().url("Invalid URL").optional(),
    location: z.string().optional(),                                    // NEW
    availability: z.array(z.string()).optional(),                       // NEW
    skillsOffering: z.array(z.string().min(2, ...)).optional(),         // NEW
    skillsWanted: z.array(z.string().min(2, ...)).optional(),           // NEW
})
```

---

## Change 2: Updated User Services ✅
**File:** [src/modules/Users/user.services.ts](src/modules/Users/user.services.ts)

### A. Added Helper Function
```typescript
const transformUserWithSkills = (user: any) => {
    const { password, ...withoutPassword } = user;
    return {
        ...withoutPassword,
        skillsOffering: user.skillsOffered?.map((s: any) => s.name) || [],
        skillsWanted: user.skillsWanted?.map((s: any) => s.name) || [],
    };
};
```

This helper:
- Removes password field
- Transforms `skillsOffered` array to flat `skillsOffering` string array
- Transforms `skillsWanted` array to flat `skillsWanted` string array

### B. Updated `getMe()` Service
- Now includes both `skillsOffered` and `skillsWanted` relations from database
- Returns flat arrays via `transformUserWithSkills()`
- Response includes: `skillsOffering: string[]` and `skillsWanted: string[]`

### C. Updated `getUserById()` Service
- Now includes both skill relations
- Returns flat arrays via `transformUserWithSkills()`
- Same response shape as `getMe()`

### D. Updated `getAllUsers()` Service
- Now queries with `include: { skillsOffered: true, skillsWanted: true }`
- Maps all users through `transformUserWithSkills()`
- Each user object includes flat skill arrays

### E. Updated `updateMe()` Service
Now accepts and handles:
- `location?: string` - Updates User.location field
- `availability?: string[]` - Updates User.availability field
- `skillsOffering?: string[]` - Deletes all and creates new skillOffered records
- `skillsWanted?: string[]` - Deletes all and creates new skillWanted records

Logic:
1. Separates skill fields from regular user data
2. Updates user record with regular fields (name, bio, etc.)
3. If `skillsOffering` provided:
   - Deletes all existing skillOffered records for user
   - Creates new skillOffered records if array not empty
   - Refreshes user data and returns
4. If `skillsWanted` provided:
   - Deletes all existing skillWanted records for user
   - Creates new skillWanted records if array not empty
   - Refreshes user data and returns
5. Returns transformed user with flat skill arrays

---

## Change 3: Added Review Controllers ✅
**File:** [src/modules/Users/users.controllers.ts](src/modules/Users/users.controllers.ts)

### New Import
```typescript
import { getReviewsForUser } from "../reviews/reviews.services"
```

### New Controllers

#### `getMyReviewsController`
```typescript
GET /api/users/me/reviews
Authorization: Bearer [accessToken]

Response (200 OK):
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": [array of reviews]
}
```
- Requires authentication
- Returns reviews for authenticated user
- Calls `getReviewsForUser(userId)` from reviews service

#### `getUserReviewsController`
```typescript
GET /api/users/:id/reviews
// No auth required

Response (200 OK):
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": [array of reviews]
}
```
- Public endpoint
- Returns reviews for specified user by ID
- Calls `getReviewsForUser(id)` from reviews service

---

## Change 4: Updated Routes ✅
**File:** [src/modules/Users/user.routes.ts](src/modules/Users/user.routes.ts)

### New Imports
```typescript
import { ..., getMyReviewsController, getUserReviewsController }
```

### Route Changes

#### Changed PUT to PATCH
```typescript
// BEFORE
userRouter.put("/me", authMiddleware, validate(updateUserSchema), updateMeController);

// AFTER
userRouter.patch("/me", authMiddleware, validate(updateUserSchema), updateMeController);
```

#### Added Review Routes
```typescript
// BEFORE /:id routes (important for route precedence)
userRouter.get("/me/reviews", authMiddleware, getMyReviewsController);
userRouter.get("/:id/reviews", getUserReviewsController);
```

### Final Route Order
```
1. GET  /me                    - Get current user
2. GET  /me/reviews            - Get user's received reviews (AUTH)
3. PATCH /me                   - Update current user (AUTH)
4. DELETE /me                  - Delete current user (AUTH)
5. GET  /                      - Get all users
6. POST /skills/offered        - Add offered skills (AUTH)
7. POST /skills/wanted         - Add wanted skills (AUTH)
8. GET  /skills/me             - Get user's skills (AUTH)
9. DELETE /skills/offered/:id  - Remove offered skill (AUTH)
10. DELETE /skills/wanted/:id  - Remove wanted skill (AUTH)
11. GET /:id/reviews           - Get user's reviews (public)
12. GET /:id                   - Get user by ID (public)
```

✅ All specific `/me/` routes come before `/:id` wildcard
✅ `/me/reviews` before `/:id/reviews` for correct matching
✅ All skill routes before `/:id` wildcard

---

## Response Format

### User Response (from getMe, getUserById, getAllUsers)
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid-123",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Teaching React",
    "avatarUrl": "https://...",
    "location": "San Francisco, CA",
    "availability": ["Monday 10-12", "Wednesday 14-16"],
    "createdAt": "2026-03-22T...",
    "updatedAt": "2026-03-22T...",
    "skillsOffering": ["React", "TypeScript", "Node.js"],
    "skillsWanted": ["Python", "Machine Learning"]
  }
}
```

### Update Profile Response
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid-123",
    "name": "John Developer",
    "email": "john@example.com",
    "bio": "MERN Stack Expert",
    "avatarUrl": "https://...",
    "location": "San Francisco, CA",
    "availability": ["Monday 10-12", "Wednesday 14-16"],
    "createdAt": "2026-03-22T...",
    "updatedAt": "2026-03-22T...",
    "skillsOffering": ["React", "Node.js"],
    "skillsWanted": ["Python"]
  }
}
```

### Reviews Response
```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": [
    {
      "id": "uuid-review-1",
      "reviewerId": "uuid-123",
      "revieweeId": "uuid-456",
      "sessionId": "uuid-session-1",
      "rating": 5,
      "comment": "Excellent teacher!",
      "createdAt": "2026-03-22T...",
      "reviewer": {
        "id": "uuid-123",
        "name": "John Doe",
        "avatarUrl": "..."
      }
    }
  ]
}
```

---

## API Examples

### Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer eyJ..."
```

### Update Profile with Skills
```bash
curl -X PATCH http://localhost:5000/api/users/me \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Developer",
    "bio": "Expert in MERN",
    "location": "New York, NY",
    "availability": ["Monday 10-12", "Friday 14-16"],
    "skillsOffering": ["React", "TypeScript", "Node.js"],
    "skillsWanted": ["Python", "Data Science"]
  }'
```

### Get User's Reviews (Authenticated)
```bash
curl -X GET http://localhost:5000/api/users/me/reviews \
  -H "Authorization: Bearer eyJ..."
```

### Get Specific User's Reviews (Public)
```bash
curl -X GET http://localhost:5000/api/users/uuid-456/reviews
```

### Get Specific User Profile
```bash
curl -X GET http://localhost:5000/api/users/uuid-456
```

---

## Testing Checklist

- [x] No TypeScript errors
- [x] All imports use relative paths (no @ alias)
- [x] Password field never returned in responses
- [x] Skills returned as flat string arrays (`skillsOffering`, `skillsWanted`)
- [x] /me routes come before /:id wildcard
- [x] /me/reviews comes before /:id/reviews
- [x] All controllers have try/catch with next(error)
- [x] Response format: `{ success, message, data }`
- [x] Authentication middleware applied to /me/* routes
- [x] PUT changed to PATCH for /me route
- [x] New fields (location, availability) included in responses
- [x] updateMe handles skillsOffering and skillsWanted correctly

---

## Files Modified

1. ✅ [src/modules/Users/user.validation.ts](src/modules/Users/user.validation.ts) - Updated schema
2. ✅ [src/modules/Users/user.services.ts](src/modules/Users/user.services.ts) - Updated all services
3. ✅ [src/modules/Users/users.controllers.ts](src/modules/Users/users.controllers.ts) - Added review controllers
4. ✅ [src/modules/Users/user.routes.ts](src/modules/Users/user.routes.ts) - Updated routes and changed PUT to PATCH
