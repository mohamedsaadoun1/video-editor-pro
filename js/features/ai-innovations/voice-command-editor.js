/**
 * ميزة التحرير بالأوامر الصوتية
 * تحرير الفيديو باستخدام الأوامر الصوتية باللغة العربية
 */

class VoiceCommandEditor {
  constructor() {
    this.recognition = null;
    this.speechSynthesis = null;
    this.isListening = false;
    this.commandProcessor = null;
    this.editorInterface = null;
    this.commandHistory = [];
    this.availableCommands = {};
    this.contextualHelp = {};
    this.currentContext = 'general';
    this.language = 'ar-SA';
    this.confidenceThreshold = 0.7;
    this.onCommandRecognized = null;
    this.onCommandExecuted = null;
    this.onListeningStateChanged = null;
    this.onError = null;
    this.initialized = false;
  }

  /**
   * تهيئة ميزة التحرير بالأوامر الصوتية
   * @param {Object} editorInterface واجهة المحرر
   * @param {Object} options خيارات التهيئة
   * @returns {Promise<boolean>} نجاح العملية
   */
  async initialize(editorInterface, options = {}) {
    try {
      // التحقق من دعم التعرف على الكلام
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('التعرف على الكلام غير مدعوم في هذا المتصفح');
      }
      
      // التحقق من دعم تخليق الكلام
      if (!('speechSynthesis' in window)) {
        throw new Error('تخليق الكلام غير مدعوم في هذا المتصفح');
      }
      
      // تعيين واجهة المحرر
      this.editorInterface = editorInterface;
      
      // تعيين خيارات التهيئة
      this.language = options.language || 'ar-SA';
      this.confidenceThreshold = options.confidenceThreshold || 0.7;
      this.onCommandRecognized = options.onCommandRecognized || null;
      this.onCommandExecuted = options.onCommandExecuted || null;
      this.onListeningStateChanged = options.onListeningStateChanged || null;
      this.onError = options.onError || null;
      
      // إنشاء كائن التعرف على الكلام
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = this.language;
      
      // تعيين معالجات أحداث التعرف على الكلام
      this.recognition.onresult = this._handleRecognitionResult.bind(this);
      this.recognition.onerror = this._handleRecognitionError.bind(this);
      this.recognition.onend = this._handleRecognitionEnd.bind(this);
      
      // إنشاء كائن تخليق الكلام
      this.speechSynthesis = window.speechSynthesis;
      
      // تحميل معالج الأوامر
      await this._loadCommandProcessor();
      
      // تهيئة الأوامر المتاحة
      this._initializeAvailableCommands();
      
      // تهيئة المساعدة السياقية
      this._initializeContextualHelp();
      
      this.initialized = true;
      console.log('تم تهيئة ميزة التحرير بالأوامر الصوتية بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ في تهيئة ميزة التحرير بالأوامر الصوتية:', error);
      if (this.onError) {
        this.onError('initialization_error', error.message);
      }
      return false;
    }
  }

  /**
   * بدء الاستماع للأوامر الصوتية
   * @returns {boolean} نجاح العملية
   */
  startListening() {
    if (!this.initialized) {
      console.warn('ميزة التحرير بالأوامر الصوتية غير مهيأة بعد');
      return false;
    }
    
    if (this.isListening) {
      console.warn('الاستماع للأوامر الصوتية جارٍ بالفعل');
      return false;
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
      
      if (this.onListeningStateChanged) {
        this.onListeningStateChanged(true);
      }
      
      console.log('بدأ الاستماع للأوامر الصوتية');
      return true;
    } catch (error) {
      console.error('خطأ في بدء الاستماع للأوامر الصوتية:', error);
      if (this.onError) {
        this.onError('start_listening_error', error.message);
      }
      return false;
    }
  }

  /**
   * إيقاف الاستماع للأوامر الصوتية
   * @returns {boolean} نجاح العملية
   */
  stopListening() {
    if (!this.initialized) {
      console.warn('ميزة التحرير بالأوامر الصوتية غير مهيأة بعد');
      return false;
    }
    
    if (!this.isListening) {
      console.warn('الاستماع للأوامر الصوتية متوقف بالفعل');
      return false;
    }
    
    try {
      this.recognition.stop();
      this.isListening = false;
      
      if (this.onListeningStateChanged) {
        this.onListeningStateChanged(false);
      }
      
      console.log('تم إيقاف الاستماع للأوامر الصوتية');
      return true;
    } catch (error) {
      console.error('خطأ في إيقاف الاستماع للأوامر الصوتية:', error);
      if (this.onError) {
        this.onError('stop_listening_error', error.message);
      }
      return false;
    }
  }

  /**
   * تنفيذ أمر نصي
   * @param {string} commandText نص الأمر
   * @returns {Promise<boolean>} نجاح العملية
   */
  async executeCommand(commandText) {
    if (!this.initialized) {
      console.warn('ميزة التحرير بالأوامر الصوتية غير مهيأة بعد');
      return false;
    }
    
    try {
      // معالجة الأمر
      const commandResult = await this._processCommand(commandText);
      
      if (commandResult.success) {
        // إضافة الأمر إلى السجل
        this._addToCommandHistory(commandText, commandResult.command, commandResult.params);
        
        // استدعاء دالة رد الاتصال
        if (this.onCommandExecuted) {
          this.onCommandExecuted(commandResult.command, commandResult.params, commandResult.result);
        }
        
        console.log('تم تنفيذ الأمر بنجاح:', commandText);
        return true;
      } else {
        console.warn('فشل تنفيذ الأمر:', commandText, commandResult.error);
        if (this.onError) {
          this.onError('command_execution_error', commandResult.error);
        }
        return false;
      }
    } catch (error) {
      console.error('خطأ في تنفيذ الأمر:', error);
      if (this.onError) {
        this.onError('command_execution_error', error.message);
      }
      return false;
    }
  }

  /**
   * تغيير سياق الأوامر
   * @param {string} context السياق الجديد
   * @returns {boolean} نجاح العملية
   */
  changeContext(context) {
    if (!this.initialized) {
      console.warn('ميزة التحرير بالأوامر الصوتية غير مهيأة بعد');
      return false;
    }
    
    if (!this.contextualHelp[context]) {
      console.warn('سياق غير صالح:', context);
      return false;
    }
    
    this.currentContext = context;
    console.log('تم تغيير سياق الأوامر إلى:', context);
    return true;
  }

  /**
   * الحصول على قائمة الأوامر المتاحة
   * @param {string} context السياق (اختياري)
   * @returns {Array} قائمة الأوامر المتاحة
   */
  getAvailableCommands(context = null) {
    if (!this.initialized) {
      console.warn('ميزة التحرير بالأوامر الصوتية غير مهيأة بعد');
      return [];
    }
    
    const targetContext = context || this.currentContext;
    
    if (!this.availableCommands[targetContext]) {
      return this.availableCommands['general'] || [];
    }
    
    return this.availableCommands[targetContext];
  }

  /**
   * الحصول على المساعدة السياقية
   * @param {string} context السياق (اختياري)
   * @returns {Object} المساعدة السياقية
   */
  getContextualHelp(context = null) {
    if (!this.initialized) {
      console.warn('ميزة التحرير بالأوامر الصوتية غير مهيأة بعد');
      return {};
    }
    
    const targetContext = context || this.currentContext;
    
    if (!this.contextualHelp[targetContext]) {
      return this.contextualHelp['general'] || {};
    }
    
    return this.contextualHelp[targetContext];
  }

  /**
   * الحصول على سجل الأوامر
   * @returns {Array} سجل الأوامر
   */
  getCommandHistory() {
    return this.commandHistory;
  }

  /**
   * مسح سجل الأوامر
   * @returns {boolean} نجاح العملية
   */
  clearCommandHistory() {
    this.commandHistory = [];
    console.log('تم مسح سجل الأوامر');
    return true;
  }

  /**
   * تحميل معالج الأوامر
   * @returns {Promise<boolean>} نجاح العملية
   * @private
   */
  async _loadCommandProcessor() {
    try {
      // في التطبيق الحقيقي، يتم تحميل معالج الأوامر من خدمة خارجية أو مكتبة متخصصة
      // هنا نستخدم معالج وهمي للتوضيح
      
      console.log('جاري تحميل معالج الأوامر...');
      
      // محاكاة تأخير التحميل
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.commandProcessor = {
        processCommand: async (commandText, context) => {
          // محاكاة معالجة الأمر
          console.log('جاري معالجة الأمر:', commandText, 'في السياق:', context);
          
          // محاكاة تأخير المعالجة
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // تحليل الأمر
          const commandLower = commandText.toLowerCase();
          
          // أوامر عامة
          if (commandLower.includes('توقف') || commandLower.includes('إيقاف الاستماع')) {
            return {
              success: true,
              command: 'stopListening',
              params: {},
              result: 'تم إيقاف الاستماع'
            };
          }
          
          if (commandLower.includes('مساعدة') || commandLower.includes('ما هي الأوامر')) {
            return {
              success: true,
              command: 'showHelp',
              params: { context },
              result: 'عرض المساعدة'
            };
          }
          
          // أوامر تحرير الفيديو
          if (context === 'video_editing' || context === 'general') {
            if (commandLower.includes('قص') || commandLower.includes('اقتطاع')) {
              // استخراج الوقت من الأمر
              const startTimeMatch = commandLower.match(/من (\d+)(?::|\.| و |،)(\d+)/);
              const endTimeMatch = commandLower.match(/إلى (\d+)(?::|\.| و |،)(\d+)/);
              
              let startTime = null;
              let endTime = null;
              
              if (startTimeMatch) {
                startTime = parseInt(startTimeMatch[1]) * 60 + parseInt(startTimeMatch[2]);
              }
              
              if (endTimeMatch) {
                endTime = parseInt(endTimeMatch[1]) * 60 + parseInt(endTimeMatch[2]);
              }
              
              return {
                success: true,
                command: 'trimVideo',
                params: { startTime, endTime },
                result: 'تم قص الفيديو'
              };
            }
            
            if (commandLower.includes('تشغيل') || commandLower.includes('ابدأ التشغيل')) {
              return {
                success: true,
                command: 'playVideo',
                params: {},
                result: 'تم تشغيل الفيديو'
              };
            }
            
            if (commandLower.includes('إيقاف') || commandLower.includes('أوقف التشغيل')) {
              return {
                success: true,
                command: 'pauseVideo',
                params: {},
                result: 'تم إيقاف الفيديو'
              };
            }
          }
          
          // أوامر تحرير الصوت
          if (context === 'audio_editing' || context === 'general') {
            if (commandLower.includes('رفع الصوت') || commandLower.includes('زيادة الصوت')) {
              // استخراج القيمة من الأمر
              const valueMatch = commandLower.match(/بنسبة (\d+)/);
              const value = valueMatch ? parseInt(valueMatch[1]) : 10;
              
              return {
                success: true,
                command: 'increaseVolume',
                params: { value },
                result: 'تم رفع الصوت'
              };
            }
            
            if (commandLower.includes('خفض الصوت') || commandLower.includes('تقليل الصوت')) {
              // استخراج القيمة من الأمر
              const valueMatch = commandLower.match(/بنسبة (\d+)/);
              const value = valueMatch ? parseInt(valueMatch[1]) : 10;
              
              return {
                success: true,
                command: 'decreaseVolume',
                params: { value },
                result: 'تم خفض الصوت'
              };
            }
          }
          
          // أوامر تحرير النص
          if (context === 'text_editing' || context === 'general') {
            if (commandLower.includes('إضافة نص') || commandLower.includes('أضف نص')) {
              // استخراج النص من الأمر
              const textMatch = commandLower.match(/إضافة نص "(.*?)"|أضف نص "(.*?)"/);
              const text = textMatch ? (textMatch[1] || textMatch[2]) : 'نص جديد';
              
              return {
                success: true,
                command: 'addText',
                params: { text },
                result: 'تم إضافة النص'
              };
            }
          }
          
          // أوامر تحرير القرآن
          if (context === 'quran_editing' || context === 'general') {
            if (commandLower.includes('إضافة آية') || commandLower.includes('أضف آية')) {
              // استخراج رقم السورة والآية من الأمر
              const surahMatch = commandLower.match(/سورة (\d+)|سورة (.*?)(?:\s|$)/);
              const verseMatch = commandLower.match(/آية (\d+)/);
              
              let surah = null;
              let verse = null;
              
              if (surahMatch) {
                surah = surahMatch[1] ? parseInt(surahMatch[1]) : surahMatch[2];
              }
              
              if (verseMatch) {
                verse = parseInt(verseMatch[1]);
              }
              
              return {
                success: true,
                command: 'addQuranVerse',
                params: { surah, verse },
                result: 'تم إضافة الآية'
              };
            }
          }
          
          // إذا لم يتم التعرف على الأمر
          return {
            success: false,
            error: 'لم يتم التعرف على الأمر'
          };
        }
      };
      
      console.log('تم تحميل معالج الأوامر بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ في تحميل معالج الأوامر:', error);
      return false;
    }
  }

  /**
   * تهيئة الأوامر المتاحة
   * @private
   */
  _initializeAvailableCommands() {
    this.availableCommands = {
      'general': [
        {
          command: 'مساعدة',
          description: 'عرض قائمة الأوامر المتاحة',
          examples: ['مساعدة', 'ما هي الأوامر المتاحة']
        },
        {
          command: 'توقف',
          description: 'إيقاف الاستماع للأوامر الصوتية',
          examples: ['توقف', 'إيقاف الاستماع']
        }
      ],
      'video_editing': [
        {
          command: 'قص الفيديو',
          description: 'قص الفيديو من وقت البداية إلى وقت النهاية',
          examples: ['قص الفيديو من 1:30 إلى 2:45', 'اقتطاع من 0:10 إلى 1:20']
        },
        {
          command: 'تشغيل',
          description: 'تشغيل الفيديو',
          examples: ['تشغيل', 'ابدأ التشغيل']
        },
        {
          command: 'إيقاف',
          description: 'إيقاف تشغيل الفيديو',
          examples: ['إيقاف', 'أوقف التشغيل']
        }
      ],
      'audio_editing': [
        {
          command: 'رفع الصوت',
          description: 'رفع مستوى الصوت بنسبة معينة',
          examples: ['رفع الصوت بنسبة 20', 'زيادة الصوت']
        },
        {
          command: 'خفض الصوت',
          description: 'خفض مستوى الصوت بنسبة معينة',
          examples: ['خفض الصوت بنسبة 10', 'تقليل الصوت']
        }
      ],
      'text_editing': [
        {
          command: 'إضافة نص',
          description: 'إضافة نص جديد إلى الفيديو',
          examples: ['إضافة نص "بسم الله الرحمن الرحيم"', 'أضف نص "مرحباً بكم"']
        }
      ],
      'quran_editing': [
        {
          command: 'إضافة آية',
          description: 'إضافة آية من القرآن الكريم',
          examples: ['إضافة آية 1 من سورة الفاتحة', 'أضف آية 255 من سورة البقرة']
        }
      ]
    };
  }

  /**
   * تهيئة المساعدة السياقية
   * @private
   */
  _initializeContextualHelp() {
    this.contextualHelp = {
      'general': {
        title: 'المساعدة العامة',
        description: 'يمكنك استخدام الأوامر الصوتية للتحكم في المحرر. فيما يلي بعض الأوامر العامة:',
        commands: this.availableCommands['general']
      },
      'video_editing': {
        title: 'مساعدة تحرير الفيديو',
        description: 'أوامر خاصة بتحرير الفيديو:',
        commands: this.availableCommands['video_editing']
      },
      'audio_editing': {
        title: 'مساعدة تحرير الصوت',
        description: 'أوامر خاصة بتحرير الصوت:',
        commands: this.availableCommands['audio_editing']
      },
      'text_editing': {
        title: 'مساعدة تحرير النص',
        description: 'أوامر خاصة بتحرير النص:',
        commands: this.availableCommands['text_editing']
      },
      'quran_editing': {
        title: 'مساعدة تحرير القرآن',
        description: 'أوامر خاصة بتحرير محتوى القرآن:',
        commands: this.availableCommands['quran_editing']
      }
    };
  }

  /**
   * معالجة نتيجة التعرف على الكلام
   * @param {SpeechRecognitionEvent} event حدث التعرف على الكلام
   * @private
   */
  async _handleRecognitionResult(event) {
    try {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      const confidence = result[0].confidence;
      
      console.log('تم التعرف على الكلام:', transcript, 'بثقة:', confidence);
      
      // التحقق من مستوى الثقة
      if (confidence < this.confidenceThreshold) {
        console.warn('مستوى الثقة منخفض جدًا:', confidence);
        return;
      }
      
      // استدعاء دالة رد الاتصال
      if (this.onCommandRecognized) {
        this.onCommandRecognized(transcript, confidence);
      }
      
      // معالجة الأمر
      await this._processCommand(transcript);
    } catch (error) {
      console.error('خطأ في معالجة نتيجة التعرف على الكلام:', error);
      if (this.onError) {
        this.onError('recognition_result_error', error.message);
      }
    }
  }

  /**
   * معالجة خطأ التعرف على الكلام
   * @param {SpeechRecognitionError} event حدث خطأ التعرف على الكلام
   * @private
   */
  _handleRecognitionError(event) {
    console.error('خطأ في التعرف على الكلام:', event.error);
    
    if (this.onError) {
      this.onError('recognition_error', event.error);
    }
  }

  /**
   * معالجة انتهاء التعرف على الكلام
   * @private
   */
  _handleRecognitionEnd() {
    console.log('انتهى التعرف على الكلام');
    
    // إعادة تشغيل التعرف إذا كان الاستماع لا يزال مفعلاً
    if (this.isListening) {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('خطأ في إعادة تشغيل التعرف على الكلام:', error);
        this.isListening = false;
        
        if (this.onListeningStateChanged) {
          this.onListeningStateChanged(false);
        }
        
        if (this.onError) {
          this.onError('recognition_restart_error', error.message);
        }
      }
    }
  }

  /**
   * معالجة الأمر
   * @param {string} commandText نص الأمر
   * @returns {Promise<Object>} نتيجة معالجة الأمر
   * @private
   */
  async _processCommand(commandText) {
    try {
      // استخدام معالج الأوامر
      const commandResult = await this.commandProcessor.processCommand(commandText, this.currentContext);
      
      if (commandResult.success) {
        // تنفيذ الأمر
        await this._executeCommand(commandResult.command, commandResult.params);
        
        // نطق الرد
        this._speakResponse(commandResult.result);
        
        return commandResult;
      } else {
        // نطق رسالة الخطأ
        this._speakResponse('لم أفهم هذا الأمر، يرجى المحاولة مرة أخرى');
        
        return commandResult;
      }
    } catch (error) {
      console.error('خطأ في معالجة الأمر:', error);
      
      // نطق رسالة الخطأ
      this._speakResponse('حدث خطأ أثناء تنفيذ الأمر');
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * تنفيذ الأمر
   * @param {string} command الأمر
   * @param {Object} params معلمات الأمر
   * @returns {Promise<boolean>} نجاح العملية
   * @private
   */
  async _executeCommand(command, params) {
    try {
      switch (command) {
        case 'stopListening':
          this.stopListening();
          break;
          
        case 'showHelp':
          this._showHelp(params.context);
          break;
          
        case 'trimVideo':
          if (this.editorInterface && this.editorInterface.trimVideo) {
            await this.editorInterface.trimVideo(params.startTime, params.endTime);
          }
          break;
          
        case 'playVideo':
          if (this.editorInterface && this.editorInterface.playVideo) {
            await this.editorInterface.playVideo();
          }
          break;
          
        case 'pauseVideo':
          if (this.editorInterface && this.editorInterface.pauseVideo) {
            await this.editorInterface.pauseVideo();
          }
          break;
          
        case 'increaseVolume':
          if (this.editorInterface && this.editorInterface.adjustVolume) {
            await this.editorInterface.adjustVolume(params.value);
          }
          break;
          
        case 'decreaseVolume':
          if (this.editorInterface && this.editorInterface.adjustVolume) {
            await this.editorInterface.adjustVolume(-params.value);
          }
          break;
          
        case 'addText':
          if (this.editorInterface && this.editorInterface.addText) {
            await this.editorInterface.addText(params.text);
          }
          break;
          
        case 'addQuranVerse':
          if (this.editorInterface && this.editorInterface.addQuranVerse) {
            await this.editorInterface.addQuranVerse(params.surah, params.verse);
          }
          break;
          
        default:
          console.warn('أمر غير معروف:', command);
          return false;
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تنفيذ الأمر:', error);
      return false;
    }
  }

  /**
   * عرض المساعدة
   * @param {string} context السياق
   * @private
   */
  _showHelp(context = null) {
    const help = this.getContextualHelp(context);
    
    if (help) {
      // نطق عنوان المساعدة
      this._speakResponse(help.title + '. ' + help.description);
    }
  }

  /**
   * نطق الرد
   * @param {string} text نص الرد
   * @private
   */
  _speakResponse(text) {
    try {
      // إيقاف أي نطق سابق
      this.speechSynthesis.cancel();
      
      // إنشاء كائن النطق
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language;
      
      // نطق النص
      this.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('خطأ في نطق الرد:', error);
    }
  }

  /**
   * إضافة أمر إلى السجل
   * @param {string} text نص الأمر
   * @param {string} command الأمر
   * @param {Object} params معلمات الأمر
   * @private
   */
  _addToCommandHistory(text, command, params) {
    this.commandHistory.push({
      text,
      command,
      params,
      timestamp: Date.now()
    });
    
    // الاحتفاظ بآخر 50 أمر فقط
    if (this.commandHistory.length > 50) {
      this.commandHistory.shift();
    }
  }
}

export default VoiceCommandEditor;
