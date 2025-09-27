import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'He',
    localeDesc : 'עִברִית',
    localeCode : 'he',
    localeRtl  : true,

    Button : {
        'Display hints' : 'הצג רמזים',
        Apply           : 'החל',
        Learn           : 'למד',
        DownloadTrial   : 'הורד גרסת ניסיון',
        upgradeGuide    : 'מדריך שדרוג',
        documentation   : 'תיעוד',
        tabJS           : 'הצג דוגמאות JavaScript',
        tabReact        : 'הצג דוגמאות React',
        tabVue          : 'הצג דוגמאות Vue',
        tabAngular      : 'הצג דוגמאות Angular'
    },

    Checkbox : {
        Automatically : 'אוטומטית',
        runHints      : 'הפעל זרימת רמזים בעת ההפעלה'
    },

    Combo : {
        Theme    : 'ערכת נושא',
        Language : 'שפה',
        Size     : 'גודל',
        jumpTo   : 'עבור אל'
    },

    FilterField : {
        typeToFilter : 'הקלד לסינון'
    },

    Popup : {
        UsedClasses : 'מחלקות בשימוש בהדגמה זו'
    },

    SlideToggle : {
        newDemos : 'חדש ומעודכן'
    },

    Shared : {
        'Locale changed' : 'השפה שונתה'
    },

    TextField : {
        Filter : 'סינון'
    },

    Tooltip : {
        infoButton       : 'לחץ כדי להציג מידע ולהחליף ערכת נושא או שפה',
        codeButton       : 'לחץ כדי להציג את עורך הקוד המובנה',
        hintCheck        : 'סמן כדי להציג רמזים אוטומטית בעת טעינת הדוגמה',
        fullscreenButton : 'מסך מלא',
        openInCodePen    : 'פתח ב-CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
