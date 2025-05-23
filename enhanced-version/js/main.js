/**
 * الملف الرئيسي لمحرر فيديو القرآن المطور
 * يقوم بتهيئة المحررين وتحميل الأصول وتفعيل الميزات
 */

// استيراد وحدات التكامل
import { initAssetsIntegration } from './assets-integration.js';
import { initGeneralAssetsIntegration } from './general-assets-integration.js';
import { testComprehensiveIntegration } from './integration-test.js';

// المتغيرات العامة
let activeEditor = 'quran-editor';
let activePanel = null;

/**
 * تهيئة التطبيق
 */
function initApp() {
  console.log('بدء تهيئة محرر فيديو القرآن المطور...');
  
  // تهيئة مستمعي الأحداث للتبديل بين المحررين
  document.getElementById('quran-editor-tab').addEventListener('click', (e) => {
    e.preventDefault();
    switchEditor('quran-editor');
  });
  
  document.getElementById('general-editor-tab').addEventListener('click', (e) => {
    e.preventDefault();
    switchEditor('general-editor');
  });
  
  // تهيئة مستمعي الأحداث لأزرار الأدوات
  document.querySelectorAll('.tool-button').forEach(button => {
    button.addEventListener('click', () => {
      const tool = button.dataset.tool;
      openToolPanel(tool);
    });
  });
  
  // تهيئة تكامل الأصول
  if (activeEditor === 'quran-editor') {
    initAssetsIntegration();
  } else {
    initGeneralAssetsIntegration();
  }
  
  // تشغيل اختبار التكامل الشامل
  const testResults = runIntegrationTests();
  
  console.log('اكتملت تهيئة محرر فيديو القرآن المطور بنجاح');
}

/**
 * تبديل المحرر النشط
 */
function switchEditor(editorId) {
  // إخفاء جميع المحررين
  document.querySelectorAll('.editor-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // إظهار المحرر المحدد
  document.getElementById(`${editorId}-section`).classList.add('active');
  
  // تحديث التبويب النشط
  document.querySelectorAll('nav ul li a').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(`${editorId}-tab`).classList.add('active');
  
  // تحديث المحرر النشط
  activeEditor = editorId;
  
  // تهيئة تكامل الأصول للمحرر النشط
  if (editorId === 'quran-editor') {
    initAssetsIntegration();
  } else {
    initGeneralAssetsIntegration();
  }
  
  console.log(`تم التبديل إلى محرر: ${editorId}`);
}

/**
 * فتح لوحة أداة محددة
 */
function openToolPanel(toolId) {
  // إخفاء جميع اللوحات
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // إظهار اللوحة المحددة
  const panelId = `${toolId}-panel`;
  const panel = document.getElementById(panelId);
  
  if (panel) {
    panel.classList.add('active');
    activePanel = panelId;
    console.log(`تم فتح لوحة الأداة: ${toolId}`);
  } else {
    console.warn(`لوحة الأداة غير موجودة: ${toolId}`);
  }
}

/**
 * تشغيل اختبارات التكامل
 */
function runIntegrationTests() {
  console.log('بدء تشغيل اختبارات التكامل...');
  
  try {
    const results = testComprehensiveIntegration();
    console.log('نتائج اختبارات التكامل:', results);
    return results;
  } catch (error) {
    console.error('فشل تشغيل اختبارات التكامل:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// تشغيل التطبيق عند اكتمال تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);

// تصدير الدوال للاستخدام الخارجي
export {
  initApp,
  switchEditor,
  openToolPanel,
  runIntegrationTests
};
