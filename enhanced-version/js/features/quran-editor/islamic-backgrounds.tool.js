/**
 * أداة الخلفيات الإسلامية لمحرر فيديو القرآن
 * توفر واجهة برمجية للتعامل مع مكتبة خلفيات إسلامية متنوعة
 */

class IslamicBackgroundsTool {
  constructor() {
    this.backgrounds = [];
    this.categories = [];
    this.currentBackground = null;
    this.transitionEffects = [];
    this.currentTransition = 'fade';
    this.transitionDuration = 1.0; // بالثواني
    this.initialized = false;
  }

  /**
   * تهيئة أداة الخلفيات الإسلامية
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // تحميل فئات الخلفيات
      this._initializeCategories();
      
      // تحميل الخلفيات
      await this._loadBackgrounds();
      
      // تهيئة تأثيرات الانتقال
      this._initializeTransitionEffects();
      
      this.initialized = true;
      console.log('تم تهيئة أداة الخلفيات الإسلامية بنجاح مع', this.backgrounds.length, 'خلفية');
    } catch (error) {
      console.error('خطأ في تهيئة أداة الخلفيات الإسلامية:', error);
    }
    
    return this.initialized;
  }

  /**
   * الحصول على قائمة الخلفيات المتاحة
   * @param {string} categoryId معرف الفئة (اختياري)
   * @returns {Array} قائمة الخلفيات
   */
  getBackgrounds(categoryId = null) {
    if (!this.initialized) {
      console.warn('أداة الخلفيات الإسلامية غير مهيأة بعد');
      return [];
    }
    
    if (categoryId) {
      return this.backgrounds.filter(bg => bg.categoryId === categoryId);
    }
    
    return this.backgrounds;
  }

  /**
   * الحصول على قائمة فئات الخلفيات
   * @returns {Array} قائمة الفئات
   */
  getCategories() {
    return this.categories;
  }

  /**
   * الحصول على قائمة تأثيرات الانتقال
   * @returns {Array} قائمة التأثيرات
   */
  getTransitionEffects() {
    return this.transitionEffects;
  }

  /**
   * تعيين الخلفية الحالية
   * @param {string} backgroundId معرف الخلفية
   * @returns {Object|null} معلومات الخلفية أو null إذا لم يتم العثور عليها
   */
  setBackground(backgroundId) {
    if (!this.initialized) {
      console.warn('أداة الخلفيات الإسلامية غير مهيأة بعد');
      return null;
    }
    
    const background = this.backgrounds.find(bg => bg.id === backgroundId);
    if (background) {
      this.currentBackground = background;
      console.log('تم تعيين الخلفية:', background.name);
      return background;
    }
    
    console.warn('لم يتم العثور على الخلفية:', backgroundId);
    return null;
  }

  /**
   * تعيين تأثير الانتقال
   * @param {string} transitionId معرف التأثير
   * @returns {boolean} نجاح العملية
   */
  setTransitionEffect(transitionId) {
    const transition = this.transitionEffects.find(t => t.id === transitionId);
    if (transition) {
      this.currentTransition = transitionId;
      console.log('تم تعيين تأثير الانتقال:', transition.name);
      return true;
    }
    
    console.warn('لم يتم العثور على تأثير الانتقال:', transitionId);
    return false;
  }

  /**
   * تعيين مدة الانتقال
   * @param {number} duration المدة بالثواني
   * @returns {boolean} نجاح العملية
   */
  setTransitionDuration(duration) {
    if (duration >= 0.1 && duration <= 5.0) {
      this.transitionDuration = duration;
      console.log('تم تعيين مدة الانتقال:', duration, 'ثانية');
      return true;
    }
    
    console.warn('مدة الانتقال يجب أن تكون بين 0.1 و 5.0 ثواني');
    return false;
  }

  /**
   * تحميل خلفية مخصصة
   * @param {File|Blob} file ملف الخلفية
   * @param {string} name اسم الخلفية
   * @param {string} categoryId معرف الفئة
   * @returns {Promise<Object|null>} وعد يتم حله بمعلومات الخلفية أو null في حالة الفشل
   */
  async uploadCustomBackground(file, name, categoryId = 'custom') {
    if (!this.initialized) {
      console.warn('أداة الخلفيات الإسلامية غير مهيأة بعد');
      return null;
    }
    
    try {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        throw new Error('نوع الملف غير مدعوم. يجب أن يكون صورة أو فيديو.');
      }
      
      // إنشاء معرف فريد للخلفية
      const uniqueId = 'custom_' + Date.now();
      
      // إنشاء URL للملف
      const url = URL.createObjectURL(file);
      
      // إضافة الخلفية إلى القائمة
      const newBackground = {
        id: uniqueId,
        name: name || file.name,
        url: url,
        thumbnail: url,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        categoryId: categoryId,
        isCustom: true
      };
      
      this.backgrounds.push(newBackground);
      
      // التأكد من وجود فئة "مخصص"
      if (!this.categories.some(cat => cat.id === 'custom')) {
        this.categories.push({
          id: 'custom',
          name: 'خلفيات مخصصة',
          description: 'خلفيات تم تحميلها بواسطة المستخدم'
        });
      }
      
      console.log('تم تحميل خلفية مخصصة:', newBackground.name);
      return newBackground;
    } catch (error) {
      console.error('خطأ في تحميل الخلفية المخصصة:', error);
      return null;
    }
  }

  /**
   * تطبيق الخلفية على عنصر HTML
   * @param {HTMLElement} element العنصر المراد تطبيق الخلفية عليه
   * @param {string} backgroundId معرف الخلفية (اختياري، يستخدم الخلفية الحالية إذا لم يتم تحديده)
   * @returns {Promise<boolean>} وعد يتم حله بنجاح العملية
   */
  async applyBackgroundToElement(element, backgroundId = null) {
    if (!this.initialized) {
      console.warn('أداة الخلفيات الإسلامية غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد الخلفية المراد تطبيقها
      const background = backgroundId ? 
        this.backgrounds.find(bg => bg.id === backgroundId) : 
        this.currentBackground;
      
      if (!background) {
        console.warn('لم يتم تحديد خلفية للتطبيق');
        return false;
      }
      
      // تطبيق تأثير الانتقال
      element.style.transition = `all ${this.transitionDuration}s`;
      
      // تطبيق الخلفية حسب نوعها
      if (background.type === 'image') {
        // إزالة أي عناصر فيديو سابقة
        const existingVideo = element.querySelector('video');
        if (existingVideo) {
          element.removeChild(existingVideo);
        }
        
        // تطبيق الصورة كخلفية
        element.style.backgroundImage = `url(${background.url})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
      } else if (background.type === 'video') {
        // إزالة أي خلفية صورة سابقة
        element.style.backgroundImage = 'none';
        
        // إزالة أي عناصر فيديو سابقة
        const existingVideo = element.querySelector('video');
        if (existingVideo) {
          element.removeChild(existingVideo);
        }
        
        // إنشاء عنصر فيديو جديد
        const video = document.createElement('video');
        video.src = background.url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.style.position = 'absolute';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.zIndex = '-1';
        
        // إضافة الفيديو إلى العنصر
        element.style.position = 'relative';
        element.appendChild(video);
      }
      
      console.log('تم تطبيق الخلفية:', background.name);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق الخلفية:', error);
      return false;
    }
  }

  /**
   * تهيئة فئات الخلفيات
   * @private
   */
  _initializeCategories() {
    this.categories = [
      {
        id: 'mosques',
        name: 'المساجد',
        description: 'خلفيات للمساجد والأماكن المقدسة'
      },
      {
        id: 'nature',
        name: 'الطبيعة',
        description: 'خلفيات طبيعية تعكس جمال الخلق'
      },
      {
        id: 'patterns',
        name: 'زخارف إسلامية',
        description: 'أنماط وزخارف إسلامية تقليدية'
      },
      {
        id: 'calligraphy',
        name: 'خط عربي',
        description: 'خلفيات تحتوي على خط عربي وكتابات إسلامية'
      },
      {
        id: 'occasions',
        name: 'مناسبات إسلامية',
        description: 'خلفيات للمناسبات الإسلامية مثل رمضان والعيد والحج'
      },
      {
        id: 'abstract',
        name: 'تجريدية',
        description: 'خلفيات تجريدية بألوان وأشكال متناسقة'
      }
    ];
  }

  /**
   * تحميل الخلفيات
   * @returns {Promise} وعد يتم حله عند اكتمال التحميل
   * @private
   */
  async _loadBackgrounds() {
    try {
      // في التطبيق الحقيقي، يمكن تحميل هذه الخلفيات من API أو قاعدة بيانات
      // هنا نستخدم بيانات افتراضية للتوضيح
      
      this.backgrounds = [
        // خلفيات المساجد
        {
          id: 'mosque_01',
          name: 'المسجد الحرام',
          url: 'assets/backgrounds/mosques/makkah.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/makkah_thumb.jpg',
          type: 'image',
          categoryId: 'mosques'
        },
        {
          id: 'mosque_02',
          name: 'المسجد النبوي',
          url: 'assets/backgrounds/mosques/madinah.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/madinah_thumb.jpg',
          type: 'image',
          categoryId: 'mosques'
        },
        {
          id: 'mosque_03',
          name: 'المسجد الأقصى',
          url: 'assets/backgrounds/mosques/aqsa.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/aqsa_thumb.jpg',
          type: 'image',
          categoryId: 'mosques'
        },
        {
          id: 'mosque_04',
          name: 'الكعبة المشرفة - متحرك',
          url: 'assets/backgrounds/mosques/kaaba_motion.mp4',
          thumbnail: 'assets/backgrounds/thumbnails/kaaba_motion_thumb.jpg',
          type: 'video',
          categoryId: 'mosques'
        },
        
        // خلفيات الطبيعة
        {
          id: 'nature_01',
          name: 'غروب الشمس',
          url: 'assets/backgrounds/nature/sunset.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/sunset_thumb.jpg',
          type: 'image',
          categoryId: 'nature'
        },
        {
          id: 'nature_02',
          name: 'السماء والنجوم',
          url: 'assets/backgrounds/nature/stars.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/stars_thumb.jpg',
          type: 'image',
          categoryId: 'nature'
        },
        {
          id: 'nature_03',
          name: 'أمواج البحر - متحرك',
          url: 'assets/backgrounds/nature/ocean_waves.mp4',
          thumbnail: 'assets/backgrounds/thumbnails/ocean_waves_thumb.jpg',
          type: 'video',
          categoryId: 'nature'
        },
        
        // زخارف إسلامية
        {
          id: 'pattern_01',
          name: 'زخرفة هندسية أزرق',
          url: 'assets/backgrounds/patterns/geometric_blue.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/geometric_blue_thumb.jpg',
          type: 'image',
          categoryId: 'patterns'
        },
        {
          id: 'pattern_02',
          name: 'زخرفة نباتية ذهبية',
          url: 'assets/backgrounds/patterns/floral_gold.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/floral_gold_thumb.jpg',
          type: 'image',
          categoryId: 'patterns'
        },
        {
          id: 'pattern_03',
          name: 'زخرفة متحركة',
          url: 'assets/backgrounds/patterns/pattern_motion.mp4',
          thumbnail: 'assets/backgrounds/thumbnails/pattern_motion_thumb.jpg',
          type: 'video',
          categoryId: 'patterns'
        },
        
        // خط عربي
        {
          id: 'calligraphy_01',
          name: 'بسم الله الرحمن الرحيم',
          url: 'assets/backgrounds/calligraphy/bismillah.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/bismillah_thumb.jpg',
          type: 'image',
          categoryId: 'calligraphy'
        },
        {
          id: 'calligraphy_02',
          name: 'الله نور السماوات والأرض',
          url: 'assets/backgrounds/calligraphy/allah_light.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/allah_light_thumb.jpg',
          type: 'image',
          categoryId: 'calligraphy'
        },
        
        // مناسبات إسلامية
        {
          id: 'occasion_01',
          name: 'رمضان كريم',
          url: 'assets/backgrounds/occasions/ramadan.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/ramadan_thumb.jpg',
          type: 'image',
          categoryId: 'occasions'
        },
        {
          id: 'occasion_02',
          name: 'عيد مبارك',
          url: 'assets/backgrounds/occasions/eid.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/eid_thumb.jpg',
          type: 'image',
          categoryId: 'occasions'
        },
        {
          id: 'occasion_03',
          name: 'فانوس رمضان - متحرك',
          url: 'assets/backgrounds/occasions/ramadan_lantern.mp4',
          thumbnail: 'assets/backgrounds/thumbnails/ramadan_lantern_thumb.jpg',
          type: 'video',
          categoryId: 'occasions'
        },
        
        // تجريدية
        {
          id: 'abstract_01',
          name: 'تموجات ضوئية',
          url: 'assets/backgrounds/abstract/light_waves.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/light_waves_thumb.jpg',
          type: 'image',
          categoryId: 'abstract'
        },
        {
          id: 'abstract_02',
          name: 'تدرجات لونية',
          url: 'assets/backgrounds/abstract/gradients.jpg',
          thumbnail: 'assets/backgrounds/thumbnails/gradients_thumb.jpg',
          type: 'image',
          categoryId: 'abstract'
        },
        {
          id: 'abstract_03',
          name: 'جسيمات متحركة',
          url: 'assets/backgrounds/abstract/particles.mp4',
          thumbnail: 'assets/backgrounds/thumbnails/particles_thumb.jpg',
          type: 'video',
          categoryId: 'abstract'
        }
      ];
      
      // تعيين الخلفية الافتراضية
      if (this.backgrounds.length > 0) {
        this.currentBackground = this.backgrounds[0];
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تحميل الخلفيات:', error);
      return false;
    }
  }

  /**
   * تهيئة تأثيرات الانتقال
   * @private
   */
  _initializeTransitionEffects() {
    this.transitionEffects = [
      {
        id: 'fade',
        name: 'تلاشي',
        description: 'تأثير تلاشي بسيط بين الخلفيات'
      },
      {
        id: 'slide_left',
        name: 'انزلاق لليسار',
        description: 'انزلاق الخلفية الجديدة من اليمين إلى اليسار'
      },
      {
        id: 'slide_right',
        name: 'انزلاق لليمين',
        description: 'انزلاق الخلفية الجديدة من اليسار إلى اليمين'
      },
      {
        id: 'slide_up',
        name: 'انزلاق للأعلى',
        description: 'انزلاق الخلفية الجديدة من الأسفل إلى الأعلى'
      },
      {
        id: 'slide_down',
        name: 'انزلاق للأسفل',
        description: 'انزلاق الخلفية الجديدة من الأعلى إلى الأسفل'
      },
      {
        id: 'zoom_in',
        name: 'تكبير',
        description: 'ظهور الخلفية الجديدة بتأثير تكبير'
      },
      {
        id: 'zoom_out',
        name: 'تصغير',
        description: 'ظهور الخلفية الجديدة بتأثير تصغير'
      },
      {
        id: 'rotate',
        name: 'دوران',
        description: 'ظهور الخلفية الجديدة بتأثير دوران'
      },
      {
        id: 'blur',
        name: 'ضبابية',
        description: 'تحول الخلفية الحالية إلى ضبابية ثم ظهور الخلفية الجديدة'
      }
    ];
  }
}

export default IslamicBackgroundsTool;
