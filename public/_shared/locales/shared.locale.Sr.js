import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Sr',
    localeDesc : 'Srpski',
    localeCode : 'sr',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Prikaži savete',
        Apply           : 'Primeni',
        Learn           : 'Nauči',
        DownloadTrial   : 'Preuzmi probnu verziju',
        upgradeGuide    : 'Vodič za nadogradnju',
        documentation   : 'Dokumentacija',
        tabJS           : 'Prikaži primere JavaScript-a',
        tabReact        : 'Prikaži primere React-a',
        tabVue          : 'Prikaži primere Vue-a',
        tabAngular      : 'Prikaži primere Angular-a'
    },

    Checkbox : {
        Automatically : 'Automatski',
        runHints      : 'Pokreni tok saveta pri pokretanju'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Jezik',
        Size     : 'Veličina',
        jumpTo   : 'Idi na'
    },

    FilterField : {
        typeToFilter : 'Unesite za filtriranje'
    },

    Popup : {
        UsedClasses : 'Klase korišćene u ovom demou'
    },

    SlideToggle : {
        newDemos : 'Novi i ažurirani'
    },

    Shared : {
        'Locale changed' : 'Lokalizacija promenjena'
    },

    TextField : {
        Filter : 'Filter'
    },

    Tooltip : {
        infoButton       : 'Kliknite da prikažete informacije i promenite temu ili lokalizaciju',
        codeButton       : 'Kliknite da prikažete ugrađeni uređivač koda',
        hintCheck        : 'Označite da automatski prikažete savete prilikom učitavanja primera',
        fullscreenButton : 'Ceo ekran',
        openInCodePen    : 'Otvori u CodePen-u'
    }
};

export default LocaleHelper.publishLocale(locale);
