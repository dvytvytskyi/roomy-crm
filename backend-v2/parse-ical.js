const ical = require('node-ical');
const fs = require('fs');

console.log('🔍 Аналіз Airbnb iCal файлу');
console.log('='.repeat(50));

try {
  // Читаємо .ics файл
  const icsContent = fs.readFileSync('/tmp/airbnb_calendar.ics', 'utf8');
  
  // Парсимо iCal
  const parsed = ical.parseICS(icsContent);
  
  console.log('📊 Загальна інформація:');
  console.log(`- Тип: ${parsed.vcalendar?.type || 'N/A'}`);
  console.log(`- Версія: ${parsed.vcalendar?.version || 'N/A'}`);
  console.log(`- Кількість подій: ${Object.keys(parsed).filter(key => key.startsWith('VEVENT')).length}`);
  console.log('');
  
  // Аналізуємо кожну подію
  let eventCount = 0;
  Object.keys(parsed).forEach(key => {
    const event = parsed[key];
    
    if (event.type === 'VEVENT') {
      eventCount++;
      console.log(`📅 Подія #${eventCount}:`);
      console.log(`   UID: ${event.uid || 'N/A'}`);
      console.log(`   Summary: ${event.summary || 'N/A'}`);
      console.log(`   Description: ${event.description || 'N/A'}`);
      console.log(`   Start: ${event.start ? event.start.toISOString().split('T')[0] : 'N/A'}`);
      console.log(`   End: ${event.end ? event.end.toISOString().split('T')[0] : 'N/A'}`);
      console.log(`   Duration: ${event.start && event.end ? Math.ceil((event.end - event.start) / (1000 * 60 * 60 * 24)) + ' днів' : 'N/A'}`);
      
      // Додаткові поля
      if (event.location) console.log(`   Location: ${event.location}`);
      if (event.attendee) console.log(`   Attendee: ${event.attendee}`);
      if (event.organizer) console.log(`   Organizer: ${event.organizer}`);
      if (event.categories) console.log(`   Categories: ${event.categories}`);
      if (event.status) console.log(`   Status: ${event.status}`);
      if (event.transparency) console.log(`   Transparency: ${event.transparency}`);
      
      console.log('');
    }
  });
  
  console.log('🔍 Детальний аналіз полів:');
  console.log('='.repeat(30));
  
  // Аналізуємо summary
  const summaries = Object.keys(parsed)
    .filter(key => parsed[key].type === 'VEVENT')
    .map(key => parsed[key].summary)
    .filter(summary => summary);
    
  console.log('📝 Summary поля:');
  summaries.forEach((summary, index) => {
    console.log(`   ${index + 1}. "${summary}"`);
  });
  
  // Аналізуємо description
  const descriptions = Object.keys(parsed)
    .filter(key => parsed[key].type === 'VEVENT')
    .map(key => parsed[key].description)
    .filter(desc => desc);
    
  console.log('\n📄 Description поля:');
  if (descriptions.length > 0) {
    descriptions.forEach((desc, index) => {
      console.log(`   ${index + 1}. "${desc}"`);
    });
  } else {
    console.log('   ❌ Description поля відсутні');
  }
  
  // Перевіряємо наявність гостей
  const hasGuestInfo = summaries.some(summary => 
    summary && (
      summary.toLowerCase().includes('guest') ||
      summary.toLowerCase().includes('reserved') ||
      summary.toLowerCase().includes('booking') ||
      /^[A-Za-z\s]+$/.test(summary) // Тільки букви та пробіли (ім'я)
    )
  );
  
  console.log('\n🎯 Висновки:');
  console.log(`   - Є інформація про гостей: ${hasGuestInfo ? '✅ Так' : '❌ Ні'}`);
  console.log(`   - Summary містить імена: ${summaries.some(s => s && /^[A-Za-z\s]+$/.test(s)) ? '✅ Так' : '❌ Ні'}`);
  console.log(`   - Summary містить "Reserved": ${summaries.some(s => s && s.toLowerCase().includes('reserved')) ? '✅ Так' : '❌ Ні'}`);
  console.log(`   - Є description поля: ${descriptions.length > 0 ? '✅ Так' : '❌ Ні'}`);
  
} catch (error) {
  console.error('❌ Помилка при парсингу:', error.message);
}
