import { TopicItem, VocabularyItem, Classroom, Assignment, NotificationItem, UserProfile } from '../types';

export const CURRENT_SCHOOL_INFO = {
  schoolName: 'TRƯỜNG PT DTNT THPT BÌNH THUẬN',
  teacherName: 'NGUYỄN THỊ CHÂU',
  subject: 'TIN HỌC',
  slogan: 'Learn IT English – Khám phá công nghệ, chinh phục tiếng Anh',
  textbook: 'Kết nối tri thức với cuộc sống'
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-student-1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan.dtnt@gmail.com',
    role: 'student',
    studentCode: 'HS20251201',
    className: '12A1',
    grade: 12,
    school: 'Trường PT DTNT THPT Bình Thuận',
    teacherName: 'Nguyễn Thị Châu'
  },
  {
    id: 'user-teacher-1',
    name: 'Nguyễn Thị Châu',
    email: 'nguyenthichau.dtnt@gmail.com',
    role: 'teacher',
    school: 'Trường PT DTNT THPT Bình Thuận'
  },
  {
    id: 'user-admin-1',
    name: 'Quản trị viên Hệ thống',
    email: 'admin.dtnt@gmail.com',
    role: 'admin',
    school: 'Trường PT DTNT THPT Bình Thuận'
  }
];

export const INITIAL_TOPICS: TopicItem[] = [
  // LỚP 10
  {
    id: 'top-10-1',
    grade: 10,
    name: 'Chủ đề 1. Máy tính và xã hội số',
    order: 1,
    lessons: [
      { id: 'les-10-1-1', topicId: 'top-10-1', grade: 10, name: 'Bài 1. Thông tin và xử lý thông tin', order: 1, wordCount: 8 },
      { id: 'les-10-1-2', topicId: 'top-10-1', grade: 10, name: 'Bài 2. Vai trò của thiết bị thông minh', order: 2, wordCount: 6 }
    ]
  },
  {
    id: 'top-10-2',
    grade: 10,
    name: 'Chủ đề 2. Mạng máy tính và Internet',
    order: 2,
    lessons: [
      { id: 'les-10-2-1', topicId: 'top-10-2', grade: 10, name: 'Bài 3. Mạng máy tính và các thiết bị kết nối', order: 1, wordCount: 10 },
      { id: 'les-10-2-2', topicId: 'top-10-2', grade: 10, name: 'Bài 4. Điện toán đám mây và Internet vạn vật', order: 2, wordCount: 8 }
    ]
  },
  {
    id: 'top-10-3',
    grade: 10,
    name: 'Chủ đề 3. Đa phương tiện và truyền thông',
    order: 3,
    lessons: [
      { id: 'les-10-3-1', topicId: 'top-10-3', grade: 10, name: 'Bài 5. Dữ liệu âm thanh và hình ảnh số', order: 1, wordCount: 6 }
    ]
  },
  {
    id: 'top-10-4',
    grade: 10,
    name: 'Chủ đề 4. Giải quyết vấn đề với Python',
    order: 4,
    lessons: [
      { id: 'les-10-4-1', topicId: 'top-10-4', grade: 10, name: 'Bài 6. Biến, biểu thức và câu lệnh gán', order: 1, wordCount: 8 },
      { id: 'les-10-4-2', topicId: 'top-10-4', grade: 10, name: 'Bài 7. Cấu trúc rẽ nhánh và vòng lặp', order: 2, wordCount: 8 }
    ]
  },
  {
    id: 'top-10-5',
    grade: 10,
    name: 'Chủ đề 5. Hướng nghiệp với Tin học',
    order: 5,
    lessons: [
      { id: 'les-10-5-1', topicId: 'top-10-5', grade: 10, name: 'Bài 8. Nghề nghiệp trong kỷ nguyên số', order: 1, wordCount: 6 }
    ]
  },
  {
    id: 'top-10-6',
    grade: 10,
    name: 'Chủ đề 6. Thực hành và dự án',
    order: 6,
    lessons: [
      { id: 'les-10-6-1', topicId: 'top-10-6', grade: 10, name: 'Bài 9. Dự án phần mềm nhỏ hỗ trợ học tập', order: 1, wordCount: 6 }
    ]
  },

  // LỚP 11 - Định hướng Tin học ứng dụng
  {
    id: 'top-11-1',
    grade: 11,
    name: 'Chủ đề 1. Hệ điều hành',
    order: 1,
    lessons: [
      { id: 'les-11-1-1', topicId: 'top-11-1', grade: 11, name: 'Bài 1. Hệ điều hành và quản lý tệp tin', order: 1, wordCount: 8 },
      { id: 'les-11-1-2', topicId: 'top-11-1', grade: 11, name: 'Bài 2. Thực hành sử dụng hệ điều hành', order: 2, wordCount: 6 }
    ]
  },
  {
    id: 'top-11-2',
    grade: 11,
    name: 'Chủ đề 2. Cơ sở dữ liệu',
    order: 2,
    lessons: [
      { id: 'les-11-2-1', topicId: 'top-11-2', grade: 11, name: 'Bài 3. Bảng, trường và bản ghi trong CSDL', order: 1, wordCount: 9 },
      { id: 'les-11-2-2', topicId: 'top-11-2', grade: 11, name: 'Bài 4. Khóa chính và liên kết giữa các bảng', order: 2, wordCount: 7 }
    ]
  },
  {
    id: 'top-11-3',
    grade: 11,
    name: 'Chủ đề 3. SQL và khai thác dữ liệu',
    order: 3,
    lessons: [
      { id: 'les-11-3-1', topicId: 'top-11-3', grade: 11, name: 'Bài 5. Truy vấn dữ liệu cơ bản với SQL', order: 1, wordCount: 8 }
    ]
  },
  {
    id: 'top-11-4',
    grade: 11,
    name: 'Chủ đề 4. Xử lý ảnh',
    order: 4,
    lessons: [
      { id: 'les-11-4-1', topicId: 'top-11-4', grade: 11, name: 'Bài 6. Lớp ảnh (Layers) và các công cụ chỉnh sửa', order: 1, wordCount: 8 }
    ]
  },
  {
    id: 'top-11-5',
    grade: 11,
    name: 'Chủ đề 5. Xử lý video',
    order: 5,
    lessons: [
      { id: 'les-11-5-1', topicId: 'top-11-5', grade: 11, name: 'Bài 7. Dựng video và hiệu ứng chuyển cảnh', order: 1, wordCount: 7 }
    ]
  },
  {
    id: 'top-11-6',
    grade: 11,
    name: 'Chủ đề 6. Thực hành và dự án',
    order: 6,
    lessons: [
      { id: 'les-11-6-1', topicId: 'top-11-6', grade: 11, name: 'Bài 8. Dự án tạo sản phẩm truyền thông số', order: 1, wordCount: 6 }
    ]
  },

  // LỚP 12 - Định hướng Tin học ứng dụng
  {
    id: 'top-12-1',
    grade: 12,
    name: 'Chủ đề 1. Trí tuệ nhân tạo',
    order: 1,
    lessons: [
      { id: 'les-12-1-1', topicId: 'top-12-1', grade: 12, name: 'Bài 1. Giới thiệu trí tuệ nhân tạo (AI)', order: 1, wordCount: 8 },
      { id: 'les-12-1-2', topicId: 'top-12-1', grade: 12, name: 'Bài 2. Ứng dụng AI trong học tập và đời sống', order: 2, wordCount: 7 }
    ]
  },
  {
    id: 'top-12-2',
    grade: 12,
    name: 'Chủ đề 2. Mạng máy tính',
    order: 2,
    lessons: [
      { id: 'les-12-2-1', topicId: 'top-12-2', grade: 12, name: 'Bài 3. Giao thức truyền thông mạng TCP/IP', order: 1, wordCount: 8 },
      { id: 'les-12-2-2', topicId: 'top-12-2', grade: 12, name: 'Bài 4. Địa chỉ IP, Router và Switch', order: 2, wordCount: 7 }
    ]
  },
  {
    id: 'top-12-3',
    grade: 12,
    name: 'Chủ đề 3. Thiết kế trang web (HTML)',
    order: 3,
    lessons: [
      { id: 'les-12-3-1', topicId: 'top-12-3', grade: 12, name: 'Bài 7. HTML và cấu trúc trang web', order: 1, wordCount: 11 },
      { id: 'les-12-3-2', topicId: 'top-12-3', grade: 12, name: 'Bài 8. Các thẻ định dạng văn bản và danh sách', order: 2, wordCount: 8 },
      { id: 'les-12-3-3', topicId: 'top-12-3', grade: 12, name: 'Bài 9. Chèn hình ảnh, video và siêu liên kết', order: 3, wordCount: 8 }
    ]
  },
  {
    id: 'top-12-4',
    grade: 12,
    name: 'Chủ đề 4. Định dạng trang web (CSS)',
    order: 4,
    lessons: [
      { id: 'les-12-4-1', topicId: 'top-12-4', grade: 12, name: 'Bài 10. Giới thiệu ngôn ngữ CSS', order: 1, wordCount: 8 },
      { id: 'les-12-4-2', topicId: 'top-12-4', grade: 12, name: 'Bài 11. Định dạng màu sắc, phông chữ và bố cục', order: 2, wordCount: 9 }
    ]
  },
  {
    id: 'top-12-5',
    grade: 12,
    name: 'Chủ đề 5. Ứng dụng và phát triển',
    order: 5,
    lessons: [
      { id: 'les-12-5-1', topicId: 'top-12-5', grade: 12, name: 'Bài 12. Phát triển và triển khai website cá nhân', order: 1, wordCount: 7 }
    ]
  },
  {
    id: 'top-12-6',
    grade: 12,
    name: 'Chủ đề 6. Thực hành và dự án',
    order: 6,
    lessons: [
      { id: 'les-12-6-1', topicId: 'top-12-6', grade: 12, name: 'Bài 13. Dự án xây dựng website quảng bá địa phương', order: 1, wordCount: 6 }
    ]
  }
];

export const INITIAL_VOCABULARY: VocabularyItem[] = [
  // --- LỚP 12 - BÀI 7: HTML VÀ CẤU TRÚC TRANG WEB ---
  {
    id: 'voc-12-7-01',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'HTML',
    ipa: '/ˌeɪtʃ tiː em ˈel/',
    partOfSpeech: 'abbr',
    vietnamese: 'Ngôn ngữ đánh dấu siêu văn bản',
    explanation: 'Viết tắt của HyperText Markup Language, ngôn ngữ chuẩn để tạo và cấu trúc nội dung các trang web hiển thị trên trình duyệt.',
    example: 'Every modern website begins with an HTML document.',
    exampleTranslation: 'Mọi trang web hiện đại đều bắt đầu bằng một tài liệu HTML.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 38,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-12-7-02',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Webpage',
    ipa: '/ˈwebpeɪdʒ/',
    partOfSpeech: 'n',
    vietnamese: 'Trang web',
    explanation: 'Một tài liệu đơn lẻ trên mạng toàn cầu (World Wide Web) được tạo bằng HTML và hiển thị qua trình duyệt.',
    example: 'The home webpage contains links to other sections of the school.',
    exampleTranslation: 'Trang web chính chứa các liên kết dẫn đến các phân mục khác của trường.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 38,
    isFavorite: false,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-12-7-03',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Website',
    ipa: '/ˈwebsaɪt/',
    partOfSpeech: 'n',
    vietnamese: 'Trang mạng / Tập hợp trang web',
    explanation: 'Tập hợp các trang web có liên quan với nhau, cùng thuộc một tên miền và được lưu trữ trên một máy chủ web.',
    example: 'Our school website provides information for ethnic minority boarding students.',
    exampleTranslation: 'Website của trường chúng tôi cung cấp thông tin cho học sinh dân tộc nội trú.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 38,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-12-7-04',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Browser',
    ipa: '/ˈbraʊzə(r)/',
    partOfSpeech: 'n',
    vietnamese: 'Trình duyệt web',
    explanation: 'Phần mềm ứng dụng giúp người dùng truy cập, hiển thị và tương tác với các tài liệu trên mạng Internet (như Chrome, Edge, Firefox).',
    example: 'The web browser renders HTML code into a visible page.',
    exampleTranslation: 'Trình duyệt web chuyển mã HTML thành trang hiển thị cho người xem.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 39,
    isFavorite: false,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-12-7-05',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Tag',
    ipa: '/tæɡ/',
    partOfSpeech: 'n',
    vietnamese: 'Thẻ HTML',
    explanation: 'Từ khóa đặc biệt được bao bởi cặp dấu ngoặc nhọn `<>` dùng để hướng dẫn trình duyệt cách định dạng và hiển thị nội dung.',
    example: 'The opening tag and closing tag enclose the content of an element.',
    exampleTranslation: 'Thẻ mở và thẻ đóng bao quanh nội dung của một phần tử.',
    level: 'trung bình',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 40,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 2
  },
  {
    id: 'voc-12-7-06',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Element',
    ipa: '/ˈelɪmənt/',
    partOfSpeech: 'n',
    vietnamese: 'Phần tử HTML',
    explanation: 'Một thành phần hoàn chỉnh bao gồm thẻ mở, nội dung và thẻ đóng (ví dụ: `<p>Xin chào</p>`).',
    example: 'An HTML element usually consists of a start tag, content, and an end tag.',
    exampleTranslation: 'Một phần tử HTML thường bao gồm thẻ bắt đầu, nội dung và thẻ kết thúc.',
    level: 'trung bình',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 40,
    isFavorite: false,
    isLearned: true,
    masteryLevel: 2
  },
  {
    id: 'voc-12-7-07',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Attribute',
    ipa: '/ˈætrɪbjuːt/',
    partOfSpeech: 'n',
    vietnamese: 'Thuộc tính',
    explanation: 'Thông tin bổ sung được đặt trong thẻ mở của phần tử HTML nhằm xác định các đặc tính hoặc hành vi riêng biệt (như href, src, alt).',
    example: 'The href attribute specifies the URL of the page the link goes to.',
    exampleTranslation: 'Thuộc tính href chỉ định địa chỉ URL mà liên kết sẽ dẫn tới.',
    level: 'trung bình',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 41,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 2
  },
  {
    id: 'voc-12-7-08',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Hyperlink',
    ipa: '/ˈhaɪpəlɪŋk/',
    partOfSpeech: 'n',
    vietnamese: 'Siêu liên kết',
    explanation: 'Đường dẫn điện tử liên kết từ trang web này sang trang web khác hoặc giữa các vị trí trong cùng một trang.',
    example: 'Click the hyperlink to navigate to the IT vocabulary quiz.',
    exampleTranslation: 'Nhấn vào siêu liên kết để chuyển đến bài kiểm tra từ vựng Tin học.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 42,
    isFavorite: false,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-12-7-09',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Heading',
    ipa: '/ˈhedɪŋ/',
    partOfSpeech: 'n',
    vietnamese: 'Tiêu đề đề mục',
    explanation: 'Các thẻ từ `<h1>` đến `<h6>` được sử dụng để định nghĩa cấp độ ưu tiên của tiêu đề bài viết trên trang web.',
    example: 'The h1 tag defines the most important heading on the page.',
    exampleTranslation: 'Thẻ h1 định nghĩa tiêu đề quan trọng nhất trên trang.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 43,
    isFavorite: false,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-12-7-10',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Paragraph',
    ipa: '/ˈpærəɡrɑːf/',
    partOfSpeech: 'n',
    vietnamese: 'Đoạn văn bản',
    explanation: 'Phần tử được tạo bởi thẻ `<p>` đại diện cho một khối đoạn văn bản trong tài liệu HTML.',
    example: 'Use the p tag to create a clean paragraph of text.',
    exampleTranslation: 'Sử dụng thẻ p để tạo một đoạn văn bản rõ ràng.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 43,
    isFavorite: false,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-12-7-11',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-3',
    topicName: 'Chủ đề 3. Thiết kế trang web (HTML)',
    lessonId: 'les-12-3-1',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    english: 'Source Code',
    ipa: '/sɔːs kəʊd/',
    partOfSpeech: 'n',
    vietnamese: 'Mã nguồn',
    explanation: 'Văn bản chứa các lệnh lập trình hoặc đánh dấu được viết bằng ngôn ngữ máy tính mà con người có thể đọc và chỉnh sửa.',
    example: 'Right-click and choose "View Page Source" to inspect the HTML source code.',
    exampleTranslation: 'Nhấp chuột phải và chọn "Xem nguồn trang" để kiểm tra mã nguồn HTML.',
    level: 'trung bình',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 44,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 2
  },

  // --- LỚP 12 - CHỦ ĐỀ 1: TRÍ TUỆ NHÂN TẠO ---
  {
    id: 'voc-12-1-01',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-1',
    topicName: 'Chủ đề 1. Trí tuệ nhân tạo',
    lessonId: 'les-12-1-1',
    lessonName: 'Bài 1. Giới thiệu trí tuệ nhân tạo (AI)',
    english: 'Artificial Intelligence',
    ipa: '/ˌɑːtɪˈfɪʃl ɪnˈtelɪdʒəns/',
    partOfSpeech: 'n',
    vietnamese: 'Trí tuệ nhân tạo',
    explanation: 'Ngành khoa học máy tính nghiên cứu cách tạo ra các hệ thống có khả năng mô phỏng trí tuệ con người như học hỏi, suy luận và giải quyết vấn đề.',
    example: 'Artificial Intelligence is revolutionizing modern education.',
    exampleTranslation: 'Trí tuệ nhân tạo đang tạo bước ngoặt lớn trong giáo dục hiện đại.',
    level: 'dễ',
    sourceType: 'Từ gợi ý - cần đối chiếu',
    isFavorite: true,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-12-1-02',
    grade: 12,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-12-1',
    topicName: 'Chủ đề 1. Trí tuệ nhân tạo',
    lessonId: 'les-12-1-1',
    lessonName: 'Bài 1. Giới thiệu trí tuệ nhân tạo (AI)',
    english: 'Machine Learning',
    ipa: '/məˈʃiːn ˈlɜːnɪŋ/',
    partOfSpeech: 'n',
    vietnamese: 'Học máy',
    explanation: 'Một phân nhánh của AI cho phép máy tính tự học hỏi và nâng cao hiệu suất từ dữ liệu mà không cần được lập trình cụ thể từng bước.',
    example: 'Machine learning algorithms detect patterns in large datasets.',
    exampleTranslation: 'Các thuật toán học máy phát hiện quy luật trong những tập dữ liệu lớn.',
    level: 'nâng cao',
    sourceType: 'Từ mở rộng chuyên ngành',
    isFavorite: false,
    isLearned: false,
    masteryLevel: 1
  },

  // --- LỚP 11 - CƠ SỞ DỮ LIỆU & SQL ---
  {
    id: 'voc-11-2-01',
    grade: 11,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-11-2',
    topicName: 'Chủ đề 2. Cơ sở dữ liệu',
    lessonId: 'les-11-2-1',
    lessonName: 'Bài 3. Bảng, trường và bản ghi trong CSDL',
    english: 'Database',
    ipa: '/ˈdeɪtəbeɪs/',
    partOfSpeech: 'n',
    vietnamese: 'Cơ sở dữ liệu (CSDL)',
    explanation: 'Tập hợp dữ liệu có cấu trúc được lưu trữ điện tử trong hệ thống máy tính để có thể dễ dàng truy cập, quản lý và cập nhật.',
    example: 'The school stores student academic records in a relational database.',
    exampleTranslation: 'Nhà trường lưu trữ hồ sơ học tập của học sinh trong một cơ sở dữ liệu quan hệ.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 52,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-11-2-02',
    grade: 11,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-11-2',
    topicName: 'Chủ đề 2. Cơ sở dữ liệu',
    lessonId: 'les-11-2-1',
    lessonName: 'Bài 3. Bảng, trường và bản ghi trong CSDL',
    english: 'Primary Key',
    ipa: '/ˈpraɪməri kiː/',
    partOfSpeech: 'phrase',
    vietnamese: 'Khóa chính',
    explanation: 'Một hoặc một nhóm trường xác định duy nhất mỗi bản ghi trong bảng dữ liệu quan hệ.',
    example: 'Student ID serves as the primary key in the student table.',
    exampleTranslation: 'Mã số học sinh đóng vai trò là khóa chính trong bảng học sinh.',
    level: 'trung bình',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 56,
    isFavorite: false,
    isLearned: true,
    masteryLevel: 2
  },
  {
    id: 'voc-11-2-03',
    grade: 11,
    textbook: 'Kết nối tri thức với cuộc sống',
    orientation: 'Tin học ứng dụng',
    topicId: 'top-11-2',
    topicName: 'Chủ đề 2. Cơ sở dữ liệu',
    lessonId: 'les-11-2-1',
    lessonName: 'Bài 3. Bảng, trường và bản ghi trong CSDL',
    english: 'Query',
    ipa: '/ˈkwɪəri/',
    partOfSpeech: 'n',
    vietnamese: 'Truy vấn dữ liệu',
    explanation: 'Một yêu cầu tìm kiếm, trích xuất hoặc xử lý dữ liệu được gửi đến hệ quản trị cơ sở dữ liệu.',
    example: 'Execute a query to retrieve students with high scores.',
    exampleTranslation: 'Thực thi một câu truy vấn để lấy ra danh sách học sinh có điểm cao.',
    level: 'trung bình',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 60,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 2
  },

  // --- LỚP 10 - MẠNG MÁY TÍNH & PYTHON ---
  {
    id: 'voc-10-2-01',
    grade: 10,
    textbook: 'Kết nối tri thức với cuộc sống',
    topicId: 'top-10-2',
    topicName: 'Chủ đề 2. Mạng máy tính và Internet',
    lessonId: 'les-10-2-1',
    lessonName: 'Bài 3. Mạng máy tính và các thiết bị kết nối',
    english: 'Computer Network',
    ipa: '/kəmˈpjuːtə(r) ˈnetwɜːk/',
    partOfSpeech: 'phrase',
    vietnamese: 'Mạng máy tính',
    explanation: 'Tập hợp các máy tính và thiết bị được kết nối với nhau theo một phương thức nào đó để trao đổi dữ liệu và chia sẻ tài nguyên.',
    example: 'The school computer network connects all computers in the computer lab.',
    exampleTranslation: 'Mạng máy tính của trường kết nối tất cả máy tính trong phòng thực hành Tin học.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 24,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-10-2-02',
    grade: 10,
    textbook: 'Kết nối tri thức với cuộc sống',
    topicId: 'top-10-2',
    topicName: 'Chủ đề 2. Mạng máy tính và Internet',
    lessonId: 'les-10-2-1',
    lessonName: 'Bài 3. Mạng máy tính và các thiết bị kết nối',
    english: 'Bandwidth',
    ipa: '/ˈbændwɪtθ/',
    partOfSpeech: 'n',
    vietnamese: 'Băng thông',
    explanation: 'Lượng dữ liệu tối đa có thể truyền qua một kết nối mạng trong một đơn vị thời gian nhất định (thường đo bằng Mbps hoặc Gbps).',
    example: 'High bandwidth allows video streaming without buffering.',
    exampleTranslation: 'Băng thông cao cho phép xem video mượt mà không bị nghẽn.',
    level: 'trung bình',
    sourceType: 'Từ gợi ý - cần đối chiếu',
    isFavorite: false,
    isLearned: false,
    masteryLevel: 1
  },
  {
    id: 'voc-10-4-01',
    grade: 10,
    textbook: 'Kết nối tri thức với cuộc sống',
    topicId: 'top-10-4',
    topicName: 'Chủ đề 4. Giải quyết vấn đề với Python',
    lessonId: 'les-10-4-1',
    lessonName: 'Bài 6. Biến, biểu thức và câu lệnh gán',
    english: 'Variable',
    ipa: '/ˈveəriəbl/',
    partOfSpeech: 'n',
    vietnamese: 'Biến trong lập trình',
    explanation: 'Tên vùng nhớ dùng để lưu trữ giá trị dữ liệu và giá trị này có thể thay đổi trong quá trình thực thi chương trình.',
    example: 'In Python, we declare a variable by simply assigning a value to it.',
    exampleTranslation: 'Trong Python, chúng ta khai báo một biến đơn giản bằng cách gán một giá trị cho nó.',
    level: 'dễ',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 75,
    isFavorite: false,
    isLearned: true,
    masteryLevel: 3
  },
  {
    id: 'voc-10-4-02',
    grade: 10,
    textbook: 'Kết nối tri thức với cuộc sống',
    topicId: 'top-10-4',
    topicName: 'Chủ đề 4. Giải quyết vấn đề với Python',
    lessonId: 'les-10-4-2',
    lessonName: 'Bài 7. Cấu trúc rẽ nhánh và vòng lặp',
    english: 'Algorithm',
    ipa: '/ˈælɡərɪðəm/',
    partOfSpeech: 'n',
    vietnamese: 'Thuật toán',
    explanation: 'Một dãy hữu hạn các chỉ dẫn rõ ràng, tuần tự nhằm giải quyết một bài toán hoặc một nhiệm vụ xác định.',
    example: 'A good algorithm solves problems with maximum efficiency.',
    exampleTranslation: 'Một thuật toán tốt giải quyết vấn đề với hiệu suất tối ưu.',
    level: 'trung bình',
    sourceType: 'Trong SGK (Đã xác minh)',
    sourcePage: 82,
    isFavorite: true,
    isLearned: true,
    masteryLevel: 3
  }
];

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'cls-12a1',
    name: '12A1',
    grade: 12,
    academicYear: '2025 - 2026',
    teacherId: 'user-teacher-1',
    teacherName: 'Nguyễn Thị Châu',
    studentCount: 35,
    students: [
      { id: 'hs-12a1-01', studentCode: 'HS12001', name: 'Nguyễn Văn An', className: '12A1', wordsLearned: 152, completedLessons: 12, avgScore: 8.6, lastActive: 'Hôm nay 09:15', status: 'active' },
      { id: 'hs-12a1-02', studentCode: 'HS12002', name: 'Trần Thị Bích', className: '12A1', wordsLearned: 148, completedLessons: 11, avgScore: 8.4, lastActive: 'Hôm nay 08:30', status: 'active' },
      { id: 'hs-12a1-03', studentCode: 'HS12003', name: 'Lê Hoàng Dũng', className: '12A1', wordsLearned: 160, completedLessons: 13, avgScore: 9.1, lastActive: 'Hôm qua 21:04', status: 'active' },
      { id: 'hs-12a1-04', studentCode: 'HS12004', name: 'Mang Thị Lan', className: '12A1', wordsLearned: 134, completedLessons: 10, avgScore: 7.9, lastActive: '2 ngày trước', status: 'active' },
      { id: 'hs-12a1-05', studentCode: 'HS12005', name: 'Thông Minh Sơn', className: '12A1', wordsLearned: 110, completedLessons: 8, avgScore: 7.2, lastActive: 'Hôm nay 07:12', status: 'active' },
      { id: 'hs-12a1-06', studentCode: 'HS12006', name: 'Hứa Thị Tuyết', className: '12A1', wordsLearned: 155, completedLessons: 12, avgScore: 8.8, lastActive: 'Hôm nay 10:02', status: 'active' },
      { id: 'hs-12a1-07', studentCode: 'HS12007', name: 'Báo Văn Hùng', className: '12A1', wordsLearned: 95, completedLessons: 7, avgScore: 6.8, lastActive: '3 ngày trước', status: 'inactive' }
    ]
  },
  {
    id: 'cls-12a2',
    name: '12A2',
    grade: 12,
    academicYear: '2025 - 2026',
    teacherId: 'user-teacher-1',
    teacherName: 'Nguyễn Thị Châu',
    studentCount: 34,
    students: [
      { id: 'hs-12a2-01', studentCode: 'HS12036', name: 'Trương Quốc Bảo', className: '12A2', wordsLearned: 140, completedLessons: 11, avgScore: 8.2, lastActive: 'Hôm nay 09:45', status: 'active' },
      { id: 'hs-12a2-02', studentCode: 'HS12037', name: 'Dương Thị Kim Chi', className: '12A2', wordsLearned: 125, completedLessons: 9, avgScore: 7.5, lastActive: 'Hôm qua 19:20', status: 'active' }
    ]
  },
  {
    id: 'cls-11a1',
    name: '11A1',
    grade: 11,
    academicYear: '2025 - 2026',
    teacherId: 'user-teacher-1',
    teacherName: 'Nguyễn Thị Châu',
    studentCount: 36,
    students: [
      { id: 'hs-11a1-01', studentCode: 'HS11001', name: 'Phan Nhật Minh', className: '11A1', wordsLearned: 118, completedLessons: 9, avgScore: 8.0, lastActive: 'Hôm nay 10:11', status: 'active' },
      { id: 'hs-11a1-02', studentCode: 'HS11002', name: 'Đàng Thị Thảo', className: '11A1', wordsLearned: 130, completedLessons: 10, avgScore: 8.5, lastActive: 'Hôm nay 08:15', status: 'active' }
    ]
  },
  {
    id: 'cls-10a1',
    name: '10A1',
    grade: 10,
    academicYear: '2025 - 2026',
    teacherId: 'user-teacher-1',
    teacherName: 'Nguyễn Thị Châu',
    studentCount: 35,
    students: [
      { id: 'hs-10a1-01', studentCode: 'HS10001', name: 'Mai Văn Đạt', className: '10A1', wordsLearned: 85, completedLessons: 6, avgScore: 7.8, lastActive: 'Hôm nay 07:50', status: 'active' },
      { id: 'hs-10a1-02', studentCode: 'HS10002', name: 'Lâm Mỹ Duyên', className: '10A1', wordsLearned: 92, completedLessons: 7, avgScore: 8.3, lastActive: 'Hôm nay 09:20', status: 'active' }
    ]
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-01',
    title: 'Ôn tập từ vựng Bài 7: HTML và cấu trúc trang web',
    className: '12A1',
    type: 'flashcard',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    assignedDate: '2025-01-10',
    dueDate: '2025-01-20',
    allowedAttempts: 3,
    status: 'in-progress',
    instructions: 'Luyện tập Flashcard ghi nhớ ít nhất 10 từ vựng cốt lõi của bài học HTML trước giờ thực hành phòng máy.'
  },
  {
    id: 'asg-02',
    title: 'Kiểm tra 15 phút: Thuật ngữ HTML & Trình duyệt',
    className: '12A1',
    type: 'exam',
    lessonName: 'Bài 7. HTML và cấu trúc trang web',
    assignedDate: '2025-01-12',
    dueDate: '2025-01-20 23:59',
    allowedAttempts: 2,
    status: 'pending',
    instructions: 'Hoàn thành 10 câu trắc nghiệm và điền khuyết. Điểm số sẽ tính vào đánh giá quá trình.'
  },
  {
    id: 'asg-03',
    title: 'Luyện tập từ vựng CSDL & Khóa chính',
    className: '11A1',
    type: 'practice',
    lessonName: 'Bài 3. Bảng, trường và bản ghi trong CSDL',
    assignedDate: '2025-01-14',
    dueDate: '2025-01-22',
    allowedAttempts: 5,
    status: 'in-progress',
    instructions: 'Ghép cặp thuật ngữ Database và Primary key.'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Có bài học mới: Bài 12 – HTML (Lớp 12)',
    content: 'Giáo viên Nguyễn Thị Châu đã cập nhật 11 từ vựng mới theo chuẩn SGK Kết nối tri thức.',
    date: 'Hôm nay',
    type: 'lesson',
    isRead: false,
    badge: 'Mới'
  },
  {
    id: 'notif-2',
    title: 'Hạn nộp bài kiểm tra: Đến 23:59 ngày 20/01/2025',
    content: 'Bài kiểm tra 15 phút từ vựng Chủ đề Thiết kế trang web đang chờ hoàn thành.',
    date: '1 ngày trước',
    type: 'exam',
    isRead: false
  },
  {
    id: 'notif-3',
    title: 'Thử thách tuần: Ôn tập 20 từ vựng chủ đề Mạng máy tính',
    content: 'Đạt danh hiệu "Chuyên gia mạng máy tính" khi hoàn thành trên 85% câu hỏi đúng.',
    date: '3 ngày trước',
    type: 'reminder',
    isRead: true
  },
  {
    id: 'notif-4',
    title: 'Lời nhắn từ cô Nguyễn Thị Châu',
    content: 'Các em học sinh 12A1 nhớ luyện phát âm chính xác các thuật ngữ HTML, Element và Attribute nhé!',
    date: '4 ngày trước',
    type: 'system',
    isRead: true
  }
];
