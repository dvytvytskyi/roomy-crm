import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Ms',
    localeDesc : 'Melayu',
    localeCode : 'ms',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Papar petunjuk',
        Apply           : 'Guna',
        Learn           : 'Belajar',
        DownloadTrial   : 'Muat Turun Percubaan',
        upgradeGuide    : 'Panduan Peningkatan',
        documentation   : 'Dokumentasi',
        tabJS           : 'Tunjukkan contoh JavaScript',
        tabReact        : 'Tunjukkan contoh React',
        tabVue          : 'Tunjukkan contoh Vue',
        tabAngular      : 'Tunjukkan contoh Angular'
    },

    Checkbox : {
        Automatically : 'Secara automatik',
        runHints      : 'Jalankan aliran petunjuk semasa permulaan'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Bahasa',
        Size     : 'Saiz',
        jumpTo   : 'Lompat ke'
    },

    FilterField : {
        typeToFilter : 'Taip untuk menapis'
    },

    Popup : {
        UsedClasses : 'Kelas yang digunakan dalam demo ini'
    },

    SlideToggle : {
        newDemos : 'Baru dan dikemas kini'
    },

    Shared : {
        'Locale changed' : 'Lokasi ditukar'
    },

    TextField : {
        Filter : 'Tapis'
    },

    Tooltip : {
        infoButton       : 'Klik untuk menunjukkan info dan menukar tema atau lokasi',
        codeButton       : 'Klik untuk menunjukkan editor kod terbina dalam',
        hintCheck        : 'Tandakan untuk memaparkan petunjuk secara automatik apabila memuatkan contoh',
        fullscreenButton : 'Skrin penuh',
        openInCodePen    : 'Buka di CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
