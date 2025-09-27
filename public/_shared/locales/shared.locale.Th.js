import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Th',
    localeDesc : 'ไทย',
    localeCode : 'th',
    localeRtl  : false,

    Button : {
        'Display hints' : 'แสดงคำแนะนำ',
        Apply           : 'ใช้',
        Learn           : 'เรียนรู้',
        DownloadTrial   : 'ดาวน์โหลดรุ่นทดลอง',
        upgradeGuide    : 'คู่มือการอัปเกรด',
        documentation   : 'เอกสารประกอบ',
        tabJS           : 'แสดงตัวอย่าง JavaScript',
        tabReact        : 'แสดงตัวอย่าง React',
        tabVue          : 'แสดงตัวอย่าง Vue',
        tabAngular      : 'แสดงตัวอย่าง Angular'
    },

    Checkbox : {
        Automatically : 'อัตโนมัติ',
        runHints      : 'เรียกใช้กระบวนการคำแนะนำเมื่อเริ่มต้น'
    },

    Combo : {
        Theme    : 'ธีม',
        Language : 'ภาษา',
        Size     : 'ขนาด',
        jumpTo   : 'ไปยัง'
    },

    FilterField : {
        typeToFilter : 'พิมพ์เพื่อกรอง'
    },

    Popup : {
        UsedClasses : 'คลาสที่ใช้ในเดโมนี้'
    },

    SlideToggle : {
        newDemos : 'ใหม่และอัปเดต'
    },

    Shared : {
        'Locale changed' : 'เปลี่ยนภาษาแล้ว'
    },

    TextField : {
        Filter : 'กรอง'
    },

    Tooltip : {
        infoButton       : 'คลิกเพื่อแสดงข้อมูลและเปลี่ยนธีมหรือภาษา',
        codeButton       : 'คลิกเพื่อแสดงตัวแก้ไขโค้ดในตัว',
        hintCheck        : 'เลือกเพื่อแสดงคำแนะนำโดยอัตโนมัติเมื่อโหลดตัวอย่าง',
        fullscreenButton : 'เต็มจอ',
        openInCodePen    : 'เปิดใน CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
