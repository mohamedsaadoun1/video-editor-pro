/**
 * أداة قص الفيديو لمحرر الفيديو العام
 * توفر واجهة برمجية للتعامل مع قص وتقسيم ودمج مقاطع الفيديو
 */

class VideoTrimmingTool {
  constructor() {
    this.videoElement = null;
    this.canvas = null;
    this.ctx = null;
    this.currentVideo = null;
    this.segments = [];
    this.currentSegment = null;
    this.playbackRate = 1.0;
    this.initialized = false;
  }

  /**
   * تهيئة أداة قص الفيديو
   * @param {HTMLVideoElement} videoElement عنصر الفيديو للمعاينة
   * @param {HTMLCanvasElement} canvas عنصر الكانفاس لعرض الإطارات
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize(videoElement, canvas) {
    if (this.initialized) return;
    
    try {
      this.videoElement = videoElement;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      
      // إعداد مستمعي الأحداث
      this._setupEventListeners();
      
      this.initialized = true;
      console.log('تم تهيئة أداة قص الفيديو بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة أداة قص الفيديو:', error);
    }
    
    return this.initialized;
  }

  /**
   * تحميل ملف فيديو
   * @param {File|Blob|string} videoSource ملف الفيديو أو رابط
   * @returns {Promise<Object>} وعد يتم حله بمعلومات الفيديو
   */
  async loadVideo(videoSource) {
    if (!this.initialized) {
      console.warn('أداة قص الفيديو غير مهيأة بعد');
      return null;
    }
    
    try {
      // إنشاء URL للفيديو إذا كان ملفاً
      let videoUrl;
      if (typeof videoSource === 'string') {
        videoUrl = videoSource;
      } else {
        videoUrl = URL.createObjectURL(videoSource);
      }
      
      // تحميل الفيديو
      await new Promise((resolve, reject) => {
        this.videoElement.src = videoUrl;
        this.videoElement.onloadedmetadata = () => resolve();
        this.videoElement.onerror = (e) => reject(new Error('فشل في تحميل الفيديو: ' + e.message));
      });
      
      // تعيين أبعاد الكانفاس لتتناسب مع الفيديو
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
      
      // إنشاء معلومات الفيديو
      this.currentVideo = {
        url: videoUrl,
        duration: this.videoElement.duration,
        width: this.videoElement.videoWidth,
        height: this.videoElement.videoHeight,
        fps: 30 // افتراضي، يمكن حسابه بدقة أكبر
      };
      
      // إنشاء قطعة افتراضية تغطي الفيديو بالكامل
      this.segments = [{
        id: 'segment_' + Date.now(),
        start: 0,
        end: this.currentVideo.duration,
        name: 'القطعة الأصلية'
      }];
      
      this.currentSegment = this.segments[0];
      
      console.log('تم تحميل الفيديو بنجاح:', this.currentVideo);
      return this.currentVideo;
    } catch (error) {
      console.error('خطأ في تحميل الفيديو:', error);
      return null;
    }
  }

  /**
   * قص الفيديو إلى قطعة محددة
   * @param {number} startTime وقت البداية بالثواني
   * @param {number} endTime وقت النهاية بالثواني
   * @param {string} name اسم القطعة (اختياري)
   * @returns {Object} معلومات القطعة الجديدة
   */
  trimVideo(startTime, endTime, name = null) {
    if (!this.initialized || !this.currentVideo) {
      console.warn('أداة قص الفيديو غير مهيأة أو لم يتم تحميل فيديو');
      return null;
    }
    
    try {
      // التحقق من صحة الأوقات
      if (startTime < 0) startTime = 0;
      if (endTime > this.currentVideo.duration) endTime = this.currentVideo.duration;
      if (startTime >= endTime) {
        throw new Error('وقت البداية يجب أن يكون أقل من وقت النهاية');
      }
      
      // إنشاء قطعة جديدة
      const newSegment = {
        id: 'segment_' + Date.now(),
        start: startTime,
        end: endTime,
        name: name || `قطعة ${this.segments.length + 1}`
      };
      
      // إضافة القطعة إلى القائمة
      this.segments.push(newSegment);
      this.currentSegment = newSegment;
      
      console.log('تم قص الفيديو:', newSegment);
      return newSegment;
    } catch (error) {
      console.error('خطأ في قص الفيديو:', error);
      return null;
    }
  }

  /**
   * تقسيم الفيديو عند نقطة زمنية محددة
   * @param {number} splitTime الوقت بالثواني لتقسيم الفيديو عنده
   * @returns {Array} قائمة بالقطع الناتجة
   */
  splitVideoAt(splitTime) {
    if (!this.initialized || !this.currentVideo) {
      console.warn('أداة قص الفيديو غير مهيأة أو لم يتم تحميل فيديو');
      return null;
    }
    
    try {
      // التحقق من صحة الوقت
      if (splitTime <= 0 || splitTime >= this.currentVideo.duration) {
        throw new Error('وقت التقسيم يجب أن يكون بين 0 و مدة الفيديو');
      }
      
      // إنشاء قطعتين جديدتين
      const firstSegment = {
        id: 'segment_' + Date.now(),
        start: 0,
        end: splitTime,
        name: `القطعة الأولى`
      };
      
      const secondSegment = {
        id: 'segment_' + (Date.now() + 1),
        start: splitTime,
        end: this.currentVideo.duration,
        name: `القطعة الثانية`
      };
      
      // إضافة القطع إلى القائمة
      this.segments.push(firstSegment, secondSegment);
      this.currentSegment = firstSegment;
      
      console.log('تم تقسيم الفيديو إلى قطعتين');
      return [firstSegment, secondSegment];
    } catch (error) {
      console.error('خطأ في تقسيم الفيديو:', error);
      return null;
    }
  }

  /**
   * دمج عدة قطع فيديو
   * @param {Array} segmentIds قائمة بمعرفات القطع المراد دمجها
   * @param {string} name اسم القطعة الناتجة (اختياري)
   * @returns {Object} معلومات القطعة الناتجة
   */
  mergeSegments(segmentIds, name = null) {
    if (!this.initialized || !this.currentVideo) {
      console.warn('أداة قص الفيديو غير مهيأة أو لم يتم تحميل فيديو');
      return null;
    }
    
    try {
      // التحقق من وجود القطع
      const segmentsToMerge = this.segments.filter(segment => segmentIds.includes(segment.id));
      if (segmentsToMerge.length < 2) {
        throw new Error('يجب تحديد قطعتين على الأقل للدمج');
      }
      
      // ترتيب القطع حسب وقت البداية
      segmentsToMerge.sort((a, b) => a.start - b.start);
      
      // إنشاء قطعة جديدة تغطي جميع القطع المحددة
      const startTime = Math.min(...segmentsToMerge.map(s => s.start));
      const endTime = Math.max(...segmentsToMerge.map(s => s.end));
      
      const mergedSegment = {
        id: 'segment_' + Date.now(),
        start: startTime,
        end: endTime,
        name: name || `قطعة مدمجة`
      };
      
      // إضافة القطعة إلى القائمة
      this.segments.push(mergedSegment);
      this.currentSegment = mergedSegment;
      
      console.log('تم دمج القطع:', mergedSegment);
      return mergedSegment;
    } catch (error) {
      console.error('خطأ في دمج القطع:', error);
      return null;
    }
  }

  /**
   * تعديل سرعة تشغيل الفيديو
   * @param {number} rate معدل السرعة (0.25 إلى 4.0)
   * @returns {boolean} نجاح العملية
   */
  setPlaybackRate(rate) {
    if (!this.initialized || !this.currentVideo) {
      console.warn('أداة قص الفيديو غير مهيأة أو لم يتم تحميل فيديو');
      return false;
    }
    
    try {
      // التحقق من صحة المعدل
      if (rate < 0.25 || rate > 4.0) {
        throw new Error('معدل السرعة يجب أن يكون بين 0.25 و 4.0');
      }
      
      // تعيين معدل السرعة
      this.playbackRate = rate;
      this.videoElement.playbackRate = rate;
      
      console.log('تم تعديل سرعة التشغيل:', rate);
      return true;
    } catch (error) {
      console.error('خطأ في تعديل سرعة التشغيل:', error);
      return false;
    }
  }

  /**
   * الحصول على إطار من الفيديو عند وقت محدد
   * @param {number} time الوقت بالثواني
   * @returns {Promise<Blob>} وعد يتم حله بالإطار كصورة
   */
  async getFrameAt(time) {
    if (!this.initialized || !this.currentVideo) {
      console.warn('أداة قص الفيديو غير مهيأة أو لم يتم تحميل فيديو');
      return null;
    }
    
    try {
      // التحقق من صحة الوقت
      if (time < 0 || time > this.currentVideo.duration) {
        throw new Error('الوقت يجب أن يكون بين 0 و مدة الفيديو');
      }
      
      // تعيين وقت الفيديو
      this.videoElement.currentTime = time;
      
      // انتظار تحديث الفيديو
      await new Promise(resolve => {
        const onSeeked = () => {
          this.videoElement.removeEventListener('seeked', onSeeked);
          resolve();
        };
        this.videoElement.addEventListener('seeked', onSeeked);
      });
      
      // رسم الإطار على الكانفاس
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      
      // تحويل الكانفاس إلى صورة
      return new Promise(resolve => {
        this.canvas.toBlob(blob => {
          resolve(blob);
        }, 'image/jpeg', 0.95);
      });
    } catch (error) {
      console.error('خطأ في الحصول على الإطار:', error);
      return null;
    }
  }

  /**
   * تشغيل معاينة لقطعة محددة
   * @param {string} segmentId معرف القطعة (اختياري، يستخدم القطعة الحالية إذا لم يتم تحديده)
   * @returns {boolean} نجاح العملية
   */
  previewSegment(segmentId = null) {
    if (!this.initialized || !this.currentVideo) {
      console.warn('أداة قص الفيديو غير مهيأة أو لم يتم تحميل فيديو');
      return false;
    }
    
    try {
      // تحديد القطعة المراد معاينتها
      const segment = segmentId ? 
        this.segments.find(s => s.id === segmentId) : 
        this.currentSegment;
      
      if (!segment) {
        throw new Error('لم يتم العثور على القطعة');
      }
      
      // تعيين وقت البداية
      this.videoElement.currentTime = segment.start;
      
      // تعيين معالج لإيقاف التشغيل عند نهاية القطعة
      const onTimeUpdate = () => {
        if (this.videoElement.currentTime >= segment.end) {
          this.videoElement.pause();
          this.videoElement.removeEventListener('timeupdate', onTimeUpdate);
        }
      };
      
      // إضافة مستمع الحدث
      this.videoElement.addEventListener('timeupdate', onTimeUpdate);
      
      // بدء التشغيل
      this.videoElement.play();
      
      console.log('تم بدء معاينة القطعة:', segment.name);
      return true;
    } catch (error) {
      console.error('خطأ في معاينة القطعة:', error);
      return false;
    }
  }

  /**
   * تصدير قطعة فيديو
   * @param {string} segmentId معرف القطعة (اختياري، يستخدم القطعة الحالية إذا لم يتم تحديده)
   * @param {Object} options خيارات التصدير
   * @returns {Promise<Blob>} وعد يتم حله بملف الفيديو المصدر
   */
  async exportSegment(segmentId = null, options = {}) {
    if (!this.initialized || !this.currentVideo) {
      console.warn('أداة قص الفيديو غير مهيأة أو لم يتم تحميل فيديو');
      return null;
    }
    
    try {
      // تحديد القطعة المراد تصديرها
      const segment = segmentId ? 
        this.segments.find(s => s.id === segmentId) : 
        this.currentSegment;
      
      if (!segment) {
        throw new Error('لم يتم العثور على القطعة');
      }
      
      // في بيئة حقيقية، هنا سيتم استخدام FFmpeg أو WebAssembly لمعالجة الفيديو
      // لكن في هذا المثال، سنفترض أن العملية تمت بنجاح ونعيد وعداً يتم حله بعد فترة
      
      console.log('جاري تصدير القطعة:', segment.name);
      
      // محاكاة عملية التصدير
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('تم تصدير القطعة بنجاح');
      
      // في التطبيق الحقيقي، سيتم إرجاع ملف الفيديو المعالج
      return new Blob(['dummy video data'], { type: 'video/mp4' });
    } catch (error) {
      console.error('خطأ في تصدير القطعة:', error);
      return null;
    }
  }

  /**
   * الحصول على قائمة القطع الحالية
   * @returns {Array} قائمة القطع
   */
  getSegments() {
    return this.segments;
  }

  /**
   * تعيين القطعة الحالية
   * @param {string} segmentId معرف القطعة
   * @returns {Object|null} معلومات القطعة أو null إذا لم يتم العثور عليها
   */
  setCurrentSegment(segmentId) {
    const segment = this.segments.find(s => s.id === segmentId);
    if (segment) {
      this.currentSegment = segment;
      console.log('تم تعيين القطعة الحالية:', segment.name);
      return segment;
    }
    
    console.warn('لم يتم العثور على القطعة:', segmentId);
    return null;
  }

  /**
   * إعداد مستمعي الأحداث
   * @private
   */
  _setupEventListeners() {
    // مستمع لحدث انتهاء الفيديو
    this.videoElement.addEventListener('ended', () => {
      console.log('انتهى تشغيل الفيديو');
    });
    
    // مستمع لحدث تحديث الوقت
    this.videoElement.addEventListener('timeupdate', () => {
      // يمكن استخدام هذا الحدث لتحديث واجهة المستخدم
    });
    
    // مستمع لحدث تغيير حجم الفيديو
    this.videoElement.addEventListener('resize', () => {
      // تحديث أبعاد الكانفاس عند تغيير حجم الفيديو
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
    });
  }
}

export default VideoTrimmingTool;
