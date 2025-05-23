/**
 * أداة الكروما كي (المفتاح اللوني) لمحرر الفيديو العام
 * توفر واجهة برمجية للتعامل مع إزالة الخلفيات وتأثيرات الكروما
 */

class ChromaKeyTool {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.videoElement = null;
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.backgroundElement = null;
    this.settings = {
      enabled: false,
      color: [0, 177, 64], // اللون الأخضر القياسي للكروما
      similarity: 0.4,     // درجة التشابه (0-1)
      smoothness: 0.08,    // نعومة الحواف (0-1)
      spill: 0.1,          // تقليل تسرب اللون (0-1)
      noiseReduction: 0.1, // تقليل الضوضاء (0-1)
      alphaFeathering: 3,  // تنعيم حواف الألفا (بالبكسل)
      crop: {              // اقتصاص منطقة الكروما
        enabled: false,
        x: 0,
        y: 0,
        width: 100,
        height: 100
      },
      keyColor: 'green',   // اللون الأساسي: 'green', 'blue', 'red', 'custom'
      advancedMode: false  // وضع الإعدادات المتقدمة
    };
    this.presets = {};
    this.initialized = false;
  }

  /**
   * تهيئة أداة الكروما كي
   * @param {HTMLVideoElement} videoElement عنصر الفيديو للمعاينة
   * @param {HTMLCanvasElement} canvas عنصر الكانفاس لعرض النتيجة
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
      
      // تهيئة الإعدادات المسبقة
      this._initializePresets();
      
      // إعداد مستمعي الأحداث
      this._setupEventListeners();
      
      this.initialized = true;
      console.log('تم تهيئة أداة الكروما كي بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة أداة الكروما كي:', error);
    }
    
    return this.initialized;
  }

  /**
   * تفعيل أو تعطيل تأثير الكروما كي
   * @param {boolean} enabled حالة التفعيل
   * @returns {boolean} نجاح العملية
   */
  setEnabled(enabled) {
    if (!this.initialized) {
      console.warn('أداة الكروما كي غير مهيأة بعد');
      return false;
    }
    
    this.settings.enabled = enabled;
    console.log('تم ' + (enabled ? 'تفعيل' : 'تعطيل') + ' تأثير الكروما كي');
    return true;
  }

  /**
   * تعيين خلفية للكروما كي
   * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement|string} background عنصر الخلفية أو رابط الصورة
   * @returns {Promise<boolean>} وعد يتم حله بنجاح العملية
   */
  async setBackground(background) {
    if (!this.initialized) {
      console.warn('أداة الكروما كي غير مهيأة بعد');
      return false;
    }
    
    try {
      if (typeof background === 'string') {
        // إذا كان رابط، قم بتحميل الصورة
        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = background;
        });
        
        this.backgroundElement = image;
      } else {
        // استخدام العنصر مباشرة
        this.backgroundElement = background;
      }
      
      console.log('تم تعيين خلفية جديدة للكروما كي');
      return true;
    } catch (error) {
      console.error('خطأ في تعيين خلفية الكروما كي:', error);
      return false;
    }
  }

  /**
   * تعيين لون الكروما كي
   * @param {string|Array} color لون الكروما (اسم اللون، قيم RGB، أو قيم HEX)
   * @returns {boolean} نجاح العملية
   */
  setKeyColor(color) {
    if (!this.initialized) {
      console.warn('أداة الكروما كي غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحويل اللون إلى مصفوفة RGB
      let rgbColor;
      
      if (Array.isArray(color) && color.length >= 3) {
        // إذا كان مصفوفة RGB
        rgbColor = [
          Math.min(255, Math.max(0, color[0])),
          Math.min(255, Math.max(0, color[1])),
          Math.min(255, Math.max(0, color[2]))
        ];
      } else if (typeof color === 'string') {
        if (color === 'green') {
          rgbColor = [0, 177, 64];
          this.settings.keyColor = 'green';
        } else if (color === 'blue') {
          rgbColor = [0, 71, 187];
          this.settings.keyColor = 'blue';
        } else if (color === 'red') {
          rgbColor = [255, 0, 0];
          this.settings.keyColor = 'red';
        } else {
          // تحويل لون HEX أو اسم لون إلى RGB
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 1;
          tempCanvas.height = 1;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.fillStyle = color;
          tempCtx.fillRect(0, 0, 1, 1);
          const imageData = tempCtx.getImageData(0, 0, 1, 1).data;
          rgbColor = [imageData[0], imageData[1], imageData[2]];
          this.settings.keyColor = 'custom';
        }
      } else {
        throw new Error('تنسيق لون غير صالح');
      }
      
      this.settings.color = rgbColor;
      console.log('تم تعيين لون الكروما كي:', rgbColor);
      return true;
    } catch (error) {
      console.error('خطأ في تعيين لون الكروما كي:', error);
      return false;
    }
  }

  /**
   * تحديث إعدادات الكروما كي
   * @param {Object} settings الإعدادات الجديدة
   * @returns {boolean} نجاح العملية
   */
  updateSettings(settings) {
    if (!this.initialized) {
      console.warn('أداة الكروما كي غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديث الإعدادات
      if (settings.similarity !== undefined) {
        this.settings.similarity = Math.min(1, Math.max(0, settings.similarity));
      }
      
      if (settings.smoothness !== undefined) {
        this.settings.smoothness = Math.min(1, Math.max(0, settings.smoothness));
      }
      
      if (settings.spill !== undefined) {
        this.settings.spill = Math.min(1, Math.max(0, settings.spill));
      }
      
      if (settings.noiseReduction !== undefined) {
        this.settings.noiseReduction = Math.min(1, Math.max(0, settings.noiseReduction));
      }
      
      if (settings.alphaFeathering !== undefined) {
        this.settings.alphaFeathering = Math.max(0, settings.alphaFeathering);
      }
      
      if (settings.crop !== undefined) {
        Object.assign(this.settings.crop, settings.crop);
      }
      
      if (settings.advancedMode !== undefined) {
        this.settings.advancedMode = settings.advancedMode;
      }
      
      console.log('تم تحديث إعدادات الكروما كي');
      return true;
    } catch (error) {
      console.error('خطأ في تحديث إعدادات الكروما كي:', error);
      return false;
    }
  }

  /**
   * تطبيق إعداد مسبق للكروما كي
   * @param {string} presetName اسم الإعداد المسبق
   * @returns {boolean} نجاح العملية
   */
  applyPreset(presetName) {
    if (!this.initialized) {
      console.warn('أداة الكروما كي غير مهيأة بعد');
      return false;
    }
    
    try {
      // البحث عن الإعداد المسبق
      const preset = this.presets[presetName];
      if (!preset) {
        throw new Error('الإعداد المسبق غير موجود: ' + presetName);
      }
      
      // تطبيق الإعداد المسبق
      Object.assign(this.settings, preset);
      
      console.log('تم تطبيق الإعداد المسبق:', presetName);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق الإعداد المسبق:', error);
      return false;
    }
  }

  /**
   * حفظ الإعدادات الحالية كإعداد مسبق
   * @param {string} presetName اسم الإعداد المسبق
   * @returns {boolean} نجاح العملية
   */
  saveAsPreset(presetName) {
    if (!this.initialized) {
      console.warn('أداة الكروما كي غير مهيأة بعد');
      return false;
    }
    
    try {
      // نسخ الإعدادات الحالية
      const preset = { ...this.settings };
      
      // حفظ الإعداد المسبق
      this.presets[presetName] = preset;
      
      console.log('تم حفظ الإعدادات الحالية كإعداد مسبق:', presetName);
      return true;
    } catch (error) {
      console.error('خطأ في حفظ الإعداد المسبق:', error);
      return false;
    }
  }

  /**
   * تطبيق تأثير الكروما كي على الإطار الحالي
   * @returns {boolean} نجاح العملية
   */
  processFrame() {
    if (!this.initialized || !this.settings.enabled) {
      // إذا كانت الأداة غير مهيأة أو غير مفعلة، ارسم الفيديو مباشرة
      if (this.initialized) {
        this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      }
      return false;
    }
    
    try {
      // رسم الفيديو على الكانفاس خارج الشاشة
      this.offscreenCtx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      
      // الحصول على بيانات الصورة
      const imageData = this.offscreenCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;
      
      // تطبيق تأثير الكروما كي
      this._applyChromaKey(data);
      
      // وضع بيانات الصورة المعدلة على الكانفاس خارج الشاشة
      this.offscreenCtx.putImageData(imageData, 0, 0);
      
      // رسم الخلفية إذا كانت موجودة
      if (this.backgroundElement) {
        this.ctx.drawImage(this.backgroundElement, 0, 0, this.canvas.width, this.canvas.height);
      } else {
        // إذا لم تكن هناك خلفية، استخدم خلفية شفافة أو سوداء
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      
      // رسم الفيديو المعالج على الكانفاس الرئيسي
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
      
      return true;
    } catch (error) {
      console.error('خطأ في معالجة إطار الكروما كي:', error);
      
      // في حالة الخطأ، ارسم الفيديو الأصلي
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      
      return false;
    }
  }

  /**
   * الحصول على الإعدادات الحالية
   * @returns {Object} الإعدادات الحالية
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * الحصول على قائمة الإعدادات المسبقة
   * @returns {Object} قائمة الإعدادات المسبقة
   */
  getPresets() {
    return { ...this.presets };
  }

  /**
   * تهيئة الإعدادات المسبقة
   * @private
   */
  _initializePresets() {
    this.presets = {
      'standard-green': {
        enabled: true,
        color: [0, 177, 64],
        similarity: 0.4,
        smoothness: 0.08,
        spill: 0.1,
        noiseReduction: 0.1,
        alphaFeathering: 3,
        crop: {
          enabled: false,
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        keyColor: 'green',
        advancedMode: false
      },
      'standard-blue': {
        enabled: true,
        color: [0, 71, 187],
        similarity: 0.4,
        smoothness: 0.08,
        spill: 0.1,
        noiseReduction: 0.1,
        alphaFeathering: 3,
        crop: {
          enabled: false,
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        keyColor: 'blue',
        advancedMode: false
      },
      'high-quality': {
        enabled: true,
        color: [0, 177, 64],
        similarity: 0.35,
        smoothness: 0.05,
        spill: 0.08,
        noiseReduction: 0.05,
        alphaFeathering: 2,
        crop: {
          enabled: false,
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        keyColor: 'green',
        advancedMode: true
      },
      'low-light': {
        enabled: true,
        color: [0, 177, 64],
        similarity: 0.5,
        smoothness: 0.12,
        spill: 0.15,
        noiseReduction: 0.2,
        alphaFeathering: 4,
        crop: {
          enabled: false,
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        keyColor: 'green',
        advancedMode: true
      },
      'fine-hair': {
        enabled: true,
        color: [0, 177, 64],
        similarity: 0.3,
        smoothness: 0.03,
        spill: 0.05,
        noiseReduction: 0.05,
        alphaFeathering: 1,
        crop: {
          enabled: false,
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        keyColor: 'green',
        advancedMode: true
      }
    };
  }

  /**
   * تطبيق تأثير الكروما كي على بيانات الصورة
   * @param {Uint8ClampedArray} data بيانات الصورة
   * @private
   */
  _applyChromaKey(data) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const keyColor = this.settings.color;
    const similarity = this.settings.similarity * 255;
    const smoothness = this.settings.smoothness * 255;
    const spillReduction = this.settings.spill;
    
    // تحديد منطقة المعالجة
    let startX = 0;
    let startY = 0;
    let endX = width;
    let endY = height;
    
    if (this.settings.crop.enabled) {
      startX = Math.max(0, this.settings.crop.x);
      startY = Math.max(0, this.settings.crop.y);
      endX = Math.min(width, startX + this.settings.crop.width);
      endY = Math.min(height, startY + this.settings.crop.height);
    }
    
    // معالجة كل بكسل
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const i = (y * width + x) * 4;
        
        // الحصول على قيم RGB للبكسل الحالي
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // حساب الفرق بين لون البكسل ولون الكروما
        const diffR = Math.abs(r - keyColor[0]);
        const diffG = Math.abs(g - keyColor[1]);
        const diffB = Math.abs(b - keyColor[2]);
        
        // حساب مجموع الفروق
        const diff = (diffR + diffG + diffB) / 3;
        
        // حساب قيمة الألفا بناءً على الفرق والتشابه والنعومة
        let alpha = 255;
        
        if (diff < similarity) {
          alpha = 0;
        } else if (diff < similarity + smoothness) {
          alpha = ((diff - similarity) / smoothness) * 255;
        }
        
        // تطبيق قيمة الألفا
        data[i + 3] = alpha;
        
        // تقليل تسرب اللون إذا كان البكسل شبه شفاف
        if (alpha < 255 && spillReduction > 0) {
          // تحديد القناة المهيمنة في لون الكروما
          let dominantChannel = 1; // افتراضياً هو الأخضر
          
          if (keyColor[0] > keyColor[1] && keyColor[0] > keyColor[2]) {
            dominantChannel = 0; // الأحمر
          } else if (keyColor[2] > keyColor[0] && keyColor[2] > keyColor[1]) {
            dominantChannel = 2; // الأزرق
          }
          
          // تقليل القناة المهيمنة
          const spillAmount = (255 - alpha) / 255 * spillReduction;
          
          if (dominantChannel === 0) {
            data[i] = Math.max(0, r - (r * spillAmount));
          } else if (dominantChannel === 1) {
            data[i + 1] = Math.max(0, g - (g * spillAmount));
          } else {
            data[i + 2] = Math.max(0, b - (b * spillAmount));
          }
        }
      }
    }
    
    // تطبيق تقليل الضوضاء إذا كان مفعلاً
    if (this.settings.noiseReduction > 0) {
      this._applyNoiseReduction(data, width, height, startX, startY, endX, endY);
    }
    
    // تطبيق تنعيم حواف الألفا إذا كان مفعلاً
    if (this.settings.alphaFeathering > 0) {
      this._applyAlphaFeathering(data, width, height, startX, startY, endX, endY);
    }
  }

  /**
   * تطبيق تقليل الضوضاء على بيانات الصورة
   * @param {Uint8ClampedArray} data بيانات الصورة
   * @param {number} width عرض الصورة
   * @param {number} height ارتفاع الصورة
   * @param {number} startX بداية منطقة المعالجة على المحور الأفقي
   * @param {number} startY بداية منطقة المعالجة على المحور الرأسي
   * @param {number} endX نهاية منطقة المعالجة على المحور الأفقي
   * @param {number} endY نهاية منطقة المعالجة على المحور الرأسي
   * @private
   */
  _applyNoiseReduction(data, width, height, startX, startY, endX, endY) {
    // نسخة من بيانات الألفا الأصلية
    const alphaData = new Uint8Array((endX - startX) * (endY - startY));
    let index = 0;
    
    // نسخ بيانات الألفا
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const i = (y * width + x) * 4 + 3;
        alphaData[index++] = data[i];
      }
    }
    
    // تطبيق عتبة الضوضاء
    const threshold = this.settings.noiseReduction * 255;
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const i = (y * width + x) * 4 + 3;
        const alpha = data[i];
        
        // إذا كانت قيمة الألفا قريبة من 0 أو 255، طبق العتبة
        if (alpha < threshold) {
          data[i] = 0;
        } else if (alpha > 255 - threshold) {
          data[i] = 255;
        }
      }
    }
  }

  /**
   * تطبيق تنعيم حواف الألفا على بيانات الصورة
   * @param {Uint8ClampedArray} data بيانات الصورة
   * @param {number} width عرض الصورة
   * @param {number} height ارتفاع الصورة
   * @param {number} startX بداية منطقة المعالجة على المحور الأفقي
   * @param {number} startY بداية منطقة المعالجة على المحور الرأسي
   * @param {number} endX نهاية منطقة المعالجة على المحور الأفقي
   * @param {number} endY نهاية منطقة المعالجة على المحور الرأسي
   * @private
   */
  _applyAlphaFeathering(data, width, height, startX, startY, endX, endY) {
    // نسخة من بيانات الألفا الأصلية
    const alphaData = new Uint8Array(width * height);
    
    // نسخ بيانات الألفا
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4 + 3;
        alphaData[y * width + x] = data[i];
      }
    }
    
    // حجم نواة التنعيم
    const kernelSize = Math.max(1, Math.floor(this.settings.alphaFeathering));
    
    // تطبيق مرشح متوسط على قيم الألفا
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const i = (y * width + x) * 4 + 3;
        
        // تخطي البكسلات التي لها قيمة ألفا 0 أو 255
        if (alphaData[y * width + x] === 0 || alphaData[y * width + x] === 255) {
          continue;
        }
        
        // حساب متوسط قيم الألفا في النواة
        let sum = 0;
        let count = 0;
        
        for (let ky = -kernelSize; ky <= kernelSize; ky++) {
          const ny = y + ky;
          if (ny < 0 || ny >= height) continue;
          
          for (let kx = -kernelSize; kx <= kernelSize; kx++) {
            const nx = x + kx;
            if (nx < 0 || nx >= width) continue;
            
            sum += alphaData[ny * width + nx];
            count++;
          }
        }
        
        // تطبيق المتوسط
        if (count > 0) {
          data[i] = Math.round(sum / count);
        }
      }
    }
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
      
      // تحديث أبعاد الكانفاس خارج الشاشة
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
    });
  }
}

export default ChromaKeyTool;
