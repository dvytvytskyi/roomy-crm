import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Hr',
    localeDesc : 'Hrvatski',
    localeCode : 'hr',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Prikaži savjete',
        Apply           : 'Primijeni',
        Learn           : 'Uči',
        DownloadTrial   : 'Preuzmi probnu verziju',
        upgradeGuide    : 'Vodič za nadogradnju',
        documentation   : 'Dokumentacija',
        tabJS           : 'Prikaži primjere JavaScripta',
        tabReact        : 'Prikaži primjere Reacta',
        tabVue          : 'Prikaži primjere Vuea',
        tabAngular      : 'Prikaži primjere Angulara'
    },

    Checkbox : {
        Automatically : 'Automatski',
        runHints      : 'Pokreni tijek savjeta pri pokretanju'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Jezik',
        Size     : 'Veličina',
        jumpTo   : 'Skoči na'
    },

    FilterField : {
        typeToFilter : 'Upišite za filtriranje'
    },

    Popup : {
        UsedClasses : 'Klase korištene u ovom demou'
    },

    SlideToggle : {
        newDemos : 'Novi i ažurirani'
    },

    Shared : {
        'Locale changed' : 'Lokalitet promijenjen'
    },

    TextField : {
        Filter : 'Filtriraj'
    },

    Tooltip : {
        infoButton       : 'Kliknite za prikaz informacija i promjenu teme ili lokaliteta',
        codeButton       : 'Kliknite za prikaz ugrađenog uređivača koda',
        hintCheck        : 'Označite za automatski prikaz savjeta prilikom učitavanja primjera',
        fullscreenButton : 'Cijeli ekran',
        openInCodePen    : 'Otvori u CodePen-u'
    }
};

export default LocaleHelper.publishLocale(locale);
