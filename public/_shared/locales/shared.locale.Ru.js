import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Ru',
    localeDesc : 'Русский',
    localeCode : 'ru',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Показать подсказки',
        Apply           : 'Применить',
        Learn           : 'Изучить',
        DownloadTrial   : 'Скачать пробную версию',
        upgradeGuide    : 'Руководство по обновлению',
        documentation   : 'Документация',
        tabJS           : 'Показать примеры JavaScript',
        tabReact        : 'Показать примеры React',
        tabVue          : 'Показать примеры Vue',
        tabAngular      : 'Показать примеры Angular'
    },

    Checkbox : {
        Automatically : 'Автоматически',
        runHints      : 'Запустить подсказку при запуске'
    },

    Combo : {
        Theme    : 'Выбрать тему',
        Language : 'Выбрать язык',
        Size     : 'Выбрать размер',
        jumpTo   : 'Перейти к'
    },

    FilterField : {
        typeToFilter : 'Введите для фильтрации'
    },

    Popup : {
        UsedClasses : 'Классы, используемые в этом демо'
    },

    SlideToggle : {
        newDemos : 'Новые и обновленные'
    },

    Shared : {
        'Locale changed' : 'Язык изменен'
    },

    TextField : {
        Filter : 'Фильтр'
    },

    Tooltip : {
        infoButton       : 'Показать редактор кода',
        codeButton       : 'Показать информацию, переключить тему или язык',
        hintCheck        : 'Автоматически показывать подсказки при загрузке примера',
        fullscreenButton : 'На весь экран',
        openInCodePen    : 'Открыть в CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
