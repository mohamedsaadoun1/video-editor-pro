/**
 * أداة الملصقات والطبقات لمحرر الفيديو العام
 * توفر واجهة برمجية للتعامل مع إضافة وتنسيق الملصقات والطبقات على الفيديو
 */

class StickersOverlaysTool {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.videoElement = null;
    this.stickerElements = [];
    this.selectedStickerId = null;
    this.stickerCategories = [];
    this.stickerLibrary = {};
    this.customStickers = [];
    this.initialized = false;
  }

  /**
   * تهيئة أداة الملصقات والطبقات
   * @param {HTMLVideoElement} videoElement عنصر الفيديو للمعاينة
   * @param {HTMLCanvasElement} canvas عنصر الكانفاس لعرض الملصقات
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
      
      // تهيئة فئات الملصقات
      this._initializeStickerCategories();
      
      // تحميل مكتبة الملصقات
      await this._loadStickerLibrary();
      
      // إعداد مستمعي الأحداث
      this._setupEventListeners();
      
      this.initialized = true;
      console.log('تم تهيئة أداة الملصقات والطبقات بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة أداة الملصقات والطبقات:', error);
    }
    
    return this.initialized;
  }

  /**
   * إضافة ملصق جديد إلى الفيديو
   * @param {string} stickerId معرف الملصق
   * @param {Object} options خيارات الملصق
   * @returns {Object} معلومات الملصق المضاف
   */
  addSticker(stickerId, options = {}) {
    if (!this.initialized) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن الملصق في المكتبة
      let stickerInfo = null;
      
      // البحث في مكتبة الملصقات العامة
      for (const category in this.stickerLibrary) {
        const sticker = this.stickerLibrary[category].find(s => s.id === stickerId);
        if (sticker) {
          stickerInfo = sticker;
          break;
        }
      }
      
      // البحث في الملصقات المخصصة
      if (!stickerInfo) {
        stickerInfo = this.customStickers.find(s => s.id === stickerId);
      }
      
      if (!stickerInfo) {
        throw new Error('لم يتم العثور على الملصق: ' + stickerId);
      }
      
      // إنشاء معرف فريد للملصق المضاف
      const elementId = 'sticker_' + Date.now();
      
      // إنشاء عنصر الملصق
      const stickerElement = {
        id: elementId,
        stickerId: stickerId,
        type: stickerInfo.type,
        url: stickerInfo.url,
        x: options.x || this.canvas.width / 2,
        y: options.y || this.canvas.height / 2,
        width: options.width || stickerInfo.width || 100,
        height: options.height || stickerInfo.height || 100,
        rotation: options.rotation || 0,
        scale: options.scale || 1,
        opacity: options.opacity !== undefined ? options.opacity : 1,
        flipX: options.flipX || false,
        flipY: options.flipY || false,
        startTime: options.startTime || 0,
        endTime: options.endTime || this.videoElement.duration || 60,
        animation: options.animation || null,
        animationParams: options.animationParams || {},
        image: null // سيتم تحميله لاحقاً
      };
      
      // تحميل صورة الملصق
      this._loadStickerImage(stickerElement);
      
      // إضافة الملصق إلى القائمة
      this.stickerElements.push(stickerElement);
      
      // تحديد الملصق الجديد
      this.selectedStickerId = elementId;
      
      console.log('تم إضافة ملصق جديد:', stickerInfo.name);
      return stickerElement;
    } catch (error) {
      console.error('خطأ في إضافة الملصق:', error);
      return null;
    }
  }

  /**
   * تحديث خصائص الملصق
   * @param {string} elementId معرف عنصر الملصق
   * @param {Object} options خصائص الملصق الجديدة
   * @returns {Object|null} معلومات الملصق المحدث أو null في حالة الفشل
   */
  updateSticker(elementId, options) {
    if (!this.initialized) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن الملصق
      const stickerElement = this.stickerElements.find(sticker => sticker.id === elementId);
      if (!stickerElement) {
        throw new Error('لم يتم العثور على الملصق: ' + elementId);
      }
      
      // تحديث خصائص الملصق
      Object.assign(stickerElement, options);
      
      // إعادة تحميل الصورة إذا تم تغيير الملصق
      if (options.stickerId && options.stickerId !== stickerElement.stickerId) {
        stickerElement.stickerId = options.stickerId;
        this._loadStickerImage(stickerElement);
      }
      
      console.log('تم تحديث الملصق');
      return stickerElement;
    } catch (error) {
      console.error('خطأ في تحديث الملصق:', error);
      return null;
    }
  }

  /**
   * حذف ملصق
   * @param {string} elementId معرف عنصر الملصق
   * @returns {boolean} نجاح العملية
   */
  deleteSticker(elementId) {
    if (!this.initialized) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد');
      return false;
    }
    
    try {
      // البحث عن الملصق
      const index = this.stickerElements.findIndex(sticker => sticker.id === elementId);
      if (index === -1) {
        throw new Error('لم يتم العثور على الملصق: ' + elementId);
      }
      
      // حذف الملصق
      this.stickerElements.splice(index, 1);
      
      // إعادة تعيين الملصق المحدد إذا كان هو الملصق المحذوف
      if (this.selectedStickerId === elementId) {
        this.selectedStickerId = this.stickerElements.length > 0 ? this.stickerElements[0].id : null;
      }
      
      console.log('تم حذف الملصق');
      return true;
    } catch (error) {
      console.error('خطأ في حذف الملصق:', error);
      return false;
    }
  }

  /**
   * تحديد ملصق
   * @param {string} elementId معرف عنصر الملصق
   * @returns {Object|null} معلومات الملصق المحدد أو null في حالة الفشل
   */
  selectSticker(elementId) {
    if (!this.initialized) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن الملصق
      const stickerElement = this.stickerElements.find(sticker => sticker.id === elementId);
      if (!stickerElement) {
        throw new Error('لم يتم العثور على الملصق: ' + elementId);
      }
      
      // تحديد الملصق
      this.selectedStickerId = elementId;
      
      console.log('تم تحديد الملصق');
      return stickerElement;
    } catch (error) {
      console.error('خطأ في تحديد الملصق:', error);
      return null;
    }
  }

  /**
   * تحريك الملصق المحدد
   * @param {number} x الإحداثي الأفقي الجديد
   * @param {number} y الإحداثي الرأسي الجديد
   * @returns {boolean} نجاح العملية
   */
  moveSelectedSticker(x, y) {
    if (!this.initialized || !this.selectedStickerId) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد أو لم يتم تحديد ملصق');
      return false;
    }
    
    try {
      // البحث عن الملصق المحدد
      const stickerElement = this.stickerElements.find(sticker => sticker.id === this.selectedStickerId);
      if (!stickerElement) {
        throw new Error('لم يتم العثور على الملصق المحدد');
      }
      
      // تحديث موضع الملصق
      stickerElement.x = x;
      stickerElement.y = y;
      
      console.log('تم تحريك الملصق إلى:', x, y);
      return true;
    } catch (error) {
      console.error('خطأ في تحريك الملصق:', error);
      return false;
    }
  }

  /**
   * تغيير حجم الملصق المحدد
   * @param {number} width العرض الجديد
   * @param {number} height الارتفاع الجديد
   * @returns {boolean} نجاح العملية
   */
  resizeSelectedSticker(width, height) {
    if (!this.initialized || !this.selectedStickerId) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد أو لم يتم تحديد ملصق');
      return false;
    }
    
    try {
      // البحث عن الملصق المحدد
      const stickerElement = this.stickerElements.find(sticker => sticker.id === this.selectedStickerId);
      if (!stickerElement) {
        throw new Error('لم يتم العثور على الملصق المحدد');
      }
      
      // تحديث أبعاد الملصق
      stickerElement.width = width;
      stickerElement.height = height;
      
      console.log('تم تغيير حجم الملصق إلى:', width, height);
      return true;
    } catch (error) {
      console.error('خطأ في تغيير حجم الملصق:', error);
      return false;
    }
  }

  /**
   * تدوير الملصق المحدد
   * @param {number} angle زاوية الدوران بالدرجات
   * @returns {boolean} نجاح العملية
   */
  rotateSelectedSticker(angle) {
    if (!this.initialized || !this.selectedStickerId) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد أو لم يتم تحديد ملصق');
      return false;
    }
    
    try {
      // البحث عن الملصق المحدد
      const stickerElement = this.stickerElements.find(sticker => sticker.id === this.selectedStickerId);
      if (!stickerElement) {
        throw new Error('لم يتم العثور على الملصق المحدد');
      }
      
      // تحديث زاوية دوران الملصق
      stickerElement.rotation = angle;
      
      console.log('تم تدوير الملصق إلى:', angle, 'درجة');
      return true;
    } catch (error) {
      console.error('خطأ في تدوير الملصق:', error);
      return false;
    }
  }

  /**
   * تطبيق تأثير حركي على الملصق
   * @param {string} elementId معرف عنصر الملصق
   * @param {string} animationId معرف التأثير الحركي
   * @param {Object} params معلمات التأثير (اختياري)
   * @returns {Object|null} معلومات الملصق المحدث أو null في حالة الفشل
   */
  applyAnimation(elementId, animationId, params = {}) {
    if (!this.initialized) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد');
      return null;
    }
    
    try {
      // البحث عن الملصق
      const stickerElement = this.stickerElements.find(sticker => sticker.id === elementId);
      if (!stickerElement) {
        throw new Error('لم يتم العثور على الملصق: ' + elementId);
      }
      
      // تطبيق التأثير الحركي على الملصق
      stickerElement.animation = animationId;
      stickerElement.animationParams = params;
      
      console.log('تم تطبيق التأثير الحركي على الملصق:', animationId);
      return stickerElement;
    } catch (error) {
      console.error('خطأ في تطبيق التأثير الحركي:', error);
      return null;
    }
  }

  /**
   * إضافة ملصق مخصص
   * @param {File|Blob|string} imageSource ملف الصورة أو رابط
   * @param {string} name اسم الملصق
   * @returns {Promise<Object|null>} وعد يتم حله بمعلومات الملصق المضاف أو null في حالة الفشل
   */
  async addCustomSticker(imageSource, name) {
    if (!this.initialized) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد');
      return null;
    }
    
    try {
      // إنشاء معرف فريد للملصق المخصص
      const stickerId = 'custom_' + Date.now();
      
      // إنشاء URL للصورة إذا كانت ملفاً
      let imageUrl;
      if (typeof imageSource === 'string') {
        imageUrl = imageSource;
      } else {
        imageUrl = URL.createObjectURL(imageSource);
      }
      
      // تحميل الصورة للحصول على أبعادها
      const image = await this._loadImage(imageUrl);
      
      // إنشاء معلومات الملصق المخصص
      const customSticker = {
        id: stickerId,
        name: name || 'ملصق مخصص',
        type: 'image',
        url: imageUrl,
        category: 'custom',
        width: image.width,
        height: image.height
      };
      
      // إضافة الملصق إلى قائمة الملصقات المخصصة
      this.customStickers.push(customSticker);
      
      console.log('تم إضافة ملصق مخصص:', customSticker.name);
      return customSticker;
    } catch (error) {
      console.error('خطأ في إضافة ملصق مخصص:', error);
      return null;
    }
  }

  /**
   * رسم جميع الملصقات على الكانفاس
   * @param {number} currentTime الوقت الحالي في الفيديو
   * @returns {boolean} نجاح العملية
   */
  renderStickers(currentTime) {
    if (!this.initialized) {
      console.warn('أداة الملصقات والطبقات غير مهيأة بعد');
      return false;
    }
    
    try {
      // مسح الكانفاس
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // رسم كل ملصق في نطاق الوقت الحالي
      for (const stickerElement of this.stickerElements) {
        if (currentTime >= stickerElement.startTime && currentTime <= stickerElement.endTime) {
          this._renderSticker(stickerElement, currentTime);
        }
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في رسم الملصقات:', error);
      return false;
    }
  }

  /**
   * الحصول على قائمة فئات الملصقات
   * @returns {Array} قائمة الفئات
   */
  getStickerCategories() {
    return this.stickerCategories;
  }

  /**
   * الحصول على قائمة الملصقات في فئة معينة
   * @param {string} category اسم الفئة
   * @returns {Array} قائمة الملصقات
   */
  getStickersByCategory(category) {
    if (category === 'custom') {
      return this.customStickers;
    }
    
    return this.stickerLibrary[category] || [];
  }

  /**
   * الحصول على قائمة الملصقات المخصصة
   * @returns {Array} قائمة الملصقات المخصصة
   */
  getCustomStickers() {
    return this.customStickers;
  }

  /**
   * الحصول على قائمة الملصقات الحالية
   * @returns {Array} قائمة الملصقات
   */
  getStickers() {
    return this.stickerElements;
  }

  /**
   * تهيئة فئات الملصقات
   * @private
   */
  _initializeStickerCategories() {
    this.stickerCategories = [
      {
        id: 'emoji',
        name: 'رموز تعبيرية',
        icon: '😀'
      },
      {
        id: 'shapes',
        name: 'أشكال',
        icon: '🔷'
      },
      {
        id: 'decorative',
        name: 'زخارف',
        icon: '✨'
      },
      {
        id: 'animated',
        name: 'متحركة',
        icon: '🎬'
      },
      {
        id: 'text-bubbles',
        name: 'فقاعات نصية',
        icon: '💬'
      },
      {
        id: 'custom',
        name: 'مخصصة',
        icon: '🎨'
      }
    ];
  }

  /**
   * تحميل مكتبة الملصقات
   * @returns {Promise} وعد يتم حله عند اكتمال التحميل
   * @private
   */
  async _loadStickerLibrary() {
    try {
      // في التطبيق الحقيقي، يمكن تحميل الملصقات من API أو قاعدة بيانات
      // هنا نستخدم بيانات افتراضية للتوضيح
      
      this.stickerLibrary = {
        'emoji': [
          {
            id: 'emoji_smile',
            name: 'ابتسامة',
            type: 'image',
            url: 'assets/stickers/emoji/smile.png',
            category: 'emoji',
            width: 64,
            height: 64
          },
          {
            id: 'emoji_laugh',
            name: 'ضحك',
            type: 'image',
            url: 'assets/stickers/emoji/laugh.png',
            category: 'emoji',
            width: 64,
            height: 64
          },
          {
            id: 'emoji_heart',
            name: 'قلب',
            type: 'image',
            url: 'assets/stickers/emoji/heart.png',
            category: 'emoji',
            width: 64,
            height: 64
          },
          {
            id: 'emoji_thumbs_up',
            name: 'إعجاب',
            type: 'image',
            url: 'assets/stickers/emoji/thumbs_up.png',
            category: 'emoji',
            width: 64,
            height: 64
          },
          {
            id: 'emoji_star',
            name: 'نجمة',
            type: 'image',
            url: 'assets/stickers/emoji/star.png',
            category: 'emoji',
            width: 64,
            height: 64
          }
        ],
        'shapes': [
          {
            id: 'shape_circle',
            name: 'دائرة',
            type: 'svg',
            url: 'assets/stickers/shapes/circle.svg',
            category: 'shapes',
            width: 100,
            height: 100,
            svgContent: '<circle cx="50" cy="50" r="45" fill="#FF5722" />'
          },
          {
            id: 'shape_square',
            name: 'مربع',
            type: 'svg',
            url: 'assets/stickers/shapes/square.svg',
            category: 'shapes',
            width: 100,
            height: 100,
            svgContent: '<rect x="5" y="5" width="90" height="90" fill="#2196F3" />'
          },
          {
            id: 'shape_triangle',
            name: 'مثلث',
            type: 'svg',
            url: 'assets/stickers/shapes/triangle.svg',
            category: 'shapes',
            width: 100,
            height: 100,
            svgContent: '<polygon points="50,10 90,90 10,90" fill="#4CAF50" />'
          },
          {
            id: 'shape_star',
            name: 'نجمة',
            type: 'svg',
            url: 'assets/stickers/shapes/star.svg',
            category: 'shapes',
            width: 100,
            height: 100,
            svgContent: '<polygon points="50,10 61,35 90,35 65,55 75,80 50,65 25,80 35,55 10,35 39,35" fill="#FFC107" />'
          },
          {
            id: 'shape_heart',
            name: 'قلب',
            type: 'svg',
            url: 'assets/stickers/shapes/heart.svg',
            category: 'shapes',
            width: 100,
            height: 100,
            svgContent: '<path d="M50,80 C35,65 10,50 10,30 C10,15 25,10 35,10 C45,10 50,20 50,20 C50,20 55,10 65,10 C75,10 90,15 90,30 C90,50 65,65 50,80 Z" fill="#E91E63" />'
          }
        ],
        'decorative': [
          {
            id: 'decorative_frame1',
            name: 'إطار مزخرف 1',
            type: 'image',
            url: 'assets/stickers/decorative/frame1.png',
            category: 'decorative',
            width: 200,
            height: 200
          },
          {
            id: 'decorative_frame2',
            name: 'إطار مزخرف 2',
            type: 'image',
            url: 'assets/stickers/decorative/frame2.png',
            category: 'decorative',
            width: 200,
            height: 200
          },
          {
            id: 'decorative_ribbon',
            name: 'شريط',
            type: 'image',
            url: 'assets/stickers/decorative/ribbon.png',
            category: 'decorative',
            width: 150,
            height: 80
          },
          {
            id: 'decorative_flower',
            name: 'زهرة',
            type: 'image',
            url: 'assets/stickers/decorative/flower.png',
            category: 'decorative',
            width: 100,
            height: 100
          },
          {
            id: 'decorative_crown',
            name: 'تاج',
            type: 'image',
            url: 'assets/stickers/decorative/crown.png',
            category: 'decorative',
            width: 120,
            height: 80
          }
        ],
        'animated': [
          {
            id: 'animated_sparkle',
            name: 'بريق',
            type: 'animated',
            url: 'assets/stickers/animated/sparkle.gif',
            category: 'animated',
            width: 100,
            height: 100
          },
          {
            id: 'animated_fire',
            name: 'نار',
            type: 'animated',
            url: 'assets/stickers/animated/fire.gif',
            category: 'animated',
            width: 100,
            height: 100
          },
          {
            id: 'animated_heart',
            name: 'قلب نابض',
            type: 'animated',
            url: 'assets/stickers/animated/heart.gif',
            category: 'animated',
            width: 100,
            height: 100
          },
          {
            id: 'animated_confetti',
            name: 'كونفيتي',
            type: 'animated',
            url: 'assets/stickers/animated/confetti.gif',
            category: 'animated',
            width: 150,
            height: 150
          },
          {
            id: 'animated_stars',
            name: 'نجوم',
            type: 'animated',
            url: 'assets/stickers/animated/stars.gif',
            category: 'animated',
            width: 150,
            height: 150
          }
        ],
        'text-bubbles': [
          {
            id: 'bubble_speech',
            name: 'فقاعة كلام',
            type: 'svg',
            url: 'assets/stickers/bubbles/speech.svg',
            category: 'text-bubbles',
            width: 150,
            height: 100,
            svgContent: '<path d="M10,10 H140 Q145,10 145,15 V70 Q145,75 140,75 H40 L25,90 L25,75 H10 Q5,75 5,70 V15 Q5,10 10,10 Z" fill="white" stroke="#333" stroke-width="2" />'
          },
          {
            id: 'bubble_thought',
            name: 'فقاعة تفكير',
            type: 'svg',
            url: 'assets/stickers/bubbles/thought.svg',
            category: 'text-bubbles',
            width: 150,
            height: 100,
            svgContent: '<path d="M75,10 C35,10 10,30 10,55 C10,80 35,90 60,90 C60,90 55,105 45,110 C45,110 65,110 75,95 C115,95 140,80 140,55 C140,30 115,10 75,10 Z" fill="white" stroke="#333" stroke-width="2" /><circle cx="30" cy="100" r="5" fill="white" stroke="#333" stroke-width="2" /><circle cx="20" cy="110" r="3" fill="white" stroke="#333" stroke-width="2" />'
          },
          {
            id: 'bubble_shout',
            name: 'فقاعة صراخ',
            type: 'svg',
            url: 'assets/stickers/bubbles/shout.svg',
            category: 'text-bubbles',
            width: 150,
            height: 100,
            svgContent: '<polygon points="5,5 145,5 145,75 85,75 45,95 55,75 5,75" fill="white" stroke="#333" stroke-width="2" />'
          },
          {
            id: 'bubble_rounded',
            name: 'فقاعة مستديرة',
            type: 'svg',
            url: 'assets/stickers/bubbles/rounded.svg',
            category: 'text-bubbles',
            width: 150,
            height: 100,
            svgContent: '<rect x="5" y="5" width="140" height="70" rx="20" ry="20" fill="white" stroke="#333" stroke-width="2" />'
          },
          {
            id: 'bubble_cloud',
            name: 'فقاعة سحابة',
            type: 'svg',
            url: 'assets/stickers/bubbles/cloud.svg',
            category: 'text-bubbles',
            width: 150,
            height: 100,
            svgContent: '<path d="M30,30 Q5,30 5,50 Q5,70 25,70 H125 Q145,70 145,50 Q145,30 125,30 Q125,10 105,10 Q85,10 85,25 Q75,5 50,15 Q30,20 30,30 Z" fill="white" stroke="#333" stroke-width="2" />'
          }
        ]
      };
      
      return true;
    } catch (error) {
      console.error('خطأ في تحميل مكتبة الملصقات:', error);
      return false;
    }
  }

  /**
   * تحميل صورة الملصق
   * @param {Object} stickerElement عنصر الملصق
   * @private
   */
  _loadStickerImage(stickerElement) {
    // البحث عن معلومات الملصق
    let stickerInfo = null;
    
    // البحث في مكتبة الملصقات العامة
    for (const category in this.stickerLibrary) {
      const sticker = this.stickerLibrary[category].find(s => s.id === stickerElement.stickerId);
      if (sticker) {
        stickerInfo = sticker;
        break;
      }
    }
    
    // البحث في الملصقات المخصصة
    if (!stickerInfo) {
      stickerInfo = this.customStickers.find(s => s.id === stickerElement.stickerId);
    }
    
    if (!stickerInfo) {
      console.warn('لم يتم العثور على معلومات الملصق:', stickerElement.stickerId);
      return;
    }
    
    // تحميل الصورة أو إنشاء SVG
    if (stickerInfo.type === 'svg' && stickerInfo.svgContent) {
      // إنشاء صورة من SVG
      const svgBlob = new Blob([
        `<svg xmlns="http://www.w3.org/2000/svg" width="${stickerInfo.width}" height="${stickerInfo.height}" viewBox="0 0 ${stickerInfo.width} ${stickerInfo.height}">${stickerInfo.svgContent}</svg>`
      ], { type: 'image/svg+xml' });
      
      const url = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        stickerElement.image = image;
        URL.revokeObjectURL(url);
      };
      image.onerror = () => {
        console.error('فشل في تحميل صورة الملصق SVG:', stickerElement.stickerId);
      };
      image.src = url;
    } else {
      // تحميل صورة عادية
      const image = new Image();
      image.onload = () => {
        stickerElement.image = image;
      };
      image.onerror = () => {
        console.error('فشل في تحميل صورة الملصق:', stickerElement.stickerId);
      };
      image.src = stickerInfo.url;
    }
  }

  /**
   * تحميل صورة
   * @param {string} url رابط الصورة
   * @returns {Promise<HTMLImageElement>} وعد يتم حله بعنصر الصورة
   * @private
   */
  _loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('فشل في تحميل الصورة: ' + url));
      image.src = url;
    });
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
   * رسم ملصق على الكانفاس
   * @param {Object} stickerElement عنصر الملصق
   * @param {number} currentTime الوقت الحالي في الفيديو
   * @private
   */
  _renderSticker(stickerElement, currentTime) {
    // التحقق من وجود صورة الملصق
    if (!stickerElement.image) {
      return;
    }
    
    // حفظ حالة السياق
    this.ctx.save();
    
    // تعيين الشفافية
    this.ctx.globalAlpha = stickerElement.opacity;
    
    // تطبيق التأثير الحركي إذا وجد
    if (stickerElement.animation) {
      this._applyAnimation(stickerElement, currentTime);
    }
    
    // تطبيق التحويلات
    this.ctx.translate(stickerElement.x, stickerElement.y);
    this.ctx.rotate(stickerElement.rotation * Math.PI / 180);
    this.ctx.scale(
      stickerElement.scale * (stickerElement.flipX ? -1 : 1),
      stickerElement.scale * (stickerElement.flipY ? -1 : 1)
    );
    
    // رسم الملصق
    this.ctx.drawImage(
      stickerElement.image,
      -stickerElement.width / 2,
      -stickerElement.height / 2,
      stickerElement.width,
      stickerElement.height
    );
    
    // استعادة حالة السياق
    this.ctx.restore();
  }

  /**
   * تطبيق تأثير حركي على الملصق
   * @param {Object} stickerElement عنصر الملصق
   * @param {number} currentTime الوقت الحالي في الفيديو
   * @private
   */
  _applyAnimation(stickerElement, currentTime) {
    const animation = stickerElement.animation;
    const params = stickerElement.animationParams || {};
    
    const startTime = stickerElement.startTime;
    const endTime = stickerElement.endTime;
    const duration = endTime - startTime;
    const elapsedTime = currentTime - startTime;
    const progress = elapsedTime / duration;
    
    switch (animation) {
      case 'fade-in':
        // ظهور تدريجي
        const fadeInDuration = params.duration || 1.0;
        if (elapsedTime <= fadeInDuration) {
          this.ctx.globalAlpha = (elapsedTime / fadeInDuration) * stickerElement.opacity;
        }
        break;
        
      case 'fade-out':
        // اختفاء تدريجي
        const fadeOutDuration = params.duration || 1.0;
        const fadeOutStart = duration - fadeOutDuration;
        if (elapsedTime >= fadeOutStart) {
          const fadeOutProgress = (duration - elapsedTime) / fadeOutDuration;
          this.ctx.globalAlpha = fadeOutProgress * stickerElement.opacity;
        }
        break;
        
      case 'rotate':
        // دوران مستمر
        const rotationSpeed = params.speed || 1.0;
        const angle = (elapsedTime * rotationSpeed * 360) % 360;
        this.ctx.rotate(angle * Math.PI / 180);
        break;
        
      case 'pulse':
        // نبض
        const pulseSpeed = params.speed || 1.0;
        const pulseMin = params.min || 0.8;
        const pulseMax = params.max || 1.2;
        const pulseFactor = pulseMin + (Math.sin(elapsedTime * pulseSpeed * Math.PI) + 1) / 2 * (pulseMax - pulseMin);
        this.ctx.scale(pulseFactor, pulseFactor);
        break;
        
      case 'bounce':
        // ارتداد
        const bounceHeight = params.height || 20;
        const bounceSpeed = params.speed || 1.0;
        const bounceOffset = Math.abs(Math.sin(elapsedTime * bounceSpeed * Math.PI)) * bounceHeight;
        this.ctx.translate(0, -bounceOffset);
        break;
        
      case 'shake':
        // اهتزاز
        const shakeIntensity = params.intensity || 5;
        const shakeSpeed = params.speed || 10;
        const shakeX = (Math.random() - 0.5) * shakeIntensity * 2;
        const shakeY = (Math.random() - 0.5) * shakeIntensity * 2;
        this.ctx.translate(shakeX, shakeY);
        break;
        
      case 'slide-in':
        // دخول انزلاقي
        const slideDirection = params.direction || 'right';
        const slideDuration = params.duration || 1.0;
        
        if (elapsedTime <= slideDuration) {
          const slideProgress = this._easeOutQuad(elapsedTime / slideDuration);
          let offsetX = 0;
          let offsetY = 0;
          
          switch (slideDirection) {
            case 'right':
              offsetX = (1 - slideProgress) * this.canvas.width;
              break;
            case 'left':
              offsetX = -(1 - slideProgress) * this.canvas.width;
              break;
            case 'top':
              offsetY = -(1 - slideProgress) * this.canvas.height;
              break;
            case 'bottom':
              offsetY = (1 - slideProgress) * this.canvas.height;
              break;
          }
          
          this.ctx.translate(offsetX, offsetY);
        }
        break;
    }
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

export default StickersOverlaysTool;
