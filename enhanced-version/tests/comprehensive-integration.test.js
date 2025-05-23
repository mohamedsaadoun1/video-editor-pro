/**
 * ملف اختبار التكامل الشامل للمشروع
 * يقوم باختبار تكامل جميع المكونات والميزات في المشروع بشكل شامل
 */

// استيراد اختبارات محرر فيديو القرآن
import QuranEditorIntegrationTest from './quran-editor-integration.test.js';

// استيراد اختبارات محرر الفيديو العام
import GeneralEditorIntegrationTest from './general-editor-integration.test.js';

// تعريف فئة اختبار التكامل الشامل
class ComprehensiveIntegrationTest {
  constructor() {
    this.quranEditorTest = new QuranEditorIntegrationTest();
    this.generalEditorTest = new GeneralEditorIntegrationTest();
    this.testResults = {
      quranEditor: null,
      generalEditor: null,
      crossIntegration: null,
      overall: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };
  }

  /**
   * اختبار تكامل محرر فيديو القرآن
   */
  async testQuranEditor() {
    console.log('=== بدء اختبار تكامل محرر فيديو القرآن ===');
    const quranEditorResult = await this.quranEditorTest.runAllTests();
    this.testResults.quranEditor = {
      success: quranEditorResult,
      details: this.quranEditorTest.testResults
    };
    
    this.testResults.overall.passed += this.quranEditorTest.testResults.passed;
    this.testResults.overall.failed += this.quranEditorTest.testResults.failed;
    this.testResults.overall.total += this.quranEditorTest.testResults.total;
    
    console.log(`نتيجة اختبار محرر فيديو القرآن: ${quranEditorResult ? 'ناجح' : 'فاشل'}`);
    return quranEditorResult;
  }

  /**
   * اختبار تكامل محرر الفيديو العام
   */
  async testGeneralEditor() {
    console.log('=== بدء اختبار تكامل محرر الفيديو العام ===');
    const generalEditorResult = await this.generalEditorTest.runAllTests();
    this.testResults.generalEditor = {
      success: generalEditorResult,
      details: this.generalEditorTest.testResults
    };
    
    this.testResults.overall.passed += this.generalEditorTest.testResults.passed;
    this.testResults.overall.failed += this.generalEditorTest.testResults.failed;
    this.testResults.overall.total += this.generalEditorTest.testResults.total;
    
    console.log(`نتيجة اختبار محرر الفيديو العام: ${generalEditorResult ? 'ناجح' : 'فاشل'}`);
    return generalEditorResult;
  }

  /**
   * اختبار التكامل المتبادل بين المحررين
   */
  async testCrossIntegration() {
    console.log('=== بدء اختبار التكامل المتبادل بين المحررين ===');
    
    try {
      // إنشاء عناصر DOM للاختبار
      document.body.innerHTML = `
        <div id="editors-container">
          <div id="quran-editor-container"></div>
          <div id="general-editor-container"></div>
        </div>
        <div id="shared-resources-container"></div>
      `;
      
      // تهيئة المحررين
      const quranEditor = new QuranEditorDesign();
      await quranEditor.initialize({
        container: document.getElementById('quran-editor-container')
      });
      
      const generalEditor = new GeneralEditorDesign();
      await generalEditor.initialize({
        container: document.getElementById('general-editor-container')
      });
      
      // اختبار مشاركة الموارد
      const resourcesShared = await this.testResourceSharing(quranEditor, generalEditor);
      
      // اختبار تبادل المحتوى
      const contentExchanged = await this.testContentExchange(quranEditor, generalEditor);
      
      // اختبار تكامل الإعدادات
      const settingsIntegrated = await this.testSettingsIntegration(quranEditor, generalEditor);
      
      // اختبار تكامل الذكاء الاصطناعي
      const aiIntegrated = await this.testAIIntegration(quranEditor, generalEditor);
      
      // تجميع النتائج
      const crossIntegrationSuccess = resourcesShared && contentExchanged && settingsIntegrated && aiIntegrated;
      
      this.testResults.crossIntegration = {
        success: crossIntegrationSuccess,
        details: {
          resourcesShared,
          contentExchanged,
          settingsIntegrated,
          aiIntegrated
        }
      };
      
      // تحديث النتائج الإجمالية
      this.testResults.overall.total += 4;
      this.testResults.overall.passed += [resourcesShared, contentExchanged, settingsIntegrated, aiIntegrated].filter(Boolean).length;
      this.testResults.overall.failed += [resourcesShared, contentExchanged, settingsIntegrated, aiIntegrated].filter(result => !result).length;
      
      console.log(`نتيجة اختبار التكامل المتبادل: ${crossIntegrationSuccess ? 'ناجح' : 'فاشل'}`);
      return crossIntegrationSuccess;
    } catch (error) {
      console.error('خطأ في اختبار التكامل المتبادل:', error);
      
      this.testResults.crossIntegration = {
        success: false,
        details: {
          error: error.toString()
        }
      };
      
      // تحديث النتائج الإجمالية
      this.testResults.overall.total += 1;
      this.testResults.overall.failed += 1;
      
      return false;
    }
  }

  /**
   * اختبار مشاركة الموارد بين المحررين
   * @param {Object} quranEditor محرر فيديو القرآن
   * @param {Object} generalEditor محرر الفيديو العام
   * @returns {Promise<boolean>} نجاح الاختبار
   */
  async testResourceSharing(quranEditor, generalEditor) {
    try {
      console.log('اختبار مشاركة الموارد بين المحررين...');
      
      // إنشاء مورد مشترك
      const sharedResource = {
        id: 'shared_resource_1',
        type: 'audio',
        url: 'assets/shared/background_music.mp3',
        name: 'موسيقى خلفية هادئة'
      };
      
      // إضافة المورد إلى محرر فيديو القرآن
      const addedToQuranEditor = await quranEditor.addSharedResource(sharedResource);
      
      // إضافة المورد إلى محرر الفيديو العام
      const addedToGeneralEditor = await generalEditor.addSharedResource(sharedResource);
      
      // التحقق من إمكانية استخدام المورد في كلا المحررين
      const usableInQuranEditor = await quranEditor.useSharedResource(sharedResource.id);
      const usableInGeneralEditor = await generalEditor.useSharedResource(sharedResource.id);
      
      // التحقق من تحديث المورد في كلا المحررين
      const updatedResource = {
        ...sharedResource,
        name: 'موسيقى خلفية هادئة (معدلة)'
      };
      
      const updatedInQuranEditor = await quranEditor.updateSharedResource(sharedResource.id, updatedResource);
      
      // التحقق من انعكاس التحديث في المحرر الآخر
      const reflectedInGeneralEditor = (await generalEditor.getSharedResource(sharedResource.id)).name === updatedResource.name;
      
      const success = addedToQuranEditor && addedToGeneralEditor && usableInQuranEditor && usableInGeneralEditor && updatedInQuranEditor && reflectedInGeneralEditor;
      
      console.log(`نتيجة اختبار مشاركة الموارد: ${success ? 'ناجح' : 'فاشل'}`);
      return success;
    } catch (error) {
      console.error('خطأ في اختبار مشاركة الموارد:', error);
      return false;
    }
  }

  /**
   * اختبار تبادل المحتوى بين المحررين
   * @param {Object} quranEditor محرر فيديو القرآن
   * @param {Object} generalEditor محرر الفيديو العام
   * @returns {Promise<boolean>} نجاح الاختبار
   */
  async testContentExchange(quranEditor, generalEditor) {
    try {
      console.log('اختبار تبادل المحتوى بين المحررين...');
      
      // إنشاء محتوى في محرر فيديو القرآن
      const quranContent = {
        id: 'quran_content_1',
        type: 'verse',
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        surah: 1,
        verse: 1,
        styling: {
          font: 'Uthmanic',
          size: 36,
          color: '#000000'
        }
      };
      
      await quranEditor.createContent(quranContent);
      
      // تصدير المحتوى من محرر فيديو القرآن
      const exportedContent = await quranEditor.exportContent(quranContent.id);
      
      // استيراد المحتوى إلى محرر الفيديو العام
      const importedToGeneral = await generalEditor.importContent(exportedContent);
      
      // التحقق من استخدام المحتوى في محرر الفيديو العام
      const usableInGeneralEditor = await generalEditor.useContent(exportedContent.id);
      
      // إنشاء محتوى في محرر الفيديو العام
      const generalContent = {
        id: 'general_content_1',
        type: 'text',
        text: 'نص تجريبي للمحرر العام',
        styling: {
          font: 'Arial',
          size: 24,
          color: '#FFFFFF',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      };
      
      await generalEditor.createContent(generalContent);
      
      // تصدير المحتوى من محرر الفيديو العام
      const exportedGeneralContent = await generalEditor.exportContent(generalContent.id);
      
      // استيراد المحتوى إلى محرر فيديو القرآن
      const importedToQuran = await quranEditor.importContent(exportedGeneralContent);
      
      // التحقق من استخدام المحتوى في محرر فيديو القرآن
      const usableInQuranEditor = await quranEditor.useContent(exportedGeneralContent.id);
      
      const success = importedToGeneral && usableInGeneralEditor && importedToQuran && usableInQuranEditor;
      
      console.log(`نتيجة اختبار تبادل المحتوى: ${success ? 'ناجح' : 'فاشل'}`);
      return success;
    } catch (error) {
      console.error('خطأ في اختبار تبادل المحتوى:', error);
      return false;
    }
  }

  /**
   * اختبار تكامل الإعدادات بين المحررين
   * @param {Object} quranEditor محرر فيديو القرآن
   * @param {Object} generalEditor محرر الفيديو العام
   * @returns {Promise<boolean>} نجاح الاختبار
   */
  async testSettingsIntegration(quranEditor, generalEditor) {
    try {
      console.log('اختبار تكامل الإعدادات بين المحررين...');
      
      // تعيين إعدادات مشتركة في محرر فيديو القرآن
      const sharedSettings = {
        theme: 'dark',
        language: 'ar',
        autoSave: true,
        autosaveInterval: 60,
        renderQuality: 'high'
      };
      
      await quranEditor.setSharedSettings(sharedSettings);
      
      // التحقق من انعكاس الإعدادات في محرر الفيديو العام
      const generalEditorSettings = await generalEditor.getSharedSettings();
      
      const settingsReflected = 
        generalEditorSettings.theme === sharedSettings.theme &&
        generalEditorSettings.language === sharedSettings.language &&
        generalEditorSettings.autoSave === sharedSettings.autoSave &&
        generalEditorSettings.autosaveInterval === sharedSettings.autosaveInterval &&
        generalEditorSettings.renderQuality === sharedSettings.renderQuality;
      
      // تعديل الإعدادات في محرر الفيديو العام
      const updatedSettings = {
        ...sharedSettings,
        theme: 'light'
      };
      
      await generalEditor.setSharedSettings(updatedSettings);
      
      // التحقق من انعكاس التعديلات في محرر فيديو القرآن
      const quranEditorSettings = await quranEditor.getSharedSettings();
      
      const updatesReflected = quranEditorSettings.theme === updatedSettings.theme;
      
      const success = settingsReflected && updatesReflected;
      
      console.log(`نتيجة اختبار تكامل الإعدادات: ${success ? 'ناجح' : 'فاشل'}`);
      return success;
    } catch (error) {
      console.error('خطأ في اختبار تكامل الإعدادات:', error);
      return false;
    }
  }

  /**
   * اختبار تكامل الذكاء الاصطناعي بين المحررين
   * @param {Object} quranEditor محرر فيديو القرآن
   * @param {Object} generalEditor محرر الفيديو العام
   * @returns {Promise<boolean>} نجاح الاختبار
   */
  async testAIIntegration(quranEditor, generalEditor) {
    try {
      console.log('اختبار تكامل الذكاء الاصطناعي بين المحررين...');
      
      // إنشاء مصدر فيديو وهمي للاختبار
      const videoElement = document.createElement('video');
      
      // تحليل الفيديو باستخدام محلل المشاهد في محرر فيديو القرآن
      const quranSceneAnalyzer = quranEditor.getAIFeature('sceneAnalyzer');
      const quranAnalysisResults = await quranSceneAnalyzer.analyzeVideo(videoElement);
      
      // استخدام نتائج التحليل في محرر الفيديو العام
      const generalSceneAnalyzer = generalEditor.getAIFeature('sceneAnalyzer');
      const analysisShared = await generalSceneAnalyzer.useExternalAnalysis(quranAnalysisResults);
      
      // إنشاء توصيات تنسيق في محرر الفيديو العام
      const generalFormatRecommendations = generalEditor.getAIFeature('formatRecommendations');
      const recommendations = await generalFormatRecommendations.analyzeAndRecommend(videoElement);
      
      // استخدام التوصيات في محرر فيديو القرآن
      const quranFormatRecommendations = quranEditor.getAIFeature('formatRecommendations');
      const recommendationsShared = await quranFormatRecommendations.useExternalRecommendations(recommendations);
      
      const success = analysisShared && recommendationsShared;
      
      console.log(`نتيجة اختبار تكامل الذكاء الاصطناعي: ${success ? 'ناجح' : 'فاشل'}`);
      return success;
    } catch (error) {
      console.error('خطأ في اختبار تكامل الذكاء الاصطناعي:', error);
      return false;
    }
  }

  /**
   * تشغيل جميع الاختبارات
   */
  async runAllTests() {
    console.log('=== بدء تشغيل اختبارات التكامل الشامل ===');
    
    try {
      // اختبار محرر فيديو القرآن
      const quranEditorResult = await this.testQuranEditor();
      
      // اختبار محرر الفيديو العام
      const generalEditorResult = await this.testGeneralEditor();
      
      // اختبار التكامل المتبادل
      const crossIntegrationResult = await this.testCrossIntegration();
      
      // تجميع النتائج
      const overallSuccess = quranEditorResult && generalEditorResult && crossIntegrationResult;
      
      // عرض ملخص نتائج الاختبارات
      console.log('=== ملخص نتائج الاختبارات الشاملة ===');
      console.log(`إجمالي الاختبارات: ${this.testResults.overall.total}`);
      console.log(`الاختبارات الناجحة: ${this.testResults.overall.passed}`);
      console.log(`الاختبارات الفاشلة: ${this.testResults.overall.failed}`);
      console.log(`نسبة النجاح: ${(this.testResults.overall.passed / this.testResults.overall.total * 100).toFixed(2)}%`);
      console.log(`النتيجة الإجمالية: ${overallSuccess ? 'ناجح' : 'فاشل'}`);
      
      return overallSuccess;
    } catch (error) {
      console.error('خطأ في تشغيل الاختبارات الشاملة:', error);
      return false;
    }
  }

  /**
   * الحصول على تقرير الاختبارات
   * @returns {Object} تقرير الاختبارات
   */
  getTestReport() {
    return {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      summary: {
        total: this.testResults.overall.total,
        passed: this.testResults.overall.passed,
        failed: this.testResults.overall.failed,
        successRate: (this.testResults.overall.passed / this.testResults.overall.total * 100).toFixed(2) + '%',
        overallSuccess: this.testResults.overall.failed === 0
      }
    };
  }
}

export default ComprehensiveIntegrationTest;
