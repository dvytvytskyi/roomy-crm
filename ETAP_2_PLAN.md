# 📋 Етап 2 - Детальний План Інтеграції

## 🎯 Мета
Переписати всі frontend сервіси для роботи з API v2 замість localStorage/моків.

---

## 🔴 HIGH PRIORITY - Критичні Функції

### 1. Financial Service (Payments & Financial Data)

#### Backend Check:
- [x] Перевірити financial.service.ts на backend-v2
- [x] Перевірити які endpoints існують
- [ ] Створити endpoint для transactions якщо немає

#### Frontend Refactor:
- [ ] Переписати `getFinancialData()` → викликати API v2
- [ ] Переписати `getPayments()` → викликати API v2
- [ ] Переписати `addPayment()` → викликати POST API v2
- [ ] Видалити всі localStorage calls

#### Endpoints Required:
```
GET  /api/v2/financials/overview?propertyId=xxx&dateFrom=xxx&dateTo=xxx
GET  /api/v2/properties/:id/transactions
POST /api/v2/properties/:id/transactions
```

---

### 2. Property Settings Service (Utilities)

#### Backend - Вже Готово:
- [x] Property model має поле `utilities: String[]`
- [x] PUT /api/v2/properties/:id підтримує utilities

#### Frontend Refactor:
- [ ] Видалити всі виклики до неіснуючого API v1
- [ ] Використовувати `handlePropertyUpdate({ utilities: [...] })`
- [ ] Utilities зберігаються як частина Property, не окремо

#### Endpoints Used:
```
PUT /api/v2/properties/:id
Body: { utilities: ["WiFi", "TV", "AC"] }
```

---

## 🟡 MEDIUM PRIORITY - Automation Features

### 3. Saved Replies Service

#### Backend Create:
- [ ] Створити SavedReply model в schema.prisma
- [ ] Створити SavedReplyService
- [ ] Створити SavedReplyController
- [ ] Створити saved-reply.routes.ts

#### Frontend Refactor:
- [ ] Переписати getSavedReplies() → API v2
- [ ] Переписати addSavedReply() → POST API v2
- [ ] Переписати updateSavedReply() → PUT API v2
- [ ] Видалити localStorage

#### Endpoints Required:
```
GET    /api/v2/properties/:id/saved-replies
POST   /api/v2/properties/:id/saved-replies
PUT    /api/v2/properties/:id/saved-replies/:replyId
DELETE /api/v2/properties/:id/saved-replies/:replyId
```

---

### 4. Automation Service

#### Backend Create:
- [ ] Розширити Property model або створити PropertyAutomation model
- [ ] Створити AutomationService
- [ ] Створити AutomationController  
- [ ] Створити automation.routes.ts

#### Frontend Refactor:
- [ ] Переписати getAutomationSettings() → API v2
- [ ] Переписати updateAutoResponseMessage() → PUT API v2
- [ ] Переписати toggleAutoResponse() → PATCH API v2
- [ ] Видалити localStorage

#### Endpoints Required:
```
GET   /api/v2/properties/:id/automation
PUT   /api/v2/properties/:id/automation/auto-response
PUT   /api/v2/properties/:id/automation/auto-reviews
PATCH /api/v2/properties/:id/automation/toggle
```

---

### 5. Document Service

#### Backend - Частково Готово:
- [x] FileService існує (backend-v2/src/services/file.service.ts)
- [ ] Перевірити чи є endpoints для property documents

#### Frontend Refactor:
- [ ] Переписати uploadDocument() → використати file upload API
- [ ] Переписати getDocuments() → API v2
- [ ] Переписати deleteDocument() → DELETE API v2
- [ ] Реальне завантаження файлів на S3

#### Endpoints Required:
```
GET    /api/v2/properties/:id/documents
POST   /api/v2/properties/:id/documents (multipart/form-data)
DELETE /api/v2/properties/:id/documents/:documentId
GET    /api/v2/files/download/:fileId
```

---

## 📈 Пріоритизація Робіт

### Фаза 1 - Критичні (Тиждень 1):
1. ✅ **Financial Service** - payments та financial data
2. ✅ **Property Settings** - utilities через Property API

### Фаза 2 - Важливі (Тиждень 2):
3. **Saved Replies** - комунікація з гостями
4. **Documents** - документообіг

### Фаза 3 - Automation (Тиждень 3):
5. **Automation Service** - auto responses та reviews

---

## 💡 Рекомендації

### Швидке Рішення (для демо/MVP):
- Залишити Saved Replies, Automation, Documents як є (localStorage)
- Зосередитись на **Payments/Financial** та **Utilities**
- Це дасть 80% функціональності з 20% зусиль

### Повне Рішення (для production):
- Інтегрувати ВСІ сервіси з API v2
- Створити всі необхідні backend models
- Повна міграція з localStorage

---

## 🚀 Наступні Кроки

Що робимо далі?

### Варіант A: Швидка Інтеграція (Рекомендую)
1. **Payments/Financial** - інтегрувати з existing backend-v2 financial API
2. **Utilities** - використовувати Property API (вже готово)
3. Залишити інші як localStorage (працює, але не ідеально)

### Варіант B: Повна Інтеграція
1. Створити backend models для SavedReply, Automation
2. Створити всі services, controllers, routes
3. Переписати всі frontend сервіси
4. **Час:** ~1-2 тижні роботи

**Який варіант обираєте?** 🤔

