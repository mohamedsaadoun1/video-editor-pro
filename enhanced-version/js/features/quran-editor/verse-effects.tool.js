/**
 * أداة تأثيرات الآيات لمحرر فيديو القرآن
 * توفر واجهة برمجية للتعامل مع تأثيرات متقدمة لعرض الآيات
 */

class VerseEffectsTool {
  constructor() {
    this.effects = [];
    this.currentEffect = null;
    this.effectDuration = 1.0; // بالثواني
    this.effectIntensity = 0.5; // من 0 إلى 1
    this.syncWithRecitation = true;
    this.initialized = false;
  }

  /**
   * تهيئة أداة تأثيرات الآيات
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // تحميل التأثيرات المتاحة
      this._initializeEffects();
      
      this.initialized = true;
      console.log('تم تهيئة أداة تأثيرات الآيات بنجاح مع', this.effects.length, 'تأثير');
    } catch (error) {
      console.error('خطأ في تهيئة أداة تأثيرات الآيات:', error);
    }
    
    return this.initialized;
  }

  /**
   * الحصول على قائمة التأثيرات المتاحة
   * @returns {Array} قائمة التأثيرات
   */
  getEffects() {
    return this.effects;
  }

  /**
   * تعيين التأثير الحالي
   * @param {string} effectId معرف التأثير
   * @returns {Object|null} معلومات التأثير أو null إذا لم يتم العثور عليه
   */
  setEffect(effectId) {
    if (!this.initialized) {
      console.warn('أداة تأثيرات الآيات غير مهيأة بعد');
      return null;
    }
    
    const effect = this.effects.find(e => e.id === effectId);
    if (effect) {
      this.currentEffect = effect;
      console.log('تم تعيين التأثير:', effect.name);
      return effect;
    }
    
    console.warn('لم يتم العثور على التأثير:', effectId);
    return null;
  }

  /**
   * تعيين مدة التأثير
   * @param {number} duration المدة بالثواني
   * @returns {boolean} نجاح العملية
   */
  setEffectDuration(duration) {
    if (duration >= 0.1 && duration <= 5.0) {
      this.effectDuration = duration;
      console.log('تم تعيين مدة التأثير:', duration, 'ثانية');
      return true;
    }
    
    console.warn('مدة التأثير يجب أن تكون بين 0.1 و 5.0 ثواني');
    return false;
  }

  /**
   * تعيين شدة التأثير
   * @param {number} intensity الشدة (من 0 إلى 1)
   * @returns {boolean} نجاح العملية
   */
  setEffectIntensity(intensity) {
    if (intensity >= 0 && intensity <= 1) {
      this.effectIntensity = intensity;
      console.log('تم تعيين شدة التأثير:', intensity);
      return true;
    }
    
    console.warn('شدة التأثير يجب أن تكون بين 0 و 1');
    return false;
  }

  /**
   * تفعيل أو تعطيل مزامنة التأثيرات مع التلاوة
   * @param {boolean} enabled حالة التفعيل
   */
  setSyncWithRecitation(enabled) {
    this.syncWithRecitation = Boolean(enabled);
    console.log('تم', this.syncWithRecitation ? 'تفعيل' : 'تعطيل', 'مزامنة التأثيرات مع التلاوة');
  }

  /**
   * تطبيق التأثير على عنصر HTML
   * @param {HTMLElement} element العنصر المراد تطبيق التأثير عليه
   * @param {string} effectId معرف التأثير (اختياري، يستخدم التأثير الحالي إذا لم يتم تحديده)
   * @param {Object} options خيارات إضافية للتأثير
   * @returns {Promise<boolean>} وعد يتم حله بنجاح العملية
   */
  async applyEffect(element, effectId = null, options = {}) {
    if (!this.initialized) {
      console.warn('أداة تأثيرات الآيات غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد التأثير المراد تطبيقه
      const effect = effectId ? 
        this.effects.find(e => e.id === effectId) : 
        this.currentEffect;
      
      if (!effect) {
        console.warn('لم يتم تحديد تأثير للتطبيق');
        return false;
      }
      
      // دمج الخيارات مع الإعدادات الافتراضية
      const effectOptions = {
        duration: options.duration || this.effectDuration,
        intensity: options.intensity || this.effectIntensity,
        sync: options.sync !== undefined ? options.sync : this.syncWithRecitation,
        direction: options.direction || 'rtl',
        delay: options.delay || 0
      };
      
      // تطبيق التأثير حسب نوعه
      switch (effect.id) {
        case 'fade_in':
          await this._applyFadeInEffect(element, effectOptions);
          break;
        case 'fade_out':
          await this._applyFadeOutEffect(element, effectOptions);
          break;
        case 'slide_in':
          await this._applySlideInEffect(element, effectOptions);
          break;
        case 'slide_out':
          await this._applySlideOutEffect(element, effectOptions);
          break;
        case 'typewriter':
          await this._applyTypewriterEffect(element, effectOptions);
          break;
        case 'glow':
          await this._applyGlowEffect(element, effectOptions);
          break;
        case 'highlight':
          await this._applyHighlightEffect(element, effectOptions);
          break;
        case 'zoom_in':
          await this._applyZoomInEffect(element, effectOptions);
          break;
        case 'zoom_out':
          await this._applyZoomOutEffect(element, effectOptions);
          break;
        case 'bounce':
          await this._applyBounceEffect(element, effectOptions);
          break;
        default:
          console.warn('التأثير غير مدعوم:', effect.id);
          return false;
      }
      
      console.log('تم تطبيق التأثير:', effect.name);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق التأثير:', error);
      return false;
    }
  }

  /**
   * تطبيق تأثير على كلمات الآية بشكل متتابع
   * @param {HTMLElement} element العنصر المراد تطبيق التأثير عليه
   * @param {string} effectId معرف التأثير
   * @param {Array} wordTimings توقيتات الكلمات
   * @returns {Promise<boolean>} وعد يتم حله بنجاح العملية
   */
  async applyWordByWordEffect(element, effectId, wordTimings) {
    if (!this.initialized) {
      console.warn('أداة تأثيرات الآيات غير مهيأة بعد');
      return false;
    }
    
    try {
      // التحقق من وجود التأثير
      const effect = this.effects.find(e => e.id === effectId);
      if (!effect) {
        console.warn('لم يتم العثور على التأثير:', effectId);
        return false;
      }
      
      // التحقق من وجود توقيتات الكلمات
      if (!wordTimings || !Array.isArray(wordTimings) || wordTimings.length === 0) {
        console.warn('توقيتات الكلمات غير صالحة');
        return false;
      }
      
      // تقسيم النص إلى كلمات
      const words = element.textContent.split(' ');
      if (words.length !== wordTimings.length) {
        console.warn('عدد الكلمات لا يتطابق مع عدد التوقيتات');
        return false;
      }
      
      // إفراغ العنصر
      element.innerHTML = '';
      
      // إنشاء عناصر span للكلمات
      for (let i = 0; i < words.length; i++) {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = words[i] + (i < words.length - 1 ? ' ' : '');
        wordSpan.style.opacity = '0.3';
        wordSpan.dataset.wordIndex = i;
        element.appendChild(wordSpan);
      }
      
      // تطبيق التأثير على كل كلمة حسب توقيتها
      for (let i = 0; i < wordTimings.length; i++) {
        const timing = wordTimings[i];
        const wordSpan = element.querySelector(`span[data-word-index="${i}"]`);
        
        if (wordSpan) {
          setTimeout(() => {
            // تطبيق التأثير على الكلمة الحالية
            this.applyEffect(wordSpan, effectId, {
              duration: 0.3,
              intensity: this.effectIntensity,
              sync: false
            });
            
            // إعادة تعتيم الكلمة السابقة
            if (i > 0) {
              const prevWordSpan = element.querySelector(`span[data-word-index="${i-1}"]`);
              if (prevWordSpan) {
                prevWordSpan.style.opacity = '0.5';
              }
            }
          }, timing.startTime * 1000);
        }
      }
      
      console.log('تم تطبيق التأثير كلمة بكلمة:', effect.name);
      return true;
    } catch (error) {
      console.error('خطأ في تطبيق التأثير كلمة بكلمة:', error);
      return false;
    }
  }

  /**
   * تهيئة التأثيرات المتاحة
   * @private
   */
  _initializeEffects() {
    this.effects = [
      {
        id: 'fade_in',
        name: 'ظهور تدريجي',
        description: 'ظهور النص بشكل تدريجي',
        category: 'appearance'
      },
      {
        id: 'fade_out',
        name: 'اختفاء تدريجي',
        description: 'اختفاء النص بشكل تدريجي',
        category: 'disappearance'
      },
      {
        id: 'slide_in',
        name: 'انزلاق للداخل',
        description: 'ظهور النص بانزلاق من الخارج إلى الداخل',
        category: 'appearance'
      },
      {
        id: 'slide_out',
        name: 'انزلاق للخارج',
        description: 'اختفاء النص بانزلاق من الداخل إلى الخارج',
        category: 'disappearance'
      },
      {
        id: 'typewriter',
        name: 'الآلة الكاتبة',
        description: 'ظهور النص حرفاً بحرف كأنه يُكتب',
        category: 'appearance'
      },
      {
        id: 'glow',
        name: 'توهج',
        description: 'إضافة تأثير توهج للنص',
        category: 'highlight'
      },
      {
        id: 'highlight',
        name: 'تظليل',
        description: 'تظليل النص بلون مميز',
        category: 'highlight'
      },
      {
        id: 'zoom_in',
        name: 'تكبير',
        description: 'ظهور النص بتأثير تكبير',
        category: 'appearance'
      },
      {
        id: 'zoom_out',
        name: 'تصغير',
        description: 'اختفاء النص بتأثير تصغير',
        category: 'disappearance'
      },
      {
        id: 'bounce',
        name: 'ارتداد',
        description: 'حركة ارتداد للنص',
        category: 'animation'
      }
    ];
    
    // تعيين التأثير الافتراضي
    if (this.effects.length > 0) {
      this.currentEffect = this.effects[0];
    }
  }

  /**
   * تطبيق تأثير الظهور التدريجي
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyFadeInEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalOpacity = element.style.opacity;
      
      // تعيين الخصائص الأولية
      element.style.opacity = '0';
      
      // تأخير قصير لضمان تطبيق الخصائص الأولية
      setTimeout(() => {
        // تعيين الانتقال
        element.style.transition = `opacity ${options.duration}s ease`;
        
        // تطبيق التأثير بعد تأخير قصير
        setTimeout(() => {
          element.style.opacity = '1';
          
          // استعادة الخصائص الأصلية بعد اكتمال التأثير
          setTimeout(() => {
            element.style.transition = originalTransition;
            resolve(true);
          }, options.duration * 1000);
        }, options.delay * 1000);
      }, 10);
    });
  }

  /**
   * تطبيق تأثير الاختفاء التدريجي
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyFadeOutEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalOpacity = element.style.opacity || '1';
      
      // تعيين الانتقال
      element.style.transition = `opacity ${options.duration}s ease`;
      
      // تطبيق التأثير بعد التأخير المحدد
      setTimeout(() => {
        element.style.opacity = '0';
        
        // استعادة الخصائص الأصلية بعد اكتمال التأثير
        setTimeout(() => {
          element.style.transition = originalTransition;
          resolve(true);
        }, options.duration * 1000);
      }, options.delay * 1000);
    });
  }

  /**
   * تطبيق تأثير الانزلاق للداخل
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applySlideInEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalTransform = element.style.transform;
      const originalOpacity = element.style.opacity;
      
      // تحديد اتجاه الانزلاق
      let startTransform;
      if (options.direction === 'rtl') {
        startTransform = 'translateX(100%)';
      } else if (options.direction === 'ltr') {
        startTransform = 'translateX(-100%)';
      } else if (options.direction === 'ttb') {
        startTransform = 'translateY(-100%)';
      } else if (options.direction === 'btt') {
        startTransform = 'translateY(100%)';
      } else {
        startTransform = 'translateX(100%)'; // الافتراضي للعربية
      }
      
      // تعيين الخصائص الأولية
      element.style.opacity = '0';
      element.style.transform = startTransform;
      
      // تأخير قصير لضمان تطبيق الخصائص الأولية
      setTimeout(() => {
        // تعيين الانتقال
        element.style.transition = `transform ${options.duration}s ease, opacity ${options.duration}s ease`;
        
        // تطبيق التأثير بعد التأخير المحدد
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateX(0)';
          
          // استعادة الخصائص الأصلية بعد اكتمال التأثير
          setTimeout(() => {
            element.style.transition = originalTransition;
            resolve(true);
          }, options.duration * 1000);
        }, options.delay * 1000);
      }, 10);
    });
  }

  /**
   * تطبيق تأثير الانزلاق للخارج
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applySlideOutEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalTransform = element.style.transform;
      const originalOpacity = element.style.opacity || '1';
      
      // تحديد اتجاه الانزلاق
      let endTransform;
      if (options.direction === 'rtl') {
        endTransform = 'translateX(-100%)';
      } else if (options.direction === 'ltr') {
        endTransform = 'translateX(100%)';
      } else if (options.direction === 'ttb') {
        endTransform = 'translateY(100%)';
      } else if (options.direction === 'btt') {
        endTransform = 'translateY(-100%)';
      } else {
        endTransform = 'translateX(-100%)'; // الافتراضي للعربية
      }
      
      // تعيين الانتقال
      element.style.transition = `transform ${options.duration}s ease, opacity ${options.duration}s ease`;
      
      // تطبيق التأثير بعد التأخير المحدد
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = endTransform;
        
        // استعادة الخصائص الأصلية بعد اكتمال التأثير
        setTimeout(() => {
          element.style.transition = originalTransition;
          resolve(true);
        }, options.duration * 1000);
      }, options.delay * 1000);
    });
  }

  /**
   * تطبيق تأثير الآلة الكاتبة
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyTypewriterEffect(element, options) {
    return new Promise(resolve => {
      // حفظ النص الأصلي
      const originalText = element.textContent;
      
      // إفراغ العنصر
      element.textContent = '';
      
      // حساب تأخير كل حرف
      const charDelay = (options.duration * 1000) / originalText.length;
      
      // إضافة الحروف واحداً تلو الآخر
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < originalText.length) {
          element.textContent += originalText.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(typeInterval);
          resolve(true);
        }
      }, charDelay);
    });
  }

  /**
   * تطبيق تأثير التوهج
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyGlowEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalTextShadow = element.style.textShadow;
      
      // تحديد شدة التوهج بناءً على شدة التأثير
      const glowIntensity = Math.floor(options.intensity * 20);
      const glowColor = 'rgba(255, 255, 255, 0.8)';
      
      // تعيين الانتقال
      element.style.transition = `text-shadow ${options.duration / 2}s ease-in-out`;
      
      // تطبيق التأثير بعد التأخير المحدد
      setTimeout(() => {
        // تطبيق التوهج
        element.style.textShadow = `0 0 ${glowIntensity}px ${glowColor}`;
        
        // إزالة التوهج بعد نصف المدة
        setTimeout(() => {
          element.style.textShadow = originalTextShadow || 'none';
          
          // استعادة الخصائص الأصلية بعد اكتمال التأثير
          setTimeout(() => {
            element.style.transition = originalTransition;
            resolve(true);
          }, options.duration * 500);
        }, options.duration * 500);
      }, options.delay * 1000);
    });
  }

  /**
   * تطبيق تأثير التظليل
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyHighlightEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalBackground = element.style.backgroundColor;
      const originalColor = element.style.color;
      
      // تعيين الانتقال
      element.style.transition = `background-color ${options.duration / 2}s ease-in-out, color ${options.duration / 2}s ease-in-out`;
      
      // تطبيق التأثير بعد التأخير المحدد
      setTimeout(() => {
        // تطبيق التظليل
        element.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
        element.style.color = '#000000';
        
        // إزالة التظليل بعد نصف المدة
        setTimeout(() => {
          element.style.backgroundColor = originalBackground || 'transparent';
          element.style.color = originalColor || 'inherit';
          
          // استعادة الخصائص الأصلية بعد اكتمال التأثير
          setTimeout(() => {
            element.style.transition = originalTransition;
            resolve(true);
          }, options.duration * 500);
        }, options.duration * 500);
      }, options.delay * 1000);
    });
  }

  /**
   * تطبيق تأثير التكبير
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyZoomInEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalTransform = element.style.transform;
      const originalOpacity = element.style.opacity;
      
      // تعيين الخصائص الأولية
      element.style.opacity = '0';
      element.style.transform = 'scale(0.5)';
      
      // تأخير قصير لضمان تطبيق الخصائص الأولية
      setTimeout(() => {
        // تعيين الانتقال
        element.style.transition = `transform ${options.duration}s ease, opacity ${options.duration}s ease`;
        
        // تطبيق التأثير بعد التأخير المحدد
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          
          // استعادة الخصائص الأصلية بعد اكتمال التأثير
          setTimeout(() => {
            element.style.transition = originalTransition;
            resolve(true);
          }, options.duration * 1000);
        }, options.delay * 1000);
      }, 10);
    });
  }

  /**
   * تطبيق تأثير التصغير
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyZoomOutEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalTransform = element.style.transform;
      const originalOpacity = element.style.opacity || '1';
      
      // تعيين الانتقال
      element.style.transition = `transform ${options.duration}s ease, opacity ${options.duration}s ease`;
      
      // تطبيق التأثير بعد التأخير المحدد
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'scale(1.5)';
        
        // استعادة الخصائص الأصلية بعد اكتمال التأثير
        setTimeout(() => {
          element.style.transition = originalTransition;
          resolve(true);
        }, options.duration * 1000);
      }, options.delay * 1000);
    });
  }

  /**
   * تطبيق تأثير الارتداد
   * @param {HTMLElement} element العنصر
   * @param {Object} options خيارات التأثير
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyBounceEffect(element, options) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalTransform = element.style.transform;
      
      // تعيين الانتقال
      element.style.transition = `transform ${options.duration / 4}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
      
      // تطبيق التأثير بعد التأخير المحدد
      setTimeout(() => {
        // مرحلة 1: ارتفاع
        element.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          // مرحلة 2: هبوط
          element.style.transform = 'translateY(0)';
          
          setTimeout(() => {
            // مرحلة 3: ارتفاع أقل
            element.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
              // مرحلة 4: عودة للوضع الأصلي
              element.style.transform = originalTransform || 'translateY(0)';
              
              // استعادة الخصائص الأصلية بعد اكتمال التأثير
              setTimeout(() => {
                element.style.transition = originalTransition;
                resolve(true);
              }, options.duration * 250);
            }, options.duration * 250);
          }, options.duration * 250);
        }, options.duration * 250);
      }, options.delay * 1000);
    });
  }
}

export default VerseEffectsTool;
