/**
 * أداة إضافة النصوص لمحرر الفيديو العام
 * توفر واجهة برمجية للتعامل مع إضافة وتنسيق النصوص على الفيديو
 */

class TextOverlayTool {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.videoElement = null;
    this.textElements = [];
    this.selectedTextId = null;
    this.fonts = [];
    this.templates = [];
    this.animations = [];
    this.initialized = false;
  }

  /**
   * تهيئة أداة إضافة النصوص
   * @param {HTMLVideoElement} videoElement عنصر الفيديو للمعاينة
   * @param {HTMLCanvasElement} canvas عنصر الكانفاس لعرض النصوص
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize(videoElement, canvas) {
    if (this.initialized) return;
    
    try {
      this.videoElement = videoElement;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      
      // تعيين أبعاد الكانفاس لتتناسب مع الفيديو
      this.canvas.width = this.videoElement.videoWidth || 1280;
      this.canvas.height = this.videoElement.videoHeight || 720;
      
      // تحميل الخطوط
      await this._loadFonts();
      
      // تهيئة قوالب النصوص
      this._initializeTemplates();
      
      // تهيئة التأثيرات الحركية
      this._initializeAnimations();
      
      // إعداد مستمعي الأحداث
      this._setupEventListeners();
      
      this.initialized = true;
      console.log('تم تهيئة أداة إضافة النصوص بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة أداة إضافة النصوص:', error);
    }
    
    return this.initialized;
  }

  /**
   * إضافة نص جديد إلى الفيديو
   * @param {Object} options خيارات النص
   * @returns {Object} معلومات النص المضاف
   */
  addText(options = {}) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return null;
    }
    
    try {
      // إنشاء معرف فريد للنص
      const textId = 'text_' + Date.now();
      
      // إنشاء عنصر النص
      const textElement = {
        id: textId,
        text: options.text || 'نص جديد',
        x: options.x || this.canvas.width / 2,
        y: options.y || this.canvas.height / 2,
        width: 0, // سيتم حسابه لاحقاً
        height: 0, // سيتم حسابه لاحقاً
        fontSize: options.fontSize || 32,
        fontFamily: options.fontFamily || 'Arial',
        fontWeight: options.fontWeight || 'normal',
        fontStyle: options.fontStyle || 'normal',
        color: options.color || '#ffffff',
        strokeColor: options.strokeColor || '#000000',
        strokeWidth: options.strokeWidth || 0,
        backgroundColor: options.backgroundColor || 'transparent',
        padding: options.padding || 5,
        borderRadius: options.borderRadius || 0,
        textAlign: options.textAlign || 'center',
        opacity: options.opacity !== undefined ? options.opacity : 1,
        rotation: options.rotation || 0,
        startTime: options.startTime || 0,
        endTime: options.endTime || this.videoElement.duration || 60,
        animation: options.animation || null,
        animationParams: options.animationParams || {},
        shadow: options.shadow || false,
        shadowColor: options.shadowColor || 'rgba(0, 0, 0, 0.5)',
        shadowBlur: options.shadowBlur || 5,
        shadowOffsetX: options.shadowOffsetX || 2,
        shadowOffsetY: options.shadowOffsetY || 2
      };
      
      // حساب أبعاد النص
      this._calculateTextDimensions(textElement);
      
      // إضافة النص إلى القائمة
      this.textElements.push(textElement);
      
      // تحديد النص الجديد
      this.selectedTextId = textId;
      
      console.log('تم إضافة نص جديد:', textElement.text);
      return textElement;
    } catch (error) {
      console.error('خطأ في إضافة النص:', error);
      return null;
    }
  }

  /**
   * تحديث خصائص النص
   * @param {string} textId معرف النص
   * @param {Object} options خصائص النص الجديدة
   * @returns {Object|null} معلومات النص المحدث أو null في حالة الفشل
   */
  updateText(textId, options) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن النص
      const textElement = this.textElements.find(text => text.id === textId);
      if (!textElement) {
        throw new Error('لم يتم العثور على النص: ' + textId);
      }
      
      // تحديث خصائص النص
      Object.assign(textElement, options);
      
      // إعادة حساب أبعاد النص إذا تم تغيير النص أو الخط
      if (options.text || options.fontSize || options.fontFamily || options.fontWeight || options.fontStyle) {
        this._calculateTextDimensions(textElement);
      }
      
      console.log('تم تحديث النص:', textElement.text);
      return textElement;
    } catch (error) {
      console.error('خطأ في تحديث النص:', error);
      return null;
    }
  }

  /**
   * حذف نص
   * @param {string} textId معرف النص
   * @returns {boolean} نجاح العملية
   */
  deleteText(textId) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return false;
    }
    
    try {
      // البحث عن النص
      const index = this.textElements.findIndex(text => text.id === textId);
      if (index === -1) {
        throw new Error('لم يتم العثور على النص: ' + textId);
      }
      
      // حذف النص
      this.textElements.splice(index, 1);
      
      // إعادة تعيين النص المحدد إذا كان هو النص المحذوف
      if (this.selectedTextId === textId) {
        this.selectedTextId = this.textElements.length > 0 ? this.textElements[0].id : null;
      }
      
      console.log('تم حذف النص');
      return true;
    } catch (error) {
      console.error('خطأ في حذف النص:', error);
      return false;
    }
  }

  /**
   * تحديد نص
   * @param {string} textId معرف النص
   * @returns {Object|null} معلومات النص المحدد أو null في حالة الفشل
   */
  selectText(textId) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن النص
      const textElement = this.textElements.find(text => text.id === textId);
      if (!textElement) {
        throw new Error('لم يتم العثور على النص: ' + textId);
      }
      
      // تحديد النص
      this.selectedTextId = textId;
      
      console.log('تم تحديد النص:', textElement.text);
      return textElement;
    } catch (error) {
      console.error('خطأ في تحديد النص:', error);
      return null;
    }
  }

  /**
   * تحريك النص المحدد
   * @param {number} x الإحداثي الأفقي الجديد
   * @param {number} y الإحداثي الرأسي الجديد
   * @returns {boolean} نجاح العملية
   */
  moveSelectedText(x, y) {
    if (!this.initialized || !this.selectedTextId) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد أو لم يتم تحديد نص');
      return false;
    }
    
    try {
      // البحث عن النص المحدد
      const textElement = this.textElements.find(text => text.id === this.selectedTextId);
      if (!textElement) {
        throw new Error('لم يتم العثور على النص المحدد');
      }
      
      // تحديث موضع النص
      textElement.x = x;
      textElement.y = y;
      
      console.log('تم تحريك النص إلى:', x, y);
      return true;
    } catch (error) {
      console.error('خطأ في تحريك النص:', error);
      return false;
    }
  }

  /**
   * تطبيق قالب نصي
   * @param {string} textId معرف النص
   * @param {string} templateId معرف القالب
   * @returns {Object|null} معلومات النص المحدث أو null في حالة الفشل
   */
  applyTemplate(textId, templateId) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن النص
      const textElement = this.textElements.find(text => text.id === textId);
      if (!textElement) {
        throw new Error('لم يتم العثور على النص: ' + textId);
      }
      
      // البحث عن القالب
      const template = this.templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('لم يتم العثور على القالب: ' + templateId);
      }
      
      // تطبيق خصائص القالب على النص
      Object.assign(textElement, template.style);
      
      // إعادة حساب أبعاد النص
      this._calculateTextDimensions(textElement);
      
      console.log('تم تطبيق القالب:', template.name);
      return textElement;
    } catch (error) {
      console.error('خطأ في تطبيق القالب:', error);
      return null;
    }
  }

  /**
   * تطبيق تأثير حركي على النص
   * @param {string} textId معرف النص
   * @param {string} animationId معرف التأثير الحركي
   * @param {Object} params معلمات التأثير (اختياري)
   * @returns {Object|null} معلومات النص المحدث أو null في حالة الفشل
   */
  applyAnimation(textId, animationId, params = {}) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن النص
      const textElement = this.textElements.find(text => text.id === textId);
      if (!textElement) {
        throw new Error('لم يتم العثور على النص: ' + textId);
      }
      
      // البحث عن التأثير الحركي
      const animation = this.animations.find(a => a.id === animationId);
      if (!animation) {
        throw new Error('لم يتم العثور على التأثير الحركي: ' + animationId);
      }
      
      // تطبيق التأثير الحركي على النص
      textElement.animation = animationId;
      textElement.animationParams = { ...animation.defaultParams, ...params };
      
      console.log('تم تطبيق التأثير الحركي:', animation.name);
      return textElement;
    } catch (error) {
      console.error('خطأ في تطبيق التأثير الحركي:', error);
      return null;
    }
  }

  /**
   * إزالة التأثير الحركي من النص
   * @param {string} textId معرف النص
   * @returns {boolean} نجاح العملية
   */
  removeAnimation(textId) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return false;
    }
    
    try {
      // البحث عن النص
      const textElement = this.textElements.find(text => text.id === textId);
      if (!textElement) {
        throw new Error('لم يتم العثور على النص: ' + textId);
      }
      
      // إزالة التأثير الحركي
      textElement.animation = null;
      textElement.animationParams = {};
      
      console.log('تم إزالة التأثير الحركي من النص');
      return true;
    } catch (error) {
      console.error('خطأ في إزالة التأثير الحركي:', error);
      return false;
    }
  }

  /**
   * مزامنة النص مع الصوت
   * @param {string} textId معرف النص
   * @param {Array} timings توقيتات الكلمات
   * @returns {boolean} نجاح العملية
   */
  syncWithAudio(textId, timings) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return false;
    }
    
    try {
      // البحث عن النص
      const textElement = this.textElements.find(text => text.id === textId);
      if (!textElement) {
        throw new Error('لم يتم العثور على النص: ' + textId);
      }
      
      // التحقق من صحة التوقيتات
      if (!Array.isArray(timings) || timings.length === 0) {
        throw new Error('توقيتات غير صالحة');
      }
      
      // تطبيق التأثير الحركي للمزامنة مع الصوت
      textElement.animation = 'sync-with-audio';
      textElement.animationParams = { timings };
      
      console.log('تم مزامنة النص مع الصوت');
      return true;
    } catch (error) {
      console.error('خطأ في مزامنة النص مع الصوت:', error);
      return false;
    }
  }

  /**
   * رسم جميع النصوص على الكانفاس
   * @param {number} currentTime الوقت الحالي في الفيديو
   * @returns {boolean} نجاح العملية
   */
  renderTexts(currentTime) {
    if (!this.initialized) {
      console.warn('أداة إضافة النصوص غير مهيأة بعد');
      return false;
    }
    
    try {
      // مسح الكانفاس
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // رسم كل نص في نطاق الوقت الحالي
      for (const textElement of this.textElements) {
        if (currentTime >= textElement.startTime && currentTime <= textElement.endTime) {
          this._renderText(textElement, currentTime);
        }
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في رسم النصوص:', error);
      return false;
    }
  }

  /**
   * الحصول على قائمة الخطوط المتاحة
   * @returns {Array} قائمة الخطوط
   */
  getFonts() {
    return this.fonts;
  }

  /**
   * الحصول على قائمة القوالب النصية المتاحة
   * @returns {Array} قائمة القوالب
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * الحصول على قائمة التأثيرات الحركية المتاحة
   * @returns {Array} قائمة التأثيرات
   */
  getAnimations() {
    return this.animations;
  }

  /**
   * الحصول على قائمة النصوص الحالية
   * @returns {Array} قائمة النصوص
   */
  getTexts() {
    return this.textElements;
  }

  /**
   * تحميل الخطوط
   * @returns {Promise} وعد يتم حله عند اكتمال التحميل
   * @private
   */
  async _loadFonts() {
    try {
      // في التطبيق الحقيقي، يمكن تحميل الخطوط من API أو قاعدة بيانات
      // هنا نستخدم بيانات افتراضية للتوضيح
      
      this.fonts = [
        {
          id: 'arial',
          name: 'Arial',
          category: 'sans-serif',
          url: null // خط افتراضي
        },
        {
          id: 'times-new-roman',
          name: 'Times New Roman',
          category: 'serif',
          url: null // خط افتراضي
        },
        {
          id: 'courier-new',
          name: 'Courier New',
          category: 'monospace',
          url: null // خط افتراضي
        },
        {
          id: 'roboto',
          name: 'Roboto',
          category: 'sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
        },
        {
          id: 'open-sans',
          name: 'Open Sans',
          category: 'sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap'
        },
        {
          id: 'lato',
          name: 'Lato',
          category: 'sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap'
        },
        {
          id: 'montserrat',
          name: 'Montserrat',
          category: 'sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap'
        },
        {
          id: 'cairo',
          name: 'Cairo',
          category: 'arabic',
          url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap'
        },
        {
          id: 'tajawal',
          name: 'Tajawal',
          category: 'arabic',
          url: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap'
        },
        {
          id: 'amiri',
          name: 'Amiri',
          category: 'arabic',
          url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap'
        }
      ];
      
      // تحميل الخطوط الخارجية
      for (const font of this.fonts) {
        if (font.url) {
          await this._loadFontStyle(font.url);
        }
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تحميل الخطوط:', error);
      return false;
    }
  }

  /**
   * تحميل ملف CSS للخط
   * @param {string} url رابط ملف CSS
   * @returns {Promise} وعد يتم حله عند اكتمال التحميل
   * @private
   */
  async _loadFontStyle(url) {
    return new Promise((resolve, reject) => {
      // التحقق من وجود الخط بالفعل
      const existingLink = document.querySelector(`link[href="${url}"]`);
      if (existingLink) {
        resolve(true);
        return;
      }
      
      // إنشاء عنصر link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      
      // معالجة أحداث التحميل
      link.onload = () => resolve(true);
      link.onerror = () => reject(new Error(`فشل في تحميل الخط: ${url}`));
      
      // إضافة العنصر إلى الصفحة
      document.head.appendChild(link);
    });
  }

  /**
   * تهيئة قوالب النصوص
   * @private
   */
  _initializeTemplates() {
    this.templates = [
      {
        id: 'title',
        name: 'عنوان رئيسي',
        category: 'titles',
        style: {
          fontSize: 48,
          fontFamily: 'Montserrat',
          fontWeight: 'bold',
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 2,
          backgroundColor: 'transparent',
          textAlign: 'center',
          shadow: true,
          shadowColor: 'rgba(0, 0, 0, 0.7)',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      },
      {
        id: 'subtitle',
        name: 'عنوان فرعي',
        category: 'titles',
        style: {
          fontSize: 32,
          fontFamily: 'Montserrat',
          fontWeight: 'normal',
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 1,
          backgroundColor: 'transparent',
          textAlign: 'center',
          shadow: true,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 5,
          shadowOffsetX: 1,
          shadowOffsetY: 1
        }
      },
      {
        id: 'caption',
        name: 'تعليق توضيحي',
        category: 'captions',
        style: {
          fontSize: 24,
          fontFamily: 'Open Sans',
          fontWeight: 'normal',
          color: '#ffffff',
          strokeColor: 'transparent',
          strokeWidth: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: 10,
          borderRadius: 5,
          textAlign: 'center',
          shadow: false
        }
      },
      {
        id: 'quote',
        name: 'اقتباس',
        category: 'quotes',
        style: {
          fontSize: 36,
          fontFamily: 'Georgia',
          fontWeight: 'normal',
          fontStyle: 'italic',
          color: '#ffffff',
          strokeColor: 'transparent',
          strokeWidth: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: 15,
          borderRadius: 10,
          textAlign: 'center',
          shadow: true,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 3,
          shadowOffsetX: 1,
          shadowOffsetY: 1
        }
      },
      {
        id: 'lower-third',
        name: 'شريط سفلي',
        category: 'lower-thirds',
        style: {
          fontSize: 28,
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          color: '#ffffff',
          strokeColor: 'transparent',
          strokeWidth: 0,
          backgroundColor: 'rgba(0, 100, 200, 0.7)',
          padding: 12,
          borderRadius: 0,
          textAlign: 'left',
          shadow: false
        }
      },
      {
        id: 'arabic-title',
        name: 'عنوان عربي',
        category: 'arabic',
        style: {
          fontSize: 42,
          fontFamily: 'Cairo',
          fontWeight: 'bold',
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 1,
          backgroundColor: 'transparent',
          textAlign: 'center',
          shadow: true,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowBlur: 8,
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      },
      {
        id: 'arabic-subtitle',
        name: 'عنوان فرعي عربي',
        category: 'arabic',
        style: {
          fontSize: 30,
          fontFamily: 'Tajawal',
          fontWeight: 'normal',
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 1,
          backgroundColor: 'transparent',
          textAlign: 'center',
          shadow: true,
          shadowColor: 'rgba(0, 0, 0, 0.4)',
          shadowBlur: 4,
          shadowOffsetX: 1,
          shadowOffsetY: 1
        }
      },
      {
        id: 'neon',
        name: 'نيون',
        category: 'effects',
        style: {
          fontSize: 36,
          fontFamily: 'Montserrat',
          fontWeight: 'bold',
          color: '#ffffff',
          strokeColor: '#00ffff',
          strokeWidth: 2,
          backgroundColor: 'transparent',
          textAlign: 'center',
          shadow: true,
          shadowColor: 'rgba(0, 255, 255, 0.8)',
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 0
        }
      }
    ];
  }

  /**
   * تهيئة التأثيرات الحركية
   * @private
   */
  _initializeAnimations() {
    this.animations = [
      {
        id: 'fade-in',
        name: 'ظهور تدريجي',
        category: 'entrance',
        defaultParams: {
          duration: 1.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const duration = params.duration;
          const elapsedTime = currentTime - startTime;
          
          if (elapsedTime <= duration) {
            const opacity = elapsedTime / duration;
            ctx.globalAlpha = opacity * textElement.opacity;
          } else {
            ctx.globalAlpha = textElement.opacity;
          }
        }
      },
      {
        id: 'fade-out',
        name: 'اختفاء تدريجي',
        category: 'exit',
        defaultParams: {
          duration: 1.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const endTime = textElement.endTime;
          const duration = params.duration;
          const remainingTime = endTime - currentTime;
          
          if (remainingTime <= duration) {
            const opacity = remainingTime / duration;
            ctx.globalAlpha = opacity * textElement.opacity;
          } else {
            ctx.globalAlpha = textElement.opacity;
          }
        }
      },
      {
        id: 'slide-in-right',
        name: 'دخول من اليمين',
        category: 'entrance',
        defaultParams: {
          duration: 1.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const duration = params.duration;
          const elapsedTime = currentTime - startTime;
          
          if (elapsedTime <= duration) {
            const progress = elapsedTime / duration;
            const startX = this.canvas.width;
            const targetX = textElement.x;
            const currentX = startX - (startX - targetX) * this._easeOutQuad(progress);
            
            ctx.translate(currentX - textElement.x, 0);
          }
        }
      },
      {
        id: 'slide-in-left',
        name: 'دخول من اليسار',
        category: 'entrance',
        defaultParams: {
          duration: 1.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const duration = params.duration;
          const elapsedTime = currentTime - startTime;
          
          if (elapsedTime <= duration) {
            const progress = elapsedTime / duration;
            const startX = -textElement.width;
            const targetX = textElement.x;
            const currentX = startX + (targetX - startX) * this._easeOutQuad(progress);
            
            ctx.translate(currentX - textElement.x, 0);
          }
        }
      },
      {
        id: 'slide-in-top',
        name: 'دخول من الأعلى',
        category: 'entrance',
        defaultParams: {
          duration: 1.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const duration = params.duration;
          const elapsedTime = currentTime - startTime;
          
          if (elapsedTime <= duration) {
            const progress = elapsedTime / duration;
            const startY = -textElement.height;
            const targetY = textElement.y;
            const currentY = startY + (targetY - startY) * this._easeOutQuad(progress);
            
            ctx.translate(0, currentY - textElement.y);
          }
        }
      },
      {
        id: 'slide-in-bottom',
        name: 'دخول من الأسفل',
        category: 'entrance',
        defaultParams: {
          duration: 1.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const duration = params.duration;
          const elapsedTime = currentTime - startTime;
          
          if (elapsedTime <= duration) {
            const progress = elapsedTime / duration;
            const startY = this.canvas.height;
            const targetY = textElement.y;
            const currentY = startY - (startY - targetY) * this._easeOutQuad(progress);
            
            ctx.translate(0, currentY - textElement.y);
          }
        }
      },
      {
        id: 'zoom-in',
        name: 'تكبير',
        category: 'entrance',
        defaultParams: {
          duration: 1.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const duration = params.duration;
          const elapsedTime = currentTime - startTime;
          
          if (elapsedTime <= duration) {
            const progress = elapsedTime / duration;
            const scale = this._easeOutQuad(progress);
            
            ctx.translate(textElement.x, textElement.y);
            ctx.scale(scale, scale);
            ctx.translate(-textElement.x, -textElement.y);
          }
        }
      },
      {
        id: 'zoom-out',
        name: 'تصغير',
        category: 'exit',
        defaultParams: {
          duration: 1.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const endTime = textElement.endTime;
          const duration = params.duration;
          const remainingTime = endTime - currentTime;
          
          if (remainingTime <= duration) {
            const progress = remainingTime / duration;
            const scale = progress;
            
            ctx.translate(textElement.x, textElement.y);
            ctx.scale(scale, scale);
            ctx.translate(-textElement.x, -textElement.y);
          }
        }
      },
      {
        id: 'rotate-in',
        name: 'دوران للداخل',
        category: 'entrance',
        defaultParams: {
          duration: 1.0,
          rotations: 1
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const duration = params.duration;
          const elapsedTime = currentTime - startTime;
          
          if (elapsedTime <= duration) {
            const progress = elapsedTime / duration;
            const angle = (1 - progress) * Math.PI * 2 * params.rotations;
            
            ctx.translate(textElement.x, textElement.y);
            ctx.rotate(angle);
            ctx.translate(-textElement.x, -textElement.y);
          }
        }
      },
      {
        id: 'typing',
        name: 'كتابة',
        category: 'text',
        defaultParams: {
          duration: 2.0
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const duration = params.duration;
          const elapsedTime = currentTime - startTime;
          
          if (elapsedTime <= duration) {
            const progress = elapsedTime / duration;
            const visibleLength = Math.floor(textElement.text.length * progress);
            const visibleText = textElement.text.substring(0, visibleLength);
            
            // حفظ النص الأصلي
            const originalText = textElement.text;
            
            // تعديل النص مؤقتاً
            textElement.text = visibleText;
            
            // استعادة النص الأصلي بعد الرسم
            setTimeout(() => {
              textElement.text = originalText;
            }, 0);
          }
        }
      },
      {
        id: 'bounce',
        name: 'ارتداد',
        category: 'emphasis',
        defaultParams: {
          amplitude: 20,
          frequency: 2
        },
        apply: (ctx, textElement, currentTime, params) => {
          const startTime = textElement.startTime;
          const elapsedTime = currentTime - startTime;
          
          const amplitude = params.amplitude;
          const frequency = params.frequency;
          
          const offset = amplitude * Math.sin(elapsedTime * frequency * Math.PI);
          
          ctx.translate(0, offset);
        }
      },
      {
        id: 'wave',
        name: 'موجة',
        category: 'emphasis',
        defaultParams: {
          amplitude: 10,
          frequency: 2
        },
        apply: (ctx, textElement, currentTime, params) => {
          // هذا التأثير يتطلب معالجة خاصة لكل حرف
          // في هذا المثال، نكتفي بتأثير بسيط للتوضيح
          const startTime = textElement.startTime;
          const elapsedTime = currentTime - startTime;
          
          const amplitude = params.amplitude;
          const frequency = params.frequency;
          
          const angle = elapsedTime * frequency;
          const offset = amplitude * Math.sin(angle);
          
          ctx.translate(0, offset);
        }
      }
    ];
  }

  /**
   * إعداد مستمعي الأحداث
   * @private
   */
  _setupEventListeners() {
    // مستمع لحدث تغيير حجم الفيديو
    this.videoElement.addEventListener('resize', () => {
      // تحديث أبعاد الكانفاس عند تغيير حجم الفيديو
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
      
      // إعادة حساب أبعاد النصوص
      for (const textElement of this.textElements) {
        this._calculateTextDimensions(textElement);
      }
    });
  }

  /**
   * حساب أبعاد النص
   * @param {Object} textElement عنصر النص
   * @private
   */
  _calculateTextDimensions(textElement) {
    // تعيين خصائص السياق
    this.ctx.font = `${textElement.fontStyle} ${textElement.fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`;
    this.ctx.textAlign = textElement.textAlign;
    
    // قياس أبعاد النص
    const metrics = this.ctx.measureText(textElement.text);
    textElement.width = metrics.width + textElement.padding * 2;
    textElement.height = textElement.fontSize + textElement.padding * 2;
  }

  /**
   * رسم نص على الكانفاس
   * @param {Object} textElement عنصر النص
   * @param {number} currentTime الوقت الحالي في الفيديو
   * @private
   */
  _renderText(textElement, currentTime) {
    // حفظ حالة السياق
    this.ctx.save();
    
    // تعيين الشفافية
    this.ctx.globalAlpha = textElement.opacity;
    
    // تطبيق التأثير الحركي إذا وجد
    if (textElement.animation) {
      const animation = this.animations.find(a => a.id === textElement.animation);
      if (animation) {
        animation.apply(this.ctx, textElement, currentTime, textElement.animationParams);
      }
    }
    
    // تطبيق الدوران
    if (textElement.rotation !== 0) {
      this.ctx.translate(textElement.x, textElement.y);
      this.ctx.rotate(textElement.rotation * Math.PI / 180);
      this.ctx.translate(-textElement.x, -textElement.y);
    }
    
    // رسم خلفية النص إذا كانت غير شفافة
    if (textElement.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = textElement.backgroundColor;
      
      // حساب موضع وأبعاد الخلفية بناءً على محاذاة النص
      let x = textElement.x;
      if (textElement.textAlign === 'center') {
        x -= textElement.width / 2;
      } else if (textElement.textAlign === 'right') {
        x -= textElement.width;
      }
      
      const y = textElement.y - textElement.fontSize / 2 - textElement.padding;
      
      // رسم الخلفية مع دعم الزوايا المستديرة
      if (textElement.borderRadius > 0) {
        this._roundRect(
          this.ctx,
          x,
          y,
          textElement.width,
          textElement.height,
          textElement.borderRadius
        );
        this.ctx.fill();
      } else {
        this.ctx.fillRect(x, y, textElement.width, textElement.height);
      }
    }
    
    // تعيين خصائص النص
    this.ctx.font = `${textElement.fontStyle} ${textElement.fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`;
    this.ctx.textAlign = textElement.textAlign;
    this.ctx.textBaseline = 'middle';
    
    // إضافة ظل إذا كان مفعلاً
    if (textElement.shadow) {
      this.ctx.shadowColor = textElement.shadowColor;
      this.ctx.shadowBlur = textElement.shadowBlur;
      this.ctx.shadowOffsetX = textElement.shadowOffsetX;
      this.ctx.shadowOffsetY = textElement.shadowOffsetY;
    }
    
    // رسم حدود النص إذا كانت مفعلة
    if (textElement.strokeWidth > 0) {
      this.ctx.strokeStyle = textElement.strokeColor;
      this.ctx.lineWidth = textElement.strokeWidth;
      this.ctx.strokeText(textElement.text, textElement.x, textElement.y);
    }
    
    // رسم النص
    this.ctx.fillStyle = textElement.color;
    this.ctx.fillText(textElement.text, textElement.x, textElement.y);
    
    // استعادة حالة السياق
    this.ctx.restore();
  }

  /**
   * رسم مستطيل بزوايا مستديرة
   * @param {CanvasRenderingContext2D} ctx سياق الكانفاس
   * @param {number} x الإحداثي الأفقي
   * @param {number} y الإحداثي الرأسي
   * @param {number} width العرض
   * @param {number} height الارتفاع
   * @param {number} radius نصف قطر الزوايا
   * @private
   */
  _roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * دالة تسهيل للحركة (Easing function)
   * @param {number} t قيمة بين 0 و 1
   * @returns {number} قيمة معدلة بين 0 و 1
   * @private
   */
  _easeOutQuad(t) {
    return t * (2 - t);
  }
}

export default TextOverlayTool;
