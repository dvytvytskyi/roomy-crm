import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Bg',
    localeDesc : 'Български',
    localeCode : 'bg',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Показване на подсказки',
        Apply           : 'Приложи',
        Learn           : 'Научи',
        DownloadTrial   : 'Изтегли пробна версия',
        upgradeGuide    : 'Ръководство за надграждане',
        documentation   : 'Документация',
        tabJS           : 'Показване на примери за JavaScript',
        tabReact        : 'Показване на примери за React',
        tabVue          : 'Показване на примери за Vue',
        tabAngular      : 'Показване на примери за Angular'
    },

    Checkbox : {
        Automatically : 'Автоматично',
        runHints      : 'Стартиране на потока с подсказки при стартиране'
    },

    Combo : {
        Theme    : 'Тема',
        Language : 'Език',
        Size     : 'Размер',
        jumpTo   : 'Прескачане към'
    },

    FilterField : {
        typeToFilter : 'Въведете за филтриране'
    },

    Popup : {
        UsedClasses : 'Класове, използвани в тази демонстрация'
    },

    SlideToggle : {
        newDemos : 'Нови и актуализирани'
    },

    Shared : {
        'Locale changed' : 'Локалът е променен'
    },

    TextField : {
        Filter : 'Филтър'
    },

    Tooltip : {
        infoButton       : 'Кликнете, за да покажете информация и да смените темата или локала',
        codeButton       : 'Кликнете, за да покажете вградения редактор на код',
        hintCheck        : 'Отметнете, за да показвате автоматично подсказки при зареждане на примера',
        fullscreenButton : 'Цял екран',
        openInCodePen    : 'Отвори в CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
