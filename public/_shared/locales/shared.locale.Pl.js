import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Pl',
    localeDesc : 'Polski',
    localeCode : 'pl',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Wyświetl wskazówki',
        Apply           : 'Zastosuj',
        Learn           : 'Ucz się',
        DownloadTrial   : 'Pobierz wersję próbną',
        upgradeGuide    : 'Przewodnik aktualizacji',
        documentation   : 'Dokumentacja',
        tabJS           : 'Pokaż przykłady JavaScript',
        tabReact        : 'Pokaż przykłady React',
        tabVue          : 'Pokaż przykłady Vue',
        tabAngular      : 'Pokaż przykłady Angular'
    },

    Checkbox : {
        Automatically : 'Automatycznie',
        runHints      : 'Uruchom przepływ wskazówek przy starcie'
    },

    Combo : {
        Theme    : 'Motyw',
        Language : 'Język',
        Size     : 'Rozmiar',
        jumpTo   : 'Przejdź do'
    },

    FilterField : {
        typeToFilter : 'Wpisz, aby filtrować'
    },

    Popup : {
        UsedClasses : 'Klasy używane w tym demo'
    },

    SlideToggle : {
        newDemos : 'Nowe i zaktualizowane'
    },

    Shared : {
        'Locale changed' : 'Zmieniono ustawienia regionalne'
    },

    TextField : {
        Filter : 'Filtr'
    },

    Tooltip : {
        infoButton       : 'Kliknij, aby wyświetlić informacje i zmienić motyw lub ustawienia regionalne',
        codeButton       : 'Kliknij, aby wyświetlić wbudowany edytor kodu',
        hintCheck        : 'Zaznacz, aby automatycznie wyświetlać wskazówki podczas ładowania przykładu',
        fullscreenButton : 'Pełny ekran',
        openInCodePen    : 'Otwórz w CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
