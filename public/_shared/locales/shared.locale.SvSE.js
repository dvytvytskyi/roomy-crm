import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'SvSE',
    localeDesc : 'Svenska',
    localeCode : 'sv-SE',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Visa tips',
        Apply           : 'Verkställ',
        Learn           : 'Lär',
        DownloadTrial   : 'Ladda ner testversion',
        upgradeGuide    : 'Uppgraderingsguide',
        documentation   : 'Dokumentation',
        tabJS           : 'Visa JavaScript-exempel',
        tabReact        : 'Visa React-exempel',
        tabVue          : 'Visa Vue-exempel',
        tabAngular      : 'Visa Angular-exempel'
    },

    Checkbox : {
        Automatically : 'Automatiskt',
        runHints      : 'Kör tipsflöde vid start'
    },

    Combo : {
        Theme    : 'Välj tema',
        Language : 'Välj språk',
        Size     : 'Välj storlek',
        jumpTo   : 'Hoppa till'
    },

    FilterField : {
        typeToFilter : 'Skriv för att filtrera'
    },

    Popup : {
        UsedClasses : 'Klasser som används i denna demo'
    },

    SlideToggle : {
        newDemos : 'Nya och uppdaterade'
    },

    Shared : {
        'Locale changed' : 'Språk ändrat'
    },

    TextField : {
        Filter : 'Filter'
    },

    Tooltip : {
        infoButton       : 'Klicka för att visa information och byta tema eller språk',
        codeButton       : 'Klicka för att visa den inbyggda kodredigeraren',
        hintCheck        : 'Markera för att automatiskt visa tips när du laddar exemplet',
        fullscreenButton : 'Fullskärm',
        openInCodePen    : 'Öppna i CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
