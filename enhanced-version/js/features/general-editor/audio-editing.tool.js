/**
 * أداة تحرير الصوت لمحرر الفيديو العام
 * توفر واجهة برمجية للتعامل مع تحرير وتعديل الصوت في الفيديو
 */

class AudioEditingTool {
  constructor() {
    this.audioContext = null;
    this.audioSources = [];
    this.audioTracks = [];
    this.currentTrack = null;
    this.masterGain = null;
    this.analyser = null;
    this.effects = {};
    this.initialized = false;
  }

  /**
   * تهيئة أداة تحرير الصوت
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // إنشاء سياق الصوت
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // إنشاء عقدة التحكم الرئيسية في مستوى الصوت
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      // إنشاء عقدة المحلل للتصور البصري
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.masterGain.connect(this.analyser);
      
      // تهيئة التأثيرات الصوتية
      this._initializeEffects();
      
      this.initialized = true;
      console.log('تم تهيئة أداة تحرير الصوت بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة أداة تحرير الصوت:', error);
    }
    
    return this.initialized;
  }

  /**
   * استخراج الصوت من ملف فيديو
   * @param {File|Blob|string} videoSource ملف الفيديو أو رابط
   * @param {string} name اسم المسار الصوتي (اختياري)
   * @returns {Promise<Object>} وعد يتم حله بمعلومات المسار الصوتي
   */
  async extractAudioFromVideo(videoSource, name = null) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return null;
    }
    
    try {
      // إنشاء عنصر فيديو مؤقت
      const videoElement = document.createElement('video');
      
      // إنشاء URL للفيديو إذا كان ملفاً
      let videoUrl;
      if (typeof videoSource === 'string') {
        videoUrl = videoSource;
      } else {
        videoUrl = URL.createObjectURL(videoSource);
      }
      
      // تحميل الفيديو
      videoElement.src = videoUrl;
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => resolve();
        videoElement.onerror = (e) => reject(new Error('فشل في تحميل الفيديو: ' + e.message));
      });
      
      // إنشاء مصدر صوتي من الفيديو
      const mediaSource = this.audioContext.createMediaElementSource(videoElement);
      
      // إنشاء مسار صوتي جديد
      const trackId = 'track_' + Date.now();
      const audioTrack = {
        id: trackId,
        name: name || 'مسار الفيديو الأصلي',
        source: mediaSource,
        sourceElement: videoElement,
        type: 'video',
        duration: videoElement.duration,
        gain: this.audioContext.createGain(),
        effects: {},
        muted: false,
        volume: 1.0
      };
      
      // توصيل المسار بالمخرج الرئيسي
      audioTrack.source.connect(audioTrack.gain);
      audioTrack.gain.connect(this.masterGain);
      
      // إضافة المسار إلى القائمة
      this.audioTracks.push(audioTrack);
      this.currentTrack = audioTrack;
      
      console.log('تم استخراج الصوت من الفيديو:', audioTrack.name);
      return audioTrack;
    } catch (error) {
      console.error('خطأ في استخراج الصوت من الفيديو:', error);
      return null;
    }
  }

  /**
   * إضافة ملف صوتي
   * @param {File|Blob|string} audioSource ملف الصوت أو رابط
   * @param {string} name اسم المسار الصوتي (اختياري)
   * @returns {Promise<Object>} وعد يتم حله بمعلومات المسار الصوتي
   */
  async addAudioFile(audioSource, name = null) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return null;
    }
    
    try {
      // إنشاء عنصر صوت
      const audioElement = document.createElement('audio');
      
      // إنشاء URL للصوت إذا كان ملفاً
      let audioUrl;
      if (typeof audioSource === 'string') {
        audioUrl = audioSource;
      } else {
        audioUrl = URL.createObjectURL(audioSource);
      }
      
      // تحميل الصوت
      audioElement.src = audioUrl;
      await new Promise((resolve, reject) => {
        audioElement.onloadedmetadata = () => resolve();
        audioElement.onerror = (e) => reject(new Error('فشل في تحميل الصوت: ' + e.message));
      });
      
      // إنشاء مصدر صوتي
      const mediaSource = this.audioContext.createMediaElementSource(audioElement);
      
      // إنشاء مسار صوتي جديد
      const trackId = 'track_' + Date.now();
      const audioTrack = {
        id: trackId,
        name: name || (typeof audioSource === 'string' ? audioSource.split('/').pop() : audioSource.name || 'مسار صوتي جديد'),
        source: mediaSource,
        sourceElement: audioElement,
        type: 'audio',
        duration: audioElement.duration,
        gain: this.audioContext.createGain(),
        effects: {},
        muted: false,
        volume: 1.0
      };
      
      // توصيل المسار بالمخرج الرئيسي
      audioTrack.source.connect(audioTrack.gain);
      audioTrack.gain.connect(this.masterGain);
      
      // إضافة المسار إلى القائمة
      this.audioTracks.push(audioTrack);
      this.currentTrack = audioTrack;
      
      console.log('تم إضافة ملف صوتي:', audioTrack.name);
      return audioTrack;
    } catch (error) {
      console.error('خطأ في إضافة ملف صوتي:', error);
      return null;
    }
  }

  /**
   * تعيين مستوى صوت المسار
   * @param {string} trackId معرف المسار (اختياري، يستخدم المسار الحالي إذا لم يتم تحديده)
   * @param {number} volume مستوى الصوت (0 إلى 1)
   * @returns {boolean} نجاح العملية
   */
  setTrackVolume(trackId = null, volume) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد المسار
      const track = trackId ? 
        this.audioTracks.find(t => t.id === trackId) : 
        this.currentTrack;
      
      if (!track) {
        throw new Error('لم يتم العثور على المسار');
      }
      
      // التحقق من صحة مستوى الصوت
      if (volume < 0 || volume > 1) {
        throw new Error('مستوى الصوت يجب أن يكون بين 0 و 1');
      }
      
      // تعيين مستوى الصوت
      track.volume = volume;
      track.gain.gain.value = volume;
      
      console.log('تم تعيين مستوى صوت المسار:', track.name, volume);
      return true;
    } catch (error) {
      console.error('خطأ في تعيين مستوى الصوت:', error);
      return false;
    }
  }

  /**
   * كتم/إلغاء كتم صوت المسار
   * @param {string} trackId معرف المسار (اختياري، يستخدم المسار الحالي إذا لم يتم تحديده)
   * @param {boolean} mute حالة الكتم
   * @returns {boolean} نجاح العملية
   */
  muteTrack(trackId = null, mute) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد المسار
      const track = trackId ? 
        this.audioTracks.find(t => t.id === trackId) : 
        this.currentTrack;
      
      if (!track) {
        throw new Error('لم يتم العثور على المسار');
      }
      
      // تعيين حالة الكتم
      track.muted = mute;
      track.gain.gain.value = mute ? 0 : track.volume;
      
      console.log(mute ? 'تم كتم صوت المسار:' : 'تم إلغاء كتم صوت المسار:', track.name);
      return true;
    } catch (error) {
      console.error('خطأ في كتم/إلغاء كتم الصوت:', error);
      return false;
    }
  }

  /**
   * إضافة تأثير صوتي إلى المسار
   * @param {string} trackId معرف المسار (اختياري، يستخدم المسار الحالي إذا لم يتم تحديده)
   * @param {string} effectType نوع التأثير
   * @param {Object} params معلمات التأثير
   * @returns {boolean} نجاح العملية
   */
  addEffect(trackId = null, effectType, params = {}) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد المسار
      const track = trackId ? 
        this.audioTracks.find(t => t.id === trackId) : 
        this.currentTrack;
      
      if (!track) {
        throw new Error('لم يتم العثور على المسار');
      }
      
      // التحقق من دعم التأثير
      if (!this.effects[effectType]) {
        throw new Error('التأثير غير مدعوم: ' + effectType);
      }
      
      // إنشاء التأثير
      const effect = this._createEffect(effectType, params);
      
      // إضافة التأثير إلى المسار
      const effectId = effectType + '_' + Date.now();
      track.effects[effectId] = {
        id: effectId,
        type: effectType,
        node: effect,
        params: params
      };
      
      // إعادة توصيل المسار مع التأثيرات
      this._reconnectTrackEffects(track);
      
      console.log('تم إضافة تأثير', effectType, 'إلى المسار:', track.name);
      return true;
    } catch (error) {
      console.error('خطأ في إضافة التأثير:', error);
      return false;
    }
  }

  /**
   * إزالة تأثير صوتي من المسار
   * @param {string} trackId معرف المسار (اختياري، يستخدم المسار الحالي إذا لم يتم تحديده)
   * @param {string} effectId معرف التأثير
   * @returns {boolean} نجاح العملية
   */
  removeEffect(trackId = null, effectId) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد المسار
      const track = trackId ? 
        this.audioTracks.find(t => t.id === trackId) : 
        this.currentTrack;
      
      if (!track) {
        throw new Error('لم يتم العثور على المسار');
      }
      
      // التحقق من وجود التأثير
      if (!track.effects[effectId]) {
        throw new Error('لم يتم العثور على التأثير: ' + effectId);
      }
      
      // إزالة التأثير
      delete track.effects[effectId];
      
      // إعادة توصيل المسار مع التأثيرات
      this._reconnectTrackEffects(track);
      
      console.log('تم إزالة التأثير من المسار:', track.name);
      return true;
    } catch (error) {
      console.error('خطأ في إزالة التأثير:', error);
      return false;
    }
  }

  /**
   * تعديل معلمات تأثير صوتي
   * @param {string} trackId معرف المسار (اختياري، يستخدم المسار الحالي إذا لم يتم تحديده)
   * @param {string} effectId معرف التأثير
   * @param {Object} params معلمات التأثير الجديدة
   * @returns {boolean} نجاح العملية
   */
  updateEffectParams(trackId = null, effectId, params) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد المسار
      const track = trackId ? 
        this.audioTracks.find(t => t.id === trackId) : 
        this.currentTrack;
      
      if (!track) {
        throw new Error('لم يتم العثور على المسار');
      }
      
      // التحقق من وجود التأثير
      const effect = track.effects[effectId];
      if (!effect) {
        throw new Error('لم يتم العثور على التأثير: ' + effectId);
      }
      
      // تحديث معلمات التأثير
      this._updateEffectParams(effect.node, effect.type, params);
      
      // تحديث المعلمات المخزنة
      Object.assign(effect.params, params);
      
      console.log('تم تحديث معلمات التأثير:', effectId);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث معلمات التأثير:', error);
      return false;
    }
  }

  /**
   * تشغيل معاينة للمسار الصوتي
   * @param {string} trackId معرف المسار (اختياري، يستخدم المسار الحالي إذا لم يتم تحديده)
   * @param {number} startTime وقت البداية بالثواني (اختياري)
   * @returns {boolean} نجاح العملية
   */
  previewTrack(trackId = null, startTime = 0) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد المسار
      const track = trackId ? 
        this.audioTracks.find(t => t.id === trackId) : 
        this.currentTrack;
      
      if (!track) {
        throw new Error('لم يتم العثور على المسار');
      }
      
      // تعيين وقت البداية
      track.sourceElement.currentTime = startTime;
      
      // بدء التشغيل
      track.sourceElement.play();
      
      console.log('تم بدء معاينة المسار:', track.name);
      return true;
    } catch (error) {
      console.error('خطأ في معاينة المسار:', error);
      return false;
    }
  }

  /**
   * إيقاف تشغيل المسار الصوتي
   * @param {string} trackId معرف المسار (اختياري، يستخدم المسار الحالي إذا لم يتم تحديده)
   * @returns {boolean} نجاح العملية
   */
  stopTrack(trackId = null) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return false;
    }
    
    try {
      // تحديد المسار
      const track = trackId ? 
        this.audioTracks.find(t => t.id === trackId) : 
        this.currentTrack;
      
      if (!track) {
        throw new Error('لم يتم العثور على المسار');
      }
      
      // إيقاف التشغيل
      track.sourceElement.pause();
      
      console.log('تم إيقاف تشغيل المسار:', track.name);
      return true;
    } catch (error) {
      console.error('خطأ في إيقاف تشغيل المسار:', error);
      return false;
    }
  }

  /**
   * تصدير المسار الصوتي
   * @param {string} trackId معرف المسار (اختياري، يستخدم المسار الحالي إذا لم يتم تحديده)
   * @param {Object} options خيارات التصدير
   * @returns {Promise<Blob>} وعد يتم حله بملف الصوت المصدر
   */
  async exportTrack(trackId = null, options = {}) {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return null;
    }
    
    try {
      // تحديد المسار
      const track = trackId ? 
        this.audioTracks.find(t => t.id === trackId) : 
        this.currentTrack;
      
      if (!track) {
        throw new Error('لم يتم العثور على المسار');
      }
      
      // في بيئة حقيقية، هنا سيتم استخدام Web Audio API لتسجيل الصوت ومعالجته
      // لكن في هذا المثال، سنفترض أن العملية تمت بنجاح ونعيد وعداً يتم حله بعد فترة
      
      console.log('جاري تصدير المسار الصوتي:', track.name);
      
      // محاكاة عملية التصدير
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('تم تصدير المسار الصوتي بنجاح');
      
      // في التطبيق الحقيقي، سيتم إرجاع ملف الصوت المعالج
      return new Blob(['dummy audio data'], { type: 'audio/mp3' });
    } catch (error) {
      console.error('خطأ في تصدير المسار الصوتي:', error);
      return null;
    }
  }

  /**
   * الحصول على بيانات التصور البصري للصوت
   * @returns {Uint8Array} مصفوفة بيانات التصور
   */
  getVisualizationData() {
    if (!this.initialized) {
      console.warn('أداة تحرير الصوت غير مهيأة بعد');
      return null;
    }
    
    try {
      // إنشاء مصفوفة لتخزين البيانات
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      // الحصول على بيانات التردد
      this.analyser.getByteFrequencyData(dataArray);
      
      return dataArray;
    } catch (error) {
      console.error('خطأ في الحصول على بيانات التصور البصري:', error);
      return null;
    }
  }

  /**
   * الحصول على قائمة المسارات الصوتية
   * @returns {Array} قائمة المسارات
   */
  getTracks() {
    return this.audioTracks.map(track => ({
      id: track.id,
      name: track.name,
      type: track.type,
      duration: track.duration,
      muted: track.muted,
      volume: track.volume,
      effects: Object.keys(track.effects).map(key => ({
        id: track.effects[key].id,
        type: track.effects[key].type
      }))
    }));
  }

  /**
   * تعيين المسار الحالي
   * @param {string} trackId معرف المسار
   * @returns {Object|null} معلومات المسار أو null إذا لم يتم العثور عليه
   */
  setCurrentTrack(trackId) {
    const track = this.audioTracks.find(t => t.id === trackId);
    if (track) {
      this.currentTrack = track;
      console.log('تم تعيين المسار الحالي:', track.name);
      return {
        id: track.id,
        name: track.name,
        type: track.type,
        duration: track.duration,
        muted: track.muted,
        volume: track.volume
      };
    }
    
    console.warn('لم يتم العثور على المسار:', trackId);
    return null;
  }

  /**
   * تهيئة التأثيرات الصوتية
   * @private
   */
  _initializeEffects() {
    this.effects = {
      'equalizer': {
        create: (params) => {
          // إنشاء معادل صوتي بسيط (3 نطاقات)
          const lowFilter = this.audioContext.createBiquadFilter();
          lowFilter.type = 'lowshelf';
          lowFilter.frequency.value = 320;
          lowFilter.gain.value = params.low || 0;
          
          const midFilter = this.audioContext.createBiquadFilter();
          midFilter.type = 'peaking';
          midFilter.frequency.value = 1000;
          midFilter.Q.value = 1;
          midFilter.gain.value = params.mid || 0;
          
          const highFilter = this.audioContext.createBiquadFilter();
          highFilter.type = 'highshelf';
          highFilter.frequency.value = 3200;
          highFilter.gain.value = params.high || 0;
          
          // توصيل الفلاتر
          lowFilter.connect(midFilter);
          midFilter.connect(highFilter);
          
          return {
            input: lowFilter,
            output: highFilter,
            nodes: { lowFilter, midFilter, highFilter }
          };
        },
        update: (effect, params) => {
          if (params.low !== undefined) effect.nodes.lowFilter.gain.value = params.low;
          if (params.mid !== undefined) effect.nodes.midFilter.gain.value = params.mid;
          if (params.high !== undefined) effect.nodes.highFilter.gain.value = params.high;
        }
      },
      'reverb': {
        create: (params) => {
          // إنشاء تأثير الصدى
          const convolver = this.audioContext.createConvolver();
          
          // إنشاء استجابة نبضية للصدى
          const duration = params.duration || 2;
          const decay = params.decay || 0.5;
          const rate = this.audioContext.sampleRate;
          const length = rate * duration;
          const impulse = this.audioContext.createBuffer(2, length, rate);
          
          for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
            const impulseData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
              impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
          }
          
          convolver.buffer = impulse;
          
          // إنشاء عقدة للتحكم في مستوى التأثير
          const wetGain = this.audioContext.createGain();
          wetGain.gain.value = params.wet || 0.5;
          
          const dryGain = this.audioContext.createGain();
          dryGain.gain.value = 1 - (params.wet || 0.5);
          
          // إنشاء عقدة للدمج
          const merger = this.audioContext.createGain();
          
          // توصيل العقد
          convolver.connect(wetGain);
          wetGain.connect(merger);
          dryGain.connect(merger);
          
          return {
            input: { connect: (node) => { node.connect(convolver); node.connect(dryGain); } },
            output: merger,
            nodes: { convolver, wetGain, dryGain }
          };
        },
        update: (effect, params) => {
          if (params.wet !== undefined) {
            effect.nodes.wetGain.gain.value = params.wet;
            effect.nodes.dryGain.gain.value = 1 - params.wet;
          }
        }
      },
      'compressor': {
        create: (params) => {
          // إنشاء ضاغط ديناميكي
          const compressor = this.audioContext.createDynamicsCompressor();
          compressor.threshold.value = params.threshold || -24;
          compressor.knee.value = params.knee || 30;
          compressor.ratio.value = params.ratio || 12;
          compressor.attack.value = params.attack || 0.003;
          compressor.release.value = params.release || 0.25;
          
          return {
            input: compressor,
            output: compressor,
            nodes: { compressor }
          };
        },
        update: (effect, params) => {
          const compressor = effect.nodes.compressor;
          if (params.threshold !== undefined) compressor.threshold.value = params.threshold;
          if (params.knee !== undefined) compressor.knee.value = params.knee;
          if (params.ratio !== undefined) compressor.ratio.value = params.ratio;
          if (params.attack !== undefined) compressor.attack.value = params.attack;
          if (params.release !== undefined) compressor.release.value = params.release;
        }
      },
      'delay': {
        create: (params) => {
          // إنشاء تأخير صوتي
          const delay = this.audioContext.createDelay();
          delay.delayTime.value = params.time || 0.5;
          
          // إنشاء عقدة للتحكم في مستوى التأثير
          const feedbackGain = this.audioContext.createGain();
          feedbackGain.gain.value = params.feedback || 0.5;
          
          const wetGain = this.audioContext.createGain();
          wetGain.gain.value = params.wet || 0.5;
          
          const dryGain = this.audioContext.createGain();
          dryGain.gain.value = 1 - (params.wet || 0.5);
          
          // إنشاء عقدة للدمج
          const merger = this.audioContext.createGain();
          
          // توصيل العقد
          delay.connect(feedbackGain);
          feedbackGain.connect(delay);
          delay.connect(wetGain);
          wetGain.connect(merger);
          dryGain.connect(merger);
          
          return {
            input: { connect: (node) => { node.connect(delay); node.connect(dryGain); } },
            output: merger,
            nodes: { delay, feedbackGain, wetGain, dryGain }
          };
        },
        update: (effect, params) => {
          if (params.time !== undefined) effect.nodes.delay.delayTime.value = params.time;
          if (params.feedback !== undefined) effect.nodes.feedbackGain.gain.value = params.feedback;
          if (params.wet !== undefined) {
            effect.nodes.wetGain.gain.value = params.wet;
            effect.nodes.dryGain.gain.value = 1 - params.wet;
          }
        }
      },
      'distortion': {
        create: (params) => {
          // إنشاء تشويه صوتي
          const distortion = this.audioContext.createWaveShaper();
          
          // إنشاء منحنى التشويه
          const amount = params.amount || 50;
          const curve = new Float32Array(this.audioContext.sampleRate);
          const deg = Math.PI / 180;
          
          for (let i = 0; i < this.audioContext.sampleRate; i++) {
            const x = i * 2 / this.audioContext.sampleRate - 1;
            curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
          }
          
          distortion.curve = curve;
          distortion.oversample = '4x';
          
          // إنشاء عقدة للتحكم في مستوى التأثير
          const wetGain = this.audioContext.createGain();
          wetGain.gain.value = params.wet || 0.5;
          
          const dryGain = this.audioContext.createGain();
          dryGain.gain.value = 1 - (params.wet || 0.5);
          
          // إنشاء عقدة للدمج
          const merger = this.audioContext.createGain();
          
          // توصيل العقد
          distortion.connect(wetGain);
          wetGain.connect(merger);
          dryGain.connect(merger);
          
          return {
            input: { connect: (node) => { node.connect(distortion); node.connect(dryGain); } },
            output: merger,
            nodes: { distortion, wetGain, dryGain }
          };
        },
        update: (effect, params) => {
          if (params.amount !== undefined) {
            const amount = params.amount;
            const curve = new Float32Array(this.audioContext.sampleRate);
            const deg = Math.PI / 180;
            
            for (let i = 0; i < this.audioContext.sampleRate; i++) {
              const x = i * 2 / this.audioContext.sampleRate - 1;
              curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
            }
            
            effect.nodes.distortion.curve = curve;
          }
          
          if (params.wet !== undefined) {
            effect.nodes.wetGain.gain.value = params.wet;
            effect.nodes.dryGain.gain.value = 1 - params.wet;
          }
        }
      }
    };
  }

  /**
   * إنشاء تأثير صوتي
   * @param {string} effectType نوع التأثير
   * @param {Object} params معلمات التأثير
   * @returns {Object} عقدة التأثير
   * @private
   */
  _createEffect(effectType, params) {
    return this.effects[effectType].create(params);
  }

  /**
   * تحديث معلمات تأثير صوتي
   * @param {Object} effectNode عقدة التأثير
   * @param {string} effectType نوع التأثير
   * @param {Object} params معلمات التأثير الجديدة
   * @private
   */
  _updateEffectParams(effectNode, effectType, params) {
    this.effects[effectType].update(effectNode, params);
  }

  /**
   * إعادة توصيل المسار مع التأثيرات
   * @param {Object} track المسار الصوتي
   * @private
   */
  _reconnectTrackEffects(track) {
    // فصل جميع التوصيلات الحالية
    track.source.disconnect();
    
    // إذا لم تكن هناك تأثيرات، توصيل المصدر مباشرة بعقدة التحكم في مستوى الصوت
    if (Object.keys(track.effects).length === 0) {
      track.source.connect(track.gain);
      return;
    }
    
    // ترتيب التأثيرات حسب الأولوية
    const effectIds = Object.keys(track.effects);
    const sortedEffects = effectIds.map(id => track.effects[id]);
    
    // توصيل المصدر بالتأثير الأول
    const firstEffect = sortedEffects[0];
    track.source.connect(firstEffect.node.input);
    
    // توصيل التأثيرات ببعضها
    for (let i = 0; i < sortedEffects.length - 1; i++) {
      sortedEffects[i].node.output.connect(sortedEffects[i + 1].node.input);
    }
    
    // توصيل التأثير الأخير بعقدة التحكم في مستوى الصوت
    const lastEffect = sortedEffects[sortedEffects.length - 1];
    lastEffect.node.output.connect(track.gain);
  }
}

export default AudioEditingTool;
