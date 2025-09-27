import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Et',
    localeDesc : 'Eesti keel',
    localeCode : 'et',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Kuva vihjed',
        Apply           : 'Rakenda',
        Learn           : 'Õpi',
        DownloadTrial   : 'Laadi alla prooviversioon',
        upgradeGuide    : 'Uuendamise juhend',
        documentation   : 'Dokumentatsioon',
        tabJS           : 'Näita JavaScripti näiteid',
        tabReact        : 'Näita Reacti näiteid',
        tabVue          : 'Näita Vue näiteid',
        tabAngular      : 'Näita Angulari näiteid'
    },

    Checkbox : {
        Automatically : 'Automaatselt',
        runHints      : 'Käivita vihjete voog käivitamisel'
    },

    Combo : {
        Theme    : 'Teema',
        Language : 'Keel',
        Size     : 'Suurus',
        jumpTo   : 'Hüppa juurde'
    },

    FilterField : {
        typeToFilter : 'Sisesta filtreerimiseks'
    },

    Popup : {
        UsedClasses : 'Selles demos kasutatud klassid'
    },

    SlideToggle : {
        newDemos : 'Uued ja uuendatud'
    },

    Shared : {
        'Locale changed' : 'Keel muutus'
    },

    TextField : {
        Filter : 'Filter'
    },

    Tooltip : {
        infoButton       : 'Klõpsake, et näidata infot ja vahetada teemat või keelt',
        codeButton       : 'Klõpsake, et näidata sisseehitatud koodiredaktorit',
        hintCheck        : 'Märkige, et automaatselt kuvada vihjeid näite laadimisel',
        fullscreenButton : 'Täisekraan',
        openInCodePen    : 'Ava CodePenis'
    }
};

export default LocaleHelper.publishLocale(locale);
