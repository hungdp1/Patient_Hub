# 🔧 Patient Hub - Integration Quick Reference & Troubleshooting

## 🚀 Quick Start Commands

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev  # Runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173

# Terminal 3: Test APIs
npx ts-node API_INTEGRATION_TEST.ts
```

---

## 📱 Using the Frontend Services

### Authentication
```typescript
import { authService } from '@/services/authService';

// Login
const result = await authService.login({
  phoneNumber: '0123456789',
  password: 'password123'
});
if (result.success) {
  // Token is auto-saved to localStorage
}

// Check auth status
const token = authService.getToken();
if (token) {
  // User is authenticated
}

// Logout
authService.logout();
```

### Getting Data
```typescript
import { dataService } from '@/services/dataService';

// Get appointments
const appointments = await dataService.getAppointments();

// Create appointment
await dataService.createAppointment({
  patientId: 'pat123',
  doctorId: 'doc456',
  date: '2024-05-25T14:00:00Z',
  reason: 'Regular checkup'
});

// Get medical records
const records = await dataService.getMedicalRecords();

// Similar patterns for: labResults, prescriptions, payments, etc.
```

### User Profile
```typescript
import { userService } from '@/services/userService';

// Get current user profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Main St'
});

// Get dashboard data
const dashboard = await userService.getDashboard();
```

### AI Chat
```typescript
import { 
  askMedicalAI,
  extractMedicalEntities,
  predictDiagnosis,
  prioritizeAppointmentScheduling
} from '@/services/chatService';

// Simple chat
const response = await askMedicalAI('I have a headache');

// Extract medical info from text
const entities = await extractMedicalEntities('Fever 38.5°C, sore throat');

// Get diagnosis prediction
const diagnosis = await predictDiagnosis(['fever', 'cough']);

// Get appointment priority
const priority = await prioritizeAppointmentScheduling(
  ['chest pain'],
  'HIGH'
);
```

---

## 🐛 Troubleshooting Guide

### Issue: "Cannot GET /api/auth/login"
**Solution:**
```bash
# 1. Check backend is running
ps aux | grep node

# 2. Check port 5000 is listening
netstat -an | grep 5000

# 3. Restart backend
cd backend && npm run dev
```

### Issue: "Unauthorized" or "Invalid token"
**Solution:**
```typescript
// Clear auth and re-login
localStorage.clear();
window.location.href = '/login';

// Or use logout
authService.logout();
```

### Issue: CORS Error
**Solution:**
```bash
# Check backend .env has correct FRONTEND_URL
FRONTEND_URL=http://localhost:5173

# Restart backend if you changed .env
npm run dev
```

### Issue: "Cannot read property 'phoneNumber' of undefined"
**Solution:**
```typescript
// In frontend, always check response structure
const result = await authService.login(credentials);
if (result.success && result.user) {
  // Safe to use result.user
  console.log(result.user.phoneNumber);
}
```

### Issue: Database connection error
**Solution:**
```bash
# Check .env file exists and has DATABASE_URL
cat backend/.env

# Test database connection
curl http://localhost:5000/api/db-check

# If database is down, start PostgreSQL:
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: PostgreSQL service should auto-start
```

---

## 🔍 API Response Debugging

### Check API Response in Browser
1. Open DevTools (F12)
2. Go to Network tab
3. Look for API requests
4. Click on request to see:
   - Request headers (including Authorization)
   - Request body (what you sent)
   - Response body (what you got back)
   - Status (200=success, 401=auth error, 404=not found)

### Test API with cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0123456789","password":"password123"}'

# Get appointments (with token)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/data/appointments

# Create appointment
curl -X POST http://localhost:5000/api/data/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "patientId":"pat123",
    "doctorId":"doc456",
    "date":"2024-05-25T14:00:00Z",
    "reason":"Checkup"
  }'
```

---

## ✅ Common Validation Errors

### Login/Register Errors
```typescript
// Missing fields
{
  "error": "Missing required fields"
}

// User already exists
{
  "error": "Email already exists"
}

// Invalid password format
{
  "error": "Password must be at least 6 characters"
}
```

### Appointment Creation Errors
```typescript
// Missing required fields
{
  "error": "Missing required fields: patientId, doctorId, date"
}

// Doctor not found
{
  "error": "Doctor not found"
}

// Invalid date format
{
  "error": "Invalid date format. Use ISO 8601 format"
}
```

---

## 📊 Environment Variables Checklist

### Backend (.env)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `PORT` - Should be 5000
- [ ] `JWT_SECRET` - Long random string for token signing
- [ ] `FRONTEND_URL` - http://localhost:5173 (dev) or your production URL
- [ ] `GEMINI_API_KEY` - If using AI features

### Frontend (.env.local)
- [ ] `VITE_API_BASE_URL` - http://localhost:5000/api
- [ ] `GEMINI_API_KEY` - If using Gemini directly

---

## 🔐 Security Best Practices

```typescript
// ✅ DO: Store token in localStorage
const token = localStorage.getItem('auth_token');

// ❌ DON'T: Expose sensitive data in console logs
console.log(creditCard); // Contains sensitive info!

// ✅ DO: Clear storage on logout
authService.logout();

// ❌ DON'T: Store plaintext passwords
localStorage.setItem('password', password); // Bad!

// ✅ DO: Use HTTPS in production
FRONTEND_URL=https://yourdomain.com (production)

// ✅ DO: Use strong JWT_SECRET in production
JWT_SECRET=your-very-long-random-string-at-least-32-characters
```

---

## 📈 Performance Tips

### Frontend Optimization
```typescript
// ✅ DO: Cache user data
const profile = await userService.getProfile();
localStorage.setItem('user_profile', JSON.stringify(profile));

// ❌ DON'T: Fetch same data repeatedly
for (let i = 0; i < 10; i++) {
  await dataService.getAppointments(); // Unnecessary!
}

// ✅ DO: Use Promise.all for parallel requests
const [appts, records, labs] = await Promise.all([
  dataService.getAppointments(),
  dataService.getMedicalRecords(),
  dataService.getLabResults()
]);
```

### Backend Optimization
```typescript
// ✅ DO: Use pagination for large datasets
// Add query params: ?limit=10&offset=0

// ✅ DO: Index frequently queried fields
// Database schema optimization

// ❌ DON'T: N+1 queries
// Use eager loading/joins instead of multiple queries
```

---

## 🧪 Testing Your Integration

### Test Login Flow
```bash
# 1. Start both servers
# Terminal 1: npm run dev (backend)
# Terminal 2: npm run dev (frontend)

# 2. In browser console:
# Go to http://localhost:5173/login
# Enter credentials and submit
# Check if you're redirected to dashboard

# 3. Check localStorage
localStorage.getItem('auth_token')
localStorage.getItem('user_data')
```

### Test CRUD Operations
```bash
# Test appointment creation
curl -X POST http://localhost:5000/api/data/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"patientId":"p1","doctorId":"d1","date":"2024-05-25T14:00:00Z"}'

# Should return 201 Created with appointment object
```

---

## 📞 Contact & Support

If integration fails:
1. Check error message in browser console
2. Check backend logs in terminal
3. Verify environment variables (.env, .env.local)
4. Try the troubleshooting section above
5. Run `API_INTEGRATION_TEST.ts` to diagnose

---

## 📚 File Reference

### Key Frontend Files
- `src/services/authService.ts` - Authentication
- `src/services/dataService.ts` - Main data operations
- `src/services/userService.ts` - User/profile operations
- `src/services/chatService.ts` - AI chat operations
- `src/routes/ProtectedRoute.tsx` - Route protection
- `src/hooks/useAuth.ts` - Auth utilities

### Key Backend Files
- `src/controllers/authController.ts` - Auth endpoints
- `src/controllers/dataController.ts` - Data endpoints
- `src/services/AuthService.ts` - Auth business logic
- `src/services/DataService.ts` - Data business logic
- `src/middleware/auth.ts` - JWT verification
- `src/routes/*.ts` - Route definitions

### Configuration Files
- `frontend/.env.local` - Frontend config
- `backend/.env` - Backend config
- `frontend/vite.config.ts` - Vite build config
- `backend/tsconfig.json` - TypeScript config

---

## 🎓 Next Steps

1. **Understand the flow**: Read the integration guide
2. **Run the tests**: Execute `API_INTEGRATION_TEST.ts`
3. **Try CRUD operations**: Create, read, update, delete data
4. **Test all pages**: Visit each page and verify data loads
5. **Check error handling**: Intentionally cause errors and verify responses
6. **Set up production**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Happy coding! 🚀**
