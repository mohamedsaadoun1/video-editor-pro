/**
 * أداة الفلاتر والتأثيرات لمحرر الفيديو العام
 * توفر واجهة برمجية للتعامل مع الفلاتر والتأثيرات البصرية المتقدمة
 */

class FiltersEffectsTool {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.videoElement = null;
    this.filters = {};
    this.effects = {};
    this.activeFilters = {};
    this.activeEffects = {};
    this.renderLoop = null;
    this.initialized = false;
  }

  /**
   * تهيئة أداة الفلاتر والتأثيرات
   * @param {HTMLVideoElement} videoElement عنصر الفيديو للمعاينة
   * @param {HTMLCanvasElement} canvas عنصر الكانفاس لعرض التأثيرات
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
      
      // تهيئة الفلاتر
      this._initializeFilters();
      
      // تهيئة التأثيرات
      this._initializeEffects();
      
      // إعداد مستمعي الأحداث
      this._setupEventListeners();
      
      this.initialized = true;
      console.log('تم تهيئة أداة الفلاتر والتأثيرات بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة أداة الفلاتر والتأثيرات:', error);
    }
    
    return this.initialized;
  }

  /**
   * بدء حلقة العرض لتطبيق الفلاتر والتأثيرات
   * @returns {boolean} نجاح العملية
   */
  startRenderLoop() {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return false;
    }
    
    // إيقاف أي حلقة عرض سابقة
    this.stopRenderLoop();
    
    // بدء حلقة العرض الجديدة
    this.renderLoop = requestAnimationFrame(this._renderFrame.bind(this));
    
    console.log('تم بدء حلقة العرض للفلاتر والتأثيرات');
    return true;
  }

  /**
   * إيقاف حلقة العرض
   * @returns {boolean} نجاح العملية
   */
  stopRenderLoop() {
    if (this.renderLoop) {
      cancelAnimationFrame(this.renderLoop);
      this.renderLoop = null;
      
      console.log('تم إيقاف حلقة العرض للفلاتر والتأثيرات');
      return true;
    }
    
    return false;
  }

  /**
   * تطبيق فلتر على الفيديو
   * @param {string} filterId معرف الفلتر
   * @param {Object} params معلمات الفلتر (اختياري)
   * @returns {boolean} نجاح العملية
   */
  applyFilter(filterId, params = {}) {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return false;
    }
    
    try {
      // التحقق من وجود الفلتر
      if (!this.filters[filterId]) {
        throw new Error('الفلتر غير موجود: ' + filterId);
      }
      
      // إضافة الفلتر إلى قائمة الفلاتر النشطة
      this.activeFilters[filterId] = {
        filter: this.filters[filterId],
        params: { ...this.filters[filterId].defaultParams, ...params }
      };
      
      // بدء حلقة العرض إذا لم تكن قد بدأت بالفعل
      if (!this.renderLoop) {
        this.startRenderLoop();
      }
      
      console.log('تم تطبيق الفلتر:', filterId);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق الفلتر:', error);
      return false;
    }
  }

  /**
   * إزالة فلتر من الفيديو
   * @param {string} filterId معرف الفلتر
   * @returns {boolean} نجاح العملية
   */
  removeFilter(filterId) {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return false;
    }
    
    try {
      // التحقق من وجود الفلتر في القائمة النشطة
      if (!this.activeFilters[filterId]) {
        throw new Error('الفلتر غير مطبق: ' + filterId);
      }
      
      // إزالة الفلتر من القائمة النشطة
      delete this.activeFilters[filterId];
      
      // إيقاف حلقة العرض إذا لم تعد هناك فلاتر أو تأثيرات نشطة
      if (Object.keys(this.activeFilters).length === 0 && Object.keys(this.activeEffects).length === 0) {
        this.stopRenderLoop();
      }
      
      console.log('تم إزالة الفلتر:', filterId);
      return true;
    } catch (error) {
      console.error('خطأ في إزالة الفلتر:', error);
      return false;
    }
  }

  /**
   * تحديث معلمات فلتر
   * @param {string} filterId معرف الفلتر
   * @param {Object} params معلمات الفلتر الجديدة
   * @returns {boolean} نجاح العملية
   */
  updateFilterParams(filterId, params) {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return false;
    }
    
    try {
      // التحقق من وجود الفلتر في القائمة النشطة
      if (!this.activeFilters[filterId]) {
        throw new Error('الفلتر غير مطبق: ' + filterId);
      }
      
      // تحديث معلمات الفلتر
      Object.assign(this.activeFilters[filterId].params, params);
      
      console.log('تم تحديث معلمات الفلتر:', filterId);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث معلمات الفلتر:', error);
      return false;
    }
  }

  /**
   * تطبيق تأثير على الفيديو
   * @param {string} effectId معرف التأثير
   * @param {Object} params معلمات التأثير (اختياري)
   * @returns {boolean} نجاح العملية
   */
  applyEffect(effectId, params = {}) {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return false;
    }
    
    try {
      // التحقق من وجود التأثير
      if (!this.effects[effectId]) {
        throw new Error('التأثير غير موجود: ' + effectId);
      }
      
      // إضافة التأثير إلى قائمة التأثيرات النشطة
      this.activeEffects[effectId] = {
        effect: this.effects[effectId],
        params: { ...this.effects[effectId].defaultParams, ...params },
        state: {} // حالة التأثير (تستخدم للتأثيرات التي تحتفظ بحالة)
      };
      
      // تهيئة حالة التأثير إذا كان التأثير يحتاج إلى ذلك
      if (this.effects[effectId].initialize) {
        this.effects[effectId].initialize(this.activeEffects[effectId].state, this.activeEffects[effectId].params);
      }
      
      // بدء حلقة العرض إذا لم تكن قد بدأت بالفعل
      if (!this.renderLoop) {
        this.startRenderLoop();
      }
      
      console.log('تم تطبيق التأثير:', effectId);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق التأثير:', error);
      return false;
    }
  }

  /**
   * إزالة تأثير من الفيديو
   * @param {string} effectId معرف التأثير
   * @returns {boolean} نجاح العملية
   */
  removeEffect(effectId) {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return false;
    }
    
    try {
      // التحقق من وجود التأثير في القائمة النشطة
      if (!this.activeEffects[effectId]) {
        throw new Error('التأثير غير مطبق: ' + effectId);
      }
      
      // إزالة التأثير من القائمة النشطة
      delete this.activeEffects[effectId];
      
      // إيقاف حلقة العرض إذا لم تعد هناك فلاتر أو تأثيرات نشطة
      if (Object.keys(this.activeFilters).length === 0 && Object.keys(this.activeEffects).length === 0) {
        this.stopRenderLoop();
      }
      
      console.log('تم إزالة التأثير:', effectId);
      return true;
    } catch (error) {
      console.error('خطأ في إزالة التأثير:', error);
      return false;
    }
  }

  /**
   * تحديث معلمات تأثير
   * @param {string} effectId معرف التأثير
   * @param {Object} params معلمات التأثير الجديدة
   * @returns {boolean} نجاح العملية
   */
  updateEffectParams(effectId, params) {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return false;
    }
    
    try {
      // التحقق من وجود التأثير في القائمة النشطة
      if (!this.activeEffects[effectId]) {
        throw new Error('التأثير غير مطبق: ' + effectId);
      }
      
      // تحديث معلمات التأثير
      Object.assign(this.activeEffects[effectId].params, params);
      
      console.log('تم تحديث معلمات التأثير:', effectId);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث معلمات التأثير:', error);
      return false;
    }
  }

  /**
   * الحصول على قائمة الفلاتر المتاحة
   * @returns {Array} قائمة الفلاتر
   */
  getAvailableFilters() {
    return Object.keys(this.filters).map(id => ({
      id,
      name: this.filters[id].name,
      description: this.filters[id].description,
      category: this.filters[id].category,
      defaultParams: this.filters[id].defaultParams
    }));
  }

  /**
   * الحصول على قائمة التأثيرات المتاحة
   * @returns {Array} قائمة التأثيرات
   */
  getAvailableEffects() {
    return Object.keys(this.effects).map(id => ({
      id,
      name: this.effects[id].name,
      description: this.effects[id].description,
      category: this.effects[id].category,
      defaultParams: this.effects[id].defaultParams
    }));
  }

  /**
   * الحصول على قائمة الفلاتر النشطة
   * @returns {Array} قائمة الفلاتر النشطة
   */
  getActiveFilters() {
    return Object.keys(this.activeFilters).map(id => ({
      id,
      name: this.activeFilters[id].filter.name,
      params: this.activeFilters[id].params
    }));
  }

  /**
   * الحصول على قائمة التأثيرات النشطة
   * @returns {Array} قائمة التأثيرات النشطة
   */
  getActiveEffects() {
    return Object.keys(this.activeEffects).map(id => ({
      id,
      name: this.activeEffects[id].effect.name,
      params: this.activeEffects[id].params
    }));
  }

  /**
   * التقاط إطار من الفيديو مع الفلاتر والتأثيرات المطبقة
   * @returns {Promise<Blob>} وعد يتم حله بالإطار كصورة
   */
  async captureFrame() {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return null;
    }
    
    try {
      // رسم الإطار الحالي على الكانفاس
      this._renderCurrentFrame();
      
      // تحويل الكانفاس إلى صورة
      return new Promise(resolve => {
        this.canvas.toBlob(blob => {
          resolve(blob);
        }, 'image/jpeg', 0.95);
      });
    } catch (error) {
      console.error('خطأ في التقاط الإطار:', error);
      return null;
    }
  }

  /**
   * تصدير الفيديو مع الفلاتر والتأثيرات المطبقة
   * @param {Object} options خيارات التصدير
   * @returns {Promise<Blob>} وعد يتم حله بملف الفيديو المصدر
   */
  async exportVideo(options = {}) {
    if (!this.initialized) {
      console.warn('أداة الفلاتر والتأثيرات غير مهيأة بعد');
      return null;
    }
    
    try {
      // في بيئة حقيقية، هنا سيتم استخدام MediaRecorder أو WebAssembly لمعالجة الفيديو
      // لكن في هذا المثال، سنفترض أن العملية تمت بنجاح ونعيد وعداً يتم حله بعد فترة
      
      console.log('جاري تصدير الفيديو مع الفلاتر والتأثيرات');
      
      // محاكاة عملية التصدير
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('تم تصدير الفيديو بنجاح');
      
      // في التطبيق الحقيقي، سيتم إرجاع ملف الفيديو المعالج
      return new Blob(['dummy video data'], { type: 'video/mp4' });
    } catch (error) {
      console.error('خطأ في تصدير الفيديو:', error);
      return null;
    }
  }

  /**
   * تهيئة الفلاتر المتاحة
   * @private
   */
  _initializeFilters() {
    this.filters = {
      'grayscale': {
        name: 'تدرج رمادي',
        description: 'تحويل الفيديو إلى تدرج رمادي',
        category: 'basic',
        defaultParams: { intensity: 1.0 },
        apply: (ctx, canvas, params) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const intensity = params.intensity;
          
          for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            data[i] = data[i] * (1 - intensity) + gray * intensity;
            data[i + 1] = data[i + 1] * (1 - intensity) + gray * intensity;
            data[i + 2] = data[i + 2] * (1 - intensity) + gray * intensity;
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      },
      'sepia': {
        name: 'سيبيا',
        description: 'تطبيق تأثير سيبيا للحصول على مظهر قديم',
        category: 'basic',
        defaultParams: { intensity: 1.0 },
        apply: (ctx, canvas, params) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const intensity = params.intensity;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const newR = Math.min(255, (r * (1 - intensity)) + ((r * 0.393 + g * 0.769 + b * 0.189) * intensity));
            const newG = Math.min(255, (g * (1 - intensity)) + ((r * 0.349 + g * 0.686 + b * 0.168) * intensity));
            const newB = Math.min(255, (b * (1 - intensity)) + ((r * 0.272 + g * 0.534 + b * 0.131) * intensity));
            
            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      },
      'brightness': {
        name: 'سطوع',
        description: 'تعديل سطوع الفيديو',
        category: 'adjustment',
        defaultParams: { value: 0 },
        apply: (ctx, canvas, params) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const value = params.value * 255;
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + value));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value));
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      },
      'contrast': {
        name: 'تباين',
        description: 'تعديل تباين الفيديو',
        category: 'adjustment',
        defaultParams: { value: 1 },
        apply: (ctx, canvas, params) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const factor = params.value;
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * factor) + 128));
            data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * factor) + 128));
            data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * factor) + 128));
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      },
      'saturation': {
        name: 'تشبع',
        description: 'تعديل تشبع الألوان في الفيديو',
        category: 'adjustment',
        defaultParams: { value: 1 },
        apply: (ctx, canvas, params) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const factor = params.value;
          
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = Math.min(255, Math.max(0, gray + factor * (data[i] - gray)));
            data[i + 1] = Math.min(255, Math.max(0, gray + factor * (data[i + 1] - gray)));
            data[i + 2] = Math.min(255, Math.max(0, gray + factor * (data[i + 2] - gray)));
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      },
      'hue': {
        name: 'صبغة',
        description: 'تعديل صبغة الألوان في الفيديو',
        category: 'adjustment',
        defaultParams: { value: 0 },
        apply: (ctx, canvas, params) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const hueValue = params.value * 360;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // تحويل RGB إلى HSL
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
              h = s = 0; // لا صبغة
            } else {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              
              switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
              }
              
              h /= 6;
            }
            
            // تعديل الصبغة
            h = (h + hueValue / 360) % 1;
            
            // تحويل HSL إلى RGB
            let r1, g1, b1;
            
            if (s === 0) {
              r1 = g1 = b1 = l;
            } else {
              const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              const p = 2 * l - q;
              
              r1 = this._hueToRgb(p, q, h + 1/3);
              g1 = this._hueToRgb(p, q, h);
              b1 = this._hueToRgb(p, q, h - 1/3);
            }
            
            data[i] = r1 * 255;
            data[i + 1] = g1 * 255;
            data[i + 2] = b1 * 255;
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      },
      'blur': {
        name: 'ضبابية',
        description: 'إضافة تأثير ضبابي للفيديو',
        category: 'effect',
        defaultParams: { radius: 5 },
        apply: (ctx, canvas, params) => {
          // استخدام فلتر CSS للضبابية
          ctx.filter = `blur(${params.radius}px)`;
          ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
          ctx.filter = 'none';
        }
      },
      'vignette': {
        name: 'فينيت',
        description: 'إضافة تأثير فينيت (تعتيم الحواف)',
        category: 'effect',
        defaultParams: { size: 0.5, intensity: 0.5 },
        apply: (ctx, canvas, params) => {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.min(centerX, centerY) * (1 - params.size);
          const intensity = params.intensity;
          
          // حفظ الصورة الأصلية
          const originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // إنشاء تدرج شعاعي للفينيت
          const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, centerX);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
          
          // رسم التدرج
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // استعادة الصورة الأصلية مع الاحتفاظ بالتدرج
          ctx.globalCompositeOperation = 'source-over';
        }
      },
      'noise': {
        name: 'ضوضاء',
        description: 'إضافة تأثير ضوضاء للفيديو',
        category: 'effect',
        defaultParams: { amount: 0.1 },
        apply: (ctx, canvas, params) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const amount = params.amount * 255;
          
          for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * amount;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      },
      'vintage': {
        name: 'قديم',
        description: 'تطبيق تأثير الفيديو القديم',
        category: 'preset',
        defaultParams: { intensity: 1.0 },
        apply: (ctx, canvas, params) => {
          // تطبيق مزيج من الفلاتر للحصول على تأثير قديم
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const intensity = params.intensity;
          
          for (let i = 0; i < data.length; i += 4) {
            // تطبيق سيبيا
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const newR = Math.min(255, (r * (1 - intensity)) + ((r * 0.393 + g * 0.769 + b * 0.189) * intensity));
            const newG = Math.min(255, (g * (1 - intensity)) + ((r * 0.349 + g * 0.686 + b * 0.168) * intensity));
            const newB = Math.min(255, (b * (1 - intensity)) + ((r * 0.272 + g * 0.534 + b * 0.131) * intensity));
            
            // تقليل التشبع
            const gray = newR * 0.299 + newG * 0.587 + newB * 0.114;
            const saturationFactor = 0.6;
            
            data[i] = gray + saturationFactor * (newR - gray);
            data[i + 1] = gray + saturationFactor * (newG - gray);
            data[i + 2] = gray + saturationFactor * (newB - gray);
            
            // إضافة ضوضاء خفيفة
            if (Math.random() > 0.95) {
              const noiseAmount = 30;
              const noise = (Math.random() - 0.5) * noiseAmount;
              data[i] = Math.min(255, Math.max(0, data[i] + noise));
              data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
              data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          // إضافة فينيت خفيف
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.min(centerX, centerY) * 0.6;
          
          const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, centerX);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      },
      'cinematic': {
        name: 'سينمائي',
        description: 'تطبيق تأثير سينمائي',
        category: 'preset',
        defaultParams: { intensity: 1.0 },
        apply: (ctx, canvas, params) => {
          // تطبيق مزيج من الفلاتر للحصول على تأثير سينمائي
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const intensity = params.intensity;
          
          // تعديل التباين والألوان
          for (let i = 0; i < data.length; i += 4) {
            // زيادة التباين
            const contrastFactor = 1.2;
            data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrastFactor) + 128));
            data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrastFactor) + 128));
            data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrastFactor) + 128));
            
            // تعديل توازن الألوان (إضافة المزيد من الأزرق والأخضر الداكن)
            data[i] = Math.min(255, Math.max(0, data[i] * 0.9));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * 1.1));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * 1.2));
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          // إضافة شريط أسود علوي وسفلي (letterbox)
          const letterboxHeight = canvas.height * 0.1 * intensity;
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvas.width, letterboxHeight);
          ctx.fillRect(0, canvas.height - letterboxHeight, canvas.width, letterboxHeight);
          
          // إضافة فينيت خفيف
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.min(centerX, centerY) * 0.7;
          
          const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, centerX);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }

  /**
   * تهيئة التأثيرات المتاحة
   * @private
   */
  _initializeEffects() {
    this.effects = {
      'particles': {
        name: 'جسيمات',
        description: 'إضافة تأثير جسيمات متحركة',
        category: 'animation',
        defaultParams: { count: 50, color: '#ffffff', size: 3, speed: 1 },
        initialize: (state, params) => {
          // إنشاء الجسيمات
          state.particles = [];
          for (let i = 0; i < params.count; i++) {
            state.particles.push({
              x: Math.random() * this.canvas.width,
              y: Math.random() * this.canvas.height,
              size: Math.random() * params.size + 1,
              speedX: (Math.random() - 0.5) * params.speed,
              speedY: (Math.random() - 0.5) * params.speed
            });
          }
        },
        apply: (ctx, canvas, params, state) => {
          // تحريك وعرض الجسيمات
          ctx.fillStyle = params.color;
          
          for (let i = 0; i < state.particles.length; i++) {
            const particle = state.particles[i];
            
            // تحريك الجسيم
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // إعادة تعيين الجسيم إذا خرج من الشاشة
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // رسم الجسيم
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      },
      'snow': {
        name: 'ثلج',
        description: 'إضافة تأثير تساقط الثلج',
        category: 'animation',
        defaultParams: { count: 100, speed: 1, size: 3 },
        initialize: (state, params) => {
          // إنشاء رقائق الثلج
          state.flakes = [];
          for (let i = 0; i < params.count; i++) {
            state.flakes.push({
              x: Math.random() * this.canvas.width,
              y: Math.random() * this.canvas.height,
              size: Math.random() * params.size + 1,
              speedY: Math.random() * params.speed + 0.5,
              speedX: Math.random() * 0.5 - 0.25,
              swing: Math.random() * 3
            });
          }
        },
        apply: (ctx, canvas, params, state) => {
          // تحريك وعرض رقائق الثلج
          ctx.fillStyle = 'white';
          
          for (let i = 0; i < state.flakes.length; i++) {
            const flake = state.flakes[i];
            
            // تحريك رقيقة الثلج
            flake.y += flake.speedY;
            flake.x += Math.sin(flake.y / 50) * flake.swing * 0.1 + flake.speedX;
            
            // إعادة تعيين رقيقة الثلج إذا خرجت من الشاشة
            if (flake.y > canvas.height) {
              flake.y = 0;
              flake.x = Math.random() * canvas.width;
            }
            
            if (flake.x < 0) flake.x = canvas.width;
            if (flake.x > canvas.width) flake.x = 0;
            
            // رسم رقيقة الثلج
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      },
      'rain': {
        name: 'مطر',
        description: 'إضافة تأثير هطول المطر',
        category: 'animation',
        defaultParams: { count: 100, speed: 10, length: 15 },
        initialize: (state, params) => {
          // إنشاء قطرات المطر
          state.drops = [];
          for (let i = 0; i < params.count; i++) {
            state.drops.push({
              x: Math.random() * this.canvas.width,
              y: Math.random() * this.canvas.height,
              length: Math.random() * params.length + 5,
              speed: Math.random() * params.speed + 5
            });
          }
        },
        apply: (ctx, canvas, params, state) => {
          // تحريك وعرض قطرات المطر
          ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
          ctx.lineWidth = 1;
          
          for (let i = 0; i < state.drops.length; i++) {
            const drop = state.drops[i];
            
            // تحريك قطرة المطر
            drop.y += drop.speed;
            
            // إعادة تعيين قطرة المطر إذا خرجت من الشاشة
            if (drop.y > canvas.height) {
              drop.y = 0;
              drop.x = Math.random() * canvas.width;
            }
            
            // رسم قطرة المطر
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
          }
        }
      },
      'glitch': {
        name: 'خلل',
        description: 'إضافة تأثير الخلل الرقمي',
        category: 'effect',
        defaultParams: { intensity: 0.5, frequency: 0.1 },
        initialize: (state, params) => {
          state.lastUpdate = 0;
          state.slices = [];
          state.offsetX = 0;
          state.offsetY = 0;
        },
        apply: (ctx, canvas, params, state) => {
          // تحديث تأثير الخلل بشكل متقطع
          const now = Date.now();
          const intensity = params.intensity * 20;
          
          // تحديث الخلل بناءً على التردد
          if (Math.random() < params.frequency || now - state.lastUpdate > 1000) {
            state.lastUpdate = now;
            
            // إنشاء شرائح جديدة للخلل
            state.slices = [];
            const sliceCount = Math.floor(Math.random() * 5) + 2;
            
            for (let i = 0; i < sliceCount; i++) {
              const y = Math.floor(Math.random() * canvas.height);
              const height = Math.floor(Math.random() * 20) + 2;
              const offsetX = (Math.random() - 0.5) * intensity;
              
              state.slices.push({ y, height, offsetX });
            }
            
            // تعيين إزاحة عامة
            state.offsetX = (Math.random() - 0.5) * intensity;
            state.offsetY = (Math.random() - 0.5) * intensity;
          }
          
          // تطبيق الخلل
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.putImageData(imageData, 0, 0);
          
          // مسح الكانفاس
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // رسم الصورة مع إزاحة عامة
          ctx.drawImage(tempCanvas, state.offsetX, state.offsetY);
          
          // رسم الشرائح مع إزاحة
          for (const slice of state.slices) {
            ctx.drawImage(
              tempCanvas,
              0, slice.y, canvas.width, slice.height,
              slice.offsetX, slice.y, canvas.width, slice.height
            );
          }
          
          // إضافة بعض التشويش اللوني
          if (Math.random() < params.frequency * 2) {
            const rgbChannel = Math.floor(Math.random() * 3);
            const channelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = channelData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              data[i + rgbChannel] = Math.min(255, data[i + rgbChannel] + intensity);
            }
            
            ctx.putImageData(channelData, 0, 0);
          }
        }
      },
      'fire': {
        name: 'نار',
        description: 'إضافة تأثير النار',
        category: 'animation',
        defaultParams: { intensity: 0.8, speed: 1 },
        initialize: (state, params) => {
          // إنشاء مصفوفة النار
          const width = Math.floor(this.canvas.width / 4);
          const height = Math.floor(this.canvas.height / 4);
          
          state.width = width;
          state.height = height;
          state.pixels = new Array(width * height).fill(0);
          state.palette = [];
          
          // إنشاء لوحة ألوان النار
          for (let i = 0; i < 256; i++) {
            const value = i * 3;
            const r = value > 255 ? 255 : value;
            const g = value > 255 ? value - 255 : 0;
            const b = 0;
            state.palette.push(`rgb(${r}, ${g}, ${b})`);
          }
        },
        apply: (ctx, canvas, params, state) => {
          // تحديث مصفوفة النار
          const { width, height, pixels, palette } = state;
          const intensity = params.intensity * 255;
          const speed = params.speed;
          
          // إنشاء مصدر النار في الصف السفلي
          for (let x = 0; x < width; x++) {
            pixels[x + (height - 1) * width] = Math.random() * intensity;
          }
          
          // حساب انتشار النار
          for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width; x++) {
              const idx = x + y * width;
              const below = x + (y + 1) * width;
              const belowLeft = (x - 1 + width) % width + (y + 1) * width;
              const belowRight = (x + 1) % width + (y + 1) * width;
              
              const decay = Math.floor(Math.random() * 3) * speed;
              const newFire = (pixels[below] + pixels[belowLeft] + pixels[belowRight]) / 3 - decay;
              pixels[idx] = newFire > 0 ? newFire : 0;
            }
          }
          
          // رسم النار
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const scaleX = canvas.width / width;
          const scaleY = canvas.height / height;
          
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = x + y * width;
              const color = Math.floor(pixels[idx]);
              const colorStr = palette[color];
              
              // تحليل اللون
              const r = parseInt(colorStr.substring(4, colorStr.indexOf(',')));
              const g = parseInt(colorStr.substring(colorStr.indexOf(',') + 2, colorStr.lastIndexOf(',')));
              const b = parseInt(colorStr.substring(colorStr.lastIndexOf(',') + 2, colorStr.indexOf(')')));
              
              // رسم البكسل المكبر
              for (let sy = 0; sy < scaleY; sy++) {
                for (let sx = 0; sx < scaleX; sx++) {
                  const dataIdx = ((y * scaleY + sy) * canvas.width + (x * scaleX + sx)) * 4;
                  
                  if (color > 0) {
                    data[dataIdx] = r;
                    data[dataIdx + 1] = g;
                    data[dataIdx + 2] = b;
                    data[dataIdx + 3] = color > 30 ? 255 : color * 8;
                  }
                }
              }
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      }
    };
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
    });
  }

  /**
   * رسم الإطار الحالي مع الفلاتر والتأثيرات
   * @private
   */
  _renderFrame() {
    // رسم الإطار الحالي
    this._renderCurrentFrame();
    
    // استمرار حلقة العرض
    this.renderLoop = requestAnimationFrame(this._renderFrame.bind(this));
  }

  /**
   * رسم الإطار الحالي مع الفلاتر والتأثيرات
   * @private
   */
  _renderCurrentFrame() {
    // مسح الكانفاس
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // رسم الفيديو على الكانفاس
    this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
    
    // تطبيق الفلاتر
    for (const filterId in this.activeFilters) {
      const filter = this.activeFilters[filterId];
      filter.filter.apply(this.ctx, this.canvas, filter.params);
    }
    
    // تطبيق التأثيرات
    for (const effectId in this.activeEffects) {
      const effect = this.activeEffects[effectId];
      effect.effect.apply(this.ctx, this.canvas, effect.params, effect.state);
    }
  }

  /**
   * تحويل قيمة الصبغة إلى RGB
   * @param {number} p
   * @param {number} q
   * @param {number} t
   * @returns {number}
   * @private
   */
  _hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
}

export default FiltersEffectsTool;
