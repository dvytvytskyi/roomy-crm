import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'ZhCn',
    localeDesc : '中文（中国）',
    localeCode : 'zh-CN',
    localeRtl  : false,

    Button : {
        'Display hints' : '显示提示',
        Apply           : '应用',
        Learn           : '学习',
        DownloadTrial   : '下载试用',
        upgradeGuide    : '升级指南',
        documentation   : '文档',
        tabJS           : '显示 JavaScript 示例',
        tabReact        : '显示 React 示例',
        tabVue          : '显示 Vue 示例',
        tabAngular      : '显示 Angular 示例'
    },

    Checkbox : {
        Automatically : '自动',
        runHints      : '启动时运行提示流程'
    },

    Combo : {
        Theme    : '主题',
        Language : '语言',
        Size     : '大小',
        jumpTo   : '跳转到'
    },

    FilterField : {
        typeToFilter : '输入以筛选'
    },

    Popup : {
        UsedClasses : '此演示中使用的类'
    },

    SlideToggle : {
        newDemos : '新的和更新的'
    },

    Shared : {
        'Locale changed' : '语言环境已更改'
    },

    TextField : {
        Filter : '过滤'
    },

    Tooltip : {
        infoButton       : '点击以显示信息并切换主题或语言环境',
        codeButton       : '点击以显示内置代码编辑器',
        hintCheck        : '选中以在加载示例时自动显示提示',
        fullscreenButton : '全屏',
        openInCodePen    : '在 CodePen 中打开'
    }
};

export default LocaleHelper.publishLocale(locale);
