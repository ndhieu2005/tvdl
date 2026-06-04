import { Link } from 'react-router-dom';
import bgAboutLibrary from '../../assets/bg_about_library.svg';

function ShortArrowRightIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.69 8.88" fill="currentColor" className={className}>
      <path d="m12.69,4.48c0-.1-.02-.21-.12-.3-.17-.17-.33-.34-.5-.5-1.17-1.19-2.33-2.37-3.5-3.56-.37-.38-.95.2-.58.58.17.17.33.34.5.5.94.95,1.87,1.9,2.81,2.85H.4c-.53,0-.53.82,0,.82h10.88c-1.11,1.1-2.23,2.2-3.35,3.3-.38.37.2.95.58.58.17-.17.34-.34.51-.51,1.18-1.17,2.36-2.33,3.54-3.49.07-.07.11-.16.11-.25,0-.01,0-.02,0-.03Z"/>
    </svg>
  );
}

export default function AboutPage() {
  const contents = [
    "Thư viện Dương Liễu là thư viện tư nhân có phục vụ cộng đồng đầu tiên tại xã Dương Liễu (nay là xã Dương Hoà), TP. Hà Nội. Được thành lập vào tháng 9 năm 2013, với mong muốn xây dựng một không gian văn hoá đọc, thân thiện và gần gũi dành cho trẻ em và người dân trong khu vực. Khởi nguồn từ tâm huyết của những người trẻ yêu sách, thư viện đã dần trở thành điểm hẹn quen thuộc của thiếu nhi, thanh thiếu niên, phụ huynh và người dân trong vùng. Trải qua hơn một thập kỷ phát triển, thư viện hiện sở hữu hơn 15.000 đầu sách đa dạng, bao gồm sách thiếu nhi, văn học, kỹ năng sống, tài liệu học tập và nhiều nguồn tri thức bổ ích khác, đáp ứng nhu cầu đọc và học tập của nhiều lứa tuổi.",
    "Không chỉ là nơi để đọc sách, Thư viện Dương Liễu còn cung cấp nhiều chương trình, hoạt động đa dạng, giúp người đọc có thêm nhiều lựa chọn khi ghé thăm. Nhiều chương trình đã được triển khai như: Pokemon Read, Book Challenge, Library Tour, Tập làm nhà phát minh, Library Talk, Gói bánh chưng, Gói bánh trung thu, các buổi nói chuyện hướng nghiệp cũng như các workshop dành cho các em học sinh cấp 1, cấp 2. Các lớp học cũng được Thư viện Dương Liễu chú trọng và tổ chức, một số lớp học tiêu biểu như: lớp học tiếng Anh, tiếng Pháp, Em tập code, các lớp học kỹ năng mềm... Các hoạt động và sự kiện này đã tạo ra nhiều cơ hội để bạn đọc được phát triển toàn diện, giúp tăng sự gắn kết trong cộng đồng và các gia đình.",
    "Không chỉ thế, hiện Thư viện Dương Liễu có nhiều dự án, CLB nhằm hướng tới việc cung cấp các dịch vụ thông tin khác nhau cho các nhóm đối tượng khác nhau. Có thể kể đến dự án WeHere - giúp nâng cao sức khoẻ tinh thần; dự án WeTalk - tập trung về truyền thông văn hoá; dự án WeTech - ứng dụng công nghệ để nâng cao chất lượng dịch vụ trong thư viện; dự án WeJoy - giáo dục thông qua các hoạt động nghệ thuật sáng tạo; dự án WeDesign - dành cho các bạn yêu thích thiết kế đồ hoạ; CLB Sách 52 - khuyến khích việc đọc sách và chia sẻ kiến thức thông qua việc đọc sách.",
    "Với mô hình tự quản, Thư viện Dương Liễu hoạt động dựa trên sự chung tay, đóng góp của cộng đồng và đội ngũ gần 100 tình nguyện viên nhiệt huyết. Chính sự đồng hành này đã giúp thư viện trở thành một không gian văn hóa – giáo dục, nơi tinh thần đọc, học tập suốt đời trở thành kim chỉ nam.",
    "Trong thời gian tới, Thư viện Dương Liễu sẽ tiếp tục mở rộng các chương trình và dịch vụ thông tin, đồng thời phát triển nhiều sáng kiến mới giúp người dân tiếp cận tri thức đa dạng và thuận tiện hơn. Thư viện đặt mục tiêu trở thành một mô hình tiên phong, sáng tạo và đổi mới, biết tận dụng nguồn lực địa phương kết hợp với ứng dụng công nghệ để nâng cao hiệu quả hoạt động.",
  ];

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center p-4 sm:p-16">
        <p className="text-blue text-xl sm:text-5xl font-semibold">
          Về Thư viện
        </p>
        <Link
          to="/contact"
          className="bg-blue hover:bg-yellow text-white duration-200 w-52 sm:w-80 h-8 sm:h-12 pl-3 sm:pl-10 flex items-center gap-2 sm:gap-8"
        >
          <ShortArrowRightIcon className="h-2 sm:h-3 w-auto" />
          <p className="font-extralight text-xs sm:text-sm">
            Liên hệ Thư viện Dương Liễu
          </p>
        </Link>
      </div>

      <img src={bgAboutLibrary} alt="bgAboutLibrary" className="w-full" />

      <div className="p-6 sm:p-16">
        <p className="text-blue text-3xl sm:text-5xl font-bold mb-5 sm:mb-14">
          WE DO LIBRARY & BEYOND
        </p>
        {contents.map((text, index) => (
          <p
            key={index}
            className={`text-sm sm:text-base font-light sm:font-normal text-dark text-justify${index !== 0 ? ' mt-5' : ''}`}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
