import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Ar',
    localeDesc : 'اللغة العربية',
    localeCode : 'ar',
    localeRtl  : true,

    Button : {
        'Display hints' : 'عرض التلميحات',
        Apply           : 'تطبيق',
        Learn           : 'تعلم',
        DownloadTrial   : 'تحميل النسخة التجريبية',
        upgradeGuide    : 'دليل الترقية',
        documentation   : 'التوثيق',
        tabJS           : 'عرض أمثلة JavaScript',
        tabReact        : 'عرض أمثلة React',
        tabVue          : 'عرض أمثلة Vue',
        tabAngular      : 'عرض أمثلة Angular'
    },

    Checkbox : {
        Automatically : 'تلقائيًا',
        runHints      : 'تشغيل تدفق التلميحات عند بدء التشغيل'
    },

    Combo : {
        Theme    : 'السمة',
        Language : 'اللغة',
        Size     : 'الحجم',
        jumpTo   : 'الانتقال إلى'
    },

    FilterField : {
        typeToFilter : 'اكتب للتصفية'
    },

    Popup : {
        UsedClasses : 'الفئات المستخدمة في هذا العرض'
    },

    SlideToggle : {
        newDemos : 'جديد ومحدث'
    },

    Shared : {
        'Locale changed' : 'تم تغيير اللغة'
    },

    TextField : {
        Filter : 'تصفية'
    },

    Tooltip : {
        infoButton       : 'انقر لعرض المعلومات وتغيير السمة أو اللغة',
        codeButton       : 'انقر لعرض محرر الشيفرة المدمج',
        hintCheck        : 'حدد لعرض التلميحات تلقائيًا عند تحميل المثال',
        fullscreenButton : 'شاشة كاملة',
        openInCodePen    : 'افتح في CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
