/**
 * برنامج تشغيل اختبارات التكامل الشامل للمشروع
 */

import ComprehensiveIntegrationTest from './comprehensive-integration.test.js';

// تهيئة وتشغيل الاختبارات
async function runTests() {
  console.log('بدء تشغيل اختبارات التكامل الشامل للمشروع...');
  
  try {
    // إنشاء كائن اختبار التكامل الشامل
    const integrationTest = new ComprehensiveIntegrationTest();
    
    // تشغيل جميع الاختبارات
    const success = await integrationTest.runAllTests();
    
    // الحصول على تقرير الاختبارات
    const testReport = integrationTest.getTestReport();
    
    // حفظ تقرير الاختبارات
    saveTestReport(testReport);
    
    console.log(`اكتمال اختبارات التكامل الشامل بنتيجة: ${success ? 'ناجح' : 'فاشل'}`);
    
    return success;
  } catch (error) {
    console.error('خطأ في تشغيل اختبارات التكامل الشامل:', error);
    return false;
  }
}

// حفظ تقرير الاختبارات
function saveTestReport(report) {
  try {
    // في بيئة المتصفح، يمكن حفظ التقرير في localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('integrationTestReport', JSON.stringify(report));
    }
    
    // في بيئة Node.js، يمكن حفظ التقرير في ملف
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    }
    
    console.log('تم حفظ تقرير الاختبارات بنجاح');
  } catch (error) {
    console.error('خطأ في حفظ تقرير الاختبارات:', error);
  }
}

// تشغيل الاختبارات عند تحميل الملف
runTests().then(success => {
  console.log(`نتيجة الاختبارات النهائية: ${success ? 'ناجح' : 'فاشل'}`);
}).catch(error => {
  console.error('خطأ غير متوقع أثناء تشغيل الاختبارات:', error);
});
