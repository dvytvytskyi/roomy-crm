# Marketing Tab Documentation

## Огляд

Розділ "Marketing" - це централізований пульт управління контентом для нерухомості. Тут ви можете редагувати всі маркетингові описи, які бачать потенційні гості, та налаштовувати інтеграції з зовнішніми сервісами.

## Основні Компоненти

### 1. Маркетингові Описи

#### Поля:
- **Title (Заголовок)**: Основна назва оголошення
  - Приклад: "Cozy Studio with Sea View near Marina"
  - Зберігається в полі `title` моделі Property

- **Description (Опис)**: Головний детальний опис об'єкта
  - Використовує Rich Text Editor (Markdown)
  - Підтримує форматування тексту
  - Зберігається в полі `description` моделі Property

- **The Space (Простір)**: Детальний опис самого приміщення
  - Rich Text Editor для форматування
  - Зберігається в полі `spaceDescription` моделі Property

- **Guest Access (Доступ для гостей)**: Інформація про доступні зони
  - Rich Text Editor
  - Зберігається в полі `guestAccess` моделі Property

- **Other Things to Note (Інші важливі деталі)**: Додаткова інформація
  - Rich Text Editor
  - Зберігається в полі `otherNotes` моделі Property

### 2. Інтеграція з PriceLabs

#### Функціонал:
- **Відображення поточного pricelabId**: Показує ID поточного лістингу в PriceLabs
- **Кнопка "Link to PriceLabs"**: Відкриває модальне вікно зі списком доступних лістингів
- **Прямий доступ до PriceLabs**: Кнопка для переходу до лістингу в PriceLabs

#### API Endpoints:
- `GET /api/v2/pricelabs/listings` - отримання списку лістингів
- `PUT /api/v2/properties/:id` - оновлення pricelabId

### 3. Канали Дистрибуції (Distribution Channels)

#### Платформи:
- **Airbnb**: Статус "Not Connected", кнопка "Connect"
- **Booking.com**: Статус "Not Connected", кнопка "Connect"  
- **Direct Bookings**: Статус "Active", кнопка "Manage"

#### Майбутня інтеграція:
Ця секція готова для інтеграції з Channel Manager для:
- Включення/виключення синхронізації з конкретними каналами
- Управління налаштуваннями для кожного каналу
- Відображення статусу публікації

## Технічні Деталі

### Rich Text Editor
- Використовується бібліотека `@uiw/react-md-editor`
- Підтримує Markdown форматування
- Режим світлої теми (`data-color-mode="light"`)
- Різні висоти для різних полів

### База Даних
Всі поля зберігаються в моделі `Property`:
```prisma
model properties {
  title               String?
  description         String?
  spaceDescription    String?
  guestAccess         String?
  otherNotes          String?
  pricelabId          String?
  // ... інші поля
}
```

### API Інтеграція
- Використовує `apiClientV2` для всіх запитів
- Автоматична автентифікація через JWT токени
- Обробка помилок та показ повідомлень користувачу

## Використання

### Редагування Описів
1. Перейдіть до вкладки "Marketing"
2. Заповніть або відредагуйте поля описів
3. Використовуйте Rich Text Editor для форматування
4. Натисніть "Save Changes" для збереження

### Зв'язування з PriceLabs
1. Натисніть "Link to PriceLabs"
2. Виберіть потрібний лістинг зі списку
3. Натисніть "Link" для зв'язування
4. Використовуйте "View in PriceLabs" для переходу до лістингу

### Управління Каналами
- Переглядайте статус кожного каналу
- Використовуйте кнопки "Connect" або "Manage" для налаштувань
- Статуси: "Active", "Not Connected"

## Майбутні Покращення

1. **Channel Manager Integration**: Повна інтеграція з системами управління каналами
2. **Template System**: Шаблони для швидкого створення описів
3. **Multi-language Support**: Підтримка кількох мов
4. **SEO Optimization**: Мета-теги та SEO налаштування
5. **A/B Testing**: Тестування різних варіантів описів
6. **Analytics**: Аналітика ефективності різних описів

## Файли

- **Компонент**: `/app/properties/[id]/components/tabs/MarketingTab.tsx`
- **Інтеграція**: `/app/properties/[id]/page.tsx`
- **Документація**: `/MARKETING_TAB_DOCUMENTATION.md`
