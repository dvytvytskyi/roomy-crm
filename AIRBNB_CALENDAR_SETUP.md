# Airbnb Calendar Integration Setup

## Проблема з ngrok URL

Раніше в системі був захардкоджений ngrok URL, який більше не працює. Це було виправлено.

## Як налаштувати Airbnb календарну інтеграцію

### 1. Отримати iCal Export URL з вашої системи

1. Відкрийте вашу property: `http://localhost:3000/properties/property-1760654434950-0q2k62mf3`
2. Перейдіть на вкладку "Marketing"
3. У розділі "Calendar Integration" знайдіть iCal URL
4. Скопіюйте URL (наприклад: `http://localhost:3002/api/v2/calendar/properties/property-1760654434950-0q2k62mf3/calendar.ics`)

### 2. Налаштувати Airbnb

1. Увійдіть в ваш Airbnb акаунт
2. Перейдіть до вашого listing
3. Натисніть "Calendar" → "Sync calendars"
4. Натисніть "Import calendar"
5. Вставте скопійований URL
6. Натисніть "Add calendar"

### 3. Налаштувати імпорт з Airbnb (опціонально)

Якщо ви хочете імпортувати бронювання з Airbnb до вашої системи:

1. У Airbnb перейдіть до "Calendar" → "Sync calendars"
2. Натисніть "Export calendar"
3. Скопіюйте URL експорту
4. У вашій системі перейдіть до property settings
5. Додайте Airbnb iCal import URL

### 4. Тестування

1. Створіть тестове бронювання в вашій системі
2. Перевірте, чи з'явилося воно в Airbnb календарі
3. Створіть бронювання в Airbnb
4. Перевірте, чи імпортувалося воно в вашу систему

## Технічні деталі

### API Endpoints

- **Export calendar**: `GET /api/v2/calendar/properties/{propertyId}/calendar.ics`
- **Update import URLs**: `PUT /api/v2/calendar/properties/{propertyId}/calendar-imports`
- **Manual import**: `POST /api/v2/calendar/import`

### Автоматичний імпорт

Система автоматично імпортує календарі кожні 5 хвилин з усіх налаштованих джерел.

### Формат iCal

Система генерує стандартний iCal файл з:
- Підтвердженими резерваціями як "BUSY" події
- Тестовою подією для валідності календаря (якщо немає резервацій)
- Правильними часовими зонами (Europe/Kiev)

## Вирішені проблеми

✅ **Захардкоджений ngrok URL** - тепер використовується динамічний URL з конфігурації
✅ **iCal імпорт** - працює автоматично кожні 5 хвилин
✅ **Календарний експорт** - генерує валідний iCal файл
✅ **CORS налаштування** - правильно налаштовані для Airbnb

## Наступні кроки

1. Налаштуйте ngrok або інший туннель для production
2. Оновіть `NEXT_PUBLIC_API_URL` в `.env` файлі
3. Протестуйте інтеграцію з реальним Airbnb listing
