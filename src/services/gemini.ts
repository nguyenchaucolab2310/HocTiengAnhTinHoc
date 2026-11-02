import { GoogleGenAI } from '@google/genai';
import { VocabularyItem, GradeLevel } from '../types';

interface GeneratedVocabularyResponse {
  english: string;
  ipa: string;
  partOfSpeech: 'n' | 'v' | 'adj' | 'adv' | 'phrase' | 'abbr';
  vietnamese: string;
  explanation: string;
  example: string;
  exampleTranslation: string;
  level: 'dễ' | 'trung bình' | 'nâng cao';
  suggestedQuestions?: {
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

export const GeminiService = {
  getApiKey(): string | null {
    // Check both standard client env var and server-side pass-through
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
      if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
    }
    return null;
  },

  isConfigured(): boolean {
    return !!this.getApiKey();
  },

  async generateVocabularyFromTopic(
    topicOrContent: string,
    grade: GradeLevel,
    lessonName: string,
    count = 5
  ): Promise<GeneratedVocabularyResponse[]> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      // Return smart simulated response for Tin học THPT SGK Kết nối tri thức
      await new Promise(resolve => setTimeout(resolve, 1200));
      return this.getSimulatedVocabulary(topicOrContent, grade, lessonName);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Bạn là chuyên gia tiếng Anh chuyên ngành Công nghệ thông tin và giáo viên Tin học THPT chương trình GDPT 2018 (bộ sách Kết nối tri thức với cuộc sống).
Hãy tạo danh sách ${count} từ vựng tiếng Anh Tin học quan trọng cho khối lớp ${grade}, bài học: "${lessonName}", nội dung/chủ đề: "${topicOrContent}".

Yêu cầu định dạng đầu ra CHÍNH XÁC là một mảng JSON (không có markdown khác ngoài json codeblock):
[
  {
    "english": "từ tiếng Anh",
    "ipa": "phiên âm IPA chuẩn quốc tế",
    "partOfSpeech": "n" | "v" | "adj" | "adv" | "phrase" | "abbr",
    "vietnamese": "nghĩa tiếng Việt chuẩn thuật ngữ Tin học",
    "explanation": "giải thích chi tiết dễ hiểu theo ngữ cảnh Tin học THPT",
    "example": "câu ví dụ tiếng Anh thực tế trong tin học",
    "exampleTranslation": "dịch nghĩa câu ví dụ",
    "level": "dễ" | "trung bình" | "nâng cao",
    "suggestedQuestions": [
      {
        "prompt": "câu hỏi trắc nghiệm kiểm tra từ này",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "giải thích tại sao chọn đáp án đó"
      }
    ]
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const text = response.text?.trim() || '[]';
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error generating vocabulary via Gemini:', err);
      // Graceful fallback to domain-accurate simulated set
      return this.getSimulatedVocabulary(topicOrContent, grade, lessonName);
    }
  },

  getSimulatedVocabulary(topic: string, grade: GradeLevel, lesson: string): GeneratedVocabularyResponse[] {
    const normalized = (topic + ' ' + lesson).toLowerCase();
    
    if (normalized.includes('web') || normalized.includes('html') || normalized.includes('css')) {
      return [
        {
          english: 'Hypertext',
          ipa: '/ˈhaɪpətekst/',
          partOfSpeech: 'n',
          vietnamese: 'Siêu văn bản',
          explanation: 'Văn bản chứa các liên kết cho phép người đọc truy cập ngay tức thì sang các tài liệu hoặc phần khác.',
          example: 'HTML documents organize hypertext across the World Wide Web.',
          exampleTranslation: 'Các tài liệu HTML tổ chức siêu văn bản trên toàn mạng máy tính toàn cầu.',
          level: 'trung bình',
          suggestedQuestions: [
            {
              prompt: 'Thuật ngữ nào chỉ dạng văn bản chứa các đường liên kết sang tài liệu khác?',
              options: ['Hypertext', 'Plain text', 'Database', 'Binary'],
              correctAnswer: 'Hypertext',
              explanation: 'Hypertext (Siêu văn bản) chứa các siêu liên kết tới tài liệu khác.'
            }
          ]
        },
        {
          english: 'Semantic Tag',
          ipa: '/sɪˈmæntɪk tæɡ/',
          partOfSpeech: 'phrase',
          vietnamese: 'Thẻ ngữ nghĩa',
          explanation: 'Thẻ HTML mô tả rõ ràng ý nghĩa của nội dung bên trong cho cả trình duyệt và nhà phát triển (ví dụ: header, footer, article).',
          example: 'Semantic tags improve web accessibility and search engine optimization.',
          exampleTranslation: 'Thẻ ngữ nghĩa cải thiện khả năng tiếp cận và tối ưu hóa công cụ tìm kiếm.',
          level: 'nâng cao'
        },
        {
          english: 'Responsive Design',
          ipa: '/rɪˈspɒnsɪv dɪˈzaɪn/',
          partOfSpeech: 'phrase',
          vietnamese: 'Thiết kế đáp ứng',
          explanation: 'Phương pháp thiết kế giúp trang web tự động thích ứng kích thước hiển thị tốt trên mọi kích cỡ màn hình từ điện thoại đến máy tính.',
          example: 'Modern websites must adopt responsive design for smartphones.',
          exampleTranslation: 'Các website hiện đại phải áp dụng thiết kế đáp ứng cho điện thoại thông minh.',
          level: 'trung bình'
        }
      ];
    }

    if (normalized.includes('ai') || normalized.includes('trí tuệ nhân tạo') || normalized.includes('dữ liệu')) {
      return [
        {
          english: 'Neural Network',
          ipa: '/ˈnjʊərəl ˈnetwɜːk/',
          partOfSpeech: 'phrase',
          vietnamese: 'Mạng nơ-ron nhân tạo',
          explanation: 'Mô hình tính toán phỏng theo cấu trúc mạng lưới tế bào thần kinh sinh học trong não người để xử lý dữ liệu phức tạp.',
          example: 'A deep neural network recognizes speech with high accuracy.',
          exampleTranslation: 'Mạng nơ-ron sâu nhận dạng giọng nói với độ chính xác cao.',
          level: 'nâng cao'
        },
        {
          english: 'Computer Vision',
          ipa: '/kəmˈpjuːtə(r) ˈvɪʒn/',
          partOfSpeech: 'phrase',
          vietnamese: 'Thị giác máy tính',
          explanation: 'Lĩnh vực của AI giúp máy tính có thể nhận diện, xử lý và hiểu nội dung từ hình ảnh và video kỹ thuật số.',
          example: 'Facial recognition in smartphones relies on computer vision.',
          exampleTranslation: 'Nhận diện khuôn mặt trên điện thoại dựa vào thị giác máy tính.',
          level: 'trung bình'
        }
      ];
    }

    // Generic IT terms
    return [
      {
        english: 'Information Technology',
        ipa: '/ˌɪnfəˈmeɪʃn tekˈnɒlədʒi/',
        partOfSpeech: 'phrase',
        vietnamese: 'Công nghệ thông tin (CNTT)',
        explanation: 'Ngành ứng dụng máy tính và phần mềm để quản lý, lưu trữ, xử lý và truyền tải thông tin.',
        example: 'Information technology is an essential subject in secondary schools.',
        exampleTranslation: 'Công nghệ thông tin là một môn học thiết yếu tại trường trung học.',
        level: 'dễ'
      },
      {
        english: 'Cloud Computing',
        ipa: '/klaʊd kəmˈpjuːtɪŋ/',
        partOfSpeech: 'phrase',
        vietnamese: 'Điện toán đám mây',
        explanation: 'Mô hình cung cấp tài nguyên điện toán (máy chủ, lưu trữ, mạng) qua Internet theo yêu cầu.',
        example: 'Google Drive is an example of cloud computing storage.',
        exampleTranslation: 'Google Drive là một ví dụ về lưu trữ điện toán đám mây.',
        level: 'trung bình'
      }
    ];
  }
};
