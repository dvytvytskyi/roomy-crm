import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Fi',
    localeDesc : 'Suomi',
    localeCode : 'fi',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Näytä vihjeet',
        Apply           : 'Käytä',
        Learn           : 'Opi',
        DownloadTrial   : 'Lataa kokeiluversio',
        upgradeGuide    : 'Päivitysopas',
        documentation   : 'Dokumentaatio',
        tabJS           : 'Näytä JavaScript-esimerkit',
        tabReact        : 'Näytä React-esimerkit',
        tabVue          : 'Näytä Vue-esimerkit',
        tabAngular      : 'Näytä Angular-esimerkit'
    },

    Checkbox : {
        Automatically : 'Automaattisesti',
        runHints      : 'Suorita vihjevirta käynnistyksen yhteydessä'
    },

    Combo : {
        Theme    : 'Teema',
        Language : 'Kieli',
        Size     : 'Koko',
        jumpTo   : 'Siirry kohtaan'
    },

    FilterField : {
        typeToFilter : 'Kirjoita suodattaaksesi'
    },

    Popup : {
        UsedClasses : 'Tässä demossa käytetyt luokat'
    },

    SlideToggle : {
        newDemos : 'Uudet ja päivitetyt'
    },

    Shared : {
        'Locale changed' : 'Kieli muuttui'
    },

    TextField : {
        Filter : 'Suodata'
    },

    Tooltip : {
        infoButton       : 'Napsauta näyttääksesi tiedot ja vaihtaaksesi teeman tai kielen',
        codeButton       : 'Napsauta näyttääksesi sisäänrakennetun koodieditorin',
        hintCheck        : 'Valitse näyttääksesi vihjeet automaattisesti esimerkkiä ladattaessa',
        fullscreenButton : 'Koko näyttö',
        openInCodePen    : 'Avaa CodePenissä'
    }
};

export default LocaleHelper.publishLocale(locale);
