# 🚀 Airbnb Import Feature - README

**Status:** ✅ Ready to Use  
**Time to Setup:** 2 minutes  
**Time to Import:** 30 seconds

---

## 🎯 What is This?

Import Airbnb properties into Roomy CRM with **one click** instead of manual data entry.

**Before:** 5 minutes of typing  
**After:** 30 seconds of clicking

---

## 🏃 Quick Start (2 Minutes)

### 1. Start Backend (Terminal 1)
```bash
cd backend-v2
npm run dev
# ✅ Server starts on http://localhost:3002
```

### 2. Start Frontend (Terminal 2)
```bash
npm run dev
# ✅ App starts on http://localhost:3000
```

### 3. Login
```
http://localhost:3000/login
Email: admin@roomy.com
Password: admin123
```

### 4. Import Property

1. Go to **Properties** page
2. Click **"Add New" ▼**
3. Select **"Import from Airbnb URL"**
4. Paste: `https://www.airbnb.com/rooms/1528180770610140527`
5. Click **"Fetch Data"**
6. ✅ Done! Property created!

---

## 📁 What Was Created

### Backend (3 files)
- `backend-v2/src/services/airbnb.service.ts`
- `backend-v2/src/controllers/airbnb.controller.ts`
- `backend-v2/src/routes/airbnb.routes.ts`

### Frontend (2 files)
- `components/properties/ImportFromAirbnbModal.tsx`
- `components/properties/AddPropertyDropdown.tsx`

### Documentation (6 files)
- `AIRBNB_INTEGRATION.md` - API docs
- `AIRBNB_QUICK_START.md` - Quick guide
- `AIRBNB_IMPORT_FRONTEND_GUIDE.md` - Frontend docs
- `AIRBNB_IMPORT_USER_GUIDE.md` - User manual
- `AIRBNB_IMPORT_COMPLETE_GUIDE.md` - Full guide
- `AIRBNB_IMPORT_FINAL_REPORT.md` - Implementation report

---

## 🧪 Test It

### Automated Test
```bash
cd backend-v2
./scripts/test-airbnb-import.sh
```

### Manual Test
```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:3002/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@roomy.com","password":"admin123"}' \
  | jq -r '.data.token')

# 2. Validate URL
curl -X POST http://localhost:3002/api/v2/integrations/airbnb/validate-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.airbnb.com/rooms/1528180770610140527"}' | jq

# 3. Import (get your user ID first)
OWNER_ID="your-user-id"
curl -X POST http://localhost:3002/api/v2/integrations/airbnb/import-from-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.airbnb.com/rooms/1528180770610140527","ownerId":"'$OWNER_ID'"}' | jq
```

---

## 🔧 API Endpoints

### Import Property
```http
POST /api/v2/integrations/airbnb/import-from-url
```

### Validate URL
```http
POST /api/v2/integrations/airbnb/validate-url
```

### Preview (ADMIN only)
```http
POST /api/v2/integrations/airbnb/preview
```

---

## 🎨 UI Features

### Dropdown Menu
Click **"Add New"** to see:
- 📎 Import from Airbnb URL
- ✏️ Create Manually

### Import Modal
- Real-time URL validation ✅
- Visual feedback (green/red) ✅
- Loading states ✅
- Auto-redirect ✅

---

## 🔐 Permissions

| Role | Can Import? | Notes |
|------|-------------|-------|
| ADMIN | ✅ Yes | For any owner |
| MANAGER | ✅ Yes | For any owner |
| OWNER | ✅ Yes | For self only |
| AGENT | ❌ No | Read-only |
| GUEST | ❌ No | No access |

---

## 📚 Documentation

**For Users:**
- `AIRBNB_IMPORT_USER_GUIDE.md` - Step-by-step guide

**For Developers:**
- `backend-v2/AIRBNB_INTEGRATION.md` - Backend API
- `AIRBNB_IMPORT_FRONTEND_GUIDE.md` - Frontend components
- `AIRBNB_IMPORT_COMPLETE_GUIDE.md` - Full system

**For Managers:**
- `AIRBNB_IMPORT_FINAL_REPORT.md` - Implementation report

---

## ⚙️ Configuration (Optional)

For **real Airbnb scraping** (production):

Add to `backend-v2/.env`:
```env
APIFY_API_KEY=your-apify-api-key
APIFY_AIRBNB_ACTOR_ID=dtrungtin/airbnb-scraper
```

**Note:** Not needed for development (uses mock data)

---

## 🐛 Troubleshooting

### Import button disabled?
→ Wait for green checkmark (URL validation)

### "Not authenticated" error?
→ Logout and login again

### Import takes too long?
→ Normal for real scraping (30-120s)  
→ Mock data is instant (dev mode)

### Property missing photos?
→ Photos are linked URLs (not downloaded)  
→ This is normal and works fine

---

## ✅ Testing Checklist

- [ ] Backend running on 3002
- [ ] Frontend running on 3000
- [ ] Can login
- [ ] Can open dropdown
- [ ] Can open import modal
- [ ] Can validate URL (green checkmark)
- [ ] Can import property
- [ ] Redirected to property page
- [ ] Property data looks correct

---

## 🎉 Success!

If you made it here and everything works:

**Congratulations! 🎊**

You have a fully working Airbnb import feature!

**Next Steps:**
1. Test with real users
2. Gather feedback
3. Iterate and improve
4. Scale to production

---

## 📞 Questions?

Check the documentation files or contact the development team.

**Happy Importing! 🏠**

---

*Created: October 9, 2025*  
*Version: 1.0.0*  
*Roomy CRM*

