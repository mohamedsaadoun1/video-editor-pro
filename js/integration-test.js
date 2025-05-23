/**
 * ملف اختبار التكامل الشامل للمشروع
 * يقوم هذا الملف باختبار تكامل جميع الأصول والميزات في المحررين
 */

// استيراد وحدات التكامل
import { initAssetsIntegration } from './assets-integration.js';
import { initGeneralAssetsIntegration } from './general-assets-integration.js';

// استيراد وحدات المحررين
import * as QuranEditor from './features/quran-editor/quran-editor.design.js';
import * as GeneralEditor from './features/general-editor/general-editor.design.js';

// استيراد وحدات الميزات المتقدمة
import * as AIFeatures from './features/ai-innovations/automatic-verse-recognition.js';

/**
 * اختبار تكامل محرر فيديو القرآن
 */
function testQuranEditorIntegration() {
  console.log('بدء اختبار تكامل محرر فيديو القرآن...');
  
  try {
    // تهيئة محرر فيديو القرآن
    QuranEditor.initialize();
    
    // تهيئة تكامل الأصول
    initAssetsIntegration();
    
    // اختبار تحميل الخلفيات
    const backgrounds = document.querySelectorAll('.background-item.islamic');
    console.log(`تم تحميل ${backgrounds.length} خلفية إسلامية`);
    
    // اختبار تحميل التلاوات
    const recitations = document.querySelectorAll('.recitation-item');
    console.log(`تم تحميل ${recitations.length} تلاوة قرآنية`);
    
    // اختبار تحميل الخطوط
    const fontFamilies = document.fonts.check('12px Amiri') && document.fonts.check('12px Cairo');
    console.log(`حالة تحميل الخطوط العربية: ${fontFamilies ? 'ناجح' : 'فاشل'}`);
    
    // اختبار المؤثرات الصوتية
    const audioTest = new Audio('../assets/effects/ui-pop-sound.mp3');
    audioTest.volume = 0.1;
    audioTest.play().then(() => {
      console.log('اختبار المؤثرات الصوتية: ناجح');
    }).catch(error => {
      console.error('اختبار المؤثرات الصوتية: فاشل', error);
    });
    
    // اختبار أدوات محرر فيديو القرآن
    QuranEditor.testAllTools();
    
    console.log('اكتمل اختبار تكامل محرر فيديو القرآن بنجاح');
    return true;
  } catch (error) {
    console.error('فشل اختبار تكامل محرر فيديو القرآن:', error);
    return false;
  }
}

/**
 * اختبار تكامل محرر الفيديو العام
 */
function testGeneralEditorIntegration() {
  console.log('بدء اختبار تكامل محرر الفيديو العام...');
  
  try {
    // تهيئة محرر الفيديو العام
    GeneralEditor.initialize();
    
    // تهيئة تكامل الأصول
    initGeneralAssetsIntegration();
    
    // اختبار تحميل الفلاتر
    const filters = document.querySelectorAll('.filter-item');
    console.log(`تم تحميل ${filters.length} فلتر`);
    
    // اختبار تحميل الانتقالات
    const transitions = document.querySelectorAll('.transition-item');
    console.log(`تم تحميل ${transitions.length} انتقال`);
    
    // اختبار تحميل الخطوط
    const fontFamilies = document.fonts.check('12px Amiri') && document.fonts.check('12px Cairo');
    console.log(`حالة تحميل الخطوط العربية: ${fontFamilies ? 'ناجح' : 'فاشل'}`);
    
    // اختبار المؤثرات الصوتية
    const audioTest = new Audio('../assets/effects/ui-pop-sound.mp3');
    audioTest.volume = 0.1;
    audioTest.play().then(() => {
      console.log('اختبار المؤثرات الصوتية: ناجح');
    }).catch(error => {
      console.error('اختبار المؤثرات الصوتية: فاشل', error);
    });
    
    // اختبار أدوات محرر الفيديو العام
    GeneralEditor.testAllTools();
    
    console.log('اكتمل اختبار تكامل محرر الفيديو العام بنجاح');
    return true;
  } catch (error) {
    console.error('فشل اختبار تكامل محرر الفيديو العام:', error);
    return false;
  }
}

/**
 * اختبار تكامل الميزات المتقدمة بالذكاء الاصطناعي
 */
function testAIFeaturesIntegration() {
  console.log('بدء اختبار تكامل ميزات الذكاء الاصطناعي...');
  
  try {
    // تهيئة ميزات الذكاء الاصطناعي
    AIFeatures.initialize();
    
    // اختبار التعرف التلقائي على الآيات
    const verseRecognitionTest = AIFeatures.testVerseRecognition();
    console.log(`اختبار التعرف التلقائي على الآيات: ${verseRecognitionTest ? 'ناجح' : 'فاشل'}`);
    
    // اختبار توليد الخلفيات بالذكاء الاصطناعي
    const backgroundGenerationTest = AIFeatures.testBackgroundGeneration();
    console.log(`اختبار توليد الخلفيات بالذكاء الاصطناعي: ${backgroundGenerationTest ? 'ناجح' : 'فاشل'}`);
    
    // اختبار تحسين الصوت الذكي
    const audioEnhancementTest = AIFeatures.testAudioEnhancement();
    console.log(`اختبار تحسين الصوت الذكي: ${audioEnhancementTest ? 'ناجح' : 'فاشل'}`);
    
    console.log('اكتمل اختبار تكامل ميزات الذكاء الاصطناعي بنجاح');
    return true;
  } catch (error) {
    console.error('فشل اختبار تكامل ميزات الذكاء الاصطناعي:', error);
    return false;
  }
}

/**
 * اختبار التكامل الشامل للمشروع
 */
function testComprehensiveIntegration() {
  console.log('بدء اختبار التكامل الشامل للمشروع...');
  
  // اختبار تكامل محرر فيديو القرآن
  const quranEditorResult = testQuranEditorIntegration();
  
  // اختبار تكامل محرر الفيديو العام
  const generalEditorResult = testGeneralEditorIntegration();
  
  // اختبار تكامل ميزات الذكاء الاصطناعي
  const aiResult = testAIFeaturesIntegration();
  
  // التحقق من نجاح جميع الاختبارات
  const overallResult = quranEditorResult && generalEditorResult && aiResult;
  
  if (overallResult) {
    console.log('اكتمل اختبار التكامل الشامل للمشروع بنجاح');
  } else {
    console.error('فشل اختبار التكامل الشامل للمشروع');
  }
  
  return {
    success: overallResult,
    quranEditor: quranEditorResult,
    generalEditor: generalEditorResult,
    aiFeatures: aiResult,
    timestamp: new Date().toISOString()
  };
}

// تصدير الدوال للاستخدام الخارجي
export {
  testQuranEditorIntegration,
  testGeneralEditorIntegration,
  testAIFeaturesIntegration,
  testComprehensiveIntegration
};
