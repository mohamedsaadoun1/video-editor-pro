/**
 * أداة الانتقالات لمحرر الفيديو العام
 * توفر واجهة برمجية للتعامل مع الانتقالات بين المشاهد في الفيديو
 */

class TransitionsTool {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.videoElement = null;
    this.transitions = {};
    this.activeTransitions = [];
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.previousFrameCanvas = null;
    this.previousFrameCtx = null;
    this.nextFrameCanvas = null;
    this.nextFrameCtx = null;
    this.initialized = false;
  }

  /**
   * تهيئة أداة الانتقالات
   * @param {HTMLVideoElement} videoElement عنصر الفيديو للمعاينة
   * @param {HTMLCanvasElement} canvas عنصر الكانفاس لعرض الانتقالات
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
      
      // إنشاء كانفاس خارج الشاشة للعمليات المؤقتة
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
      
      // إنشاء كانفاس للإطار السابق
      this.previousFrameCanvas = document.createElement('canvas');
      this.previousFrameCanvas.width = this.canvas.width;
      this.previousFrameCanvas.height = this.canvas.height;
      this.previousFrameCtx = this.previousFrameCanvas.getContext('2d');
      
      // إنشاء كانفاس للإطار التالي
      this.nextFrameCanvas = document.createElement('canvas');
      this.nextFrameCanvas.width = this.canvas.width;
      this.nextFrameCanvas.height = this.canvas.height;
      this.nextFrameCtx = this.nextFrameCanvas.getContext('2d');
      
      // تهيئة الانتقالات المتاحة
      this._initializeTransitions();
      
      // إعداد مستمعي الأحداث
      this._setupEventListeners();
      
      this.initialized = true;
      console.log('تم تهيئة أداة الانتقالات بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة أداة الانتقالات:', error);
    }
    
    return this.initialized;
  }

  /**
   * إضافة انتقال جديد بين مشهدين
   * @param {string} transitionType نوع الانتقال
   * @param {number} startTime وقت بداية الانتقال بالثواني
   * @param {number} duration مدة الانتقال بالثواني
   * @param {Object} params معلمات إضافية للانتقال (اختياري)
   * @returns {Object} معلومات الانتقال المضاف
   */
  addTransition(transitionType, startTime, duration, params = {}) {
    if (!this.initialized) {
      console.warn('أداة الانتقالات غير مهيأة بعد');
      return null;
    }
    
    try {
      // التحقق من وجود نوع الانتقال
      if (!this.transitions[transitionType]) {
        throw new Error('نوع الانتقال غير موجود: ' + transitionType);
      }
      
      // التحقق من صحة الأوقات
      if (startTime < 0) {
        throw new Error('وقت البداية يجب أن يكون أكبر من أو يساوي صفر');
      }
      
      if (duration <= 0) {
        throw new Error('مدة الانتقال يجب أن تكون أكبر من صفر');
      }
      
      // إنشاء معرف فريد للانتقال
      const transitionId = 'transition_' + Date.now();
      
      // إنشاء كائن الانتقال
      const transition = {
        id: transitionId,
        type: transitionType,
        startTime: startTime,
        duration: duration,
        endTime: startTime + duration,
        params: { ...this.transitions[transitionType].defaultParams, ...params }
      };
      
      // إضافة الانتقال إلى القائمة
      this.activeTransitions.push(transition);
      
      // ترتيب الانتقالات حسب وقت البداية
      this.activeTransitions.sort((a, b) => a.startTime - b.startTime);
      
      console.log('تم إضافة انتقال جديد:', transitionType);
      return transition;
    } catch (error) {
      console.error('خطأ في إضافة الانتقال:', error);
      return null;
    }
  }

  /**
   * تحديث معلمات انتقال
   * @param {string} transitionId معرف الانتقال
   * @param {Object} updates التحديثات المطلوبة
   * @returns {Object|null} معلومات الانتقال المحدث أو null في حالة الفشل
   */
  updateTransition(transitionId, updates) {
    if (!this.initialized) {
      console.warn('أداة الانتقالات غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن الانتقال
      const transition = this.activeTransitions.find(t => t.id === transitionId);
      if (!transition) {
        throw new Error('لم يتم العثور على الانتقال: ' + transitionId);
      }
      
      // تحديث الخصائص
      if (updates.startTime !== undefined) {
        transition.startTime = updates.startTime;
        transition.endTime = updates.startTime + transition.duration;
      }
      
      if (updates.duration !== undefined) {
        transition.duration = updates.duration;
        transition.endTime = transition.startTime + updates.duration;
      }
      
      if (updates.params) {
        Object.assign(transition.params, updates.params);
      }
      
      // إعادة ترتيب الانتقالات إذا تم تغيير الوقت
      if (updates.startTime !== undefined) {
        this.activeTransitions.sort((a, b) => a.startTime - b.startTime);
      }
      
      console.log('تم تحديث الانتقال:', transition.type);
      return transition;
    } catch (error) {
      console.error('خطأ في تحديث الانتقال:', error);
      return null;
    }
  }

  /**
   * حذف انتقال
   * @param {string} transitionId معرف الانتقال
   * @returns {boolean} نجاح العملية
   */
  deleteTransition(transitionId) {
    if (!this.initialized) {
      console.warn('أداة الانتقالات غير مهيأة بعد');
      return false;
    }
    
    try {
      // البحث عن الانتقال
      const index = this.activeTransitions.findIndex(t => t.id === transitionId);
      if (index === -1) {
        throw new Error('لم يتم العثور على الانتقال: ' + transitionId);
      }
      
      // حذف الانتقال
      this.activeTransitions.splice(index, 1);
      
      console.log('تم حذف الانتقال');
      return true;
    } catch (error) {
      console.error('خطأ في حذف الانتقال:', error);
      return false;
    }
  }

  /**
   * التحقق من وجود انتقال نشط عند وقت معين
   * @param {number} currentTime الوقت الحالي بالثواني
   * @returns {Object|null} معلومات الانتقال النشط أو null إذا لم يوجد
   */
  getActiveTransitionAt(currentTime) {
    if (!this.initialized) {
      console.warn('أداة الانتقالات غير مهيأة بعد');
      return null;
    }
    
    // البحث عن انتقال نشط في الوقت الحالي
    return this.activeTransitions.find(t => 
      currentTime >= t.startTime && currentTime <= t.endTime
    );
  }

  /**
   * التقاط الإطار الحالي للفيديو
   * @returns {boolean} نجاح العملية
   */
  captureCurrentFrame() {
    if (!this.initialized) {
      console.warn('أداة الانتقالات غير مهيأة بعد');
      return false;
    }
    
    try {
      // نسخ الإطار الحالي إلى كانفاس الإطار السابق
      this.previousFrameCtx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      return true;
    } catch (error) {
      console.error('خطأ في التقاط الإطار الحالي:', error);
      return false;
    }
  }

  /**
   * تطبيق انتقال بين إطارين
   * @param {number} currentTime الوقت الحالي بالثواني
   * @returns {boolean} نجاح العملية
   */
  applyTransition(currentTime) {
    if (!this.initialized) {
      console.warn('أداة الانتقالات غير مهيأة بعد');
      return false;
    }
    
    try {
      // البحث عن انتقال نشط في الوقت الحالي
      const activeTransition = this.getActiveTransitionAt(currentTime);
      if (!activeTransition) {
        // لا يوجد انتقال نشط، رسم الفيديو مباشرة
        this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
        return true;
      }
      
      // التقاط الإطار التالي
      this.nextFrameCtx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      
      // حساب نسبة التقدم في الانتقال
      const progress = (currentTime - activeTransition.startTime) / activeTransition.duration;
      
      // تطبيق الانتقال
      const transitionFunc = this.transitions[activeTransition.type].apply;
      transitionFunc(
        this.ctx,
        this.previousFrameCanvas,
        this.nextFrameCanvas,
        progress,
        activeTransition.params,
        this.offscreenCanvas,
        this.offscreenCtx
      );
      
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق الانتقال:', error);
      return false;
    }
  }

  /**
   * الحصول على قائمة أنواع الانتقالات المتاحة
   * @returns {Array} قائمة أنواع الانتقالات
   */
  getAvailableTransitionTypes() {
    return Object.keys(this.transitions).map(type => ({
      type,
      name: this.transitions[type].name,
      description: this.transitions[type].description,
      category: this.transitions[type].category,
      defaultParams: this.transitions[type].defaultParams
    }));
  }

  /**
   * الحصول على قائمة الانتقالات النشطة
   * @returns {Array} قائمة الانتقالات
   */
  getActiveTransitions() {
    return this.activeTransitions;
  }

  /**
   * معاينة انتقال
   * @param {string} transitionType نوع الانتقال
   * @param {Object} params معلمات الانتقال (اختياري)
   * @returns {Promise<Blob>} وعد يتم حله بصورة معاينة الانتقال
   */
  async previewTransition(transitionType, params = {}) {
    if (!this.initialized) {
      console.warn('أداة الانتقالات غير مهيأة بعد');
      return null;
    }
    
    try {
      // التحقق من وجود نوع الانتقال
      if (!this.transitions[transitionType]) {
        throw new Error('نوع الانتقال غير موجود: ' + transitionType);
      }
      
      // إنشاء كانفاس للمعاينة
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = this.canvas.width;
      previewCanvas.height = this.canvas.height;
      const previewCtx = previewCanvas.getContext('2d');
      
      // إنشاء صورتين للمعاينة
      const image1 = document.createElement('canvas');
      image1.width = this.canvas.width;
      image1.height = this.canvas.height;
      const ctx1 = image1.getContext('2d');
      ctx1.fillStyle = 'blue';
      ctx1.fillRect(0, 0, image1.width, image1.height);
      ctx1.fillStyle = 'white';
      ctx1.font = '48px Arial';
      ctx1.textAlign = 'center';
      ctx1.textBaseline = 'middle';
      ctx1.fillText('المشهد الأول', image1.width / 2, image1.height / 2);
      
      const image2 = document.createElement('canvas');
      image2.width = this.canvas.width;
      image2.height = this.canvas.height;
      const ctx2 = image2.getContext('2d');
      ctx2.fillStyle = 'green';
      ctx2.fillRect(0, 0, image2.width, image2.height);
      ctx2.fillStyle = 'white';
      ctx2.font = '48px Arial';
      ctx2.textAlign = 'center';
      ctx2.textBaseline = 'middle';
      ctx2.fillText('المشهد الثاني', image2.width / 2, image2.height / 2);
      
      // تطبيق الانتقال بنسبة تقدم 0.5
      const transitionFunc = this.transitions[transitionType].apply;
      const mergedParams = { ...this.transitions[transitionType].defaultParams, ...params };
      
      transitionFunc(
        previewCtx,
        image1,
        image2,
        0.5,
        mergedParams,
        this.offscreenCanvas,
        this.offscreenCtx
      );
      
      // تحويل الكانفاس إلى صورة
      return new Promise(resolve => {
        previewCanvas.toBlob(blob => {
          resolve(blob);
        }, 'image/jpeg', 0.95);
      });
    } catch (error) {
      console.error('خطأ في معاينة الانتقال:', error);
      return null;
    }
  }

  /**
   * تهيئة الانتقالات المتاحة
   * @private
   */
  _initializeTransitions() {
    this.transitions = {
      'fade': {
        name: 'تلاشي',
        description: 'انتقال تدريجي بين المشهدين',
        category: 'basic',
        defaultParams: {},
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          // رسم المشهد الأول
          ctx.globalAlpha = 1 - progress;
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني
          ctx.globalAlpha = progress;
          ctx.drawImage(toCanvas, 0, 0);
          
          // استعادة الشفافية
          ctx.globalAlpha = 1;
        }
      },
      'wipe-right': {
        name: 'مسح لليمين',
        description: 'انتقال بمسح المشهد من اليسار إلى اليمين',
        category: 'directional',
        defaultParams: {
          smoothness: 0
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const position = width * progress;
          const smoothness = params.smoothness * width;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع قناع
          ctx.save();
          
          if (smoothness > 0) {
            // إنشاء تدرج للحواف الناعمة
            const gradient = ctx.createLinearGradient(position - smoothness, 0, position, 0);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
            
            ctx.beginPath();
            ctx.rect(0, 0, position - smoothness, height);
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.rect(position - smoothness, 0, smoothness, height);
            ctx.fillStyle = gradient;
            ctx.fill();
          } else {
            // قص بدون حواف ناعمة
            ctx.beginPath();
            ctx.rect(0, 0, position, height);
            ctx.clip();
          }
          
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'wipe-left': {
        name: 'مسح لليسار',
        description: 'انتقال بمسح المشهد من اليمين إلى اليسار',
        category: 'directional',
        defaultParams: {
          smoothness: 0
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const position = width * (1 - progress);
          const smoothness = params.smoothness * width;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع قناع
          ctx.save();
          
          if (smoothness > 0) {
            // إنشاء تدرج للحواف الناعمة
            const gradient = ctx.createLinearGradient(position, 0, position + smoothness, 0);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.beginPath();
            ctx.rect(position + smoothness, 0, width - (position + smoothness), height);
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.rect(position, 0, smoothness, height);
            ctx.fillStyle = gradient;
            ctx.fill();
          } else {
            // قص بدون حواف ناعمة
            ctx.beginPath();
            ctx.rect(position, 0, width - position, height);
            ctx.clip();
          }
          
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'wipe-up': {
        name: 'مسح للأعلى',
        description: 'انتقال بمسح المشهد من الأسفل إلى الأعلى',
        category: 'directional',
        defaultParams: {
          smoothness: 0
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const position = height * (1 - progress);
          const smoothness = params.smoothness * height;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع قناع
          ctx.save();
          
          if (smoothness > 0) {
            // إنشاء تدرج للحواف الناعمة
            const gradient = ctx.createLinearGradient(0, position, 0, position + smoothness);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.beginPath();
            ctx.rect(0, position + smoothness, width, height - (position + smoothness));
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.rect(0, position, width, smoothness);
            ctx.fillStyle = gradient;
            ctx.fill();
          } else {
            // قص بدون حواف ناعمة
            ctx.beginPath();
            ctx.rect(0, position, width, height - position);
            ctx.clip();
          }
          
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'wipe-down': {
        name: 'مسح للأسفل',
        description: 'انتقال بمسح المشهد من الأعلى إلى الأسفل',
        category: 'directional',
        defaultParams: {
          smoothness: 0
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const position = height * progress;
          const smoothness = params.smoothness * height;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع قناع
          ctx.save();
          
          if (smoothness > 0) {
            // إنشاء تدرج للحواف الناعمة
            const gradient = ctx.createLinearGradient(0, position - smoothness, 0, position);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
            
            ctx.beginPath();
            ctx.rect(0, 0, width, position - smoothness);
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.rect(0, position - smoothness, width, smoothness);
            ctx.fillStyle = gradient;
            ctx.fill();
          } else {
            // قص بدون حواف ناعمة
            ctx.beginPath();
            ctx.rect(0, 0, width, position);
            ctx.clip();
          }
          
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'zoom-in': {
        name: 'تكبير',
        description: 'انتقال بتكبير المشهد الثاني',
        category: 'zoom',
        defaultParams: {},
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع تكبير
          ctx.save();
          ctx.globalAlpha = progress;
          
          const scale = progress;
          const scaledWidth = width * scale;
          const scaledHeight = height * scale;
          const x = (width - scaledWidth) / 2;
          const y = (height - scaledHeight) / 2;
          
          ctx.drawImage(toCanvas, x, y, scaledWidth, scaledHeight);
          ctx.restore();
        }
      },
      'zoom-out': {
        name: 'تصغير',
        description: 'انتقال بتصغير المشهد الأول',
        category: 'zoom',
        defaultParams: {},
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          
          // رسم المشهد الثاني
          ctx.drawImage(toCanvas, 0, 0);
          
          // رسم المشهد الأول مع تصغير
          ctx.save();
          ctx.globalAlpha = 1 - progress;
          
          const scale = 1 - progress;
          const scaledWidth = width * scale;
          const scaledHeight = height * scale;
          const x = (width - scaledWidth) / 2;
          const y = (height - scaledHeight) / 2;
          
          ctx.drawImage(fromCanvas, x, y, scaledWidth, scaledHeight);
          ctx.restore();
        }
      },
      'rotate': {
        name: 'دوران',
        description: 'انتقال بدوران المشهد',
        category: 'rotation',
        defaultParams: {
          direction: 1 // 1 للدوران في اتجاه عقارب الساعة، -1 للدوران عكس اتجاه عقارب الساعة
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const direction = params.direction || 1;
          
          // مسح الكانفاس
          ctx.clearRect(0, 0, width, height);
          
          // رسم المشهد الأول مع دوران
          ctx.save();
          ctx.globalAlpha = 1 - progress;
          ctx.translate(width / 2, height / 2);
          ctx.rotate(direction * Math.PI * progress);
          ctx.scale(1 - progress * 0.5, 1 - progress * 0.5);
          ctx.translate(-width / 2, -height / 2);
          ctx.drawImage(fromCanvas, 0, 0);
          ctx.restore();
          
          // رسم المشهد الثاني مع دوران
          ctx.save();
          ctx.globalAlpha = progress;
          ctx.translate(width / 2, height / 2);
          ctx.rotate(direction * Math.PI * (progress - 1));
          ctx.scale(0.5 + progress * 0.5, 0.5 + progress * 0.5);
          ctx.translate(-width / 2, -height / 2);
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'flip': {
        name: 'قلب',
        description: 'انتقال بقلب المشهد',
        category: 'rotation',
        defaultParams: {
          direction: 'horizontal' // 'horizontal' أو 'vertical'
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const direction = params.direction || 'horizontal';
          
          // مسح الكانفاس
          ctx.clearRect(0, 0, width, height);
          
          if (progress < 0.5) {
            // النصف الأول: قلب المشهد الأول
            ctx.save();
            ctx.translate(width / 2, height / 2);
            
            if (direction === 'horizontal') {
              ctx.scale(Math.cos(Math.PI * progress), 1);
            } else {
              ctx.scale(1, Math.cos(Math.PI * progress));
            }
            
            ctx.translate(-width / 2, -height / 2);
            ctx.drawImage(fromCanvas, 0, 0);
            ctx.restore();
          } else {
            // النصف الثاني: قلب المشهد الثاني
            ctx.save();
            ctx.translate(width / 2, height / 2);
            
            if (direction === 'horizontal') {
              ctx.scale(Math.cos(Math.PI * (progress - 1)), 1);
            } else {
              ctx.scale(1, Math.cos(Math.PI * (progress - 1)));
            }
            
            ctx.translate(-width / 2, -height / 2);
            ctx.drawImage(toCanvas, 0, 0);
            ctx.restore();
          }
        }
      },
      'dissolve': {
        name: 'ذوبان',
        description: 'انتقال بذوبان المشهد الأول إلى الثاني',
        category: 'effect',
        defaultParams: {
          density: 0.5
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const density = params.density || 0.5;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // إنشاء قناع عشوائي
          offscreenCtx.clearRect(0, 0, width, height);
          
          const pixelSize = Math.max(1, Math.floor(10 * (1 - density)));
          const cols = Math.ceil(width / pixelSize);
          const rows = Math.ceil(height / pixelSize);
          
          offscreenCtx.fillStyle = 'white';
          
          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              if (Math.random() < progress) {
                offscreenCtx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
              }
            }
          }
          
          // استخدام القناع لرسم المشهد الثاني
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          ctx.drawImage(offscreenCanvas, 0, 0);
          ctx.globalCompositeOperation = 'source-in';
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'blinds': {
        name: 'ستائر',
        description: 'انتقال بشكل ستائر أفقية',
        category: 'effect',
        defaultParams: {
          count: 10,
          direction: 'horizontal' // 'horizontal' أو 'vertical'
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const count = params.count || 10;
          const direction = params.direction || 'horizontal';
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع تأثير الستائر
          ctx.save();
          
          if (direction === 'horizontal') {
            const sliceHeight = height / count;
            
            for (let i = 0; i < count; i++) {
              const y = i * sliceHeight;
              const sliceProgress = Math.min(1, Math.max(0, (progress * count) - i));
              const sliceWidth = width * sliceProgress;
              
              ctx.drawImage(
                toCanvas,
                0, y, sliceWidth, sliceHeight,
                0, y, sliceWidth, sliceHeight
              );
            }
          } else {
            const sliceWidth = width / count;
            
            for (let i = 0; i < count; i++) {
              const x = i * sliceWidth;
              const sliceProgress = Math.min(1, Math.max(0, (progress * count) - i));
              const sliceHeight = height * sliceProgress;
              
              ctx.drawImage(
                toCanvas,
                x, 0, sliceWidth, sliceHeight,
                x, 0, sliceWidth, sliceHeight
              );
            }
          }
          
          ctx.restore();
        }
      },
      'circle': {
        name: 'دائرة',
        description: 'انتقال بشكل دائرة متوسعة',
        category: 'shape',
        defaultParams: {
          centerX: 0.5, // نسبة من عرض الكانفاس (0-1)
          centerY: 0.5  // نسبة من ارتفاع الكانفاس (0-1)
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const centerX = (params.centerX || 0.5) * width;
          const centerY = (params.centerY || 0.5) * height;
          
          // حساب نصف قطر الدائرة
          const maxRadius = Math.sqrt(Math.pow(Math.max(centerX, width - centerX), 2) + 
                                     Math.pow(Math.max(centerY, height - centerY), 2));
          const radius = maxRadius * progress;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع قناع دائري
          ctx.save();
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.clip();
          
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'diamond': {
        name: 'معين',
        description: 'انتقال بشكل معين متوسع',
        category: 'shape',
        defaultParams: {},
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const centerX = width / 2;
          const centerY = height / 2;
          
          // حساب أبعاد المعين
          const maxSize = Math.max(width, height) * Math.SQRT2;
          const size = maxSize * progress;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع قناع معيني
          ctx.save();
          
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY);
          ctx.lineTo(centerX, centerY + size / 2);
          ctx.lineTo(centerX - size / 2, centerY);
          ctx.closePath();
          ctx.clip();
          
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'pixelate': {
        name: 'تبكسل',
        description: 'انتقال بتأثير البكسلة',
        category: 'effect',
        defaultParams: {},
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          
          // تحديد حجم البكسل
          const minPixelSize = 1;
          const maxPixelSize = Math.min(width, height) / 10;
          
          // في البداية، حجم البكسل كبير ثم يصغر تدريجياً
          let pixelSize;
          if (progress < 0.5) {
            // المشهد الأول يتبكسل بشكل متزايد
            pixelSize = minPixelSize + (maxPixelSize - minPixelSize) * (progress * 2);
            
            // رسم المشهد الأول مع تأثير البكسلة
            offscreenCtx.clearRect(0, 0, width, height);
            offscreenCtx.drawImage(fromCanvas, 0, 0);
            
            this._applyPixelateEffect(offscreenCtx, pixelSize);
            
            ctx.drawImage(offscreenCanvas, 0, 0);
          } else {
            // المشهد الثاني يظهر من البكسلة
            pixelSize = minPixelSize + (maxPixelSize - minPixelSize) * ((1 - progress) * 2);
            
            // رسم المشهد الثاني مع تأثير البكسلة
            offscreenCtx.clearRect(0, 0, width, height);
            offscreenCtx.drawImage(toCanvas, 0, 0);
            
            this._applyPixelateEffect(offscreenCtx, pixelSize);
            
            ctx.drawImage(offscreenCanvas, 0, 0);
          }
        }
      },
      'radial-wipe': {
        name: 'مسح دائري',
        description: 'انتقال بمسح دائري',
        category: 'shape',
        defaultParams: {
          clockwise: true
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const clockwise = params.clockwise !== false;
          
          // رسم المشهد الأول
          ctx.drawImage(fromCanvas, 0, 0);
          
          // رسم المشهد الثاني مع قناع دائري
          ctx.save();
          
          ctx.beginPath();
          ctx.moveTo(width / 2, height / 2);
          
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + (clockwise ? 1 : -1) * Math.PI * 2 * progress;
          
          ctx.arc(width / 2, height / 2, Math.sqrt(width * width + height * height), startAngle, endAngle, !clockwise);
          ctx.lineTo(width / 2, height / 2);
          ctx.closePath();
          ctx.clip();
          
          ctx.drawImage(toCanvas, 0, 0);
          ctx.restore();
        }
      },
      'cube': {
        name: 'مكعب',
        description: 'انتقال بتدوير مكعب ثلاثي الأبعاد',
        category: '3d',
        defaultParams: {
          direction: 'left' // 'left', 'right', 'up', 'down'
        },
        apply: (ctx, fromCanvas, toCanvas, progress, params, offscreenCanvas, offscreenCtx) => {
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;
          const direction = params.direction || 'left';
          
          // مسح الكانفاس
          ctx.clearRect(0, 0, width, height);
          
          // تحديد محور الدوران
          let rotateX = 0;
          let rotateY = 0;
          
          switch (direction) {
            case 'left':
              rotateY = -Math.PI / 2 * progress;
              break;
            case 'right':
              rotateY = Math.PI / 2 * progress;
              break;
            case 'up':
              rotateX = Math.PI / 2 * progress;
              break;
            case 'down':
              rotateX = -Math.PI / 2 * progress;
              break;
          }
          
          // رسم الوجه الأول (المشهد الأول)
          if (progress < 0.5 || (direction === 'left' && progress < 1) || (direction === 'up' && progress < 1)) {
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate(rotateY);
            ctx.scale(Math.cos(rotateX), Math.cos(rotateY));
            ctx.translate(-width / 2, -height / 2);
            ctx.drawImage(fromCanvas, 0, 0);
            ctx.restore();
          }
          
          // رسم الوجه الثاني (المشهد الثاني)
          if (progress > 0.5 || (direction === 'right' && progress > 0) || (direction === 'down' && progress > 0)) {
            ctx.save();
            ctx.translate(width / 2, height / 2);
            
            switch (direction) {
              case 'left':
                ctx.rotate(-Math.PI / 2);
                ctx.translate(0, -height);
                break;
              case 'right':
                ctx.rotate(Math.PI / 2);
                ctx.translate(-width, 0);
                break;
              case 'up':
                ctx.rotate(Math.PI);
                ctx.translate(-width, -height);
                break;
              case 'down':
                // ترك الاتجاه كما هو
                break;
            }
            
            ctx.rotate(rotateY);
            ctx.scale(Math.cos(rotateX), Math.cos(rotateY));
            ctx.translate(-width / 2, -height / 2);
            ctx.drawImage(toCanvas, 0, 0);
            ctx.restore();
          }
        }
      }
    };
  }

  /**
   * تطبيق تأثير البكسلة على سياق الكانفاس
   * @param {CanvasRenderingContext2D} ctx سياق الكانفاس
   * @param {number} pixelSize حجم البكسل
   * @private
   */
  _applyPixelateEffect(ctx, pixelSize) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    pixelSize = Math.max(1, Math.floor(pixelSize));
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // تطبيق تأثير البكسلة
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // الحصول على لون البكسل الأول في المجموعة
        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];
        
        // تطبيق نفس اللون على جميع البكسلات في المجموعة
        for (let py = 0; py < pixelSize && y + py < height; py++) {
          for (let px = 0; px < pixelSize && x + px < width; px++) {
            const index = ((y + py) * width + (x + px)) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = a;
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
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
      
      // تحديث أبعاد الكانفاس الخارجية
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      
      // تحديث أبعاد كانفاس الإطار السابق
      this.previousFrameCanvas.width = this.canvas.width;
      this.previousFrameCanvas.height = this.canvas.height;
      
      // تحديث أبعاد كانفاس الإطار التالي
      this.nextFrameCanvas.width = this.canvas.width;
      this.nextFrameCanvas.height = this.canvas.height;
    });
  }
}

export default TransitionsTool;
