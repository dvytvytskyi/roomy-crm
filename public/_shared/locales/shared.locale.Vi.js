import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Vi',
    localeDesc : 'Tiếng Việt',
    localeCode : 'vi',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Hiển thị gợi ý',
        Apply           : 'Áp dụng',
        Learn           : 'Học',
        DownloadTrial   : 'Tải bản dùng thử',
        upgradeGuide    : 'Hướng dẫn nâng cấp',
        documentation   : 'Tài liệu',
        tabJS           : 'Hiển thị ví dụ JavaScript',
        tabReact        : 'Hiển thị ví dụ React',
        tabVue          : 'Hiển thị ví dụ Vue',
        tabAngular      : 'Hiển thị ví dụ Angular'
    },

    Checkbox : {
        Automatically : 'Tự động',
        runHints      : 'Chạy luồng gợi ý khi khởi động'
    },

    Combo : {
        Theme    : 'Chủ đề',
        Language : 'Ngôn ngữ',
        Size     : 'Kích thước',
        jumpTo   : 'Chuyển đến'
    },

    FilterField : {
        typeToFilter : 'Nhập để lọc'
    },

    Popup : {
        UsedClasses : 'Các lớp được sử dụng trong bản demo này'
    },

    SlideToggle : {
        newDemos : 'Mới và cập nhật'
    },

    Shared : {
        'Locale changed' : 'Ngôn ngữ đã thay đổi'
    },

    TextField : {
        Filter : 'Bộ lọc'
    },

    Tooltip : {
        infoButton       : 'Nhấn để hiển thị thông tin và chuyển đổi chủ đề hoặc ngôn ngữ',
        codeButton       : 'Nhấn để hiển thị trình chỉnh sửa mã tích hợp',
        hintCheck        : 'Chọn để tự động hiển thị gợi ý khi tải ví dụ',
        fullscreenButton : 'Toàn màn hình',
        openInCodePen    : 'Mở trong CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
