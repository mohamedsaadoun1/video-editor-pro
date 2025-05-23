/**
 * أداة الخط العربي لمحرر فيديو القرآن
 * توفر واجهة برمجية للتعامل مع الخطوط العربية والزخارف الإسلامية
 */

class CalligraphyTool {
  constructor() {
    this.fonts = [];
    this.decorations = [];
    this.frames = [];
    this.currentFont = null;
    this.currentDecoration = null;
    this.currentFrame = null;
    this.animationEnabled = false;
    this.initialized = false;
  }

  /**
   * تهيئة أداة الخط العربي
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // تحميل الخطوط العربية
      await this._loadFonts();
      
      // تحميل الزخارف الإسلامية
      this._initializeDecorations();
      
      // تحميل الإطارات المزخرفة
      this._initializeFrames();
      
      this.initialized = true;
      console.log('تم تهيئة أداة الخط العربي بنجاح مع', this.fonts.length, 'خط و', this.decorations.length, 'زخرفة و', this.frames.length, 'إطار');
    } catch (error) {
      console.error('خطأ في تهيئة أداة الخط العربي:', error);
    }
    
    return this.initialized;
  }

  /**
   * الحصول على قائمة الخطوط العربية المتاحة
   * @returns {Array} قائمة الخطوط
   */
  getFonts() {
    return this.fonts;
  }

  /**
   * الحصول على قائمة الزخارف الإسلامية المتاحة
   * @returns {Array} قائمة الزخارف
   */
  getDecorations() {
    return this.decorations;
  }

  /**
   * الحصول على قائمة الإطارات المزخرفة المتاحة
   * @returns {Array} قائمة الإطارات
   */
  getFrames() {
    return this.frames;
  }

  /**
   * تعيين الخط الحالي
   * @param {string} fontId معرف الخط
   * @returns {Object|null} معلومات الخط أو null إذا لم يتم العثور عليه
   */
  setFont(fontId) {
    if (!this.initialized) {
      console.warn('أداة الخط العربي غير مهيأة بعد');
      return null;
    }
    
    const font = this.fonts.find(f => f.id === fontId);
    if (font) {
      this.currentFont = font;
      console.log('تم تعيين الخط:', font.name);
      return font;
    }
    
    console.warn('لم يتم العثور على الخط:', fontId);
    return null;
  }

  /**
   * تعيين الزخرفة الحالية
   * @param {string} decorationId معرف الزخرفة
   * @returns {Object|null} معلومات الزخرفة أو null إذا لم يتم العثور عليها
   */
  setDecoration(decorationId) {
    if (!this.initialized) {
      console.warn('أداة الخط العربي غير مهيأة بعد');
      return null;
    }
    
    const decoration = this.decorations.find(d => d.id === decorationId);
    if (decoration) {
      this.currentDecoration = decoration;
      console.log('تم تعيين الزخرفة:', decoration.name);
      return decoration;
    }
    
    console.warn('لم يتم العثور على الزخرفة:', decorationId);
    return null;
  }

  /**
   * تعيين الإطار الحالي
   * @param {string} frameId معرف الإطار
   * @returns {Object|null} معلومات الإطار أو null إذا لم يتم العثور عليه
   */
  setFrame(frameId) {
    if (!this.initialized) {
      console.warn('أداة الخط العربي غير مهيأة بعد');
      return null;
    }
    
    const frame = this.frames.find(f => f.id === frameId);
    if (frame) {
      this.currentFrame = frame;
      console.log('تم تعيين الإطار:', frame.name);
      return frame;
    }
    
    console.warn('لم يتم العثور على الإطار:', frameId);
    return null;
  }

  /**
   * تفعيل أو تعطيل التأثيرات الخطية المتحركة
   * @param {boolean} enabled حالة التفعيل
   */
  setAnimationEnabled(enabled) {
    this.animationEnabled = Boolean(enabled);
    console.log('تم', this.animationEnabled ? 'تفعيل' : 'تعطيل', 'التأثيرات الخطية المتحركة');
  }

  /**
   * تطبيق الخط على عنصر HTML
   * @param {HTMLElement} element العنصر المراد تطبيق الخط عليه
   * @param {string} fontId معرف الخط (اختياري، يستخدم الخط الحالي إذا لم يتم تحديده)
   * @returns {boolean} نجاح العملية
   */
  applyFont(element, fontId = null) {
    if (!this.initialized) {
      console.warn('أداة الخط العربي غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد الخط المراد تطبيقه
      const font = fontId ? 
        this.fonts.find(f => f.id === fontId) : 
        this.currentFont;
      
      if (!font) {
        console.warn('لم يتم تحديد خط للتطبيق');
        return false;
      }
      
      // تطبيق الخط
      element.style.fontFamily = `${font.name}, ${font.fallback}`;
      
      // تطبيق خصائص إضافية إذا كانت متاحة
      if (font.features) {
        if (font.features.weight) element.style.fontWeight = font.features.weight;
        if (font.features.style) element.style.fontStyle = font.features.style;
        if (font.features.letterSpacing) element.style.letterSpacing = font.features.letterSpacing;
      }
      
      console.log('تم تطبيق الخط:', font.name);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق الخط:', error);
      return false;
    }
  }

  /**
   * تطبيق الزخرفة على عنصر HTML
   * @param {HTMLElement} containerElement عنصر الحاوية
   * @param {string} decorationId معرف الزخرفة (اختياري، يستخدم الزخرفة الحالية إذا لم يتم تحديدها)
   * @param {Object} options خيارات إضافية للزخرفة
   * @returns {boolean} نجاح العملية
   */
  applyDecoration(containerElement, decorationId = null, options = {}) {
    if (!this.initialized) {
      console.warn('أداة الخط العربي غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد الزخرفة المراد تطبيقها
      const decoration = decorationId ? 
        this.decorations.find(d => d.id === decorationId) : 
        this.currentDecoration;
      
      if (!decoration) {
        console.warn('لم يتم تحديد زخرفة للتطبيق');
        return false;
      }
      
      // إنشاء عنصر الزخرفة
      const decorationElement = document.createElement('div');
      decorationElement.className = 'calligraphy-decoration';
      
      // تعيين خصائص الزخرفة
      if (decoration.type === 'image') {
        decorationElement.style.backgroundImage = `url(${decoration.url})`;
        decorationElement.style.backgroundSize = options.size || 'contain';
        decorationElement.style.backgroundRepeat = 'no-repeat';
        decorationElement.style.backgroundPosition = options.position || 'center';
      } else if (decoration.type === 'svg') {
        // إنشاء عنصر SVG
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('viewBox', decoration.viewBox);
        svgElement.innerHTML = decoration.content;
        
        // تعيين خصائص SVG
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        
        // إضافة SVG إلى عنصر الزخرفة
        decorationElement.appendChild(svgElement);
      }
      
      // تعيين موضع الزخرفة
      decorationElement.style.position = 'absolute';
      decorationElement.style.width = options.width || '100%';
      decorationElement.style.height = options.height || '100%';
      decorationElement.style.opacity = options.opacity || '0.5';
      decorationElement.style.pointerEvents = 'none';
      decorationElement.style.zIndex = options.zIndex || '-1';
      
      // تعيين موضع الزخرفة
      switch (options.placement || 'background') {
        case 'top':
          decorationElement.style.top = '0';
          decorationElement.style.left = '0';
          decorationElement.style.right = '0';
          break;
        case 'bottom':
          decorationElement.style.bottom = '0';
          decorationElement.style.left = '0';
          decorationElement.style.right = '0';
          break;
        case 'left':
          decorationElement.style.top = '0';
          decorationElement.style.bottom = '0';
          decorationElement.style.left = '0';
          break;
        case 'right':
          decorationElement.style.top = '0';
          decorationElement.style.bottom = '0';
          decorationElement.style.right = '0';
          break;
        case 'background':
        default:
          decorationElement.style.top = '0';
          decorationElement.style.right = '0';
          decorationElement.style.bottom = '0';
          decorationElement.style.left = '0';
      }
      
      // إضافة تأثير متحرك إذا كان مفعلاً
      if (this.animationEnabled && decoration.animation) {
        decorationElement.style.animation = `${decoration.animation.name} ${decoration.animation.duration || '10s'} ${decoration.animation.timing || 'ease-in-out'} ${decoration.animation.iteration || 'infinite'}`;
      }
      
      // التأكد من أن الحاوية لها position: relative
      if (getComputedStyle(containerElement).position === 'static') {
        containerElement.style.position = 'relative';
      }
      
      // إزالة أي زخرفة سابقة
      const existingDecoration = containerElement.querySelector('.calligraphy-decoration');
      if (existingDecoration) {
        containerElement.removeChild(existingDecoration);
      }
      
      // إضافة الزخرفة إلى الحاوية
      containerElement.appendChild(decorationElement);
      
      console.log('تم تطبيق الزخرفة:', decoration.name);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق الزخرفة:', error);
      return false;
    }
  }

  /**
   * تطبيق الإطار على عنصر HTML
   * @param {HTMLElement} containerElement عنصر الحاوية
   * @param {string} frameId معرف الإطار (اختياري، يستخدم الإطار الحالي إذا لم يتم تحديده)
   * @param {Object} options خيارات إضافية للإطار
   * @returns {boolean} نجاح العملية
   */
  applyFrame(containerElement, frameId = null, options = {}) {
    if (!this.initialized) {
      console.warn('أداة الخط العربي غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد الإطار المراد تطبيقه
      const frame = frameId ? 
        this.frames.find(f => f.id === frameId) : 
        this.currentFrame;
      
      if (!frame) {
        console.warn('لم يتم تحديد إطار للتطبيق');
        return false;
      }
      
      // إنشاء عنصر الإطار
      const frameElement = document.createElement('div');
      frameElement.className = 'calligraphy-frame';
      
      // تعيين خصائص الإطار
      if (frame.type === 'image') {
        frameElement.style.backgroundImage = `url(${frame.url})`;
        frameElement.style.backgroundSize = '100% 100%';
        frameElement.style.backgroundRepeat = 'no-repeat';
        frameElement.style.backgroundPosition = 'center';
      } else if (frame.type === 'border') {
        frameElement.style.border = frame.border;
        frameElement.style.borderRadius = frame.borderRadius || '0';
        frameElement.style.boxShadow = frame.boxShadow || 'none';
      } else if (frame.type === 'svg') {
        // إنشاء عنصر SVG
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('viewBox', frame.viewBox);
        svgElement.innerHTML = frame.content;
        
        // تعيين خصائص SVG
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.position = 'absolute';
        svgElement.style.top = '0';
        svgElement.style.left = '0';
        
        // إضافة SVG إلى عنصر الإطار
        frameElement.appendChild(svgElement);
      }
      
      // تعيين موضع الإطار
      frameElement.style.position = 'absolute';
      frameElement.style.top = '0';
      frameElement.style.right = '0';
      frameElement.style.bottom = '0';
      frameElement.style.left = '0';
      frameElement.style.pointerEvents = 'none';
      frameElement.style.zIndex = options.zIndex || '0';
      
      // إضافة تأثير متحرك إذا كان مفعلاً
      if (this.animationEnabled && frame.animation) {
        frameElement.style.animation = `${frame.animation.name} ${frame.animation.duration || '10s'} ${frame.animation.timing || 'ease-in-out'} ${frame.animation.iteration || 'infinite'}`;
      }
      
      // التأكد من أن الحاوية لها position: relative
      if (getComputedStyle(containerElement).position === 'static') {
        containerElement.style.position = 'relative';
      }
      
      // إضافة padding للحاوية لإفساح المجال للإطار
      containerElement.style.padding = options.padding || '20px';
      
      // إزالة أي إطار سابق
      const existingFrame = containerElement.querySelector('.calligraphy-frame');
      if (existingFrame) {
        containerElement.removeChild(existingFrame);
      }
      
      // إضافة الإطار إلى الحاوية
      containerElement.appendChild(frameElement);
      
      console.log('تم تطبيق الإطار:', frame.name);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق الإطار:', error);
      return false;
    }
  }

  /**
   * إنشاء تأثير خطي متحرك
   * @param {HTMLElement} element العنصر
   * @param {string} animationType نوع التأثير ('writing', 'glowing', 'morphing')
   * @param {Object} options خيارات إضافية للتأثير
   * @returns {boolean} نجاح العملية
   */
  createAnimatedEffect(element, animationType, options = {}) {
    if (!this.initialized) {
      console.warn('أداة الخط العربي غير مهيأة بعد');
      return false;
    }
    
    if (!this.animationEnabled) {
      console.warn('التأثيرات الخطية المتحركة غير مفعلة');
      return false;
    }
    
    try {
      switch (animationType) {
        case 'writing':
          this._createWritingEffect(element, options);
          break;
        case 'glowing':
          this._createGlowingEffect(element, options);
          break;
        case 'morphing':
          this._createMorphingEffect(element, options);
          break;
        default:
          console.warn('نوع التأثير غير مدعوم:', animationType);
          return false;
      }
      
      console.log('تم إنشاء تأثير خطي متحرك:', animationType);
      return true;
    } catch (error) {
      console.error('خطأ في إنشاء التأثير الخطي المتحرك:', error);
      return false;
    }
  }

  /**
   * تحميل الخطوط العربية
   * @returns {Promise} وعد يتم حله عند اكتمال التحميل
   * @private
   */
  async _loadFonts() {
    try {
      // في التطبيق الحقيقي، يمكن تحميل الخطوط من API أو قاعدة بيانات
      // هنا نستخدم بيانات افتراضية للتوضيح
      
      this.fonts = [
        {
          id: 'amiri',
          name: 'Amiri',
          fallback: 'serif',
          category: 'traditional',
          description: 'خط أميري، خط نسخي كلاسيكي',
          url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'scheherazade',
          name: 'Scheherazade New',
          fallback: 'serif',
          category: 'traditional',
          description: 'خط شهرزاد، خط نسخي تقليدي',
          url: 'https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'aref-ruqaa',
          name: 'Aref Ruqaa',
          fallback: 'serif',
          category: 'calligraphy',
          description: 'خط عارف رقعة، خط رقعة أنيق',
          url: 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'cairo',
          name: 'Cairo',
          fallback: 'sans-serif',
          category: 'modern',
          description: 'خط القاهرة، خط عصري وأنيق',
          url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'tajawal',
          name: 'Tajawal',
          fallback: 'sans-serif',
          category: 'modern',
          description: 'خط تجوال، خط عصري سلس',
          url: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'lateef',
          name: 'Lateef',
          fallback: 'serif',
          category: 'traditional',
          description: 'خط لطيف، خط نسخي سهل القراءة',
          url: 'https://fonts.googleapis.com/css2?family=Lateef&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'reem-kufi',
          name: 'Reem Kufi',
          fallback: 'sans-serif',
          category: 'modern',
          description: 'خط ريم كوفي، خط كوفي عصري',
          url: 'https://fonts.googleapis.com/css2?family=Reem+Kufi&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'noto-naskh',
          name: 'Noto Naskh Arabic',
          fallback: 'serif',
          category: 'traditional',
          description: 'خط نوتو نسخ، خط نسخي حديث',
          url: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'noto-kufi',
          name: 'Noto Kufi Arabic',
          fallback: 'sans-serif',
          category: 'modern',
          description: 'خط نوتو كوفي، خط كوفي حديث',
          url: 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        },
        {
          id: 'mada',
          name: 'Mada',
          fallback: 'sans-serif',
          category: 'modern',
          description: 'خط مدى، خط عصري بسيط',
          url: 'https://fonts.googleapis.com/css2?family=Mada:wght@400;700&display=swap',
          features: {
            weight: '400',
            style: 'normal',
            letterSpacing: 'normal'
          }
        }
      ];
      
      // تحميل الخطوط
      for (const font of this.fonts) {
        await this._loadFontStyle(font.url);
      }
      
      // تعيين الخط الافتراضي
      if (this.fonts.length > 0) {
        this.currentFont = this.fonts[0];
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
   * تهيئة الزخارف الإسلامية
   * @private
   */
  _initializeDecorations() {
    this.decorations = [
      {
        id: 'arabesque_corner',
        name: 'زخرفة أرابيسك للزوايا',
        type: 'image',
        url: 'assets/decorations/arabesque_corner.png',
        category: 'corners',
        description: 'زخرفة أرابيسك للزوايا بنمط إسلامي تقليدي',
        animation: {
          name: 'rotate',
          duration: '20s',
          timing: 'linear',
          iteration: 'infinite'
        }
      },
      {
        id: 'floral_border',
        name: 'إطار زهري',
        type: 'image',
        url: 'assets/decorations/floral_border.png',
        category: 'borders',
        description: 'إطار زخرفي بنمط زهري إسلامي',
        animation: null
      },
      {
        id: 'geometric_pattern',
        name: 'نمط هندسي',
        type: 'image',
        url: 'assets/decorations/geometric_pattern.png',
        category: 'patterns',
        description: 'نمط هندسي إسلامي متكرر',
        animation: null
      },
      {
        id: 'bismillah',
        name: 'بسم الله الرحمن الرحيم',
        type: 'image',
        url: 'assets/decorations/bismillah.png',
        category: 'calligraphy',
        description: 'البسملة بخط ديواني جميل',
        animation: {
          name: 'glow',
          duration: '3s',
          timing: 'ease-in-out',
          iteration: 'infinite'
        }
      },
      {
        id: 'star_pattern',
        name: 'نمط النجوم',
        type: 'svg',
        viewBox: '0 0 100 100',
        content: '<path d="M50 0 L60 40 L100 40 L70 60 L80 100 L50 75 L20 100 L30 60 L0 40 L40 40 Z" fill="none" stroke="gold" stroke-width="1"/>',
        category: 'patterns',
        description: 'نمط نجمي إسلامي تقليدي',
        animation: {
          name: 'rotate',
          duration: '30s',
          timing: 'linear',
          iteration: 'infinite'
        }
      },
      {
        id: 'mosque_silhouette',
        name: 'ظل المسجد',
        type: 'image',
        url: 'assets/decorations/mosque_silhouette.png',
        category: 'silhouettes',
        description: 'ظل مسجد بتصميم إسلامي',
        animation: null
      },
      {
        id: 'crescent_star',
        name: 'الهلال والنجمة',
        type: 'svg',
        viewBox: '0 0 100 100',
        content: '<path d="M50 10 A40 40 0 1 0 50 90 A40 40 0 1 0 50 10 Z M50 20 A30 30 0 1 1 50 80 A30 30 0 1 1 50 20 Z" fill="none" stroke="gold" stroke-width="1"/><path d="M70 30 L75 45 L90 45 L80 55 L85 70 L70 60 L55 70 L60 55 L50 45 L65 45 Z" fill="gold"/>',
        category: 'symbols',
        description: 'رمز الهلال والنجمة الإسلامي',
        animation: {
          name: 'pulse',
          duration: '4s',
          timing: 'ease-in-out',
          iteration: 'infinite'
        }
      }
    ];
    
    // تعيين الزخرفة الافتراضية
    if (this.decorations.length > 0) {
      this.currentDecoration = this.decorations[0];
    }
  }

  /**
   * تهيئة الإطارات المزخرفة
   * @private
   */
  _initializeFrames() {
    this.frames = [
      {
        id: 'golden_frame',
        name: 'إطار ذهبي',
        type: 'image',
        url: 'assets/frames/golden_frame.png',
        category: 'ornate',
        description: 'إطار ذهبي فخم بزخارف إسلامية',
        animation: null
      },
      {
        id: 'simple_border',
        name: 'حدود بسيطة',
        type: 'border',
        border: '2px solid gold',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
        category: 'simple',
        description: 'إطار بسيط بحدود ذهبية',
        animation: null
      },
      {
        id: 'ornate_corners',
        name: 'زوايا مزخرفة',
        type: 'svg',
        viewBox: '0 0 100 100',
        content: '<path d="M0 0 L20 0 C10 10 10 10 0 20 Z" fill="gold"/><path d="M100 0 L80 0 C90 10 90 10 100 20 Z" fill="gold"/><path d="M0 100 L20 100 C10 90 10 90 0 80 Z" fill="gold"/><path d="M100 100 L80 100 C90 90 90 90 100 80 Z" fill="gold"/>',
        category: 'corners',
        description: 'إطار بزوايا مزخرفة',
        animation: null
      },
      {
        id: 'floral_frame',
        name: 'إطار زهري',
        type: 'image',
        url: 'assets/frames/floral_frame.png',
        category: 'ornate',
        description: 'إطار بزخارف زهرية إسلامية',
        animation: null
      },
      {
        id: 'geometric_frame',
        name: 'إطار هندسي',
        type: 'image',
        url: 'assets/frames/geometric_frame.png',
        category: 'geometric',
        description: 'إطار بزخارف هندسية إسلامية',
        animation: null
      },
      {
        id: 'double_border',
        name: 'حدود مزدوجة',
        type: 'border',
        border: '4px double gold',
        borderRadius: '15px',
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.3)',
        category: 'simple',
        description: 'إطار بحدود ذهبية مزدوجة',
        animation: null
      },
      {
        id: 'animated_frame',
        name: 'إطار متحرك',
        type: 'svg',
        viewBox: '0 0 100 100',
        content: '<rect x="0" y="0" width="100" height="100" fill="none" stroke="gold" stroke-width="2" stroke-dasharray="5,5"/>',
        category: 'animated',
        description: 'إطار متحرك بتأثير دوران',
        animation: {
          name: 'dash',
          duration: '20s',
          timing: 'linear',
          iteration: 'infinite'
        }
      }
    ];
    
    // تعيين الإطار الافتراضي
    if (this.frames.length > 0) {
      this.currentFrame = this.frames[0];
    }
  }

  /**
   * إنشاء تأثير الكتابة
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @private
   */
  _createWritingEffect(element, options) {
    // حفظ النص الأصلي
    const originalText = element.textContent;
    
    // إفراغ العنصر
    element.textContent = '';
    
    // إنشاء عنصر span للنص
    const textSpan = document.createElement('span');
    textSpan.style.display = 'inline-block';
    
    // إضافة العنصر إلى الحاوية
    element.appendChild(textSpan);
    
    // تحديد مدة التأثير
    const duration = options.duration || 3;
    const delay = options.delay || 0;
    
    // حساب تأخير كل حرف
    const charDelay = (duration * 1000) / originalText.length;
    
    // تأخير بداية التأثير
    setTimeout(() => {
      // إضافة الحروف واحداً تلو الآخر
      let charIndex = 0;
      const writeInterval = setInterval(() => {
        if (charIndex < originalText.length) {
          textSpan.textContent += originalText.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(writeInterval);
        }
      }, charDelay);
    }, delay * 1000);
  }

  /**
   * إنشاء تأثير التوهج
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @private
   */
  _createGlowingEffect(element, options) {
    // حفظ الخصائص الأصلية
    const originalTextShadow = element.style.textShadow;
    const originalTransition = element.style.transition;
    
    // تحديد لون التوهج
    const glowColor = options.color || 'gold';
    
    // تحديد مدة التأثير
    const duration = options.duration || 2;
    const delay = options.delay || 0;
    
    // تعيين الانتقال
    element.style.transition = `text-shadow ${duration}s ease-in-out`;
    
    // تأخير بداية التأثير
    setTimeout(() => {
      // تطبيق التوهج
      element.style.textShadow = `0 0 5px ${glowColor}, 0 0 10px ${glowColor}, 0 0 15px ${glowColor}, 0 0 20px ${glowColor}`;
      
      // إزالة التوهج بعد المدة المحددة
      setTimeout(() => {
        element.style.textShadow = originalTextShadow || 'none';
        element.style.transition = originalTransition;
      }, duration * 1000);
    }, delay * 1000);
  }

  /**
   * إنشاء تأثير التحول
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @private
   */
  _createMorphingEffect(element, options) {
    // حفظ الخصائص الأصلية
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;
    
    // تحديد مدة التأثير
    const duration = options.duration || 3;
    const delay = options.delay || 0;
    
    // تعيين الانتقال
    element.style.transition = `transform ${duration}s ease-in-out`;
    
    // تأخير بداية التأثير
    setTimeout(() => {
      // تطبيق التحول
      element.style.transform = 'scale(1.1) rotate(2deg)';
      
      // العودة إلى الشكل الأصلي بعد المدة المحددة
      setTimeout(() => {
        element.style.transform = originalTransform || 'none';
        
        // استعادة الخصائص الأصلية بعد اكتمال التأثير
        setTimeout(() => {
          element.style.transition = originalTransition;
        }, duration * 1000);
      }, duration * 1000);
    }, delay * 1000);
  }
}

export default CalligraphyTool;
